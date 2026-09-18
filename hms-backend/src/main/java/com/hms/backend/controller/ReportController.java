// =====================================================
// HMS REPORT CONTROLLER
// File:
// src/main/java/com/hms/backend/controller/ReportController.java
// =====================================================

package com.hms.backend.controller;

import com.hms.backend.dto.ReportDashboardResponse;
import com.hms.backend.service.ReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * =====================================================
 * HMS REPORT CONTROLLER
 * =====================================================
 *
 * Tenant-aware Reports API.
 *
 * IMPORTANT:
 *
 * There is intentionally NO tenantId parameter.
 *
 * =====================================================
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:4200")
public class ReportController {

    private final ReportService reportService;


    public ReportController(
            ReportService reportService
    ) {

        this.reportService =
                reportService;
    }


    // =====================================================
    // DASHBOARD
    // =====================================================

    @PreAuthorize(
            "hasAuthority('REPORT_VIEW')"
    )
    @GetMapping("/dashboard")
    public ResponseEntity<ReportDashboardResponse>
    getDashboard(

            @RequestParam(
                    required = false
            )
            LocalDate startDate,

            @RequestParam(
                    required = false
            )
            LocalDate endDate

    ) {

        return ResponseEntity.ok(

                reportService.getDashboard(
                        startDate,
                        endDate
                )
        );
    }
}