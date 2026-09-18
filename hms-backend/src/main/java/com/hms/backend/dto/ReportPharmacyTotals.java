package com.hms.backend.dto;

import java.math.BigDecimal;

public record ReportPharmacyTotals(
    long prescriptionCount,
    BigDecimal totalSales,
    BigDecimal amountPaid,
    BigDecimal outstandingBalance
) {

    public static ReportPharmacyTotals empty() {
        return new ReportPharmacyTotals(
            0L,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO
        );
    }
}