package com.onevillage.backend.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record CreateEventRequest(
        UUID communityId,
        UUID organizationId,
        @NotBlank String title,
        String description,
        @NotBlank String type,
        @NotNull Instant startAt,
        boolean online,
        String location,
        String onlineLink,
        String coverImageUrl
) {
}
