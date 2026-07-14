package com.onevillage.backend.subscription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findBySubscriptionId(UUID subscriptionId);

    boolean existsByStripeInvoiceId(String stripeInvoiceId);
}
