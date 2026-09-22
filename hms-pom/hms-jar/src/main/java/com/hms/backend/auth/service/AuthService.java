package com.hms.backend.auth.service;

import com.hms.backend.auth.dto.LoginRequest;
import com.hms.backend.auth.dto.LoginResponse;
import com.hms.backend.auth.entity.User;
import com.hms.backend.auth.repository.UserRepository;
import com.hms.backend.entity.Permission;
import com.hms.backend.entity.Role;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {

        User user = userRepository
            .findByUsername(request.getUsername())
            .orElseThrow(() ->
                new RuntimeException(
                    "Invalid username or password"
                )
            );

        if (!user.isEnabled()) {
            throw new RuntimeException(
                "User account is disabled"
            );
        }

        if (!passwordEncoder.matches(
            request.getPassword(),
            user.getPassword()
        )) {

            throw new RuntimeException(
                "Invalid username or password"
            );
        }

        /*
         * --------------------------------------------------
         * RBAC ROLES
         * --------------------------------------------------
         */

        List<String> roles =
            user.getRoles()
                .stream()
                .map(Role::getName)
                .sorted()
                .toList();

        /*
         * --------------------------------------------------
         * RBAC PERMISSIONS
         * --------------------------------------------------
         */

        List<String> permissions =
            user.getRoles()
                .stream()
                .flatMap(
                    role -> role.getPermissions().stream()
                )
                .map(Permission::getCode)
                .distinct()
                .sorted()
                .toList();

        /*
         * --------------------------------------------------
         * GENERATE JWT
         * --------------------------------------------------
         */

        String token =
            jwtService.generateToken(
                user,
                roles,
                permissions
            );

        /*
         * --------------------------------------------------
         * LEGACY ROLE FALLBACK
         * --------------------------------------------------
         */

        String primaryRole =
            user.getRole();

        if (
            primaryRole == null ||
            primaryRole.isBlank()
        ) {

            primaryRole =
                roles.isEmpty()
                    ? null
                    : roles.get(0);
        }

        /*
         * --------------------------------------------------
         * LOGIN RESPONSE
         * --------------------------------------------------
         */

        return new LoginResponse(
            token,
            user.getUsername(),
            user.getFullName(),
            primaryRole,
            roles,
            permissions
        );
    }
}