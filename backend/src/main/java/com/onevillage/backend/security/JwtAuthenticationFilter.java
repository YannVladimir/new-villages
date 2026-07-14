package com.onevillage.backend.security;

import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtService.parseClaims(token);
                if (jwtService.isAccessToken(claims) && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UUID userId = jwtService.getUserId(claims);
                    Optional<User> userOpt = userRepository.findById(userId);
                    if (userOpt.isPresent() && userOpt.get().isActive()) {
                        SecurityUser securityUser = new SecurityUser(userOpt.get());
                        var authToken = new UsernamePasswordAuthenticationToken(
                                securityUser, null, securityUser.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (JwtException | IllegalArgumentException ex) {
                log.debug("Rejected invalid JWT: {}", ex.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
