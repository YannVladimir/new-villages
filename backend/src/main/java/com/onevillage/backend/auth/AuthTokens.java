package com.onevillage.backend.auth;

import com.onevillage.backend.user.dto.UserResponse;

import java.time.Instant;

public record AuthTokens(
        String accessToken,
        String refreshToken,
        Instant refreshTokenExpiry,
        UserResponse user
) {
}
