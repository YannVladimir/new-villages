package com.onevillage.backend.event.dto;

import jakarta.validation.constraints.NotBlank;

public record RsvpRequest(
        @NotBlank String status
) {
}
