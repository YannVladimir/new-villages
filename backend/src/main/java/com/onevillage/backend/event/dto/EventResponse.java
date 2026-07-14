package com.onevillage.backend.event.dto;

import com.onevillage.backend.event.EventType;
import com.onevillage.backend.event.RsvpStatus;

import java.time.Instant;
import java.util.UUID;

public record EventResponse(
        UUID id,
        UUID communityId,
        String communityName,
        UUID organizationId,
        String organizationName,
        String title,
        String description,
        EventType type,
        Instant startAt,
        boolean online,
        String location,
        String onlineLink,
        String coverImageUrl,
        UUID createdBy,
        long goingCount,
        RsvpStatus myRsvpStatus,
        Instant createdAt
) {
}
