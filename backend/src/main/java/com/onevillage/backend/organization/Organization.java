package com.onevillage.backend.organization;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
public class Organization extends BaseId {

    @Column(name = "owner_user_id", nullable = false, unique = true)
    private UUID ownerUserId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String services;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "contact_email")
    private String contactEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrganizationStatus status = OrganizationStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
