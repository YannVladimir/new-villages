package com.onevillage.backend.auth;

import com.onevillage.backend.auth.dto.RegisterRequest;
import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.terms.TermsService;
import com.onevillage.backend.terms.TermsVersion;
import com.onevillage.backend.user.UserRepository;
import com.onevillage.backend.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserService userService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private TermsService termsService;
    @Mock
    private com.onevillage.backend.security.JwtService jwtService;
    @Mock
    private EmailService emailService;
    @Mock
    private EmailVerificationTokenRepository verificationTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, userService, passwordEncoder, termsService, jwtService,
                emailService, verificationTokenRepository, passwordResetTokenRepository, refreshTokenRepository);
    }

    @Test
    void register_rejectsDuplicateEmail() {
        when(userRepository.existsByEmailIgnoreCase("taken@onevillage.ca")).thenReturn(true);

        RegisterRequest request = new RegisterRequest("Jane Doe", "taken@onevillage.ca", "password123",
                "Canada", "Toronto", "English", "MEMBER", "1.0.0");

        assertThatThrownBy(() -> authService.register(request, "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void register_rejectsUnknownAccountType() {
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);

        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@onevillage.ca", "password123",
                "Canada", "Toronto", "English", "SUPERUSER", "1.0.0");

        assertThatThrownBy(() -> authService.register(request, "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("accountType");
    }

    @Test
    void register_rejectsStaleTermsVersion() {
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        TermsVersion current = new TermsVersion();
        current.setVersion("2.0.0");
        when(termsService.getCurrentVersionEntity()).thenReturn(current);

        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@onevillage.ca", "password123",
                "Canada", "Toronto", "English", "MEMBER", "1.0.0");

        assertThatThrownBy(() -> authService.register(request, "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("current Terms");
    }
}
