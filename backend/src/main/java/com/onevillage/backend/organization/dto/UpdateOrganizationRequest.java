package com.onevillage.backend.organization.dto;

public record UpdateOrganizationRequest(
        String name,
        String description,
        String services,
        String contactEmail,
        String logoUrl
) {
}
