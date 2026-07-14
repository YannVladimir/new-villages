package com.onevillage.backend.terms;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TermsVersionRepository extends JpaRepository<TermsVersion, UUID> {

    Optional<TermsVersion> findByCurrentTrue();

    Optional<TermsVersion> findByVersion(String version);
}
