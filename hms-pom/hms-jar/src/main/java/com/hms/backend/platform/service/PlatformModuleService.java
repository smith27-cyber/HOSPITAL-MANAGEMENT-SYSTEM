package com.hms.backend.platform.service;

import com.hms.backend.platform.entity.ModuleCode;
import com.hms.backend.platform.entity.PlatformModule;
import com.hms.backend.platform.entity.TenantModule;
import com.hms.backend.platform.repository.PlatformModuleRepository;
import com.hms.backend.platform.repository.TenantModuleRepository;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class PlatformModuleService {
    private final PlatformModuleRepository moduleRepository;
    private final TenantModuleRepository tenantModuleRepository;
    private final TenantRepository tenantRepository;

    public PlatformModuleService(PlatformModuleRepository moduleRepository,
                                 TenantModuleRepository tenantModuleRepository,
                                 TenantRepository tenantRepository) {
        this.moduleRepository = moduleRepository;
        this.tenantModuleRepository = tenantModuleRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional(readOnly = true)
    public List<PlatformModule> getModules() {
        return moduleRepository.findAll().stream().sorted(Comparator.comparing(m -> m.getCode().name())).toList();
    }

    @Transactional(readOnly = true)
    public List<TenantModule> getTenantModules(Long tenantId) {
        requireTenant(tenantId);
        return tenantModuleRepository.findAllByTenant_Id(tenantId);
    }
@Transactional(readOnly = true)
public List<ModuleCode> getEnabledTenantModuleCodes(Long tenantId) {
    requireTenant(tenantId);

    return tenantModuleRepository.findAllByTenant_Id(tenantId)
            .stream()
            .filter(TenantModule::isEnabled)
            .map(tm -> tm.getModule().getCode())
            .sorted(Comparator.comparing(Enum::name))
            .toList();
}
    public TenantModule setTenantModule(Long tenantId, Long moduleId, boolean enabled) {
        Tenant tenant = requireTenant(tenantId);
        PlatformModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));
        TenantModule tm = tenantModuleRepository.findByTenant_IdAndModule_Id(tenantId, moduleId)
                .orElseGet(() -> new TenantModule(tenant, module, enabled));
        tm.setEnabled(enabled);
        return tenantModuleRepository.save(tm);
    }

  @Transactional(readOnly = true)
public boolean isEnabled(Long tenantId, ModuleCode code) {
    if (tenantId == null) {
        return true;
    }

    return tenantModuleRepository
            .findByTenant_IdAndModule_Code(tenantId, code)
            .map(TenantModule::isEnabled)
            .orElse(false);
}

    private Tenant requireTenant(Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));
    }

    public void initializeTenantDefaults(Tenant tenant) {
        for (PlatformModule module : moduleRepository.findAll()) {
            tenantModuleRepository.findByTenant_IdAndModule_Id(tenant.getId(), module.getId())
                    .orElseGet(() -> tenantModuleRepository.save(new TenantModule(tenant, module, true)));
        }
    }

    public void enableOnly(Long tenantId, List<ModuleCode> codes) {
        requireTenant(tenantId);
        for (PlatformModule module : moduleRepository.findAll()) {
            boolean enabled = codes.contains(module.getCode());
            setTenantModule(tenantId, module.getId(), enabled);
        }
    }
}
