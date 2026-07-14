package com.onevillage.backend.admin;

import com.onevillage.backend.moderation.ActivityLogService;
import com.onevillage.backend.moderation.dto.ActivityLogResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/logs")
public class AdminLogController {

    private final ActivityLogService activityLogService;

    public AdminLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public List<ActivityLogResponse> list() {
        return activityLogService.list();
    }
}
