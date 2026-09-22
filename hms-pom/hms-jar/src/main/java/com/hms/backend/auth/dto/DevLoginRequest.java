
package com.hms.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class DevLoginRequest {

    @NotBlank(message = "Username is required")
    private String username;

    public DevLoginRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
