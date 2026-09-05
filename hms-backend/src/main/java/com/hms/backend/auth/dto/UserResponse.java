package com.hms.backend.auth.dto;

import com.hms.backend.auth.entity.User;

import java.time.LocalDateTime;
import java.util.List;

public class UserResponse {

    private Long id;
    private String username;
    private String fullName;
    private String role;
    private List<String> roles;
    private boolean enabled;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public static UserResponse fromUser(User user) {

        UserResponse response = new UserResponse();

        response.id = user.getId();
        response.username = user.getUsername();
        response.fullName = user.getFullName();
        response.role = user.getRole();
        response.enabled = user.isEnabled();
        response.createdAt = user.getCreatedAt();

        if (user.getRoles() != null) {
            response.roles = user.getRoles()
                .stream()
                .map(role -> role.getName())
                .sorted()
                .toList();
        } else {
            response.roles = List.of();
        }

        return response;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public List<String> getRoles() {
        return roles;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}