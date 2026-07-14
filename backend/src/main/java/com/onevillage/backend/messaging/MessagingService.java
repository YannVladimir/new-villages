package com.onevillage.backend.messaging;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.community.Community;
import com.onevillage.backend.community.CommunityRepository;
import com.onevillage.backend.messaging.dto.ConversationResponse;
import com.onevillage.backend.messaging.dto.MessageResponse;
import com.onevillage.backend.messaging.dto.StartConversationRequest;
import com.onevillage.backend.notification.NotificationDispatcher;
import com.onevillage.backend.notification.NotificationType;
import com.onevillage.backend.organization.Organization;
import com.onevillage.backend.organization.OrganizationRepository;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import com.onevillage.backend.user.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final BlockService blockService;
    private final CommunityRepository communityRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final NotificationDispatcher notificationDispatcher;

    public MessagingService(ConversationRepository conversationRepository,
                             ConversationParticipantRepository participantRepository,
                             MessageRepository messageRepository,
                             BlockService blockService,
                             CommunityRepository communityRepository,
                             OrganizationRepository organizationRepository,
                             UserRepository userRepository,
                             NotificationDispatcher notificationDispatcher) {
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.messageRepository = messageRepository;
        this.blockService = blockService;
        this.communityRepository = communityRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.notificationDispatcher = notificationDispatcher;
    }

    public List<ConversationResponse> listConversations(UUID userId) {
        return participantRepository.findByUserId(userId).stream()
                .map(p -> toConversationResponse(p.getConversationId(), userId))
                .sorted((a, b) -> {
                    if (a.lastMessageAt() == null) return 1;
                    if (b.lastMessageAt() == null) return -1;
                    return b.lastMessageAt().compareTo(a.lastMessageAt());
                })
                .toList();
    }

    @Transactional
    public ConversationResponse startConversation(UUID userId, StartConversationRequest request) {
        UUID recipientId = resolveRecipient(userId, request);

        if (recipientId.equals(userId)) {
            throw ApiException.badRequest("You cannot start a conversation with yourself");
        }
        if (blockService.isBlockedEitherDirection(userId, recipientId)) {
            throw ApiException.forbidden("You cannot message this user");
        }

        UUID conversationId = participantRepository.findDirectConversationBetween(userId, recipientId)
                .orElseGet(() -> createConversation(userId, recipientId));

        sendMessage(conversationId, userId, request.initialMessage());

        return toConversationResponse(conversationId, userId);
    }

    private UUID resolveRecipient(UUID userId, StartConversationRequest request) {
        return switch (request.type().toUpperCase()) {
            case "LEADER" -> {
                if (request.communityId() == null) {
                    throw ApiException.badRequest("communityId is required to message a community leader");
                }
                Community community = communityRepository.findById(request.communityId())
                        .orElseThrow(() -> ApiException.notFound("Community not found"));
                yield community.getLeaderId();
            }
            case "ORG" -> {
                if (request.organizationId() == null) {
                    throw ApiException.badRequest("organizationId is required to message an organization");
                }
                Organization org = organizationRepository.findById(request.organizationId())
                        .orElseThrow(() -> ApiException.notFound("Organization not found"));
                yield org.getOwnerUserId();
            }
            case "ADMIN" -> findAnyAdminId(userId);
            default -> throw ApiException.badRequest("type must be one of LEADER, ORG, ADMIN");
        };
    }

    private UUID findAnyAdminId(UUID excludingUserId) {
        return userRepository.findFirstByRole(UserRole.ADMIN)
                .map(User::getId)
                .filter(id -> !id.equals(excludingUserId))
                .orElseThrow(() -> ApiException.notFound("No platform support account is available right now"));
    }

    private UUID createConversation(UUID userA, UUID userB) {
        Conversation conversation = new Conversation();
        conversationRepository.save(conversation);

        ConversationParticipant p1 = new ConversationParticipant();
        p1.setConversationId(conversation.getId());
        p1.setUserId(userA);
        participantRepository.save(p1);

        ConversationParticipant p2 = new ConversationParticipant();
        p2.setConversationId(conversation.getId());
        p2.setUserId(userB);
        participantRepository.save(p2);

        return conversation.getId();
    }

    public Page<MessageResponse> getMessages(UUID conversationId, UUID userId, Pageable pageable) {
        requireParticipant(conversationId, userId);
        return messageRepository.findByConversationIdOrderBySentAtDesc(conversationId, pageable)
                .map(m -> toMessageResponse(m, userId));
    }

    @Transactional
    public MessageResponse sendMessage(UUID conversationId, UUID senderId, String body) {
        requireParticipant(conversationId, senderId);

        UUID recipientId = participantRepository.findByConversationId(conversationId).stream()
                .map(ConversationParticipant::getUserId)
                .filter(id -> !id.equals(senderId))
                .findFirst()
                .orElseThrow(() -> ApiException.notFound("Conversation has no other participant"));

        if (blockService.isBlockedEitherDirection(senderId, recipientId)) {
            throw ApiException.forbidden("You cannot message this user");
        }

        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(senderId);
        message.setBody(body);
        // saveAndFlush: toMessageResponse() below reads message.getSentAt(), which
        // @CreationTimestamp only populates once the INSERT actually executes.
        messageRepository.saveAndFlush(message);

        User sender = userRepository.findById(senderId).orElse(null);
        String senderName = sender == null ? "Someone" : sender.getFullName();
        notificationDispatcher.dispatch(recipientId, NotificationType.MESSAGE, "New Message",
                senderName + " sent you a message: \"" + truncate(body) + "\"", conversationId);

        return toMessageResponse(message, senderId);
    }

    private String truncate(String text) {
        return text.length() > 80 ? text.substring(0, 77) + "..." : text;
    }

    private void requireParticipant(UUID conversationId, UUID userId) {
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw ApiException.forbidden("You are not part of this conversation");
        }
    }

    private ConversationResponse toConversationResponse(UUID conversationId, UUID currentUserId) {
        UUID otherUserId = participantRepository.findByConversationId(conversationId).stream()
                .map(ConversationParticipant::getUserId)
                .filter(id -> !id.equals(currentUserId))
                .findFirst()
                .orElse(null);

        User other = otherUserId == null ? null : userRepository.findById(otherUserId).orElse(null);
        Message last = messageRepository.findTopByConversationIdOrderBySentAtDesc(conversationId).orElse(null);
        long unread = messageRepository.countByConversationIdAndSenderIdNotAndReadAtIsNull(conversationId, currentUserId);

        return new ConversationResponse(
                conversationId,
                otherUserId,
                other == null ? null : other.getFullName(),
                other == null ? null : other.getAvatarUrl(),
                other == null ? null : other.getRole().name(),
                last == null ? null : last.getBody(),
                last == null ? null : last.getSentAt(),
                unread
        );
    }

    private MessageResponse toMessageResponse(Message m, UUID currentUserId) {
        if (!m.getSenderId().equals(currentUserId) && m.getReadAt() == null) {
            m.setReadAt(Instant.now());
            messageRepository.save(m);
        }
        return new MessageResponse(m.getId(), m.getConversationId(), m.getSenderId(), m.getBody(),
                m.getSentAt(), m.getSenderId().equals(currentUserId), m.getReadAt());
    }
}
