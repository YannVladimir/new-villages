package com.onevillage.backend.subscription.dto;

import com.onevillage.backend.subscription.SubscriptionPlan;
import com.onevillage.backend.subscription.SubscriptionStatus;

import java.time.Instant;
import java.util.UUID;

public record SubscriptionResponse(
        UUID id,
        SubscriptionPlan plan,
        SubscriptionStatus status,
        Instant currentPeriodEnd
) {
}
