package com.onevillage.backend.moderation.dto;

import java.time.Instant;
import java.util.UUID;

public record ActivityLogResponse(
        UUID id,
        String action,
        String actorName,
        String targetType,
        UUID targetId,
        String description,
        Instant createdAt
) {
}
