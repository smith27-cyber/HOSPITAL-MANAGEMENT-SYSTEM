package com.hms.backend.platform.controller;

import com.hms.backend.platform.dto.SubscriptionCreateRequest;
import com.hms.backend.platform.entity.SubscriptionStatus;
import com.hms.backend.platform.service.SubscriptionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/platform/subscriptions")
public class SubscriptionController {

    private final SubscriptionService service;

    public SubscriptionController(
            SubscriptionService service) {

        this.service = service;
    }

    // =====================================================
    // VIEW ALL SUBSCRIPTIONS
    // =====================================================

    @PreAuthorize(
            "hasAuthority('PLATFORM_SUBSCRIPTION_VIEW')"
    )
    @GetMapping
    public Object all() {

        return service.getAll();
    }

    // =====================================================
    // VIEW TENANT SUBSCRIPTION
    // =====================================================

    @PreAuthorize(
            "hasAuthority('PLATFORM_SUBSCRIPTION_VIEW')"
    )
    @GetMapping("/tenant/{tenantId}")
    public Object tenant(
            @PathVariable Long tenantId) {

        return service.getForTenant(
                tenantId
        );
    }

    // =====================================================
    // CREATE SUBSCRIPTION
    // =====================================================

    @PreAuthorize(
            "hasAuthority('PLATFORM_SUBSCRIPTION_MANAGE')"
    )
    @PostMapping
    public Object create(
            @RequestBody SubscriptionCreateRequest r) {

        return service.create(
                r.tenantId(),
                r.planId(),
                r.status()
        );
    }

    // =====================================================
    // CHANGE SUBSCRIPTION STATUS
    // =====================================================

    @PreAuthorize(
            "hasAuthority('PLATFORM_SUBSCRIPTION_MANAGE')"
    )
    @PatchMapping("/{id}/status")
    public Object status(
            @PathVariable Long id,
            @RequestParam SubscriptionStatus value) {

        return service.changeStatus(
                id,
                value
        );
    }
}