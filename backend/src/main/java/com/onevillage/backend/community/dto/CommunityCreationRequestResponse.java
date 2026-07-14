package com.onevillage.backend.community.dto;

import com.onevillage.backend.community.CreationRequestStatus;

import java.time.Instant;
import java.util.UUID;

public record CommunityCreationRequestResponse(
        UUID id,
        UUID applicantId,
        String applicantName,
        String proposedName,
        String description,
        String category,
        String city,
        CreationRequestStatus status,
        Instant createdAt
) {
}
