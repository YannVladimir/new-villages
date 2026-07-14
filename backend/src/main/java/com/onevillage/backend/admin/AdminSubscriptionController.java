package com.onevillage.backend.admin;

import com.onevillage.backend.subscription.SubscriptionService;
import com.onevillage.backend.subscription.dto.AdminSubscriptionResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/subscriptions")
public class AdminSubscriptionController {

    private final SubscriptionService subscriptionService;

    public AdminSubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public List<AdminSubscriptionResponse> list() {
        return subscriptionService.adminListAll();
    }
}
