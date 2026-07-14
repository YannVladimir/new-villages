package com.onevillage.backend.terms;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Append-only audit trail: never updated, only inserted. The server always
 * stamps {@code acceptedAt} itself — a client-supplied timestamp is never trusted.
 */
@Entity
@Table(name = "user_terms_acceptances")
@Getter
@Setter
@NoArgsConstructor
public class UserTermsAcceptance extends BaseId {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "terms_version_id", nullable = false)
    private UUID termsVersionId;

    @Column(name = "accepted_at", nullable = false)
    private Instant acceptedAt;

    @Column(name = "ip_address")
    private String ipAddress;
}
