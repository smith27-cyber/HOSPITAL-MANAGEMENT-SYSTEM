package com.hms.backend.tenant.controller;

import com.hms.backend.tenant.dto.TenantCreateRequest;
import com.hms.backend.tenant.dto.TenantResponse;
import com.hms.backend.tenant.dto.TenantStatusRequest;
import com.hms.backend.tenant.dto.TenantUpdateRequest;
import com.hms.backend.tenant.service.TenantService;
import com.hms.backend.tenant.dto.TenantAdminCreateRequest;
import com.hms.backend.tenant.dto.TenantAdminResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(
        TenantService tenantService
    ) {
        this.tenantService =
            tenantService;
    }


    // =====================================================
    // GET ALL TENANTS
    // =====================================================

    @PreAuthorize(
        "hasAuthority('TENANT_VIEW')"
    )
    @GetMapping
    public ResponseEntity<List<TenantResponse>>
    getAllTenants() {

        return ResponseEntity.ok(
            tenantService.getAllTenants()
        );
    }
// =====================================================
// CREATE TENANT ADMINISTRATOR
// =====================================================

@PreAuthorize(
    "hasAuthority('TENANT_ADMIN_CREATE')"
)
@PostMapping("/{id}/admin")
public ResponseEntity<TenantAdminResponse>
createTenantAdmin(
    @PathVariable Long id,
    @Valid
    @RequestBody
    TenantAdminCreateRequest request
) {

    TenantAdminResponse response =
        tenantService.createTenantAdmin(
            id,
            request
        );

    return ResponseEntity
        .status(HttpStatus.CREATED)
        .body(response);
}

    // =====================================================
    // GET TENANT BY ID
    // =====================================================

    @PreAuthorize(
        "hasAuthority('TENANT_VIEW')"
    )
    @GetMapping("/{id}")
    public ResponseEntity<TenantResponse>
    getTenantById(
        @PathVariable Long id
    ) {

        return ResponseEntity.ok(
            tenantService.getTenantById(id)
        );
    }


    // =====================================================
    // CREATE TENANT
    // =====================================================

    @PreAuthorize(
        "hasAuthority('TENANT_CREATE')"
    )
    @PostMapping
    public ResponseEntity<TenantResponse>
    createTenant(
        @Valid
        @RequestBody
        TenantCreateRequest request
    ) {

        TenantResponse response =
            tenantService.createTenant(
                request
            );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }


    // =====================================================
    // UPDATE TENANT
    // =====================================================

    @PreAuthorize(
        "hasAuthority('TENANT_UPDATE')"
    )
    @PutMapping("/{id}")
    public ResponseEntity<TenantResponse>
    updateTenant(
        @PathVariable Long id,
        @Valid
        @RequestBody
        TenantUpdateRequest request
    ) {

        return ResponseEntity.ok(
            tenantService.updateTenant(
                id,
                request
            )
        );
    }


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    @PreAuthorize(
        "hasAuthority('TENANT_STATUS_UPDATE')"
    )
    @PatchMapping("/{id}/status")
    public ResponseEntity<TenantResponse>
    updateTenantStatus(
        @PathVariable Long id,
        @Valid
        @RequestBody
        TenantStatusRequest request
    ) {

        return ResponseEntity.ok(
            tenantService.updateTenantStatus(
                id,
                request
            )
        );
    }
}