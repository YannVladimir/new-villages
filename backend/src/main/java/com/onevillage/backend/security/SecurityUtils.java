package com.onevillage.backend.security;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.common.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static SecurityUser currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof SecurityUser securityUser)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, "Not authenticated");
        }
        return securityUser;
    }

    public static UUID currentUserId() {
        return currentUser().getId();
    }
}
