package com.onevillage.backend.community;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "community_memberships", uniqueConstraints = @UniqueConstraint(columnNames = {"community_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
public class CommunityMembership extends BaseId {

    @Column(name = "community_id", nullable = false)
    private UUID communityId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_in_community", nullable = false)
    private CommunityMemberRole roleInCommunity = CommunityMemberRole.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MembershipStatus status;

    @CreationTimestamp
    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt;

    @Column(name = "joined_at")
    private Instant joinedAt;
}
