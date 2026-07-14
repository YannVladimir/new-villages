package com.onevillage.backend.messaging.dto;

import java.time.Instant;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        UUID otherUserId,
        String otherUserName,
        String otherUserAvatar,
        String otherUserRole,
        String lastMessage,
        Instant lastMessageAt,
        long unreadCount
) {
}
