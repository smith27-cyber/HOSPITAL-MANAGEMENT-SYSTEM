
package com.hms.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/**
 * =====================================================
 * PAYMENT REQUEST DTO
 * =====================================================
 */
public class PaymentRequest {

    @NotNull(message = "Payment amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Payment amount must be greater than zero"
    )
    private java.math.BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private String paymentMethod;


    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public java.math.BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(java.math.BigDecimal amount) {
        this.amount = amount;
    }


    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}

