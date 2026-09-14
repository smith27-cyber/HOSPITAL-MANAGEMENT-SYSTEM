package com.hms.backend.auth.dto;

import java.util.List;

public class LoginResponse {

    private String token;

    private String username;

    private String fullName;

    /*
     * Legacy single-role field.
     * Keep temporarily for frontend compatibility.
     */
    private String role;

    /*
     * New RBAC roles.
     */
    private List<String> roles;

    /*
     * New RBAC permissions.
     */
    private List<String> permissions;
    private Long tenantId;

    private String tenantCode;

    private String tenantName;

    public LoginResponse() {
    }

    public LoginResponse(
        String token,
        String username,
        String fullName,
        String role,
        List<String> roles,
        List<String> permissions
    ) {

        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.roles = roles;
        this.permissions = permissions;
    }

    public String getToken() {
        return token;
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

    public List<String> getPermissions() {
        return permissions;
    }

      public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public String getTenantCode() {
        return tenantCode;
    }

    public void setTenantCode(String tenantCode) {
        this.tenantCode = tenantCode;
    }

    public String getTenantName() {
        return tenantName;
    }

    public void setTenantName(String tenantName) {
        this.tenantName = tenantName;
    }
}