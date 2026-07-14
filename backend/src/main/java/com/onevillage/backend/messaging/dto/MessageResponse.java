package com.onevillage.backend.messaging.dto;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String body,
        Instant sentAt,
        boolean mine,
        Instant readAt
) {
}
