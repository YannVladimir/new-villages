package com.onevillage.backend.notification.dto;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String type,
        String title,
        String description,
        UUID relatedEntityId,
        boolean isRead,
        Instant createdAt
) {
}
