package com.hms.backend.platform.repository;

import com.hms.backend.platform.entity.TenantModule;
import com.hms.backend.platform.entity.ModuleCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TenantModuleRepository extends JpaRepository<TenantModule, Long> {
    List<TenantModule> findAllByTenant_Id(Long tenantId);
    Optional<TenantModule> findByTenant_IdAndModule_Code(Long tenantId, ModuleCode code);
    Optional<TenantModule> findByTenant_IdAndModule_Id(Long tenantId, Long moduleId);
}
