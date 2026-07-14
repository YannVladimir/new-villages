package com.onevillage.backend.user.dto;

import com.onevillage.backend.user.UserRole;

import java.util.UUID;

public record PublicUserResponse(
        UUID id,
        String fullName,
        UserRole role,
        String city,
        String bio,
        String avatarUrl
) {
}
