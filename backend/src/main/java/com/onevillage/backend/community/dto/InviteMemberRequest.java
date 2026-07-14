package com.onevillage.backend.community.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InviteMemberRequest(
        @NotBlank @Email String email
) {
}
