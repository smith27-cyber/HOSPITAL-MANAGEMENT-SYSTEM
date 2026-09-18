package com.hms.backend.audit.repository;

import com.hms.backend.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByTenant_IdOrderByCreatedAtDesc(
            Long tenantId,
            Pageable pageable
    );

    Page<AuditLog> findAllByTenant_IdAndActionOrderByCreatedAtDesc(
            Long tenantId,
            String action,
            Pageable pageable
    );

    Page<AuditLog> findAllByTenant_IdAndEntityTypeOrderByCreatedAtDesc(
            Long tenantId,
            String entityType,
            Pageable pageable
    );
}