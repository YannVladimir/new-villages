package com.onevillage.backend.subscription;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "subscriptions", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
@Getter
@Setter
@NoArgsConstructor
public class Subscription extends BaseId {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan plan = SubscriptionPlan.FREE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;

    @Column(name = "stripe_subscription_id")
    private String stripeSubscriptionId;

    @Column(name = "current_period_end")
    private Instant currentPeriodEnd;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
