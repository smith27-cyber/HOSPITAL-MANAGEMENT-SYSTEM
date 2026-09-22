package com.hms.backend.auth.controller;

import com.hms.backend.auth.dto.ChangePasswordRequest;
import com.hms.backend.auth.dto.UserCreateRequest;
import com.hms.backend.auth.dto.UserResponse;
import com.hms.backend.auth.dto.UserUpdateRequest;
import com.hms.backend.auth.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAuthority('SETTINGS_USER_MANAGE')")
public class UserController {

    private final UserService userService;

    public UserController(
        UserService userService
    ) {
        this.userService = userService;
    }

    /*
     * -----------------------------------------------------
     * CREATE USER
     * -----------------------------------------------------
     */

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
        @Valid @RequestBody UserCreateRequest request
    ) {

        UserResponse response =
            userService.createUser(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    /*
     * -----------------------------------------------------
     * GET ALL USERS
     * -----------------------------------------------------
     */

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
            userService.getAllUsers()
        );
    }

    /*
     * -----------------------------------------------------
     * GET USER BY ID
     * -----------------------------------------------------
     */

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
        @PathVariable Long id
    ) {

        return ResponseEntity.ok(
            userService.getUserById(id)
        );
    }

    /*
     * -----------------------------------------------------
     * UPDATE USER
     * -----------------------------------------------------
     */

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
        @PathVariable Long id,
        @Valid @RequestBody UserUpdateRequest request
    ) {

        return ResponseEntity.ok(
            userService.updateUser(
                id,
                request
            )
        );
    }

    /*
     * -----------------------------------------------------
     * ENABLE / DISABLE USER
     * -----------------------------------------------------
     */

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
        @PathVariable Long id,
        @RequestParam boolean enabled
    ) {

        return ResponseEntity.ok(
            userService.updateUserStatus(
                id,
                enabled
            )
        );
    }

    /*
     * -----------------------------------------------------
     * CHANGE PASSWORD
     * -----------------------------------------------------
     */

    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(
        @PathVariable Long id,
        @Valid @RequestBody ChangePasswordRequest request
    ) {

        userService.changePassword(
            id,
            request
        );

        return ResponseEntity.noContent().build();
    }

    /*
     * -----------------------------------------------------
     * DELETE USER
     * -----------------------------------------------------
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
        @PathVariable Long id
    ) {

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}