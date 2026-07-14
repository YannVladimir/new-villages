package com.onevillage.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(min = 1, max = 120) String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank String country,
        @NotBlank String city,
        String preferredLanguage,
        @NotBlank String accountType,
        @NotBlank String acceptedTermsVersion
) {
}
