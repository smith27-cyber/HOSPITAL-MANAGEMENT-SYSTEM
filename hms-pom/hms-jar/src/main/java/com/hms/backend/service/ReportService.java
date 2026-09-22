// =====================================================
// HMS REPORT SERVICE
// File:
// src/main/java/com/hms/backend/service/ReportService.java
// =====================================================

package com.hms.backend.service;

import com.hms.backend.dto.ReportDashboardResponse;

import java.time.LocalDate;

/**
 * =====================================================
 * HMS REPORT SERVICE
 * =====================================================
 *
 * Tenant-aware reporting service.
 *
 * The tenant is ALWAYS resolved from TenantContext.
 *
 * =====================================================
 */
public interface ReportService {

    /**
     * Generate a dashboard report for the current tenant.
     *
     * The tenant ID is intentionally NOT supplied.
     */
    ReportDashboardResponse getDashboard(
            LocalDate startDate,
            LocalDate endDate
    );
}