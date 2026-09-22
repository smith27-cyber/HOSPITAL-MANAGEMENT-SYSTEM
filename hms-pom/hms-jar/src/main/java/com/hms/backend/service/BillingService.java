package com.hms.backend.service;

import com.hms.backend.dto.BillingItemRequest;
import com.hms.backend.dto.BillingRequest;
import com.hms.backend.dto.PaymentRequest;
import com.hms.backend.entity.Billing;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;


/**
 * =====================================================
 * BILLING SERVICE
 * =====================================================
 *
 * HMS billing architecture:
 *
 * One consultation = one invoice.
 *
 * Consultation
 *       |
 *       +---- Consultation charge
 *       |
 *       +---- Laboratory charges
 *       |
 *       +---- Pharmacy charges
 *       |
 *       v
 *    ONE BILL
 *
 * Billing synchronization is independent of
 * consultation completion.
 */
public interface BillingService {


    // =====================================================
    // BASIC BILL OPERATIONS
    // =====================================================

    List<Billing> getAllBills();


    Optional<Billing> getBillById(
            Long id
    );


    List<Billing> getBillsByPatient(
            String patientId
    );


    Optional<Billing> getActiveBillByPatient(
            String patientId
    );


    Optional<Billing> getBillByConsultation(
            String consultationId
    );


    List<Billing> getBillsByStatus(
            Billing.BillingStatus status
    );


    // =====================================================
    // CREATE BILL
    // =====================================================

    Billing createBill(
            BillingRequest request
    );


    // =====================================================
    // GENERAL PATIENT BILLING
    // =====================================================

    Billing addChargeToPatientBill(

            String patientId,

            BillingItemRequest item,

            String patientName,

            String patientNumber,

            String doctorId,

            String doctorName,

            String departmentId,

            String departmentName
    );


    // =====================================================
    // CONSULTATION BILLING
    // =====================================================

    /**
     * Creates or synchronizes the invoice belonging
     * specifically to a consultation.
     *
     * The method is idempotent.
     *
     * It must never create duplicate:
     *
     * - consultation charges
     * - laboratory charges
     * - pharmacy charges
     *
     * It does not complete the consultation.
     */
    Billing syncConsultationInvoice(
            String consultationId
    );


    // =====================================================
    // UPDATE
    // =====================================================

    Billing updateBill(
            Long id,
            BillingRequest request
    );


    // =====================================================
    // DELETE
    // =====================================================

    void deleteBill(
            Long id
    );


    // =====================================================
    // PAYMENT
    // =====================================================

    Billing recordPayment(
            Long id,
            PaymentRequest request
    );


    // =====================================================
    // STATUS
    // =====================================================

    Billing updateStatus(
            Long id,
            Billing.BillingStatus status
    );


    // =====================================================
    // STATISTICS
    // =====================================================

    long countBills();


    BigDecimal getTotalAmount();


    BigDecimal getTotalPaid();


    BigDecimal getTotalBalance();
}