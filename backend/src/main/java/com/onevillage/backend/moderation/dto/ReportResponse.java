package com.onevillage.backend.moderation.dto;

import com.onevillage.backend.moderation.ReportStatus;
import com.onevillage.backend.moderation.ReportTargetType;

import java.time.Instant;
import java.util.UUID;

public record ReportResponse(
        UUID id,
        String reporterName,
        ReportTargetType targetType,
        UUID targetId,
        String targetLabel,
        String reason,
        String details,
        ReportStatus status,
        Instant createdAt
) {
}
