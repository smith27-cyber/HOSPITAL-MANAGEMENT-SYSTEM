package com.hms.backend.platform.service;

import com.hms.backend.platform.entity.Plan;
import com.hms.backend.platform.entity.Subscription;
import com.hms.backend.platform.entity.SubscriptionStatus;
import com.hms.backend.platform.repository.PlanRepository;
import com.hms.backend.platform.repository.SubscriptionRepository;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.entity.TenantStatus;
import com.hms.backend.tenant.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;
    private final TenantRepository tenantRepository;
    private final PlanRepository planRepository;
    private final PlatformModuleService moduleService;

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                               TenantRepository tenantRepository,
                               PlanRepository planRepository,
                               PlatformModuleService moduleService) {
        this.subscriptionRepository = subscriptionRepository;
        this.tenantRepository = tenantRepository;
        this.planRepository = planRepository;
        this.moduleService = moduleService;
    }

    @Transactional(readOnly = true)
    public List<Subscription> getAll() { return subscriptionRepository.findAllByOrderByStartDateDesc(); }

    @Transactional(readOnly = true)
    public Subscription getForTenant(Long tenantId) {
        return subscriptionRepository.findFirstByTenant_IdOrderByStartDateDesc(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("No subscription for tenant: " + tenantId));
    }

    public Subscription create(Long tenantId, Long planId, SubscriptionStatus requestedStatus) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found: " + planId));
        LocalDate today = LocalDate.now();
        Subscription s = new Subscription();
        s.setTenant(tenant); s.setPlan(plan); s.setStartDate(today);
        SubscriptionStatus status = requestedStatus == null ? (plan.getTrialDays() > 0 ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE) : requestedStatus;
        s.setStatus(status);
        if (status == SubscriptionStatus.TRIAL && plan.getTrialDays() > 0) {
            s.setTrialEndsAt(today.plusDays(plan.getTrialDays()));
            s.setCurrentPeriodStart(today);
            s.setCurrentPeriodEnd(today.plusDays(plan.getTrialDays()));
            s.setNextBillingDate(s.getTrialEndsAt());
        } else {
            s.setCurrentPeriodStart(today);
            s.setCurrentPeriodEnd(nextPeriodEnd(today, plan));
            s.setNextBillingDate(s.getCurrentPeriodEnd().plusDays(1));
        }
        tenant.setStatus(status == SubscriptionStatus.ACTIVE ? TenantStatus.ACTIVE : TenantStatus.TRIAL);
        tenantRepository.save(tenant);
        Subscription saved = subscriptionRepository.save(s);
        // Plan modules become tenant entitlements.
        moduleService.enableOnly(tenantId, plan.getModules().stream().map(m -> m.getCode()).toList());
        return saved;
    }

    public Subscription changeStatus(Long id, SubscriptionStatus status) {
        Subscription s = subscriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + id));
        s.setStatus(status);
        if (status == SubscriptionStatus.CANCELLED) s.setCancelledAt(LocalDateTime.now());
        Tenant t = s.getTenant();
        switch (status) {
            case ACTIVE -> t.setStatus(TenantStatus.ACTIVE);
            case GRACE_PERIOD -> t.setStatus(TenantStatus.GRACE_PERIOD);
            case SUSPENDED -> t.setStatus(TenantStatus.SUSPENDED);
            case CANCELLED -> t.setStatus(TenantStatus.CANCELLED);
            case EXPIRED -> t.setStatus(TenantStatus.EXPIRED);
            case TRIAL -> t.setStatus(TenantStatus.TRIAL);
        }
        tenantRepository.save(t);
        return subscriptionRepository.save(s);
    }

    private LocalDate nextPeriodEnd(LocalDate start, Plan plan) {
        return switch (plan.getBillingCycle()) {
            case MONTHLY -> start.plusMonths(1).minusDays(1);
            case QUARTERLY -> start.plusMonths(3).minusDays(1);
            case YEARLY -> start.plusYears(1).minusDays(1);
            case ONE_TIME -> start.plusYears(100);
        };
    }
}
