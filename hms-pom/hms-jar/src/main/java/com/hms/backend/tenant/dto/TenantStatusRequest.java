package com.hms.backend.tenant.dto;

import com.hms.backend.tenant.entity.TenantStatus;

import jakarta.validation.constraints.NotNull;

public class TenantStatusRequest {

    @NotNull(message = "Tenant status is required")
    private TenantStatus status;

    public TenantStatusRequest() {
    }

    public TenantStatus getStatus() {
        return status;
    }

    public void setStatus(TenantStatus status) {
        this.status = status;
    }
}