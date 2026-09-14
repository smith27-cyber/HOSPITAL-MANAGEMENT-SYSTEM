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
    // TENANT
    // =====================================================

    List<Billing> findAllByTenant_Id(
            Long tenantId
    );

    Optional<Billing> findByIdAndTenant_Id(
            Long id,
            Long tenantId
    );

    // =====================================================
    // PATIENT
    // =====================================================

    List<Billing>
    findByTenant_IdAndPatientIdOrderByBillingDateDesc(
            Long tenantId,
            String patientId
    );

    // =====================================================
    // ACTIVE PATIENT BILL
    // =====================================================

    Optional<Billing>
    findFirstByTenant_IdAndPatientIdAndStatusNotAndStatusNotOrderByBillingDateDesc(
            Long tenantId,
            String patientId,
            Billing.BillingStatus paidStatus,
            Billing.BillingStatus cancelledStatus
    );

    // =====================================================
    // CONSULTATION BILL
    // =====================================================

    Optional<Billing>
    findFirstByTenant_IdAndConsultationIdAndStatusNotAndStatusNotOrderByBillingDateDesc(
            Long tenantId,
            String consultationId,
            Billing.BillingStatus paidStatus,
            Billing.BillingStatus cancelledStatus
    );

    // =====================================================
    // CONSULTATION BILL HISTORY
    // =====================================================

    Optional<Billing>
    findFirstByTenant_IdAndConsultationIdOrderByBillingDateDesc(
            Long tenantId,
            String consultationId
    );

    // =====================================================
    // INVOICE
    // =====================================================

    Optional<Billing>
    findByTenant_IdAndInvoiceNumber(
            Long tenantId,
            String invoiceNumber
    );

    boolean existsByTenant_IdAndInvoiceNumber(
            Long tenantId,
            String invoiceNumber
    );

    // =====================================================
    // STATUS
    // =====================================================

    List<Billing>
    findByTenant_IdAndStatusOrderByBillingDateDesc(
            Long tenantId,
            Billing.BillingStatus status
    );

    // =====================================================
    // COUNTS
    // =====================================================

    long countByTenant_Id(
            Long tenantId
    );

    long countByTenant_IdAndStatus(
            Long tenantId,
            Billing.BillingStatus status
    );
}