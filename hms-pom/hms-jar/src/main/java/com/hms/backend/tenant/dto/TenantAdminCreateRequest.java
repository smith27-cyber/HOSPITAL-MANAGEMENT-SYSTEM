package com.hms.backend.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TenantAdminCreateRequest {

    @NotBlank(message = "Username is required")
    @Size(
        max = 50,
        message = "Username cannot exceed 50 characters"
    )
    private String username;

    @NotBlank(message = "Password is required")
    @Size(
        min = 6,
        max = 100,
        message = "Password must be between 6 and 100 characters"
    )
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(
        max = 100,
        message = "Full name cannot exceed 100 characters"
    )
    private String fullName;

    public TenantAdminCreateRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}