
package com.hms.backend.auth.controller;

import com.hms.backend.auth.dto.DevLoginRequest;
import com.hms.backend.auth.dto.DevLoginStatusResponse;
import com.hms.backend.auth.dto.LoginRequest;
import com.hms.backend.auth.dto.LoginResponse;
import com.hms.backend.auth.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }


    /*
     * -----------------------------------------------------
     * DEV LOGIN — no password, gated server-side by
     * hms.dev-login.enabled + loopback-only caller. See
     * AuthService.devLogin() for the real enforcement; this
     * endpoint only forwards the caller's true remote address.
     * -----------------------------------------------------
     */

    @PostMapping("/dev-login")
    public ResponseEntity<LoginResponse> devLogin(
            @Valid @RequestBody DevLoginRequest request,
            HttpServletRequest httpRequest
    ) {

        LoginResponse response =
            authService.devLogin(
                request.getUsername(),
                httpRequest.getRemoteAddr()
            );

        return ResponseEntity.ok(response);
    }


    /*
     * -----------------------------------------------------
     * DEV LOGIN STATUS — public, no sensitive info beyond
     * "is dev login on" and the fixed username list; used by
     * the frontend to decide whether to render the dev-login
     * buttons at all. Never the actual security boundary.
     * -----------------------------------------------------
     */

    @GetMapping("/dev-login/status")
    public ResponseEntity<DevLoginStatusResponse> devLoginStatus() {

        return ResponseEntity.ok(
            authService.devLoginStatus()
        );
    }
}

