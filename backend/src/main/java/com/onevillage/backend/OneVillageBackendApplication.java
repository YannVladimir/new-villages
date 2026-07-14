package com.onevillage.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

// UserDetailsServiceAutoConfiguration is excluded because auth is fully custom
// (JWT filter + manual password check in AuthService) — no Spring UserDetailsService is used.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableScheduling
public class OneVillageBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(OneVillageBackendApplication.class, args);
    }
}
