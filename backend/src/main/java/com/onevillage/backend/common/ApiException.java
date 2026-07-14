package com.onevillage.backend.common;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final ErrorCode code;

    public ApiException(HttpStatus status, ErrorCode code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public ErrorCode getCode() {
        return code;
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, message);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST, message);
    }

    public static ApiException conflict(ErrorCode code, String message) {
        return new ApiException(HttpStatus.CONFLICT, code, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, message);
    }

    public static ApiException unauthorized(ErrorCode code, String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, code, message);
    }

    public static ApiException termsUpdateRequired(String message) {
        return new ApiException(HttpStatus.CONFLICT, ErrorCode.TERMS_UPDATE_REQUIRED, message);
    }
}
