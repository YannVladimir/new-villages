package com.onevillage.backend.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommunityRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 2000) String description,
        String category,
        String city,
        String visibility,
        String coverImageUrl
) {
}
