package com.hms.backend.tenant.security;

import com.hms.backend.auth.service.JwtService;
import com.hms.backend.tenant.context.TenantContext;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Establishes the tenant context from the signed JWT.
 *
 * IMPORTANT:
 * We do NOT read tenantId from request parameters or
 * request headers supplied by the frontend.
 *
 * The tenant comes from the signed JWT.
 */
@Component
public class TenantContextFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;

    public TenantContextFilter(
        JwtService jwtService
    ) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        try {

            String authorization =
                request.getHeader("Authorization");

            if (
                authorization != null &&
                authorization.startsWith("Bearer ")
            ) {

                String token =
                    authorization.substring(7).trim();

                if (!token.isBlank() &&
                    jwtService.isTokenValid(token)
                ) {

                    Long tenantId =
                        jwtService.extractTenantId(token);

                    /*
                     * A platform-level SUPER_ADMIN may
                     * legitimately have no tenant.
                     */
                    if (tenantId != null) {

                        TenantContext.setTenantId(
                            tenantId
                        );
                    }
                }
            }

            filterChain.doFilter(
                request,
                response
            );

        }
        finally {

            /*
             * Prevent tenant leakage between requests
             * when server threads are reused.
             */
            TenantContext.clear();
        }
    }
}