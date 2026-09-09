
package com.hms.backend.controller;

import com.hms.backend.dto.DashboardResponse;
import com.hms.backend.service.DashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * =====================================================
 * DASHBOARD CONTROLLER
 * File:
 * src/main/java/com/hms/backend/controller/DashboardController.java
 * =====================================================
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {

    private final DashboardService dashboardService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public DashboardController(
            DashboardService dashboardService
    ) {

        this.dashboardService =
                dashboardService;
    }


    // =====================================================
    // GET DASHBOARD
    // =====================================================

    @GetMapping
    public ResponseEntity<DashboardResponse>
    getDashboard() {

        return ResponseEntity.ok(
                dashboardService.getDashboardData()
        );
    }
}

