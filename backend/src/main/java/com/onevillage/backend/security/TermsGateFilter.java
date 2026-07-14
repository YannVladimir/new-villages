package com.onevillage.backend.security;

import com.onevillage.backend.terms.TermsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Blocks access to the app for any authenticated user who has not accepted the
 * currently published Terms of Use / Privacy Policy version, per the mandatory
 * terms-acceptance requirement. Frontend intercepts the 409 TERMS_UPDATE_REQUIRED
 * response and routes to /re-consent.
 */
public class TermsGateFilter extends OncePerRequestFilter {

    private static final List<String> WHITELIST_PREFIXES = List.of(
            "/api/auth/",
            "/api/terms/",
            "/actuator/",
            "/swagger-ui",
            "/v3/api-docs",
            "/api/subscriptions/webhook",
            "/uploads/"
    );

    private final TermsService termsService;

    public TermsGateFilter(TermsService termsService) {
        this.termsService = termsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean whitelisted = WHITELIST_PREFIXES.stream().anyMatch(path::startsWith);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (!whitelisted && auth != null && auth.getPrincipal() instanceof SecurityUser securityUser) {
            boolean upToDate = termsService.hasAcceptedCurrentVersion(securityUser.getId());
            if (!upToDate) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"code\":\"TERMS_UPDATE_REQUIRED\",\"message\":\"You must accept the latest Terms of Use and Privacy Policy before continuing.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
