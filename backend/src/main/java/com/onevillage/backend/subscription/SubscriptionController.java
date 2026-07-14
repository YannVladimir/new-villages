package com.onevillage.backend.subscription;

import com.onevillage.backend.security.SecurityUtils;
import com.onevillage.backend.subscription.dto.CheckoutSessionRequest;
import com.onevillage.backend.subscription.dto.CheckoutSessionResponse;
import com.onevillage.backend.subscription.dto.PlanResponse;
import com.onevillage.backend.subscription.dto.SubscriptionResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/plans")
    public List<PlanResponse> plans() {
        return subscriptionService.getPlans();
    }

    @GetMapping("/me")
    public SubscriptionResponse mine() {
        return subscriptionService.getMine(SecurityUtils.currentUserId());
    }

    @PostMapping("/checkout-session")
    public CheckoutSessionResponse checkout(@Valid @RequestBody CheckoutSessionRequest request) {
        return subscriptionService.createCheckoutSession(SecurityUtils.currentUserId(), request.plan());
    }

    @PostMapping("/cancel")
    public ResponseEntity<Void> cancel() {
        subscriptionService.cancel(SecurityUtils.currentUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody String payload,
                                        @RequestHeader("Stripe-Signature") String signature) {
        subscriptionService.handleWebhookEvent(payload, signature);
        return ResponseEntity.ok().build();
    }
}
