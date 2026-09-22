package com.hms.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * =====================================================
 * HMS RECEIPT RESPONSE
 * =====================================================
 *
 * Safe response object used by the API.
 *
 * Does NOT expose the JPA entity graph.
 *
 * =====================================================
 */
public record ReceiptResponse(

        Long id,

        String receiptNumber,

        Long billingId,

        String invoiceNumber,

        Long tenantId,

        String tenantCode,

        String tenantName,

        String patientId,

        String patientName,

        String patientNumber,

        BigDecimal amount,

        BigDecimal invoiceAmount,

        BigDecimal amountPaidAfterPayment,

        BigDecimal balanceAfterPayment,

        String paymentMethod,

        LocalDateTime paymentDate,

        String receivedBy,

        String notes

) {
}