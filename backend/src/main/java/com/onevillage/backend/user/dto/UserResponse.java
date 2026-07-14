package com.onevillage.backend.user.dto;

import com.onevillage.backend.user.AccountStatus;
import com.onevillage.backend.user.UserRole;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        UserRole role,
        String country,
        String city,
        String preferredLanguage,
        String bio,
        String avatarUrl,
        AccountStatus accountStatus,
        boolean emailVerified,
        UUID selectedCommunityId,
        String selectedCommunityName,
        List<String> spokenLanguages,
        String acceptedTermsVersion,
        Instant acceptedTermsDate,
        Instant createdAt
) {
}
