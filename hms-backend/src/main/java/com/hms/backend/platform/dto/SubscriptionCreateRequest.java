package com.hms.backend.platform.dto;

import com.hms.backend.platform.entity.SubscriptionStatus;

public record SubscriptionCreateRequest(Long tenantId, Long planId, SubscriptionStatus status) {}
