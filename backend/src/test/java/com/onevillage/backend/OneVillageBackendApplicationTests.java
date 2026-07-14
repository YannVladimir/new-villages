package com.onevillage.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class OneVillageBackendApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the full Spring context wires up: every controller, service,
        // and repository resolves its dependencies with no circular beans.
    }
}
