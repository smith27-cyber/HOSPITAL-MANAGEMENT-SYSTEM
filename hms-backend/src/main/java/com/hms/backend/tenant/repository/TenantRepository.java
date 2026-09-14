package com.hms.backend.tenant.repository;

import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.entity.TenantStatus;
import com.hms.backend.tenant.entity.TenantType;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TenantRepository
        extends JpaRepository<Tenant, Long> {

    Optional<Tenant> findByCode(
            String code);

    boolean existsByCode(
            String code);

    List<Tenant> findAllByStatus(
            TenantStatus status);

    List<Tenant> findAllByType(
            TenantType type);
}