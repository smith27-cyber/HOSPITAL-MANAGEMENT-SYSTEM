package com.hms.backend.auth.security;

import com.hms.backend.auth.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter
    extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(
        JwtService jwtService
    ) {

        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    )
        throws ServletException, IOException {

        String authorizationHeader =
            request.getHeader(
                HttpHeaders.AUTHORIZATION
            );

        /*
         * -------------------------------------------------
         * NO TOKEN
         * -------------------------------------------------
         */

        if (
            authorizationHeader == null ||
            !authorizationHeader.startsWith("Bearer ")
        ) {

            filterChain.doFilter(
                request,
                response
            );

            return;
        }

        String token =
            authorizationHeader.substring(7);

        /*
         * -------------------------------------------------
         * INVALID TOKEN
         * -------------------------------------------------
         */

        if (
            !jwtService.isTokenValid(token)
        ) {

            filterChain.doFilter(
                request,
                response
            );

            return;
        }

        try {

            String username =
                jwtService.extractUsername(
                    token
                );

            List<String> roles =
                jwtService.extractRoles(
                    token
                );

            List<String> permissions =
                jwtService.extractPermissions(
                    token
                );

            /*
             * ---------------------------------------------
             * BUILD AUTHORITIES
             * ---------------------------------------------
             */

            List<SimpleGrantedAuthority>
                authorities =
                    new ArrayList<>();

            /*
             * Roles
             */
            roles.forEach(
                role ->
                    authorities.add(
                        new SimpleGrantedAuthority(
                            "ROLE_" + role
                        )
                    )
            );

            /*
             * Permissions
             */
            permissions.forEach(
                permission ->
                    authorities.add(
                        new SimpleGrantedAuthority(
                            permission
                        )
                    )
            );

            /*
             * ---------------------------------------------
             * AUTHENTICATION
             * ---------------------------------------------
             */

            UsernamePasswordAuthenticationToken
                authentication =
                    new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        authorities
                    );

            authentication.setDetails(
                new WebAuthenticationDetailsSource()
                    .buildDetails(request)
            );

            SecurityContextHolder
                .getContext()
                .setAuthentication(
                    authentication
                );

        }
        catch (Exception exception) {

            SecurityContextHolder
                .clearContext();
        }

        filterChain.doFilter(
            request,
            response
        );
    }
}