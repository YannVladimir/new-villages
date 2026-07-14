package com.onevillage.backend.moderation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SubmitReportRequest(
        @NotBlank String targetType,
        @NotNull UUID targetId,
        @NotBlank String reason,
        String details
) {
}
