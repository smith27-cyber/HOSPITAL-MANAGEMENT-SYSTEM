package com.hms.backend.tenant.dto;

public class TenantAdminResponse {

    private Long userId;
    private String username;
    private String fullName;
    private String role;
    private Long tenantId;
    private String tenantCode;
    private String tenantName;

    public TenantAdminResponse() {
    }

    public TenantAdminResponse(
        Long userId,
        String username,
        String fullName,
        String role,
        Long tenantId,
        String tenantCode,
        String tenantName
    ) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.tenantId = tenantId;
        this.tenantCode = tenantCode;
        this.tenantName = tenantName;
    }

    public Long getUserId() {
        return userId;
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