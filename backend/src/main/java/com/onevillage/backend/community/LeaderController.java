package com.onevillage.backend.community;

import com.onevillage.backend.community.dto.CommunityAnalyticsResponse;
import com.onevillage.backend.community.dto.CommunityMemberResponse;
import com.onevillage.backend.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leader/communities/{communityId}")
public class LeaderController {

    private final CommunityService communityService;

    public LeaderController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping("/requests")
    public List<CommunityMemberResponse> pendingRequests(@PathVariable UUID communityId) {
        return communityService.getPendingJoinRequests(communityId, SecurityUtils.currentUserId());
    }

    @PostMapping("/requests/{userId}/approve")
    public ResponseEntity<Void> approve(@PathVariable UUID communityId, @PathVariable UUID userId) {
        communityService.approveJoinRequest(communityId, userId, SecurityUtils.currentUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/requests/{userId}/reject")
    public ResponseEntity<Void> reject(@PathVariable UUID communityId, @PathVariable UUID userId) {
        communityService.rejectJoinRequest(communityId, userId, SecurityUtils.currentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/analytics")
    public CommunityAnalyticsResponse analytics(@PathVariable UUID communityId) {
        return communityService.getAnalytics(communityId, SecurityUtils.currentUserId());
    }
}
