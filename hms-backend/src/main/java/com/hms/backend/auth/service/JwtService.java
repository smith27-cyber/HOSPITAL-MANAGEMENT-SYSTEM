package com.hms.backend.auth.service;

import com.hms.backend.auth.entity.User;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final SecretKey secretKey;

    private final long expiration;

    public JwtService(
        @Value("${hms.jwt.secret}")
        String secret,

        @Value("${hms.jwt.expiration}")
        long expiration
    ) {

        this.secretKey =
            Keys.hmacShaKeyFor(
                secret.getBytes(
                    StandardCharsets.UTF_8
                )
            );

        this.expiration = expiration;
    }

    // =====================================================
    // GENERATE TOKEN
    // =====================================================

    public String generateToken(
        User user,
        List<String> roles,
        List<String> permissions
    ) {

        Date issuedAt =
            new Date();

        Date expiresAt =
            new Date(
                issuedAt.getTime() + expiration
            );

        return Jwts.builder()

            .subject(
                user.getUsername()
            )

            .claim(
                "userId",
                user.getId()
            )

            .claim(
                "username",
                user.getUsername()
            )

            .claim(
                "tenantId",
                user.getTenant() != null ? user.getTenant().getId() : null
            )

            .claim(
                "tenantCode",
                user.getTenant() != null ? user.getTenant().getCode() : null
            )

            .claim(
                "tenantName",
                user.getTenant() != null ? user.getTenant().getName() : null
            )

            .claim(
                "fullName",
                user.getFullName()
            )

            .claim(
                "role",
                user.getRole()
            )

            .claim(
                "roles",
                roles
            )

            .claim(
                "permissions",
                permissions
            )

            .issuedAt(
                issuedAt
            )

            .expiration(
                expiresAt
            )

            .signWith(
                secretKey
            )

            .compact();
    }

    // =====================================================
    // PARSE TOKEN
    // =====================================================

    public String extractUsername(
        String token
    ) {

        return Jwts.parser()

            .verifyWith(
                secretKey
            )

            .build()

            .parseSignedClaims(
                token
            )

            .getPayload()

            .getSubject();
    }

    // =====================================================
    // VALIDATE TOKEN
    // =====================================================

    public boolean isTokenValid(
        String token
    ) {

        try {

            Jwts.parser()

                .verifyWith(
                    secretKey
                )

                .build()

                .parseSignedClaims(
                    token
                );

            return true;

        }
        catch (Exception exception) {

            return false;
        }
    }
// =====================================================
// EXTRACT TENANT ID
// =====================================================

public Long extractTenantId(String token) {

    Object tenantId =
        Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .get("tenantId");

    if (tenantId == null) {
        return null;
    }

    if (tenantId instanceof Number number) {
        return number.longValue();
    }

    try {
        return Long.valueOf(
            tenantId.toString()
        );
    }
    catch (NumberFormatException exception) {
        return null;
    }
}
    // =====================================================
    // EXTRACT CLAIMS
    // =====================================================

    public List<String> extractPermissions(
        String token
    ) {

        Object permissions =
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("permissions");

        if (
            permissions instanceof List<?> list
        ) {

            return list
                .stream()
                .map(Object::toString)
                .toList();
        }

        return List.of();
    }

    public List<String> extractRoles(
        String token
    ) {

        Object roles =
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("roles");

        if (
            roles instanceof List<?> list
        ) {

            return list
                .stream()
                .map(Object::toString)
                .toList();
        }

        return List.of();
    }
}