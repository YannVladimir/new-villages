package com.onevillage.backend.user.dto;

import com.onevillage.backend.user.AccountStatus;
import com.onevillage.backend.user.UserRole;

import java.time.Instant;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String fullName,
        String email,
        UserRole role,
        String city,
        AccountStatus accountStatus,
        Instant createdAt
) {
}
