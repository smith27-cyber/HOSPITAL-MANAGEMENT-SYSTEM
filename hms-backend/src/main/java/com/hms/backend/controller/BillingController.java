package com.hms.backend.controller;

import com.hms.backend.dto.BillingItemRequest;
import com.hms.backend.dto.BillingRequest;
import com.hms.backend.dto.PaymentRequest;
import com.hms.backend.entity.Billing;
import com.hms.backend.service.BillingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
 * This endpoint creates the consultation invoice if it
 * does not exist, or updates the existing invoice with
 * any new consultation, laboratory, or pharmacy charges.
 */
@RestController
@RequestMapping("/api/billing")
@CrossOrigin(
        origins = "http://localhost:4200"
)
public class BillingController {

    private final BillingService billingService;


    public BillingController(
            BillingService billingService
    ) {

        this.billingService = billingService;
    }


    // =====================================================
    // GET ALL BILLS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Billing>> getAllBills() {

        return ResponseEntity.ok(
                billingService.getAllBills()
        );
    }


    // =====================================================
    // GET BILL BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Billing> getBillById(
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

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Billing>> getBillsByPatient(
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

    /**
     * Legacy/general billing endpoint.
     *
     * For consultation billing, prefer:
     *
     * GET /api/billing/consultation/{consultationId}
     */
    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<Billing> getActiveBillByPatient(
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

    /**
     * Gets the invoice belonging to a consultation.
     *
     * This is the preferred billing lookup for the HMS
     * consultation workflow.
     *
     * Example:
     *
     * GET /api/billing/consultation/CON-001
     */
    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<Billing> getBillByConsultation(
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

    /**
     * =====================================================
     * MAIN CONSULTATION BILLING ENDPOINT
     * =====================================================
     *
     * Creates or synchronizes ONE invoice for the
     * specified consultation.
     *
     * The invoice may contain:
     *
     * 1. Consultation charge
     * 2. Laboratory charges
     * 3. Pharmacy charges
     *
     * Repeated calls must not create duplicate charges.
     *
     * Example:
     *
     * POST /api/billing/consultation/CON-001/sync
     *
     * The same endpoint can be called after:
     *
     * - consultation is saved
     * - laboratory request is added
     * - laboratory result is completed
     * - pharmacy prescription is added
     * - additional charge is added
     *
     * The consultation itself is NOT completed by this
     * endpoint.
     */
    @PostMapping("/consultation/{consultationId}/sync")
    public ResponseEntity<Billing> syncConsultationInvoice(
            @PathVariable String consultationId
    ) {

        Billing bill =
                billingService.syncConsultationInvoice(
                        consultationId
                );

        return ResponseEntity.ok(bill);
    }


    // =====================================================
    // GET BILLS BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Billing>> getBillsByStatus(
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

    @PostMapping
    public ResponseEntity<Billing> createBill(
            @Valid
            @RequestBody
            BillingRequest request
    ) {

        Billing bill =
                billingService.createBill(
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bill);
    }


    // =====================================================
    // ADD CHARGE TO PATIENT BILL
    // =====================================================

    /**
     * General/legacy billing endpoint.
     *
     * Consultation-specific charges should preferably
     * use the consultation invoice synchronization
     * endpoint instead.
     */
    @PostMapping("/patient/{patientId}/charge")
    public ResponseEntity<Billing> addChargeToPatientBill(

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

    @PutMapping("/{id}")
    public ResponseEntity<Billing> updateBill(

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(
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

    @PostMapping("/{id}/payment")
    public ResponseEntity<Billing> recordPayment(

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

    @PatchMapping("/{id}/status")
    public ResponseEntity<Billing> updateStatus(

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
    // STATISTICS
    // =====================================================

    @GetMapping("/statistics/count")
    public ResponseEntity<Long> getCount() {

        return ResponseEntity.ok(
                billingService.countBills()
        );
    }


    @GetMapping("/statistics/total")
    public ResponseEntity<BigDecimal> getTotalAmount() {

        return ResponseEntity.ok(
                billingService.getTotalAmount()
        );
    }


    @GetMapping("/statistics/paid")
    public ResponseEntity<BigDecimal> getTotalPaid() {

        return ResponseEntity.ok(
                billingService.getTotalPaid()
        );
    }


    @GetMapping("/statistics/balance")
    public ResponseEntity<BigDecimal> getTotalBalance() {

        return ResponseEntity.ok(
                billingService.getTotalBalance()
        );
    }

}