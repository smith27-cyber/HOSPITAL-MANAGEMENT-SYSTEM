package com.hms.backend.platform.controller;

import com.hms.backend.platform.dto.PlanCreateRequest;
import com.hms.backend.platform.service.PlanService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/platform/plans")
public class PlanController {

    private final PlanService service;

    public PlanController(PlanService service) {
        this.service = service;
    }

    // =====================================================
    // VIEW PLANS
    // =====================================================

    @PreAuthorize("hasAuthority('PLATFORM_PLAN_VIEW')")
    @GetMapping
    public Object all() {
        return service.getAll();
    }

    // =====================================================
    // CREATE PLAN
    // =====================================================

    @PreAuthorize("hasAuthority('PLATFORM_PLAN_MANAGE')")
    @PostMapping
    public Object create(
            @RequestBody PlanCreateRequest r) {

        return service.create(
                r.code(),
                r.name(),
                r.description(),
                r.price(),
                r.currency(),
                r.billingCycle(),
                r.trialDays() == null
                        ? 0
                        : r.trialDays(),
                r.moduleIds()
        );
    }

    // =====================================================
    // ACTIVATE / DEACTIVATE PLAN
    // =====================================================

    @PreAuthorize("hasAuthority('PLATFORM_PLAN_MANAGE')")
    @PatchMapping("/{id}/active")
    public Object active(
            @PathVariable Long id,
            @RequestParam boolean value) {

        return service.setActive(id, value);
    }

    // =====================================================
    // UPDATE PLAN MODULES
    // =====================================================

    @PreAuthorize("hasAuthority('PLATFORM_PLAN_MANAGE')")
    @PutMapping("/{id}/modules")
    public Object modules(
            @PathVariable Long id,
            @RequestBody java.util.List<Long> moduleIds) {

        return service.updateModules(id, moduleIds);
    }
}