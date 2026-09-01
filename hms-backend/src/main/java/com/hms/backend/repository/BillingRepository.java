
package com.hms.backend.repository;

import com.hms.backend.entity.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * =====================================================
 * BILLING REPOSITORY
 * =====================================================
 */
@Repository
public interface BillingRepository
        extends JpaRepository<Billing, Long> {

    /**
     * Find all invoices belonging to a patient.
     */
    List<Billing> findByPatientIdOrderByBillingDateDesc(
            String patientId
    );


    /**
     * Find the active invoice for a patient.
     *
     * Paid and cancelled invoices are excluded.
     */
    Optional<Billing>
    findFirstByPatientIdAndStatusNotAndStatusNotOrderByBillingDateDesc(
            String patientId,
            Billing.BillingStatus paidStatus,
            Billing.BillingStatus cancelledStatus
    );


    /**
     * Find invoice by invoice number.
     */
    Optional<Billing>
    findByInvoiceNumber(
            String invoiceNumber
    );


    /**
     * Find invoices by billing status.
     */
    List<Billing>
    findByStatusOrderByBillingDateDesc(
            Billing.BillingStatus status
    );


    /**
     * Check whether an invoice number already exists.
     */
    boolean existsByInvoiceNumber(
            String invoiceNumber
    );

}

