package com.onevillage.backend.common;

import java.time.Instant;
import java.util.Map;

public record ApiErrorResponse(
        Instant timestamp,
        int status,
        ErrorCode code,
        String message,
        String path,
        Map<String, String> fieldErrors
) {
    public static ApiErrorResponse of(int status, ErrorCode code, String message, String path) {
        return new ApiErrorResponse(Instant.now(), status, code, message, path, null);
    }

    public static ApiErrorResponse of(int status, ErrorCode code, String message, String path, Map<String, String> fieldErrors) {
        return new ApiErrorResponse(Instant.now(), status, code, message, path, fieldErrors);
    }
}
