package com.hms.backend.platform.init;

import com.hms.backend.platform.entity.*;
import com.hms.backend.platform.repository.PlatformModuleRepository;
import com.hms.backend.platform.repository.PlanRepository;
import com.hms.backend.platform.service.PlatformModuleService;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.repository.TenantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import java.math.BigDecimal;
import java.util.*;

@Configuration
public class PlatformDataInitializer {
    @Bean
    @Order(100)
    CommandLineRunner initializePlatformData(PlatformModuleRepository moduleRepo, PlanRepository planRepo,
                                             TenantRepository tenantRepo, PlatformModuleService moduleService) {
        return args -> {
            Map<ModuleCode, PlatformModule> modules = new EnumMap<>(ModuleCode.class);
            for (ModuleCode c : ModuleCode.values()) {
                PlatformModule module = moduleRepo.findByCode(c).orElseGet(() -> moduleRepo.save(new PlatformModule(c, pretty(c), "HMS " + pretty(c) + " module")));
                modules.put(c, module);
            }
            seedPlan(planRepo, "PHARMACY_STARTER", "Pharmacy Starter", new BigDecimal("150000"), BillingCycle.MONTHLY, 14,
                    modules, EnumSet.of(ModuleCode.DASHBOARD, ModuleCode.PHARMACY, ModuleCode.INVENTORY, ModuleCode.BILLING, ModuleCode.REPORTS));
            seedPlan(planRepo, "CLINIC_STARTER", "Clinic Starter", new BigDecimal("250000"), BillingCycle.MONTHLY, 14,
                    modules, EnumSet.of(ModuleCode.DASHBOARD, ModuleCode.PATIENTS, ModuleCode.APPOINTMENTS, ModuleCode.DOCTORS, ModuleCode.DEPARTMENTS, ModuleCode.CONSULTATIONS, ModuleCode.BILLING, ModuleCode.REPORTS, ModuleCode.SETTINGS));
            seedPlan(planRepo, "CLINIC_PROFESSIONAL", "Clinic Professional", new BigDecimal("450000"), BillingCycle.MONTHLY, 14,
                    modules, EnumSet.allOf(ModuleCode.class));
            seedPlan(planRepo, "HOSPITAL_ENTERPRISE", "Hospital Enterprise", new BigDecimal("900000"), BillingCycle.MONTHLY, 30,
                    modules, EnumSet.allOf(ModuleCode.class));

            for (Tenant tenant : tenantRepo.findAll()) {
                moduleService.initializeTenantDefaults(tenant);
            }
        };
    }

    private void seedPlan(PlanRepository repo, String code, String name, BigDecimal price, BillingCycle cycle, int trial,
                          Map<ModuleCode, PlatformModule> modules, Set<ModuleCode> enabled) {
        Plan p = repo.findByCode(code).orElseGet(() -> { Plan x = new Plan(); x.setCode(code); return x; });
        p.setName(name); p.setDescription(name + " plan"); p.setPrice(price); p.setCurrency("UGX"); p.setBillingCycle(cycle); p.setTrialDays(trial); p.setActive(true);
        p.setModules(new HashSet<>(enabled.stream().map(modules::get).toList()));
        repo.save(p);
    }

    private String pretty(ModuleCode code) {
        String[] parts = code.name().split("_");
        return Arrays.stream(parts).map(s -> s.substring(0,1) + s.substring(1).toLowerCase(Locale.ROOT)).reduce((a,b)->a+" "+b).orElse(code.name());
    }
}
