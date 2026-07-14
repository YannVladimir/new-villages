package com.onevillage.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class JwtService {

    private static final String CLAIM_TOKEN_TYPE = "type";
    private static final String CLAIM_ROLE = "role";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    private final SecretKey signingKey;
    private final long accessTokenTtlMinutes;
    private final long refreshTokenTtlDays;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-ttl-minutes}") long accessTokenTtlMinutes,
            @Value("${app.jwt.refresh-token-ttl-days}") long refreshTokenTtlDays
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenTtlMinutes = accessTokenTtlMinutes;
        this.refreshTokenTtlDays = refreshTokenTtlDays;
    }

    public String generateAccessToken(UUID userId, String email, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim(CLAIM_ROLE, role)
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_ACCESS)
                .issuedAt(java.util.Date.from(now))
                .expiration(java.util.Date.from(now.plus(accessTokenTtlMinutes, ChronoUnit.MINUTES)))
                .signWith(signingKey)
                .compact();
    }

    public String generateRefreshToken(UUID userId, UUID tokenId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .id(tokenId.toString())
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_REFRESH)
                .issuedAt(java.util.Date.from(now))
                .expiration(java.util.Date.from(now.plus(refreshTokenTtlDays, ChronoUnit.DAYS)))
                .signWith(signingKey)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isRefreshToken(Claims claims) {
        return TOKEN_TYPE_REFRESH.equals(claims.get(CLAIM_TOKEN_TYPE, String.class));
    }

    public boolean isAccessToken(Claims claims) {
        return TOKEN_TYPE_ACCESS.equals(claims.get(CLAIM_TOKEN_TYPE, String.class));
    }

    public UUID getUserId(Claims claims) {
        return UUID.fromString(claims.getSubject());
    }

    public UUID getTokenId(Claims claims) {
        return UUID.fromString(claims.getId());
    }

    public long getRefreshTokenTtlDays() {
        return refreshTokenTtlDays;
    }
}
