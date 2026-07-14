package com.onevillage.backend.terms.dto;

import jakarta.validation.constraints.NotBlank;

public record AcceptTermsRequest(
        @NotBlank String version
) {
}
