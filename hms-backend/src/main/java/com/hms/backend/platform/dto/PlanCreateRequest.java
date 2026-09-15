package com.hms.backend.platform.dto;

import com.hms.backend.platform.entity.BillingCycle;
import java.math.BigDecimal;
import java.util.List;

public record PlanCreateRequest(String code, String name, String description, BigDecimal price,
                                String currency, BillingCycle billingCycle, Integer trialDays,
                                List<Long> moduleIds) {}
