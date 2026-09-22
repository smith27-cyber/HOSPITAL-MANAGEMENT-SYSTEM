package com.hms.backend.audit.service;

import com.hms.backend.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {

    AuditLog log(
            String action,
            String entityType,
            String entityId,
            String description
    );

    AuditLog log(
            String action,
            String entityType,
            String entityId,
            String description,
            String oldValue,
            String newValue
    );

    Page<AuditLog> getTenantLogs(
            Long tenantId,
            Pageable pageable
    );

    Page<AuditLog> getTenantLogsByAction(
            Long tenantId,
            String action,
            Pageable pageable
    );

    Page<AuditLog> getTenantLogsByEntityType(
            Long tenantId,
            String entityType,
            Pageable pageable
    );
}