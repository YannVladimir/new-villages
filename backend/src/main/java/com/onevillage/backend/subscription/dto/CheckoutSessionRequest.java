package com.onevillage.backend.subscription.dto;

import jakarta.validation.constraints.NotBlank;

public record CheckoutSessionRequest(
        @NotBlank String plan // COMMUNITY_LEADER | ORGANIZATION
) {
}
