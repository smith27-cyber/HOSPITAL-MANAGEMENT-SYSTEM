
package com.hms.backend.auth;

import com.hms.backend.auth.entity.User;
import com.hms.backend.auth.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthDataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            if (!userRepository.existsByUsername("admin")) {

                User admin = new User(
                        "admin",
                        passwordEncoder.encode("admin123"),
                        "HMS Administrator",
                        "ADMIN"
                );

                admin.setEnabled(true);

                userRepository.save(admin);

                System.out.println(
                        "================================================="
                );

                System.out.println(
                        "HMS ADMIN USER CREATED"
                );

                System.out.println(
                        "Username: admin"
                );

                System.out.println(
                        "Password: admin123"
                );

                System.out.println(
                        "================================================="
                );
            }
        };
    }
}

