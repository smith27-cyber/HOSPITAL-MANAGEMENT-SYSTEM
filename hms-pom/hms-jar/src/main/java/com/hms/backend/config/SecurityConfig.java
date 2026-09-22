// =====================================================
// HMS SECURITY CONFIGURATION
// File:
// src/main/java/com/hms/backend/config/SecurityConfig.java
// =====================================================

package com.hms.backend.config;

import com.hms.backend.auth.security.JwtAuthenticationFilter;

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
            // CORS — blocked entirely, no configuration.
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
                        "/api/auth/login",
                        "/api/auth/register"
                    )
                    .permitAll()

                    .requestMatchers(
                        "/api/"
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
                    // SWAGGER UI & API DOCUMENTATION
                    // -----------------------------------------

                    .requestMatchers(
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/api-docs",
                        "/api-docs/**",
                        "/v3/api-docs",
                        "/v3/api-docs/**"
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
}