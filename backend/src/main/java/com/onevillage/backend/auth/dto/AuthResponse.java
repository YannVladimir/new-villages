package com.onevillage.backend.auth.dto;

import com.onevillage.backend.user.dto.UserResponse;

public record AuthResponse(
        String accessToken,
        UserResponse user
) {
}
