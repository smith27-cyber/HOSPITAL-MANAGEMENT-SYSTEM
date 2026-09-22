package com.hms.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * =====================================================
 * PAYMENT REQUEST DTO
 * =====================================================
 *
 * Used when recording a payment against a billing invoice.
 */
public class PaymentRequest {

    // =====================================================
    // PAYMENT AMOUNT
    // =====================================================

    @NotNull(message = "Payment amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Payment amount must be greater than zero"
    )
    private BigDecimal amount;


    // =====================================================
    // PAYMENT METHOD
    // =====================================================

    @NotNull(message = "Payment method is required")
    private String paymentMethod;


    // =====================================================
    // PAYMENT NOTES
    // =====================================================

    private String notes;


    // =====================================================
    // GETTERS
    // =====================================================

    public BigDecimal getAmount() {
        return amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getNotes() {
        return notes;
    }


    // =====================================================
    // SETTERS
    // =====================================================

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}