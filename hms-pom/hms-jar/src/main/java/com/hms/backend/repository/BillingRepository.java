package com.hms.backend.repository;

import com.hms.backend.entity.Billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingRepository
        extends JpaRepository<Billing, Long> {


    // =====================================================
    // PATIENT
    // =====================================================

    List<Billing>
    findByPatientIdOrderByBillingDateDesc(
            String patientId
    );


    // =====================================================
    // ACTIVE PATIENT BILL
    // =====================================================

    Optional<Billing>
    findFirstByPatientIdAndStatusNotAndStatusNotOrderByBillingDateDesc(
            String patientId,
            Billing.BillingStatus paidStatus,
            Billing.BillingStatus cancelledStatus
    );


    // =====================================================
    // CONSULTATION BILL
    // =====================================================

    Optional<Billing>
    findFirstByConsultationIdAndStatusNotAndStatusNotOrderByBillingDateDesc(
            String consultationId,
            Billing.BillingStatus paidStatus,
            Billing.BillingStatus cancelledStatus
    );


    // =====================================================
    // CONSULTATION BILL HISTORY
    // =====================================================

    Optional<Billing>
    findFirstByConsultationIdOrderByBillingDateDesc(
            String consultationId
    );


    // =====================================================
    // INVOICE
    // =====================================================

    Optional<Billing>
    findByInvoiceNumber(
            String invoiceNumber
    );


    boolean existsByInvoiceNumber(
            String invoiceNumber
    );


    // =====================================================
    // STATUS
    // =====================================================

    List<Billing>
    findByStatusOrderByBillingDateDesc(
            Billing.BillingStatus status
    );
}