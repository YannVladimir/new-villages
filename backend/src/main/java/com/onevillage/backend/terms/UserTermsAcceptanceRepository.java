package com.onevillage.backend.terms;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserTermsAcceptanceRepository extends JpaRepository<UserTermsAcceptance, UUID> {

    Optional<UserTermsAcceptance> findTopByUserIdOrderByAcceptedAtDesc(UUID userId);

    boolean existsByUserIdAndTermsVersionId(UUID userId, UUID termsVersionId);
}
