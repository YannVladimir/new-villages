package com.onevillage.backend.organization;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    Optional<Organization> findByOwnerUserId(UUID ownerUserId);

    List<Organization> findByStatus(OrganizationStatus status);
}
