package com.onevillage.backend.subscription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findByUserId(UUID userId);

    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);

    List<Subscription> findByStatus(SubscriptionStatus status);

    long countByStatus(SubscriptionStatus status);
}
