package com.hms.backend.controller;

import com.hms.backend.entity.PharmacyPrescription;
import com.hms.backend.service.PharmacyPrescriptionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pharmacy/prescriptions")
@CrossOrigin(origins = "http://localhost:4200")
public class PharmacyPrescriptionController {

    private final PharmacyPrescriptionService prescriptionService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PharmacyPrescriptionController(
            PharmacyPrescriptionService prescriptionService
    ) {

        this.prescriptionService =
                prescriptionService;
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @GetMapping
    @PreAuthorize("hasAuthority('PHARMACY_PRESCRIPTION_VIEW')")
    public ResponseEntity<List<PharmacyPrescription>>
    getAllPrescriptions() {

        return ResponseEntity.ok(
                prescriptionService
                        .getAllPrescriptions()
        );
    }


    // =====================================================
    // GET BY ID
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PHARMACY_PRESCRIPTION_VIEW')")
    public ResponseEntity<PharmacyPrescription>
    getPrescriptionById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .getPrescriptionById(id)
        );
    }


    // =====================================================
    // GET BY PATIENT
    // =====================================================

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('PHARMACY_PRESCRIPTION_VIEW')")
    public ResponseEntity<List<PharmacyPrescription>>
    getPrescriptionsByPatient(
            @PathVariable String patientId
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .getPrescriptionsByPatient(
                                patientId
                        )
        );
    }


    // =====================================================
    // GET BY CONSULTATION
    // =====================================================

    @GetMapping("/consultation/{consultationId}")
    @PreAuthorize("hasAuthority('PHARMACY_PRESCRIPTION_VIEW')")
    public ResponseEntity<List<PharmacyPrescription>>
    getPrescriptionsByConsultation(
            @PathVariable String consultationId
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .getPrescriptionsByConsultation(
                                consultationId
                        )
        );
    }


    // =====================================================
    // GET CURRENT PRESCRIPTION BY CONSULTATION
    // =====================================================

    @GetMapping("/consultation/{consultationId}/current")
    @PreAuthorize("hasAuthority('PHARMACY_PRESCRIPTION_VIEW')")
    public ResponseEntity<PharmacyPrescription>
    getCurrentPrescriptionByConsultation(
            @PathVariable String consultationId
    ) {

        PharmacyPrescription prescription =
                prescriptionService
                        .getPrescriptionByConsultation(
                                consultationId
                        );


        if (prescription == null) {

            return ResponseEntity
                    .noContent()
                    .build();
        }


        return ResponseEntity.ok(
                prescription
        );
    }


    // =====================================================
    // GET BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('PHARMACY_PRESCRIPTION_VIEW')")
    public ResponseEntity<List<PharmacyPrescription>>
    getPrescriptionsByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .getPrescriptionsByStatus(
                                status
                        )
        );
    }


    // =====================================================
    // CREATE PRESCRIPTION
    // =====================================================

    /*
     * Doctor creates the prescription during consultation.
     *
     * PHARMACY_PRESCRIPTION_CREATE is intentionally
     * separate from PHARMACY_DISPENSE.
     */

    @PostMapping
    @PreAuthorize("hasAuthority('PHARMACY_PRESCRIPTION_CREATE')")
    public ResponseEntity<PharmacyPrescription>
    createPrescription(
            @RequestBody PharmacyPrescription prescription
    ) {

        PharmacyPrescription saved =
                prescriptionService
                        .createPrescription(
                                prescription
                        );


        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        saved
                );
    }


    // =====================================================
    // UPDATE PRESCRIPTION
    // =====================================================

    /*
     * Only prescriptions that are still editable
     * should be updated.
     *
     * The service layer already protects the business
     * rule that only WAITING prescriptions can be modified.
     */

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PHARMACY_PRESCRIPTION_UPDATE')")
    public ResponseEntity<PharmacyPrescription>
    updatePrescription(
            @PathVariable Long id,
            @RequestBody PharmacyPrescription prescription
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .updatePrescription(
                                id,
                                prescription
                        )
        );
    }


    // =====================================================
    // START PREPARING
    // =====================================================

    /*
     * Pharmacy workflow:
     *
     * WAITING
     *    ↓
     * PREPARING
     *
     * This is a pharmacy processing operation.
     */

    @PatchMapping("/{id}/prepare")
    @PreAuthorize("hasAuthority('PHARMACY_DISPENSE')")
    public ResponseEntity<PharmacyPrescription>
    startPreparing(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .startPreparing(id)
        );
    }


    // =====================================================
    // SEND TO BILLING
    // =====================================================

    /*
     * Pharmacy workflow:
     *
     * PREPARING
     *    ↓
     * AWAITING PAYMENT
     *
     * The pharmacy service creates/synchronizes
     * the pharmacy charge with billing.
     */

    @PatchMapping("/{id}/send-to-billing")
    @PreAuthorize("hasAuthority('PHARMACY_DISPENSE')")
    public ResponseEntity<PharmacyPrescription>
    sendToBilling(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .sendToBilling(id)
        );
    }


    // =====================================================
    // CHECK PAYMENT
    // =====================================================

    /*
     * Pharmacy checks whether the pharmacy bill
     * has been paid before allowing collection.
     *
     * A successful payment changes the prescription
     * to READY FOR PICKUP.
     */

    @PatchMapping("/{id}/check-payment")
    @PreAuthorize("hasAuthority('PHARMACY_DISPENSE')")
    public ResponseEntity<PharmacyPrescription>
    checkPayment(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .checkPayment(id)
        );
    }


    // =====================================================
    // DISPENSE
    // =====================================================

    /*
     * Pharmacy workflow:
     *
     * READY FOR PICKUP
     *       ↓
     * DISPENSED
     *
     * This is restricted to pharmacy dispensing staff.
     */

    @PatchMapping("/{id}/dispense")
    @PreAuthorize("hasAuthority('PHARMACY_DISPENSE')")
    public ResponseEntity<PharmacyPrescription>
    dispense(
            @PathVariable Long id,
            @RequestBody(required = false)
            Map<String, String> request
    ) {

        String dispensedBy =
                null;


        if (request != null) {

            dispensedBy =
                    request.get(
                            "dispensedBy"
                    );
        }


        return ResponseEntity.ok(
                prescriptionService
                        .dispense(
                                id,
                                dispensedBy
                        )
        );
    }


    // =====================================================
    // CANCEL
    // =====================================================

    /*
     * Cancellation is intentionally separate from
     * general prescription update permission.
     */

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('PHARMACY_PRESCRIPTION_CANCEL')")
    public ResponseEntity<PharmacyPrescription>
    cancelPrescription(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                prescriptionService
                        .cancelPrescription(id)
        );
    }


    // =====================================================
    // DELETE
    // =====================================================

    /*
     * There is currently no dedicated
     * PHARMACY_PRESCRIPTION_DELETE permission.
     *
     * Therefore UPDATE is used temporarily.
     *
     * The service layer already prevents deletion
     * of DISPENSED prescriptions.
     */

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PHARMACY_PRESCRIPTION_UPDATE')")
    public ResponseEntity<Void>
    deletePrescription(
            @PathVariable Long id
    ) {

        prescriptionService
                .deletePrescription(id);


        return ResponseEntity
                .noContent()
                .build();
    }

}