
package com.hms.backend.controller;

import com.hms.backend.entity.PharmacyPrescription;
import com.hms.backend.service.PharmacyPrescriptionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

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
    // CREATE
    // =====================================================

    @PostMapping
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
    // UPDATE
    // =====================================================

    @PutMapping("/{id}")
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

    @PatchMapping("/{id}/prepare")
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
    //
    // Frontend endpoint:
    //
    // PATCH /api/pharmacy/prescriptions/{id}/send-to-billing
    //
    // =====================================================

    @PatchMapping("/{id}/send-to-billing")
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

@PatchMapping("/{id}/check-payment")
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

    @PatchMapping("/{id}/dispense")
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

    @PatchMapping("/{id}/cancel")
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

    @DeleteMapping("/{id}")
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

