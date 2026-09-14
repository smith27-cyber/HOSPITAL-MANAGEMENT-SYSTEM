package com.hms.backend.tenant.service;

import com.hms.backend.tenant.dto.TenantAdminCreateRequest;
import com.hms.backend.tenant.dto.TenantAdminResponse;
import com.hms.backend.tenant.dto.TenantCreateRequest;
import com.hms.backend.tenant.dto.TenantResponse;
import com.hms.backend.tenant.dto.TenantStatusRequest;
import com.hms.backend.tenant.dto.TenantUpdateRequest;

import java.util.List;

public interface TenantService {

    List<TenantResponse> getAllTenants();

    TenantResponse getTenantById(Long id);

    TenantResponse createTenant(
        TenantCreateRequest request
    );

    TenantResponse updateTenant(
        Long id,
        TenantUpdateRequest request
    );

    TenantResponse updateTenantStatus(
        Long id,
        TenantStatusRequest request
    );

    TenantAdminResponse createTenantAdmin(
        Long tenantId,
        TenantAdminCreateRequest request
    );
}