package com.hms.backend.auth.dto;

import com.hms.backend.auth.entity.User;

import java.time.LocalDateTime;
import java.util.List;

public class PlatformUserResponse {

    private Long id;

    private String username;

    private String fullName;

    private String role;

    private List<String> roles;

    private boolean enabled;

    private LocalDateTime createdAt;

    private Long tenantId;

    private String tenantCode;

    private String tenantName;


    public PlatformUserResponse() {
    }


    public static PlatformUserResponse fromUser(User user) {

        PlatformUserResponse response =
                new PlatformUserResponse();

        response.id =
                user.getId();

        response.username =
                user.getUsername();

        response.fullName =
                user.getFullName();

        response.role =
                user.getRole();

        response.enabled =
                user.isEnabled();

        response.createdAt =
                user.getCreatedAt();


        if (user.getRoles() != null) {

            response.roles =
                    user.getRoles()
                            .stream()
                            .map(role -> role.getName())
                            .sorted()
                            .toList();

        } else {

            response.roles =
                    List.of();
        }


        /*
         * SUPER_ADMIN is a platform-level user and therefore
         * does not belong to a tenant.
         */

        if (user.getTenant() != null) {

            response.tenantId =
                    user.getTenant().getId();

            response.tenantCode =
                    user.getTenant().getCode();

            response.tenantName =
                    user.getTenant().getName();

        } else {

            response.tenantId = null;

            response.tenantCode =
                    "PLATFORM";

            response.tenantName =
                    "Olives Tech Platform";
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


    public Long getTenantId() {
        return tenantId;
    }


    public String getTenantCode() {
        return tenantCode;
    }


    public String getTenantName() {
        return tenantName;
    }
}