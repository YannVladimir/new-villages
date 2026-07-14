package com.onevillage.backend.community.dto;

import com.onevillage.backend.community.InvitationStatus;

import java.time.Instant;
import java.util.UUID;

public record CommunityInvitationResponse(
        UUID id,
        UUID communityId,
        String communityName,
        UUID invitedBy,
        String invitedByName,
        InvitationStatus status,
        Instant createdAt
) {
}
