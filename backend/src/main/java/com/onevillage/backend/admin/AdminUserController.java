package com.onevillage.backend.admin;

import com.onevillage.backend.common.PageResponse;
import com.onevillage.backend.moderation.ActivityLogService;
import com.onevillage.backend.security.SecurityUtils;
import com.onevillage.backend.user.UserService;
import com.onevillage.backend.user.dto.AdminUserResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;
    private final ActivityLogService activityLogService;

    public AdminUserController(UserService userService, ActivityLogService activityLogService) {
        this.userService = userService;
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public PageResponse<AdminUserResponse> search(@RequestParam(required = false) String search,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        return PageResponse.from(userService.adminSearch(search, PageRequest.of(page, size)));
    }

    @PatchMapping("/{id}/suspend")
    public ResponseEntity<Void> suspend(@PathVariable UUID id) {
        userService.suspend(id);
        activityLogService.log(SecurityUtils.currentUserId(), "User suspended", "USER", id, "Suspended by admin");
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reinstate")
    public ResponseEntity<Void> reinstate(@PathVariable UUID id) {
        userService.reinstate(id);
        activityLogService.log(SecurityUtils.currentUserId(), "User reinstated", "USER", id, "Reinstated by admin");
        return ResponseEntity.noContent().build();
    }
}
