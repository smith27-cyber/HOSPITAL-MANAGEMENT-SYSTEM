package com.hms.backend.service.impl;

import com.hms.backend.dto.ReceiptResponse;
import com.hms.backend.entity.Billing;
import com.hms.backend.entity.PaymentTransaction;
import com.hms.backend.repository.PaymentTransactionRepository;
import com.hms.backend.service.ReceiptService;
import com.hms.backend.tenant.context.TenantContext;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReceiptServiceImpl implements ReceiptService {

    private final PaymentTransactionRepository paymentTransactionRepository;

    public ReceiptServiceImpl(
            PaymentTransactionRepository paymentTransactionRepository) {

        this.paymentTransactionRepository =
                paymentTransactionRepository;
    }

    // =====================================================
    // CURRENT TENANT
    // =====================================================

    private Long getCurrentTenantId() {

        return TenantContext.requireTenantId();
    }

    // =====================================================
    // GET ALL RECEIPTS
    // =====================================================

    @Override
    public List<ReceiptResponse> getAllReceipts() {

        Long tenantId =
                getCurrentTenantId();

        return paymentTransactionRepository
                .findAllByTenant_IdOrderByPaymentDateDesc(
                        tenantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // GET RECEIPT BY ID
    // =====================================================

    @Override
    public ReceiptResponse getReceiptById(
            Long id) {

        Long tenantId =
                getCurrentTenantId();

        PaymentTransaction transaction =
                paymentTransactionRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Receipt not found."));

        return toResponse(transaction);
    }

    // =====================================================
    // GET RECEIPTS BY BILLING ID
    // =====================================================

    @Override
    public List<ReceiptResponse> getReceiptsByBillingId(
            Long billingId) {

        Long tenantId =
                getCurrentTenantId();

        return paymentTransactionRepository
                .findAllByTenant_IdAndBilling_IdOrderByPaymentDateDesc(
                        tenantId,
                        billingId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // GET RECEIPT BY RECEIPT NUMBER
    // =====================================================

    @Override
    public ReceiptResponse getReceiptByNumber(
            String receiptNumber) {

        if (receiptNumber == null
                || receiptNumber.isBlank()) {

            throw new IllegalArgumentException(
                    "Receipt number is required.");
        }

        Long tenantId =
                getCurrentTenantId();

        PaymentTransaction transaction =
                paymentTransactionRepository
                        .findByTenant_IdAndReceiptNumber(
                                tenantId,
                                receiptNumber.trim())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Receipt not found."));

        return toResponse(transaction);
    }

    // =====================================================
    // GET RECEIPTS BETWEEN DATES
    // =====================================================

    @Override
    public List<ReceiptResponse> getReceiptsBetween(
            LocalDateTime startDate,
            LocalDateTime endDate) {

        if (startDate == null
                || endDate == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required.");
        }

        if (endDate.isBefore(startDate)) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date.");
        }

        Long tenantId =
                getCurrentTenantId();

        return paymentTransactionRepository
                .findAllByTenant_IdAndPaymentDateBetweenOrderByPaymentDateDesc(
                        tenantId,
                        startDate,
                        endDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // CONVERT ENTITY TO RESPONSE
    // =====================================================

    private ReceiptResponse toResponse(
            PaymentTransaction transaction) {

        Billing billing =
                transaction.getBilling();

        if (billing == null) {

            throw new IllegalStateException(
                    "Receipt is not associated with a billing record.");
        }

        BigDecimal invoiceAmount =
                safe(billing.getAmount());

        BigDecimal amountPaidAfterPayment =
                safe(billing.getAmountPaid());

        BigDecimal balanceAfterPayment =
                safe(billing.getBalance());

        return new ReceiptResponse(
                transaction.getId(),
                transaction.getReceiptNumber(),
                billing.getId(),
                billing.getInvoiceNumber(),
                transaction.getTenant().getId(),
                transaction.getTenant().getCode(),
                transaction.getTenant().getName(),
                billing.getPatientId(),
                billing.getPatientName(),
                billing.getPatientNumber(),
                safe(transaction.getAmount()),
                invoiceAmount,
                amountPaidAfterPayment,
                balanceAfterPayment,
                transaction.getPaymentMethod() != null
                        ? transaction.getPaymentMethod().name()
                        : "OTHER",
                transaction.getPaymentDate(),
                transaction.getReceivedBy(),
                transaction.getNotes()
        );
    }

    // =====================================================
    // SAFE BIG DECIMAL
    // =====================================================

    private BigDecimal safe(
            BigDecimal value) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }
}