
package com.hms.backend.controller;

import com.hms.backend.dto.BillingItemRequest;
import com.hms.backend.dto.BillingRequest;
import com.hms.backend.dto.PaymentRequest;
import com.hms.backend.entity.Billing;
import com.hms.backend.service.BillingService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * =====================================================
 * BILLING CONTROLLER
 * =====================================================
 *
 * Base URL:
 *
 * /api/billing
 *
 * =====================================================
 * BILLING WORKFLOW
 * =====================================================
 *
 * One consultation should have one invoice.
 *
 * Consultation
 *      |
 *      +---- Consultation Charge
 *      |
 *      +---- Laboratory Charges
 *      |
 *      +---- Pharmacy Charges
 *      |
 *      v
 *   ONE BILL / INVOICE
 *
 * Example:
 *
 * POST /api/billing/consultation/CON-001/sync
 *
 * This endpoint creates or synchronizes the invoice
 * belonging to the consultation.
 */
@RestController
@RequestMapping("/api/billing")
@CrossOrigin(
        origins = "http://localhost:4200"
)
public class BillingController {


    private final BillingService billingService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public BillingController(
            BillingService billingService
    ) {

        this.billingService =
                billingService;
    }


    // =====================================================
    // GET ALL BILLS
    // =====================================================
    //
    // Permission:
    //
    // BILLING_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_VIEW')"
    )
    @GetMapping
    public ResponseEntity<List<Billing>>
    getAllBills() {

        return ResponseEntity.ok(
                billingService.getAllBills()
        );
    }


    // =====================================================
    // GET BILL BY ID
    // =====================================================
    //
    // Permission:
    //
    // BILLING_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_VIEW')"
    )
    @GetMapping("/{id}")
    public ResponseEntity<Billing>
    getBillById(
            @PathVariable Long id
    ) {

        return billingService
                .getBillById(id)
                .map(ResponseEntity::ok)
                .orElseGet(
                        () ->
                                ResponseEntity
                                        .notFound()
                                        .build()
                );
    }


    // =====================================================
    // GET BILLS BY PATIENT
    // =====================================================
    //
    // Permission:
    //
    // BILLING_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_VIEW')"
    )
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Billing>>
    getBillsByPatient(
            @PathVariable String patientId
    ) {

        return ResponseEntity.ok(
                billingService.getBillsByPatient(
                        patientId
                )
        );
    }


    // =====================================================
    // GET ACTIVE PATIENT BILL
    // =====================================================
    //
    // Permission:
    //
    // BILLING_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_VIEW')"
    )
    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<Billing>
    getActiveBillByPatient(
            @PathVariable String patientId
    ) {

        return billingService
                .getActiveBillByPatient(
                        patientId
                )
                .map(ResponseEntity::ok)
                .orElseGet(
                        () ->
                                ResponseEntity
                                        .notFound()
                                        .build()
                );
    }


    // =====================================================
    // GET BILL BY CONSULTATION
    // =====================================================
    //
    // Permission:
    //
    // BILLING_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_VIEW')"
    )
    @GetMapping(
            "/consultation/{consultationId}"
    )
    public ResponseEntity<Billing>
    getBillByConsultation(
            @PathVariable String consultationId
    ) {

        return billingService
                .getBillByConsultation(
                        consultationId
                )
                .map(ResponseEntity::ok)
                .orElseGet(
                        () ->
                                ResponseEntity
                                        .notFound()
                                        .build()
                );
    }


    // =====================================================
    // SYNCHRONIZE CONSULTATION INVOICE
    // =====================================================
    //
    // Permission:
    //
    // BILLING_UPDATE
    //
    // This endpoint synchronizes the single invoice
    // associated with a consultation.
    //
    // It may add:
    //
    // - Consultation charges
    // - Laboratory charges
    // - Pharmacy charges
    //
    // Repeated calls must remain idempotent.
    //
    // IMPORTANT:
    //
    // This does NOT complete the consultation.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_UPDATE')"
    )
    @PostMapping(
            "/consultation/{consultationId}/sync"
    )
    public ResponseEntity<Billing>
    syncConsultationInvoice(
            @PathVariable String consultationId
    ) {

        Billing bill =
                billingService.syncConsultationInvoice(
                        consultationId
                );

        return ResponseEntity.ok(
                bill
        );
    }


    // =====================================================
    // GET BILLS BY STATUS
    // =====================================================
    //
    // Permission:
    //
    // BILLING_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_VIEW')"
    )
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Billing>>
    getBillsByStatus(
            @PathVariable Billing.BillingStatus status
    ) {

        return ResponseEntity.ok(
                billingService.getBillsByStatus(
                        status
                )
        );
    }


    // =====================================================
    // CREATE BILL
    // =====================================================
    //
    // Permission:
    //
    // BILLING_CREATE
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_CREATE')"
    )
    @PostMapping
    public ResponseEntity<Billing>
    createBill(
            @Valid
            @RequestBody
            BillingRequest request
    ) {

        Billing bill =
                billingService.createBill(
                        request
                );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        bill
                );
    }


    // =====================================================
    // ADD CHARGE TO PATIENT BILL
    // =====================================================
    //
    // Permission:
    //
    // BILLING_CREATE
    //
    // This is a general/legacy billing endpoint.
    //
    // Consultation-specific billing should preferably
    // use the consultation invoice synchronization
    // endpoint.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_CREATE')"
    )
    @PostMapping(
            "/patient/{patientId}/charge"
    )
    public ResponseEntity<Billing>
    addChargeToPatientBill(

            @PathVariable
            String patientId,

            @Valid
            @RequestBody
            BillingItemRequest item,

            @RequestParam
            String patientName,

            @RequestParam(
                    required = false
            )
            String patientNumber,

            @RequestParam(
                    required = false
            )
            String doctorId,

            @RequestParam(
                    required = false
            )
            String doctorName,

            @RequestParam(
                    required = false
            )
            String departmentId,

            @RequestParam(
                    required = false
            )
            String departmentName
    ) {

        Billing bill =
                billingService.addChargeToPatientBill(
                        patientId,
                        item,
                        patientName,
                        patientNumber,
                        doctorId,
                        doctorName,
                        departmentId,
                        departmentName
                );

        return ResponseEntity.ok(
                bill
        );
    }


    // =====================================================
    // UPDATE BILL
    // =====================================================
    //
    // Permission:
    //
    // BILLING_UPDATE
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_UPDATE')"
    )
    @PutMapping("/{id}")
    public ResponseEntity<Billing>
    updateBill(

            @PathVariable
            Long id,

            @Valid
            @RequestBody
            BillingRequest request
    ) {

        return ResponseEntity.ok(
                billingService.updateBill(
                        id,
                        request
                )
        );
    }


    // =====================================================
    // DELETE BILL
    // =====================================================
    //
    // Permission:
    //
    // BILLING_UPDATE
    //
    // NOTE:
    //
    // There is currently no BILLING_DELETE permission
    // in the RBAC catalog.
    //
    // Therefore this endpoint is restricted to users
    // who have BILLING_UPDATE.
    //
    // The service should continue to protect invoices
    // that must not be deleted.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_UPDATE')"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteBill(
            @PathVariable Long id
    ) {

        billingService.deleteBill(id);

        return ResponseEntity
                .noContent()
                .build();
    }


    // =====================================================
    // RECORD PAYMENT
    // =====================================================
    //
    // Permission:
    //
    // BILLING_RECORD_PAYMENT
    //
    // This is deliberately separate from BILLING_UPDATE.
    //
    // A user who can edit an invoice does not automatically
    // receive authority to record a payment.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_RECORD_PAYMENT')"
    )
    @PostMapping("/{id}/payment")
    public ResponseEntity<Billing>
    recordPayment(

            @PathVariable
            Long id,

            @Valid
            @RequestBody
            PaymentRequest request
    ) {

        return ResponseEntity.ok(
                billingService.recordPayment(
                        id,
                        request
                )
        );
    }


    // =====================================================
    // UPDATE BILL STATUS
    // =====================================================
    //
    // Permission:
    //
    // BILLING_UPDATE
    //
    // The billing service remains responsible for
    // validating whether the requested status transition
    // is actually allowed.
    //
    // If cancellation needs to be exposed as a dedicated
    // operation later, it should use BILLING_CANCEL.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_UPDATE')"
    )
    @PatchMapping("/{id}/status")
    public ResponseEntity<Billing>
    updateStatus(

            @PathVariable
            Long id,

            @RequestParam
            Billing.BillingStatus status
    ) {

        return ResponseEntity.ok(
                billingService.updateStatus(
                        id,
                        status
                )
        );
    }


    // =====================================================
    // STATISTICS - COUNT
    // =====================================================
    //
    // Permission:
    //
    // BILLING_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_VIEW')"
    )
    @GetMapping("/statistics/count")
    public ResponseEntity<Long>
    getCount() {

        return ResponseEntity.ok(
                billingService.countBills()
        );
    }


    // =====================================================
    // STATISTICS - TOTAL
    // =====================================================
    //
    // Permission:
    //
    // BILLING_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_VIEW')"
    )
    @GetMapping("/statistics/total")
    public ResponseEntity<BigDecimal>
    getTotalAmount() {

        return ResponseEntity.ok(
                billingService.getTotalAmount()
        );
    }


    // =====================================================
    // STATISTICS - PAID
    // =====================================================
    //
    // Permission:
    //
    // BILLING_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_VIEW')"
    )
    @GetMapping("/statistics/paid")
    public ResponseEntity<BigDecimal>
    getTotalPaid() {

        return ResponseEntity.ok(
                billingService.getTotalPaid()
        );
    }


    // =====================================================
    // STATISTICS - BALANCE
    // =====================================================
    //
    // Permission:
    //
    // BILLING_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('BILLING_VIEW')"
    )
    @GetMapping("/statistics/balance")
    public ResponseEntity<BigDecimal>
    getTotalBalance() {

        return ResponseEntity.ok(
                billingService.getTotalBalance()
        );
    }
}

