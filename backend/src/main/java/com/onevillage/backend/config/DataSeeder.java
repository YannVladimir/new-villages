package com.onevillage.backend.config;

import com.onevillage.backend.terms.TermsVersion;
import com.onevillage.backend.terms.TermsVersionRepository;
import com.onevillage.backend.user.AccountStatus;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import com.onevillage.backend.user.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Seeds the minimum data the platform cannot function without: a published
 * Terms of Use version (required by the mandatory terms-acceptance gate) and
 * one administrator account. Idempotent — safe to run on every startup.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final TermsVersionRepository termsVersionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.terms.seed-version}")
    private String seedTermsVersion;

    @Value("${app.seed.admin-email:admin@onevillage.ca}")
    private String adminEmail;

    @Value("${app.seed.admin-password:ChangeMe123!}")
    private String adminPassword;

    public DataSeeder(TermsVersionRepository termsVersionRepository,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.termsVersionRepository = termsVersionRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedTermsVersion();
        seedAdminUser();
    }

    private void seedTermsVersion() {
        if (termsVersionRepository.findByCurrentTrue().isPresent()) {
            return;
        }
        TermsVersion version = new TermsVersion();
        version.setVersion(seedTermsVersion);
        version.setBody("By using OneVillage you agree to our Terms of Use and Privacy Policy. "
                + "Replace this placeholder with your real legal text via POST /api/terms/publish.");
        version.setPublishedAt(Instant.now());
        version.setCurrent(true);
        termsVersionRepository.save(version);
        log.info("Seeded initial Terms of Use version {}", seedTermsVersion);
    }

    private void seedAdminUser() {
        if (userRepository.findFirstByRole(UserRole.ADMIN).isPresent()) {
            return;
        }
        User admin = new User();
        admin.setFullName("OneVillage Admin");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setCountry("Canada");
        admin.setCity("Toronto");
        admin.setAccountStatus(AccountStatus.ACTIVE);
        admin.setEmailVerified(true);
        userRepository.save(admin);
        log.warn("Seeded default admin account '{}' with a default password. "
                + "Change ADMIN_SEED_PASSWORD before deploying anywhere but your own machine.", adminEmail);
    }
}
