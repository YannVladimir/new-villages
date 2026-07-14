package com.onevillage.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    void deleteByUserId(UUID userId);
}
