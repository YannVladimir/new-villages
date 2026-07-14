package com.onevillage.backend.community.dto;

import com.onevillage.backend.community.CommunityStatus;
import com.onevillage.backend.community.CommunityVisibility;

import java.time.Instant;
import java.util.UUID;

public record CommunityResponse(
        UUID id,
        String name,
        String description,
        String category,
        CommunityVisibility visibility,
        String coverImageUrl,
        String iconName,
        String color,
        CommunityStatus status,
        UUID leaderId,
        String leaderName,
        long memberCount,
        String membershipState, // NONE | JOINED | PENDING_REQUEST
        Instant createdAt
) {
}
