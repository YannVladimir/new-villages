package com.onevillage.backend.terms.dto;

import jakarta.validation.constraints.NotBlank;

public record PublishTermsRequest(
        @NotBlank String version,
        @NotBlank String body
) {
}
