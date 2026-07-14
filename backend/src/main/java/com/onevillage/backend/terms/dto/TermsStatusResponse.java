package com.onevillage.backend.terms.dto;

public record TermsStatusResponse(
        boolean upToDate,
        String currentVersion,
        String acceptedVersion
) {
}
