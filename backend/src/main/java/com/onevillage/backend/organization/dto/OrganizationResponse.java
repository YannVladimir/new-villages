package com.onevillage.backend.organization.dto;

import com.onevillage.backend.organization.OrganizationStatus;

import java.time.Instant;
import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        UUID ownerUserId,
        String name,
        String description,
        String services,
        String logoUrl,
        String contactEmail,
        OrganizationStatus status,
        Instant createdAt
) {
}
