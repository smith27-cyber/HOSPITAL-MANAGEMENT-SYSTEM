package com.hms.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Hospital Management System API",
                version = "1.0.0",
                description = "Complete REST API for the Hospital Management System (HMS). " +
                        "Manage patients, doctors, appointments, consultations, billing, and more.",
                contact = @Contact(
                        name = "HMS Development Team",
                        email = "support@hms.local"
                )
        ),
        servers = {
                @Server(
                        url = "http://localhost:8081",
                        description = "Development Server"
                ),
                @Server(
                        url = "https://hms.example.com",
                        description = "Production Server"
                )
        }
)
@SecurityScheme(
        name = "Bearer Authentication",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Enter JWT token",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
