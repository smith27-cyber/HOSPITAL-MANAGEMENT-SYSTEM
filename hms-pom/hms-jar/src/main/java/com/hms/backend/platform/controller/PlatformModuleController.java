package com.hms.backend.platform.controller;

import com.hms.backend.platform.dto.ModuleToggleRequest;
import com.hms.backend.platform.service.PlatformModuleService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/platform/modules")
public class PlatformModuleController {

    private final PlatformModuleService service;

    public PlatformModuleController(
            PlatformModuleService service) {

        this.service = service;
    }

    // =====================================================
    // VIEW AVAILABLE MODULES
    // =====================================================

    @PreAuthorize(
            "hasAuthority('PLATFORM_MODULE_VIEW')"
    )
    @GetMapping
    public Object all() {

        return service.getModules();
    }

    // =====================================================
    // VIEW TENANT MODULES
    // =====================================================

    @PreAuthorize(
            "hasAuthority('PLATFORM_MODULE_VIEW')"
    )
    @GetMapping("/tenant/{tenantId}")
    public Object tenantModules(
            @PathVariable Long tenantId) {

        return service.getTenantModules(
                tenantId
        );
    }

    // =====================================================
    // ENABLE / DISABLE TENANT MODULE
    // =====================================================

    @PreAuthorize(
            "hasAuthority('PLATFORM_MODULE_MANAGE')"
    )
    @PutMapping(
            "/tenant/{tenantId}/module/{moduleId}"
    )
    public Object toggle(
            @PathVariable Long tenantId,
            @PathVariable Long moduleId,
            @RequestBody ModuleToggleRequest request) {

        return service.setTenantModule(
                tenantId,
                moduleId,
                request.enabled()
        );
    }
}