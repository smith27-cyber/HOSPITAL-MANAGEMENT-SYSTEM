package com.hms.backend.platform.controller;

import com.hms.backend.auth.dto.PlatformUserResponse;
import com.hms.backend.platform.service.PlatformUserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/platform/users")
public class PlatformUserController {

    private final PlatformUserService platformUserService;


    public PlatformUserController(
            PlatformUserService platformUserService) {

        this.platformUserService =
                platformUserService;
    }


    // =====================================================
    // GET ALL USERS
    // =====================================================

    @GetMapping
    @PreAuthorize(
            "hasAuthority('PLATFORM_USER_VIEW')")
    public ResponseEntity<List<PlatformUserResponse>>
    getAllUsers() {

        return ResponseEntity.ok(
                platformUserService.getAllUsers());
    }


    // =====================================================
    // GET USER
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAuthority('PLATFORM_USER_VIEW')")
    public ResponseEntity<PlatformUserResponse>
    getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                platformUserService
                        .getUserById(id));
    }


    // =====================================================
    // ENABLE / DISABLE USER
    // =====================================================

    @PatchMapping("/{id}/status")
    @PreAuthorize(
            "hasAuthority('PLATFORM_USER_STATUS_UPDATE')")
    public ResponseEntity<PlatformUserResponse>
    updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {

        return ResponseEntity.ok(
                platformUserService
                        .updateUserStatus(
                                id,
                                enabled));
    }


    // =====================================================
    // DELETE USER
    // =====================================================

    @DeleteMapping("/{id}")
    @PreAuthorize(
            "hasAuthority('PLATFORM_USER_DELETE')")
    public ResponseEntity<Void>
    deleteUser(
            @PathVariable Long id) {

        platformUserService
                .deleteUser(id);

        return ResponseEntity
                .noContent()
                .build();
    }

}