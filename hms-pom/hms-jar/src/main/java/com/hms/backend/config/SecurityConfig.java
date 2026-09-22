// =====================================================
// HMS SECURITY CONFIGURATION
// File:
// src/main/java/com/hms/backend/config/SecurityConfig.java
// =====================================================

package com.hms.backend.config;

import com.hms.backend.auth.security.JwtAuthenticationFilter;
import com.hms.backend.platform.filter.ModuleAccessFilter;
import com.hms.backend.tenant.security.TenantContextFilter;

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
    // TENANT CONTEXT FILTER
    // =====================================================

    private final TenantContextFilter tenantContextFilter;

    // =====================================================
    // MODULE ACCESS FILTER
    // =====================================================

    private final ModuleAccessFilter moduleAccessFilter;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            TenantContextFilter tenantContextFilter,
            ModuleAccessFilter moduleAccessFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;

        this.tenantContextFilter = tenantContextFilter;

        this.moduleAccessFilter = moduleAccessFilter;
    }

    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // =================================================
                // CSRF
                // =================================================

                .csrf(
                        AbstractHttpConfigurer::disable)

                // =================================================
                // CORS
                // =================================================

                .cors(
                        cors -> cors.configurationSource(
                                corsConfigurationSource()))

                // =================================================
                // SESSION MANAGEMENT
                // =================================================

                .sessionManagement(
                        session -> session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))

                // =================================================
                // AUTHORIZATION
                // =================================================

                .authorizeHttpRequests(
                        auth -> auth

                                // -----------------------------------------
                                // PUBLIC AUTHENTICATION ENDPOINTS
                                // -----------------------------------------

                                .requestMatchers(
                                        "/api/auth/**")
                                .permitAll()

                                // -----------------------------------------
                                // PUBLIC HEALTH CHECK
                                // -----------------------------------------

                                .requestMatchers(
                                        "/api/health")
                                .permitAll()

                                // -----------------------------------------
                                // CORS PREFLIGHT
                                // -----------------------------------------

                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**")
                                .permitAll()

                                // -----------------------------------------
                                // SPRING ERROR ENDPOINT
                                // -----------------------------------------

                                .requestMatchers(
                                        "/error")
                                .permitAll()

                                // -----------------------------------------
                                // ANGULAR FRONTEND
                                // -----------------------------------------

                                .requestMatchers(

                                        // =====================================
                                        // ANGULAR ENTRY POINT
                                        // =====================================

                                        "/",
                                        "/index.html",
                                        "/favicon.ico",

                                        // =====================================
                                        // ANGULAR STATIC FILES
                                        // =====================================

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

                                        // =====================================
                                        // ANGULAR APPLICATION ROUTES
                                        // =====================================

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
                                        "/settings/**",
                                        // =====================================
                                        // OLIVES TECH PLATFORM
                                        // =====================================

                                        "/platform",
                                        "/platform/**")
                                .permitAll()

                                // -----------------------------------------
                                // EVERYTHING ELSE
                                // -----------------------------------------

                                .anyRequest()
                                .authenticated())

                // =================================================
                // JWT AUTHENTICATION FILTER
                // =================================================
                //
                // 1. Validate JWT
                // 2. Extract roles
                // 3. Extract permissions
                // 4. Create SecurityContext
                //
                // =================================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class)

                // =================================================
                // TENANT CONTEXT FILTER
                // =================================================
                //
                // JWT
                // ↓
                // JwtAuthenticationFilter
                // ↓
                // TenantContextFilter
                // ↓
                // ModuleAccessFilter
                // ↓
                // Controller
                //
                // =================================================

                .addFilterAfter(
                        tenantContextFilter,
                        JwtAuthenticationFilter.class)

                // =================================================
                // MODULE ACCESS FILTER
                // =================================================
                //
                // Checks whether the current tenant has the
                // requested HMS module enabled.
                //
                // Example:
                //
                // Atamba Pharmacy
                // Pharmacy ✅
                // Billing ✅
                // Inventory ✅
                // Laboratory ❌
                //
                // A request to:
                //
                // /api/laboratory/tests
                //
                // will therefore return 403.
                //
                // =================================================

                .addFilterAfter(
                        moduleAccessFilter,
                        TenantContextFilter.class);

        return http.build();
    }

    // =====================================================
    // GLOBAL CORS CONFIGURATION
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // =================================================
        // FRONTEND
        // =================================================

        configuration.setAllowedOrigins(
                List.of(
                         "http://localhost:4200"));
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
                        "OPTIONS"));

        // =================================================
        // HEADERS
        // =================================================

        configuration.setAllowedHeaders(
                List.of(
                        "*"));

        // =================================================
        // EXPOSED HEADERS
        // =================================================

        configuration.setExposedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"));

        // =================================================
        // CREDENTIALS
        // =================================================

        configuration.setAllowCredentials(
                false);

        // =================================================
        // PREFLIGHT CACHE
        // =================================================

        configuration.setMaxAge(
                3600L);

        // =================================================
        // REGISTER CORS
        // =================================================

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration);

        return source;
    }
}