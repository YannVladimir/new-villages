package com.onevillage.backend.post;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.community.CommunityMembershipRepository;
import com.onevillage.backend.community.CommunityRepository;
import com.onevillage.backend.community.MembershipStatus;
import com.onevillage.backend.post.dto.CommunityPostResponse;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CommunityPostService {

    private final CommunityPostRepository postRepository;
    private final CommunityMembershipRepository membershipRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;

    public CommunityPostService(CommunityPostRepository postRepository,
                                 CommunityMembershipRepository membershipRepository,
                                 CommunityRepository communityRepository,
                                 UserRepository userRepository) {
        this.postRepository = postRepository;
        this.membershipRepository = membershipRepository;
        this.communityRepository = communityRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CommunityPostResponse create(UUID communityId, UUID authorId, String body) {
        boolean isMember = membershipRepository.findByCommunityIdAndUserId(communityId, authorId)
                .map(m -> m.getStatus() == MembershipStatus.JOINED)
                .orElse(false);
        if (!isMember) {
            throw ApiException.forbidden("Only members of this community can post here");
        }
        if (!communityRepository.existsById(communityId)) {
            throw ApiException.notFound("Community not found");
        }

        CommunityPost post = new CommunityPost();
        post.setCommunityId(communityId);
        post.setAuthorId(authorId);
        post.setBody(body);
        // saveAndFlush: the response below reads post.getCreatedAt(), which
        // @CreationTimestamp only populates once the INSERT actually executes.
        postRepository.saveAndFlush(post);

        return toResponse(post);
    }

    public Page<CommunityPostResponse> listForCommunity(UUID communityId, Pageable pageable) {
        return postRepository.findByCommunityIdOrderByCreatedAtDesc(communityId, pageable).map(this::toResponse);
    }

    public Page<CommunityPostResponse> listFeedForUser(UUID userId, Pageable pageable) {
        List<UUID> joinedCommunityIds = membershipRepository.findJoinedCommunityIds(userId);
        if (joinedCommunityIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return postRepository.findByCommunityIdInOrderByCreatedAtDesc(joinedCommunityIds, pageable).map(this::toResponse);
    }

    private CommunityPostResponse toResponse(CommunityPost post) {
        String communityName = communityRepository.findNameById(post.getCommunityId()).orElse(null);
        User author = userRepository.findById(post.getAuthorId()).orElse(null);
        return new CommunityPostResponse(
                post.getId(),
                post.getCommunityId(),
                communityName,
                post.getAuthorId(),
                author == null ? null : author.getFullName(),
                author == null ? null : author.getAvatarUrl(),
                post.getBody(),
                post.getCreatedAt()
        );
    }
}
