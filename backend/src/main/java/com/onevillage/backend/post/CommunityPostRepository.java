package com.onevillage.backend.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, UUID> {

    Page<CommunityPost> findByCommunityIdOrderByCreatedAtDesc(UUID communityId, Pageable pageable);

    Page<CommunityPost> findByCommunityIdInOrderByCreatedAtDesc(List<UUID> communityIds, Pageable pageable);
}
