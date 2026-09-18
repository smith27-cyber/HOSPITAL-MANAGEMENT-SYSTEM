package com.hms.backend.audit.service.impl;

import com.hms.backend.audit.entity.AuditLog;
import com.hms.backend.audit.repository.AuditLogRepository;
import com.hms.backend.audit.service.AuditLogService;
import com.hms.backend.auth.entity.User;
import com.hms.backend.auth.repository.UserRepository;
import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.repository.TenantRepository;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuditLogServiceImpl
        implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final HttpServletRequest request;

    public AuditLogServiceImpl(
            AuditLogRepository auditLogRepository,
            UserRepository userRepository,
            TenantRepository tenantRepository,
            HttpServletRequest request
    ) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.request = request;
    }

    @Override
    public AuditLog log(
            String action,
            String entityType,
            String entityId,
            String description
    ) {

        return log(
                action,
                entityType,
                entityId,
                description,
                null,
                null
        );
    }

    @Override
    public AuditLog log(
            String action,
            String entityType,
            String entityId,
            String description,
            String oldValue,
            String newValue
    ) {

        AuditLog auditLog =
                new AuditLog();

        /*
         * -------------------------------------------------
         * TENANT
         * -------------------------------------------------
         */

        Long tenantId =
                TenantContext.getTenantId();

        if (tenantId != null) {

            Tenant tenant =
                    tenantRepository
                            .findById(tenantId)
                            .orElse(null);

            auditLog.setTenant(tenant);
        }

        /*
         * -------------------------------------------------
         * CURRENT USER
         * -------------------------------------------------
         */

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication != null
                &&
                authentication.isAuthenticated()
                &&
                authentication.getName() != null
                &&
                !"anonymousUser".equals(
                        authentication.getName()
                )
        ) {

            String username =
                    authentication.getName();

            auditLog.setUsername(
                    username
            );

            userRepository
                    .findByUsername(username)
                    .ifPresent(
                            auditLog::setUser
                    );
        }

        /*
         * -------------------------------------------------
         * ACTION DETAILS
         * -------------------------------------------------
         */

        auditLog.setAction(
                normalize(action)
        );

        auditLog.setEntityType(
                normalize(entityType)
        );

        auditLog.setEntityId(
                entityId
        );

        auditLog.setDescription(
                description
        );

        auditLog.setOldValue(
                oldValue
        );

        auditLog.setNewValue(
                newValue
        );

        /*
         * -------------------------------------------------
         * REQUEST INFORMATION
         * -------------------------------------------------
         */

        if (request != null) {

            auditLog.setIpAddress(
                    getClientIpAddress(request)
            );

            auditLog.setUserAgent(
                    request.getHeader(
                            "User-Agent"
                    )
            );
        }

        return auditLogRepository.save(
                auditLog
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getTenantLogs(
            Long tenantId,
            Pageable pageable
    ) {

        return auditLogRepository
                .findAllByTenant_IdOrderByCreatedAtDesc(
                        tenantId,
                        pageable
                );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getTenantLogsByAction(
            Long tenantId,
            String action,
            Pageable pageable
    ) {

        return auditLogRepository
                .findAllByTenant_IdAndActionOrderByCreatedAtDesc(
                        tenantId,
                        normalize(action),
                        pageable
                );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getTenantLogsByEntityType(
            Long tenantId,
            String entityType,
            Pageable pageable
    ) {

        return auditLogRepository
                .findAllByTenant_IdAndEntityTypeOrderByCreatedAtDesc(
                        tenantId,
                        normalize(entityType),
                        pageable
                );
    }

    private String normalize(String value) {

        if (value == null) {
            return null;
        }

        return value
                .trim()
                .toUpperCase();
    }

    private String getClientIpAddress(
            HttpServletRequest request
    ) {

        String forwarded =
                request.getHeader(
                        "X-Forwarded-For"
                );

        if (
                forwarded != null
                &&
                !forwarded.isBlank()
        ) {

            return forwarded
                    .split(",")[0]
                    .trim();
        }

        return request.getRemoteAddr();
    }
}