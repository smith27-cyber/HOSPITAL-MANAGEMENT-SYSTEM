package com.hms.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ReportDashboardResponse(

    // =====================================================
    // TENANT
    // =====================================================

    TenantInfo tenant,

    // =====================================================
    // REPORT METADATA
    // =====================================================

    ReportMetadata metadata,

    // =====================================================
    // GENERAL SUMMARY
    // =====================================================

    Summary summary,

    // =====================================================
    // FINANCIAL ANALYTICS
    // =====================================================

    FinancialAnalytics financial,

    // =====================================================
    // PHARMACY ANALYTICS
    // =====================================================

    PharmacyAnalytics pharmacy,

    // =====================================================
    // INVENTORY ANALYTICS
    // =====================================================

    InventoryAnalytics inventory,

    // =====================================================
    // ENABLED MODULES
    // =====================================================

    List<String> enabledReportModules

) {

    // =====================================================
    // TENANT INFORMATION
    // =====================================================

    public record TenantInfo(
        Long id,
        String code,
        String name,
        String type,
        String phone,
        String email,
        String address,
        String city,
        String country,
        String website,
        String logoUrl,
        String registrationNumber
    ) {
    }

    // =====================================================
    // REPORT METADATA
    // =====================================================

    public record ReportMetadata(
        String reportType,
        ReportPeriod period,
        LocalDateTime generatedAt,
        String currency
    ) {
    }

    public record ReportPeriod(
        LocalDate startDate,
        LocalDate endDate
    ) {
    }

    // =====================================================
    // GENERAL SUMMARY
    // =====================================================

    public record Summary(
        long patients,
        long doctors,
        long departments,
        long appointments,
        long consultations,
        long admissions,
        long laboratoryRequests,
        long pharmacyPrescriptions,
        long inventoryItems,
        long lowStockItems,
        long billingRecords,
        BigDecimal billedAmount,
        BigDecimal amountPaid,
        BigDecimal outstandingBalance
    ) {
    }

    // =====================================================
    // FINANCIAL ANALYTICS
    // =====================================================

    public record FinancialAnalytics(
        BigDecimal totalRevenue,
        BigDecimal billedAmount,
        BigDecimal amountPaid,
        BigDecimal outstandingBalance,
        BigDecimal collectionRate
    ) {
    }

    // =====================================================
    // PHARMACY ANALYTICS
    // =====================================================

    public record PharmacyAnalytics(
        BigDecimal totalSales,
        long totalPrescriptions,
        long totalItems,
        BigDecimal amountPaid,
        BigDecimal outstandingBalance,
        List<TopMedicine> topMedicines
    ) {
    }

    public record TopMedicine(
        String medicineName,
        long quantity,
        BigDecimal revenue
    ) {
    }

    // =====================================================
    // INVENTORY ANALYTICS
    // =====================================================

    public record InventoryAnalytics(
        BigDecimal totalStockValue,
        long totalItems,
        long lowStockItems,
        long outOfStockItems,
        long expiringItems
    ) {
    }
}