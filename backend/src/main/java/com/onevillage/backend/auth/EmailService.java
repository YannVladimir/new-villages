package com.onevillage.backend.auth;

import com.onevillage.backend.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String frontendBaseUrl;
    private final String backendBaseUrl;

    public EmailService(JavaMailSender mailSender,
                         @Value("${app.mail.from}") String fromAddress,
                         @Value("${app.frontend.base-url}") String frontendBaseUrl,
                         @Value("${server.port}") String serverPort) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.frontendBaseUrl = frontendBaseUrl;
        this.backendBaseUrl = "http://localhost:" + serverPort;
    }

    public void sendVerificationEmail(User user, String token) {
        String link = frontendBaseUrl + "/verify-email?token=" + token;
        String directApiLink = backendBaseUrl + "/api/auth/verify-email?token=" + token;
        // Logged at INFO so you can verify accounts locally without a real mail server —
        // the direct API link can be opened in a browser or hit with curl/Postman.
        log.info("Verification email for {} — direct API link: {}", user.getEmail(), directApiLink);
        send(user.getEmail(), "Verify your OneVillage email",
                "Hi " + user.getFullName() + ",\n\n"
                        + "Welcome to OneVillage! Please verify your email address by opening this link:\n"
                        + link + "\n\n"
                        + "This link expires in 24 hours.");
    }

    public void sendPasswordResetEmail(User user, String token) {
        String link = frontendBaseUrl + "/reset-password?token=" + token;
        log.info("Password reset requested for {} — token: {}", user.getEmail(), token);
        send(user.getEmail(), "Reset your OneVillage password",
                "Hi " + user.getFullName() + ",\n\n"
                        + "We received a request to reset your password. Open this link to choose a new one:\n"
                        + link + "\n\n"
                        + "If you didn't request this, you can safely ignore this email. This link expires in 1 hour.");
    }

    private void send(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            // Never let a flaky mail provider break registration/reset flows; log and move on.
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
