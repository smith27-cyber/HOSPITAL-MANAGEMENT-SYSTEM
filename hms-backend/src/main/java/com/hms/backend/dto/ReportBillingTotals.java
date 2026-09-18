// =====================================================
// HMS REPORT BILLING TOTALS
// File:
// src/main/java/com/hms/backend/dto/ReportBillingTotals.java
// =====================================================

package com.hms.backend.dto;

import java.math.BigDecimal;

/**
 * =====================================================
 * REPORT BILLING TOTALS
 * =====================================================
 *
 * Database-level aggregation used by the Reports module.
 *
 * IMPORTANT:
 *
 * This DTO contains ONLY aggregated values.
 *
 * We do not load every billing record into Java memory.
 *
 * The database performs:
 *
 * COUNT
 * SUM(amount)
 * SUM(amountPaid)
 * SUM(balance)
 *
 * while also restricting the query to the current tenant
 * and requested reporting period.
 *
 * =====================================================
 */
public record ReportBillingTotals(

        long billingRecords,

        BigDecimal billedAmount,

        BigDecimal amountPaid,

        BigDecimal outstandingBalance

) {

    /**
     * =====================================================
     * EMPTY TOTALS
     * =====================================================
     */
    public static ReportBillingTotals empty() {

        return new ReportBillingTotals(

                0L,

                BigDecimal.ZERO,

                BigDecimal.ZERO,

                BigDecimal.ZERO
        );
    }
}