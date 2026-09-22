package com.hms.backend.platform.controller;

import com.hms.backend.platform.entity.ModuleCode;
import com.hms.backend.platform.service.PlatformModuleService;
import com.hms.backend.tenant.context.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenant/modules")
public class TenantModuleController {

    private final PlatformModuleService platformModuleService;

    public TenantModuleController(PlatformModuleService platformModuleService) {
        this.platformModuleService = platformModuleService;
    }

    @GetMapping
    public ResponseEntity<List<ModuleCode>> getEnabledModules(
            Authentication authentication) {

        Long tenantId = TenantContext.getTenantId();

        if (tenantId == null) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(
                platformModuleService.getEnabledTenantModuleCodes(tenantId)
        );
    }
}