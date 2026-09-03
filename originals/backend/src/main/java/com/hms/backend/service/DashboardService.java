
package com.hms.backend.service;

import com.hms.backend.dto.DashboardResponse;

/**
 * =====================================================
 * DASHBOARD SERVICE
 * File:
 * src/main/java/com/hms/backend/service/DashboardService.java
 * =====================================================
 */
public interface DashboardService {

    /**
     * Get dashboard statistics and today's appointments.
     */
    DashboardResponse getDashboardData();
}

