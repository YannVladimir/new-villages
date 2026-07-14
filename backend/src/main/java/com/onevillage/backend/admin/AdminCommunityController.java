package com.onevillage.backend.admin;

import com.onevillage.backend.community.CommunityService;
import com.onevillage.backend.community.dto.CommunityCreationRequestResponse;
import com.onevillage.backend.community.dto.CommunityResponse;
import com.onevillage.backend.moderation.ActivityLogService;
import com.onevillage.backend.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminCommunityController {

    private final CommunityService communityService;
    private final ActivityLogService activityLogService;

    public AdminCommunityController(CommunityService communityService, ActivityLogService activityLogService) {
        this.communityService = communityService;
        this.activityLogService = activityLogService;
    }

    @GetMapping("/leader-applications")
    public List<CommunityCreationRequestResponse> pendingApplications() {
        return communityService.getPendingCreationRequests();
    }

    @PostMapping("/leader-applications/{id}/approve")
    public ResponseEntity<Void> approve(@PathVariable UUID id) {
        UUID adminId = SecurityUtils.currentUserId();
        communityService.approveCreationRequest(id, adminId);
        activityLogService.log(adminId, "Leader application approved", "COMMUNITY_CREATION_REQUEST", id, "Approved by admin");
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/leader-applications/{id}/reject")
    public ResponseEntity<Void> reject(@PathVariable UUID id) {
        UUID adminId = SecurityUtils.currentUserId();
        communityService.rejectCreationRequest(id, adminId);
        activityLogService.log(adminId, "Leader application rejected", "COMMUNITY_CREATION_REQUEST", id, "Rejected by admin");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/communities")
    public List<CommunityResponse> allCommunities() {
        return communityService.adminListAll();
    }

    @DeleteMapping("/communities/{id}")
    public ResponseEntity<Void> removeCommunity(@PathVariable UUID id) {
        UUID adminId = SecurityUtils.currentUserId();
        communityService.adminRemove(id);
        activityLogService.log(adminId, "Community removed", "COMMUNITY", id, "Archived by admin");
        return ResponseEntity.noContent().build();
    }
}
