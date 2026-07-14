package com.onevillage.backend.community;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.community.dto.*;
import com.onevillage.backend.event.EventRepository;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import com.onevillage.backend.user.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMembershipRepository membershipRepository;
    private final CommunityCreationRequestRepository creationRequestRepository;
    private final CommunityInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    public CommunityService(CommunityRepository communityRepository,
                             CommunityMembershipRepository membershipRepository,
                             CommunityCreationRequestRepository creationRequestRepository,
                             CommunityInvitationRepository invitationRepository,
                             UserRepository userRepository,
                             EventRepository eventRepository) {
        this.communityRepository = communityRepository;
        this.membershipRepository = membershipRepository;
        this.creationRequestRepository = creationRequestRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    // --- Reads ---

    public Page<CommunityResponse> search(String search, String category, UUID currentUserId, Pageable pageable) {
        return communityRepository.search(search, category, pageable)
                .map(c -> toResponse(c, currentUserId));
    }

    public List<CommunityResponse> getMine(UUID userId) {
        List<UUID> ids = membershipRepository.findJoinedCommunityIds(userId);
        return communityRepository.findAllById(ids).stream()
                .map(c -> toResponse(c, userId))
                .toList();
    }

    public List<CommunityInvitationResponse> getInvitations(UUID userId, String email) {
        List<CommunityInvitation> byUser = invitationRepository.findByInvitedUserIdAndStatus(userId, InvitationStatus.PENDING);
        List<CommunityInvitation> byEmail = email == null ? List.of()
                : invitationRepository.findByInvitedEmailIgnoreCaseAndStatus(email, InvitationStatus.PENDING);
        return java.util.stream.Stream.concat(byUser.stream(), byEmail.stream())
                .distinct()
                .map(this::toInvitationResponse)
                .toList();
    }

    public CommunityResponse getById(UUID id, UUID currentUserId) {
        return toResponse(getEntity(id), currentUserId);
    }

    public Community getEntity(UUID id) {
        return communityRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Community not found"));
    }

    public List<CommunityMemberResponse> getMembers(UUID communityId) {
        return membershipRepository.findByCommunityIdAndStatus(communityId, MembershipStatus.JOINED).stream()
                .map(this::toMemberResponse)
                .toList();
    }

    // --- Membership actions ---

    @Transactional
    public CommunityResponse join(UUID communityId, UUID userId) {
        Community community = getEntity(communityId);
        if (membershipRepository.findByCommunityIdAndUserId(communityId, userId).isPresent()) {
            throw ApiException.conflict(com.onevillage.backend.common.ErrorCode.CONFLICT, "You already joined or requested to join this community");
        }
        CommunityMembership membership = new CommunityMembership();
        membership.setCommunityId(communityId);
        membership.setUserId(userId);
        membership.setRoleInCommunity(CommunityMemberRole.MEMBER);
        if (community.getVisibility() == CommunityVisibility.PUBLIC) {
            membership.setStatus(MembershipStatus.JOINED);
            membership.setJoinedAt(Instant.now());
        } else {
            membership.setStatus(MembershipStatus.PENDING_REQUEST);
        }
        membershipRepository.save(membership);
        return toResponse(community, userId);
    }

    @Transactional
    public void leave(UUID communityId, UUID userId) {
        CommunityMembership membership = membershipRepository.findByCommunityIdAndUserId(communityId, userId)
                .orElseThrow(() -> ApiException.notFound("You are not a member of this community"));
        if (membership.getRoleInCommunity() == CommunityMemberRole.LEADER) {
            throw ApiException.badRequest("A community leader cannot leave their own community");
        }
        membershipRepository.delete(membership);
    }

    @Transactional
    public void invite(UUID communityId, UUID inviterId, String invitedEmail) {
        requireLeader(communityId, inviterId);
        CommunityInvitation invitation = new CommunityInvitation();
        invitation.setCommunityId(communityId);
        invitation.setInvitedEmail(invitedEmail.toLowerCase());
        userRepository.findByEmailIgnoreCase(invitedEmail).ifPresent(u -> invitation.setInvitedUserId(u.getId()));
        invitation.setInvitedBy(inviterId);
        invitationRepository.save(invitation);
    }

    @Transactional
    public void respondToInvitation(UUID invitationId, UUID userId, boolean accept) {
        CommunityInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> ApiException.notFound("Invitation not found"));
        invitation.setStatus(accept ? InvitationStatus.ACCEPTED : InvitationStatus.DECLINED);
        invitationRepository.save(invitation);
        if (accept) {
            Optional<CommunityMembership> existing = membershipRepository.findByCommunityIdAndUserId(invitation.getCommunityId(), userId);
            if (existing.isEmpty()) {
                CommunityMembership membership = new CommunityMembership();
                membership.setCommunityId(invitation.getCommunityId());
                membership.setUserId(userId);
                membership.setRoleInCommunity(CommunityMemberRole.MEMBER);
                membership.setStatus(MembershipStatus.JOINED);
                membership.setJoinedAt(Instant.now());
                membershipRepository.save(membership);
            }
        }
    }

    // --- Creation requests ("Create Community" / "Leader Application") ---

    @Transactional
    public CommunityCreationRequestResponse requestCreation(UUID applicantId, CreateCommunityRequest request) {
        CommunityCreationRequest creationRequest = new CommunityCreationRequest();
        creationRequest.setApplicantId(applicantId);
        creationRequest.setProposedName(request.name());
        creationRequest.setDescription(request.description());
        creationRequest.setCategory(request.category());
        creationRequest.setCity(request.city());
        creationRequest.setCoverImageUrl(request.coverImageUrl());
        if ("PRIVATE".equalsIgnoreCase(request.visibility())) {
            creationRequest.setVisibility(CommunityVisibility.PRIVATE);
        }
        // saveAndFlush (not save): the response below reads creationRequest.getCreatedAt(),
        // which @CreationTimestamp only populates once the INSERT actually executes.
        creationRequestRepository.saveAndFlush(creationRequest);
        return toCreationRequestResponse(creationRequest);
    }

    public List<CommunityCreationRequestResponse> getPendingCreationRequests() {
        return creationRequestRepository.findByStatus(CreationRequestStatus.PENDING).stream()
                .map(this::toCreationRequestResponse)
                .toList();
    }

    public List<CommunityCreationRequestResponse> getMyCreationRequests(UUID applicantId) {
        return creationRequestRepository.findByApplicantIdOrderByCreatedAtDesc(applicantId).stream()
                .map(this::toCreationRequestResponse)
                .toList();
    }

    @Transactional
    public void approveCreationRequest(UUID requestId, UUID adminId) {
        CommunityCreationRequest request = creationRequestRepository.findById(requestId)
                .orElseThrow(() -> ApiException.notFound("Request not found"));
        if (request.getStatus() != CreationRequestStatus.PENDING) {
            throw ApiException.badRequest("This request has already been reviewed");
        }

        Community community = new Community();
        community.setName(request.getProposedName());
        community.setDescription(request.getDescription());
        community.setCategory(request.getCategory());
        community.setCoverImageUrl(request.getCoverImageUrl());
        community.setVisibility(request.getVisibility());
        community.setStatus(CommunityStatus.ACTIVE);
        community.setLeaderId(request.getApplicantId());
        communityRepository.save(community);

        CommunityMembership leaderMembership = new CommunityMembership();
        leaderMembership.setCommunityId(community.getId());
        leaderMembership.setUserId(request.getApplicantId());
        leaderMembership.setRoleInCommunity(CommunityMemberRole.LEADER);
        leaderMembership.setStatus(MembershipStatus.JOINED);
        leaderMembership.setJoinedAt(Instant.now());
        membershipRepository.save(leaderMembership);

        userRepository.findById(request.getApplicantId()).ifPresent(user -> {
            if (user.getRole() == UserRole.MEMBER) {
                user.setRole(UserRole.COMMUNITY_LEADER);
                userRepository.save(user);
            }
        });

        request.setStatus(CreationRequestStatus.APPROVED);
        request.setReviewedBy(adminId);
        request.setReviewedAt(Instant.now());
        request.setResultingCommunityId(community.getId());
        creationRequestRepository.save(request);
    }

    @Transactional
    public void rejectCreationRequest(UUID requestId, UUID adminId) {
        CommunityCreationRequest request = creationRequestRepository.findById(requestId)
                .orElseThrow(() -> ApiException.notFound("Request not found"));
        if (request.getStatus() != CreationRequestStatus.PENDING) {
            throw ApiException.badRequest("This request has already been reviewed");
        }
        request.setStatus(CreationRequestStatus.REJECTED);
        request.setReviewedBy(adminId);
        request.setReviewedAt(Instant.now());
        creationRequestRepository.save(request);
    }

    // --- Leader dashboard ---

    public List<CommunityMemberResponse> getPendingJoinRequests(UUID communityId, UUID leaderId) {
        requireLeader(communityId, leaderId);
        return membershipRepository.findByCommunityIdAndStatus(communityId, MembershipStatus.PENDING_REQUEST).stream()
                .map(this::toMemberResponse)
                .toList();
    }

    @Transactional
    public void approveJoinRequest(UUID communityId, UUID memberUserId, UUID leaderId) {
        requireLeader(communityId, leaderId);
        CommunityMembership membership = membershipRepository.findByCommunityIdAndUserId(communityId, memberUserId)
                .orElseThrow(() -> ApiException.notFound("Join request not found"));
        membership.setStatus(MembershipStatus.JOINED);
        membership.setJoinedAt(Instant.now());
        membershipRepository.save(membership);
    }

    @Transactional
    public void rejectJoinRequest(UUID communityId, UUID memberUserId, UUID leaderId) {
        requireLeader(communityId, leaderId);
        membershipRepository.deleteByCommunityIdAndUserId(communityId, memberUserId);
    }

    public CommunityAnalyticsResponse getAnalytics(UUID communityId, UUID leaderId) {
        requireLeader(communityId, leaderId);
        long members = membershipRepository.countByCommunityIdAndStatus(communityId, MembershipStatus.JOINED);
        long pending = membershipRepository.countByCommunityIdAndStatus(communityId, MembershipStatus.PENDING_REQUEST);
        long upcomingEvents = eventRepository.countByCommunityIdAndStartAtAfter(communityId, Instant.now());
        return new CommunityAnalyticsResponse(members, pending, upcomingEvents);
    }

    private void requireLeader(UUID communityId, UUID userId) {
        Community community = getEntity(communityId);
        if (!community.getLeaderId().equals(userId)) {
            throw ApiException.forbidden("Only the community leader can perform this action");
        }
    }

    // --- Admin ---

    public List<CommunityResponse> adminListAll() {
        return communityRepository.findAll().stream().map(c -> toResponse(c, null)).toList();
    }

    @Transactional
    public void adminRemove(UUID communityId) {
        Community community = getEntity(communityId);
        community.setStatus(CommunityStatus.ARCHIVED);
        communityRepository.save(community);
    }

    public long countByStatus(CommunityStatus status) {
        return communityRepository.countByStatus(status);
    }

    // --- Mapping helpers ---

    private CommunityResponse toResponse(Community c, UUID currentUserId) {
        long memberCount = membershipRepository.countByCommunityIdAndStatus(c.getId(), MembershipStatus.JOINED);
        String leaderName = userRepository.findById(c.getLeaderId()).map(User::getFullName).orElse(null);
        String membershipState = "NONE";
        if (currentUserId != null) {
            membershipState = membershipRepository.findByCommunityIdAndUserId(c.getId(), currentUserId)
                    .map(m -> m.getStatus().name())
                    .orElse("NONE");
        }
        return new CommunityResponse(c.getId(), c.getName(), c.getDescription(), c.getCategory(), c.getVisibility(),
                c.getCoverImageUrl(), c.getIconName(), c.getColor(), c.getStatus(), c.getLeaderId(), leaderName,
                memberCount, membershipState, c.getCreatedAt());
    }

    private CommunityMemberResponse toMemberResponse(CommunityMembership m) {
        User user = userRepository.findById(m.getUserId()).orElse(null);
        return new CommunityMemberResponse(m.getUserId(), user == null ? null : user.getFullName(),
                user == null ? null : user.getAvatarUrl(), m.getRoleInCommunity(), m.getStatus(), m.getRequestedAt(), m.getJoinedAt());
    }

    private CommunityCreationRequestResponse toCreationRequestResponse(CommunityCreationRequest r) {
        String applicantName = userRepository.findById(r.getApplicantId()).map(User::getFullName).orElse(null);
        return new CommunityCreationRequestResponse(r.getId(), r.getApplicantId(), applicantName, r.getProposedName(),
                r.getDescription(), r.getCategory(), r.getCity(), r.getStatus(), r.getCreatedAt());
    }

    private CommunityInvitationResponse toInvitationResponse(CommunityInvitation invitation) {
        String communityName = communityRepository.findNameById(invitation.getCommunityId()).orElse(null);
        String inviterName = userRepository.findById(invitation.getInvitedBy()).map(User::getFullName).orElse(null);
        return new CommunityInvitationResponse(invitation.getId(), invitation.getCommunityId(), communityName,
                invitation.getInvitedBy(), inviterName, invitation.getStatus(), invitation.getCreatedAt());
    }
}
