package com.onevillage.backend.organization.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateOrganizationRequest(
        @NotBlank String name,
        String description,
        String services,
        String contactEmail
) {
}
