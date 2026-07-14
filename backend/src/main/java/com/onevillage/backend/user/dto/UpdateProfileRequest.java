package com.onevillage.backend.user.dto;

import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record UpdateProfileRequest(
        @Size(min = 1, max = 120) String fullName,
        @Size(max = 500) String bio,
        @Size(max = 120) String city,
        String preferredLanguage,
        List<String> spokenLanguages,
        UUID selectedCommunityId
) {
}
