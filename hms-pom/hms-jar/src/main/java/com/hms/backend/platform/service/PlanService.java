package com.hms.backend.platform.service;

import com.hms.backend.platform.entity.Plan;
import com.hms.backend.platform.entity.PlatformModule;
import com.hms.backend.platform.repository.PlanRepository;
import com.hms.backend.platform.repository.PlatformModuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class PlanService {
    private final PlanRepository planRepository;
    private final PlatformModuleRepository moduleRepository;

    public PlanService(PlanRepository planRepository, PlatformModuleRepository moduleRepository) {
        this.planRepository = planRepository;
        this.moduleRepository = moduleRepository;
    }

    @Transactional(readOnly = true)
    public List<Plan> getAll() { return planRepository.findAll(); }

    public Plan create(String code, String name, String description, BigDecimal price,
                       String currency, com.hms.backend.platform.entity.BillingCycle cycle,
                       int trialDays, List<Long> moduleIds) {
        String normalized = code.trim().toUpperCase(Locale.ROOT);
        if (planRepository.existsByCode(normalized)) throw new IllegalStateException("Plan code already exists: " + normalized);
        Plan p = new Plan();
        p.setCode(normalized); p.setName(name.trim()); p.setDescription(description);
        p.setPrice(price == null ? BigDecimal.ZERO : price); p.setCurrency(currency == null ? "UGX" : currency.toUpperCase(Locale.ROOT));
        p.setBillingCycle(cycle); p.setTrialDays(Math.max(0, trialDays));
        p.setModules(new HashSet<>(moduleRepository.findAllById(moduleIds == null ? List.of() : moduleIds)));
        return planRepository.save(p);
    }

    public Plan setActive(Long id, boolean active) {
        Plan p = find(id); p.setActive(active); return planRepository.save(p);
    }

    public Plan updateModules(Long id, List<Long> moduleIds) {
        Plan p = find(id);
        p.setModules(new HashSet<>(moduleRepository.findAllById(moduleIds == null ? List.of() : moduleIds)));
        return planRepository.save(p);
    }

    public Plan find(Long id) {
        return planRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Plan not found: " + id));
    }
}
