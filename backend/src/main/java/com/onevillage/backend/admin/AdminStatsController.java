package com.onevillage.backend.admin;

import com.onevillage.backend.admin.dto.AdminStatsResponse;
import com.onevillage.backend.community.CommunityService;
import com.onevillage.backend.community.CommunityStatus;
import com.onevillage.backend.moderation.ReportService;
import com.onevillage.backend.subscription.SubscriptionService;
import com.onevillage.backend.subscription.SubscriptionStatus;
import com.onevillage.backend.user.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private final UserService userService;
    private final CommunityService communityService;
    private final SubscriptionService subscriptionService;
    private final ReportService reportService;

    public AdminStatsController(UserService userService,
                                 CommunityService communityService,
                                 SubscriptionService subscriptionService,
                                 ReportService reportService) {
        this.userService = userService;
        this.communityService = communityService;
        this.subscriptionService = subscriptionService;
        this.reportService = reportService;
    }

    @GetMapping("/overview")
    public AdminStatsResponse overview() {
        return new AdminStatsResponse(
                userService.countAll(),
                communityService.countByStatus(CommunityStatus.ACTIVE),
                subscriptionService.countByStatus(SubscriptionStatus.ACTIVE),
                reportService.countOpen()
        );
    }
}
