package com.hms.backend.repository;

import com.hms.backend.entity.PaymentTransaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * =====================================================
 * HMS PAYMENT TRANSACTION REPOSITORY
 * =====================================================
 *
 * Every query is tenant-scoped.
 *
 * =====================================================
 */
public interface PaymentTransactionRepository
        extends JpaRepository<
                PaymentTransaction,
                Long> {


    // =====================================================
    // FIND BY ID + TENANT
    // =====================================================

    Optional<PaymentTransaction>
    findByIdAndTenant_Id(
            Long id,
            Long tenantId
    );


    // =====================================================
    // FIND ALL FOR TENANT
    // =====================================================

    List<PaymentTransaction>
    findAllByTenant_IdOrderByPaymentDateDesc(
            Long tenantId
    );


    // =====================================================
    // FIND PAYMENTS FOR ONE BILL
    // =====================================================

    List<PaymentTransaction>
    findAllByTenant_IdAndBilling_IdOrderByPaymentDateDesc(
            Long tenantId,
            Long billingId
    );


    // =====================================================
    // FIND BY RECEIPT NUMBER
    // =====================================================

    Optional<PaymentTransaction>
    findByTenant_IdAndReceiptNumber(
            Long tenantId,
            String receiptNumber
    );


    // =====================================================
    // CHECK RECEIPT NUMBER
    // =====================================================

    boolean
    existsByTenant_IdAndReceiptNumber(
            Long tenantId,
            String receiptNumber
    );


    // =====================================================
    // FIND BY DATE RANGE
    // =====================================================

    List<PaymentTransaction>
    findAllByTenant_IdAndPaymentDateBetweenOrderByPaymentDateDesc(
            Long tenantId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}