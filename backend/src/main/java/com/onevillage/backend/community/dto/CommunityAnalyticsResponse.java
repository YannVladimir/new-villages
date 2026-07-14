package com.onevillage.backend.community.dto;

public record CommunityAnalyticsResponse(
        long totalMembers,
        long pendingJoinRequests,
        long upcomingEvents
) {
}
