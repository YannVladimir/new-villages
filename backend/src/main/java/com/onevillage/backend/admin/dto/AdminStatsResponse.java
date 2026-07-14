package com.onevillage.backend.admin.dto;

public record AdminStatsResponse(
        long totalUsers,
        long totalCommunities,
        long activeSubscriptions,
        long openReports
) {
}
