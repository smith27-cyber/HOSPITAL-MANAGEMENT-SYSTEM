
package com.hms.backend.service;

import com.hms.backend.dto.BillingItemRequest;
import com.hms.backend.dto.BillingRequest;
import com.hms.backend.dto.PaymentRequest;
import com.hms.backend.entity.Billing;

import java.util.List;
import java.util.Optional;

/**
 * =====================================================
 * BILLING SERVICE
 * =====================================================
 */
public interface BillingService {

    // =====================================================
    // GET
    // =====================================================

    List<Billing> getAllBills();

    Optional<Billing> getBillById(Long id);

    List<Billing> getBillsByPatient(String patientId);

    Optional<Billing> getActiveBillByPatient(
            String patientId
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
    // ADD CHARGE TO PATIENT INVOICE
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
    // TOTALS
    // =====================================================

    long countBills();

    java.math.BigDecimal getTotalAmount();

    java.math.BigDecimal getTotalPaid();

    java.math.BigDecimal getTotalBalance();
}

