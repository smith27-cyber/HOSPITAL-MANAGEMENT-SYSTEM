// =====================================================
// HMS SECURITY CONFIGURATION
// File:
// src/main/java/com/hms/backend/config/SecurityConfig.java
// =====================================================

package com.hms.backend.config;

import com.hms.backend.auth.security.JwtAuthenticationFilter;
import com.hms.backend.platform.filter.ModuleAccessFilter;
import com.hms.backend.tenant.security.TenantContextFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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
                // CORS - blocked entirely, no configuration.
                //
                // The delivering server (ng serve's dev proxy, or
                // hms-webb's Web API forwarding layer when packaged)
                // is the only thing the browser ever talks to; both
                // forward /api/** to hms-jar server-side. There is
                // never a legitimate cross-origin request to allow.
                // =================================================

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
}