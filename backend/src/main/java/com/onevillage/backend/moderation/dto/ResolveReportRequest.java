package com.onevillage.backend.moderation.dto;

import jakarta.validation.constraints.NotBlank;

public record ResolveReportRequest(
        @NotBlank String action // REMOVE_CONTENT | SUSPEND_USER | DISMISS
) {
}
