package com.onevillage.backend.terms.dto;

import java.time.Instant;

public record TermsVersionResponse(
        String version,
        String body,
        Instant publishedAt
) {
}
