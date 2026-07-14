package com.onevillage.backend.community.dto;

import com.onevillage.backend.community.CommunityMemberRole;
import com.onevillage.backend.community.MembershipStatus;

import java.time.Instant;
import java.util.UUID;

public record CommunityMemberResponse(
        UUID userId,
        String fullName,
        String avatarUrl,
        CommunityMemberRole roleInCommunity,
        MembershipStatus status,
        Instant requestedAt,
        Instant joinedAt
) {
}
