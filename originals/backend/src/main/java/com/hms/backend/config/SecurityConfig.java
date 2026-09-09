
package com.hms.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            // =================================================
            // DISABLE CSRF
            // =================================================

            .csrf(AbstractHttpConfigurer::disable)


            // =================================================
            // ENABLE CORS
            // =================================================

            .cors(cors -> {})


            // =================================================
            // AUTHORIZATION
            // =================================================

            .authorizeHttpRequests(auth -> auth

                // ---------------------------------------------
                // AUTHENTICATION
                // ---------------------------------------------

                .requestMatchers(
                    "/api/auth/**"
                )
                .permitAll()


                // ---------------------------------------------
                // EXISTING HMS API
                // ---------------------------------------------

                .requestMatchers(
                    "/api/health",
                    "/api/dashboard/**",
                    "/api/patients/**",
                    "/api/appointments/**",
                    "/api/doctors/**",
                    "/api/departments/**",
                    "/api/inventory/**",
                    "/api/laboratory/**",
                    "/api/pharmacy/**"
                )
                .permitAll()


                // ---------------------------------------------
                // OTHER REQUESTS
                // ---------------------------------------------

                .anyRequest()
                .permitAll()
            );

        return http.build();
    }
}

