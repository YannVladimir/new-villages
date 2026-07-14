package com.onevillage.backend.subscription;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
public class Payment extends BaseId {

    @Column(name = "subscription_id", nullable = false)
    private UUID subscriptionId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private String status;

    @Column(name = "stripe_invoice_id")
    private String stripeInvoiceId;

    @Column(name = "paid_at", nullable = false)
    private Instant paidAt;
}
