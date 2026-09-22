package com.hms.backend.audit.controller;

import com.hms.backend.audit.entity.AuditLog;
import com.hms.backend.audit.service.AuditLogService;
import com.hms.backend.tenant.context.TenantContext;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "http://localhost:4200")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(
            AuditLogService auditLogService
    ) {
        this.auditLogService =
                auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
    public ResponseEntity<Page<AuditLog>> getLogs(

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size
    ) {

        Long tenantId =
                TenantContext.getTenantId();

        if (tenantId == null) {
            return ResponseEntity
                    .badRequest()
                    .build();
        }

        Pageable pageable =
                PageRequest.of(
                        page,
                        Math.min(size, 100),
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return ResponseEntity.ok(
                auditLogService
                        .getTenantLogs(
                                tenantId,
                                pageable
                        )
        );
    }

    @GetMapping("/action/{action}")
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
    public ResponseEntity<Page<AuditLog>> getByAction(

            @PathVariable String action,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size
    ) {

        Long tenantId =
                TenantContext.getTenantId();

        if (tenantId == null) {
            return ResponseEntity
                    .badRequest()
                    .build();
        }

        Pageable pageable =
                PageRequest.of(
                        page,
                        Math.min(size, 100),
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return ResponseEntity.ok(
                auditLogService
                        .getTenantLogsByAction(
                                tenantId,
                                action,
                                pageable
                        )
        );
    }

    @GetMapping("/entity/{entityType}")
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
    public ResponseEntity<Page<AuditLog>> getByEntityType(

            @PathVariable String entityType,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size
    ) {

        Long tenantId =
                TenantContext.getTenantId();

        if (tenantId == null) {
            return ResponseEntity
                    .badRequest()
                    .build();
        }

        Pageable pageable =
                PageRequest.of(
                        page,
                        Math.min(size, 100),
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        return ResponseEntity.ok(
                auditLogService
                        .getTenantLogsByEntityType(
                                tenantId,
                                entityType,
                                pageable
                        )
        );
    }
}