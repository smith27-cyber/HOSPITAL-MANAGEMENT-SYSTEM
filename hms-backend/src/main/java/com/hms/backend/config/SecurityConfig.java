
package com.hms.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
public class SecurityConfig {


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
            // AUTHORIZATION
            // =================================================

            .authorizeHttpRequests(
                auth -> auth

                    // -----------------------------------------
                    // AUTHENTICATION
                    // -----------------------------------------

                    .requestMatchers(
                        "/api/auth/**"
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
                    // HMS API
                    // -----------------------------------------

                    .requestMatchers(
                        "/api/health",
                        "/api/dashboard/**",
                        "/api/patients/**",
                        "/api/appointments/**",
                        "/api/doctors/**",
                        "/api/departments/**",
                        "/api/inventory/**",
                        "/api/laboratory/**",
                        "/api/pharmacy/**",
                        "/api/consultations/**",
                        "/api/billing/**",
                        "/api/admissions/**",
                        "/api/reports/**"
                    )
                    .permitAll()


                    // -----------------------------------------
                    // OTHER REQUESTS
                    // -----------------------------------------

                    .anyRequest()
                    .permitAll()
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
        // FRONTEND ORIGIN
        // =================================================

        configuration.setAllowedOrigins(
            List.of(
                "http://localhost:4200"
            )
        );


        // =================================================
        // ALLOWED METHODS
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
        // ALLOWED HEADERS
        // =================================================

        configuration.setAllowedHeaders(
            List.of("*")
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
        // REGISTER GLOBAL CORS
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

