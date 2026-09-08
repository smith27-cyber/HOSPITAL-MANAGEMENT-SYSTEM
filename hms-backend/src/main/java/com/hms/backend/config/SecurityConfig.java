// =====================================================
// HMS SECURITY CONFIGURATION
// File:
// src/main/java/com/hms/backend/config/SecurityConfig.java
// =====================================================

package com.hms.backend.config;

import com.hms.backend.auth.security.JwtAuthenticationFilter;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;

import org.springframework.web.cors.CorsConfigurationSource;

import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


// =====================================================
// CONFIGURATION
// =====================================================

@Configuration
@EnableMethodSecurity
public class SecurityConfig {


    // =====================================================
    // JWT FILTER
    // =====================================================

    private final JwtAuthenticationFilter jwtAuthenticationFilter;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public SecurityConfig(
        JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }


    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
        HttpSecurity http
    ) throws Exception {

        http


            // =================================================
            // CSRF
            // =================================================

            .csrf(
                AbstractHttpConfigurer::disable
            )


            // =================================================
            // CORS
            // =================================================

            .cors(
                cors ->
                    cors.configurationSource(
                        corsConfigurationSource()
                    )
            )


            // =================================================
            // SESSION MANAGEMENT
            // =================================================

            .sessionManagement(
                session ->
                    session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS
                    )
            )


            // =================================================
            // AUTHORIZATION
            // =================================================

            .authorizeHttpRequests(
                auth -> auth


                    // -----------------------------------------
                    // PUBLIC AUTHENTICATION ENDPOINTS
                    // -----------------------------------------

                    .requestMatchers(
                        "/api/auth/**"
                    )
                    .permitAll()


                    // -----------------------------------------
                    // PUBLIC HEALTH CHECK
                    // -----------------------------------------

                    .requestMatchers(
                        "/api/health"
                    )
                    .permitAll()


                    // -----------------------------------------
                    // CORS PREFLIGHT
                    // -----------------------------------------

                    .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                    )
                    .permitAll()


                    // -----------------------------------------
                    // ANGULAR FRONTEND
                    // -----------------------------------------
                    //
                    // Spring Boot serves the Angular application
                    // from src/main/resources/static/
                    //
                    // These resources must be publicly accessible
                    // so the login page can load before authentication.
                    // -----------------------------------------
.requestMatchers(
    // =================================================
    // ANGULAR ENTRY POINT
    // =================================================
    "/",
    "/index.html",
    "/favicon.ico",

    // =================================================
    // ANGULAR STATIC FILES
    // =================================================
    "/assets/**",

    "/*.js",
    "/*.css",
    "/*.ico",
    "/*.png",
    "/*.jpg",
    "/*.jpeg",
    "/*.svg",
    "/*.webp",
    "/*.woff",
    "/*.woff2",
    "/*.ttf",

    // =================================================
    // ANGULAR APPLICATION ROUTES
    // =================================================
    //
    // These are frontend routes, not API endpoints.
    // Angular's authGuard handles application login.
    //
    "/login",
    "/dashboard",

    "/patients",
    "/patients/**",

    "/doctors",
    "/doctors/**",

    "/departments",
    "/departments/**",

    "/appointments",
    "/appointments/**",

    "/consultations",
    "/consultations/**",

    "/pharmacy",
    "/pharmacy/**",

    "/laboratory",
    "/laboratory/**",

    "/admissions",
    "/admissions/**",

    "/billing",
    "/billing/**",

    "/inventory",
    "/inventory/**",

    "/reports",
    "/reports/**",

    "/settings",
    "/settings/**"
)
.permitAll()


                    // -----------------------------------------
                    // EVERYTHING ELSE
                    // -----------------------------------------
                    //
                    // API endpoints and other protected resources
                    // require JWT authentication.
                    //
                    // Fine-grained authorization remains handled
                    // by @PreAuthorize.
                    // -----------------------------------------

                    .anyRequest()
                    .authenticated()
            )


            // =================================================
            // JWT AUTHENTICATION FILTER
            // =================================================

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );


        return http.build();
    }


    // =====================================================
    // GLOBAL CORS CONFIGURATION
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
            new CorsConfiguration();


        // =================================================
        // FRONTEND
        // =================================================

        configuration.setAllowedOrigins(
            List.of(
                "http://localhost:4200"
            )
        );


        // =================================================
        // METHODS
        // =================================================

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );


        // =================================================
        // HEADERS
        // =================================================

        configuration.setAllowedHeaders(
            List.of(
                "*"
            )
        );


        // =================================================
        // EXPOSED HEADERS
        // =================================================

        configuration.setExposedHeaders(
            List.of(
                "Authorization",
                "Content-Type"
            )
        );


        // =================================================
        // CREDENTIALS
        // =================================================

        configuration.setAllowCredentials(
            false
        );


        // =================================================
        // PREFLIGHT CACHE
        // =================================================

        configuration.setMaxAge(
            3600L
        );


        // =================================================
        // REGISTER CORS
        // =================================================

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
            "/**",
            configuration
        );


        return source;
    }
}