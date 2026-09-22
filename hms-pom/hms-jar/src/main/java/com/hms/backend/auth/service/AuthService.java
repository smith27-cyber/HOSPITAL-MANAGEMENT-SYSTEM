package com.hms.backend.auth.service;

import com.hms.backend.auth.dto.DevLoginStatusResponse;
import com.hms.backend.auth.dto.LoginRequest;
import com.hms.backend.auth.dto.LoginResponse;
import com.hms.backend.auth.entity.User;
import com.hms.backend.auth.repository.UserRepository;
import com.hms.backend.entity.Permission;
import com.hms.backend.entity.Role;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    /*
     * ---------------------------------------------------------
     * DEV LOGIN — see devLogin() below.
     *
     * Both gates (this flag AND a loopback-only caller) are
     * required together; neither is sufficient on its own.
     * Default is false — only ever set true in a local,
     * non-shared environment.
     * ---------------------------------------------------------
     */

    private static final Set<String> DEV_LOGIN_USERNAMES =
        new LinkedHashSet<>(
            List.of(
                "thor",
                "doc-testuser",
                "nurse-testuser",
                "rec-testuser",
                "pharm-testuser",
                "lab-testuser",
                "acct-testuser",
                "records-testuser",
                "mgr-testuser"
            )
        );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final boolean devLoginEnabled;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,

        @Value("${hms.dev-login.enabled:false}")
        boolean devLoginEnabled
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.devLoginEnabled = devLoginEnabled;
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

        return buildLoginResponse(user);
    }

    /*
     * ---------------------------------------------------------
     * DEV LOGIN
     * ---------------------------------------------------------
     *
     * No password check — issues a real JWT for a small,
     * hardcoded set of dev-only accounts (DEV_LOGIN_USERNAMES),
     * gated behind two independent conditions that must BOTH
     * hold:
     *
     *   1. hms.dev-login.enabled=true (default false)
     *   2. the caller's remote address is loopback
     *      (127.0.0.1 / ::1 / 0:0:0:0:0:0:0:1)
     *
     * The caller (AuthController) is responsible for passing
     * the real remote address of the incoming request; this
     * method does not trust anything about the request other
     * than that address and the requested username.
     * ---------------------------------------------------------
     */

    @Transactional(readOnly = true)
    public LoginResponse devLogin(
        String username,
        String remoteAddr
    ) {

        if (!devLoginEnabled) {
            throw new RuntimeException(
                "Dev login is disabled"
            );
        }

        if (!isLoopbackAddress(remoteAddr)) {
            throw new RuntimeException(
                "Dev login is only available from the server itself"
            );
        }

        if (!DEV_LOGIN_USERNAMES.contains(username)) {
            throw new RuntimeException(
                "Unknown dev login username"
            );
        }

        User user =
            userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Dev login user not seeded: " + username
                    )
                );

        if (!user.isEnabled()) {
            throw new RuntimeException(
                "User account is disabled"
            );
        }

        return buildLoginResponse(user);
    }

    public DevLoginStatusResponse devLoginStatus() {

        return new DevLoginStatusResponse(
            devLoginEnabled,
            devLoginEnabled
                ? List.copyOf(DEV_LOGIN_USERNAMES)
                : List.of()
        );
    }

    private boolean isLoopbackAddress(String remoteAddr) {

        if (remoteAddr == null) {
            return false;
        }

        return remoteAddr.equals("127.0.0.1")
            || remoteAddr.equals("0:0:0:0:0:0:0:1")
            || remoteAddr.equals("::1");
    }

    /*
     * ---------------------------------------------------------
     * SHARED: build a LoginResponse (JWT + roles/permissions)
     * for an already-authenticated User. Used by both the
     * normal password login and dev login.
     * ---------------------------------------------------------
     */

    private LoginResponse buildLoginResponse(User user) {

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