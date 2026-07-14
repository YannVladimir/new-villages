package com.onevillage.backend.post.dto;

import java.time.Instant;
import java.util.UUID;

public record CommunityPostResponse(
        UUID id,
        UUID communityId,
        String communityName,
        UUID authorId,
        String authorName,
        String authorAvatarUrl,
        String body,
        Instant createdAt
) {
}
