package com.onevillage.backend.community;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommunityMembershipRepository extends JpaRepository<CommunityMembership, UUID> {

    Optional<CommunityMembership> findByCommunityIdAndUserId(UUID communityId, UUID userId);

    List<CommunityMembership> findByUserIdAndStatus(UUID userId, MembershipStatus status);

    List<CommunityMembership> findByCommunityIdAndStatus(UUID communityId, MembershipStatus status);

    long countByCommunityIdAndStatus(UUID communityId, MembershipStatus status);

    @Query("select m.communityId from CommunityMembership m where m.userId = :userId and m.status = com.onevillage.backend.community.MembershipStatus.JOINED")
    List<UUID> findJoinedCommunityIds(@Param("userId") UUID userId);

    void deleteByCommunityIdAndUserId(UUID communityId, UUID userId);
}
