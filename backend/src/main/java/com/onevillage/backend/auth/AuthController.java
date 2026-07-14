package com.onevillage.backend.auth;

import com.onevillage.backend.auth.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        RegisterResponse response = authService.register(request, httpRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthTokens tokens = authService.login(request.email(), request.password());
        return withRefreshCookie(tokens);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = REFRESH_COOKIE_NAME, required = false) String cookieToken,
                                                 @RequestBody(required = false) Map<String, String> body) {
        String tokenFromBody = body != null ? body.get("refreshToken") : null;
        String refreshToken = cookieToken != null ? cookieToken : tokenFromBody;
        AuthTokens tokens = authService.refresh(refreshToken);
        return withRefreshCookie(tokens);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = REFRESH_COOKIE_NAME, required = false) String cookieToken) {
        authService.logout(cookieToken);
        ResponseCookie expired = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(0)
                .build();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, expired.toString())
                .build();
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam @NotBlank String token) {
        authService.verifyEmail(token);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<AuthResponse> withRefreshCookie(AuthTokens tokens) {
        Duration maxAge = Duration.between(java.time.Instant.now(), tokens.refreshTokenExpiry());
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, tokens.refreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(maxAge)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(tokens.accessToken(), tokens.user()));
    }
}
