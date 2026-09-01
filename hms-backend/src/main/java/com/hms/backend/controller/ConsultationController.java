
package com.hms.backend.controller;

import com.hms.backend.dto.ConsultationRequest;
import com.hms.backend.dto.ConsultationResponse;
import com.hms.backend.service.ConsultationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@CrossOrigin(origins = "*")
public class ConsultationController {

    private final ConsultationService consultationService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ConsultationController(
        ConsultationService consultationService
    ) {
        this.consultationService =
            consultationService;
    }


    // =====================================================
    // GET ALL CONSULTATIONS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<ConsultationResponse>>
    getAllConsultations() {

        return ResponseEntity.ok(
            consultationService
                .getAllConsultations()
        );
    }


    // =====================================================
    // GET CONSULTATION BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ConsultationResponse>
    getConsultationById(
        @PathVariable String id
    ) {

        return ResponseEntity.ok(
            consultationService
                .getConsultationById(id)
        );
    }


    // =====================================================
    // GET CONSULTATIONS BY PATIENT
    // =====================================================

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ConsultationResponse>>
    getConsultationsByPatient(
        @PathVariable String patientId
    ) {

        return ResponseEntity.ok(
            consultationService
                .getConsultationsByPatient(
                    patientId
                )
        );
    }


    // =====================================================
    // GET CONSULTATIONS BY DOCTOR
    // =====================================================

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ConsultationResponse>>
    getConsultationsByDoctor(
        @PathVariable String doctorId
    ) {

        return ResponseEntity.ok(
            consultationService
                .getConsultationsByDoctor(
                    doctorId
                )
        );
    }


    // =====================================================
    // GET CONSULTATION BY APPOINTMENT
    // =====================================================

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ConsultationResponse>
    getConsultationByAppointment(
        @PathVariable String appointmentId
    ) {

        ConsultationResponse consultation =
            consultationService
                .getConsultationByAppointmentOrNull(
                    appointmentId
                );


        if (consultation == null) {

            return ResponseEntity
                .noContent()
                .build();
        }


        return ResponseEntity.ok(
            consultation
        );
    }


    // =====================================================
    // CREATE / SAVE CONSULTATION
    // =====================================================
    //
    // IMPORTANT:
    // Creating a consultation only saves the consultation.
    //
    // It does NOT:
    // - complete the consultation
    // - create a laboratory request
    // - create a prescription
    // - create billing
    //
    // Initial status = OPEN.
    //
    // =====================================================

    @PostMapping
    public ResponseEntity<ConsultationResponse>
    createConsultation(
        @RequestBody ConsultationRequest request
    ) {

        ConsultationResponse response =
            consultationService
                .createConsultation(request);


        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }


    // =====================================================
    // UPDATE / SAVE PROGRESS
    // =====================================================
    //
    // IMPORTANT:
    // Updating a consultation does NOT complete it.
    //
    // The current workflow status is preserved.
    //
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ConsultationResponse>
    updateConsultation(
        @PathVariable String id,
        @RequestBody ConsultationRequest request
    ) {

        return ResponseEntity.ok(
            consultationService
                .updateConsultation(
                    id,
                    request
                )
        );
    }


    // =====================================================
    // UPDATE STATUS
    // =====================================================
    //
    // This endpoint is for controlled non-completion
    // status changes.
    //
    // COMPLETED must NEVER be set here.
    //
    // Completion must use:
    //
    // PATCH /api/consultations/{id}/complete
    //
    // =====================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<ConsultationResponse>
    updateStatus(
        @PathVariable String id,
        @RequestParam String status
    ) {

        return ResponseEntity.ok(
            consultationService
                .updateStatus(
                    id,
                    status
                )
        );
    }


    // =====================================================
    // REVIEW LABORATORY RESULTS
    // =====================================================
    //
    // Workflow:
    //
    // Laboratory request
    //        ↓
    // Laboratory performs test
    //        ↓
    // Results entered
    //        ↓
    // Doctor reviews results
    //        ↓
    // READY_FOR_REVIEW / reviewed
    //        ↓
    // Final diagnosis
    //        ↓
    // Treatment plan
    //        ↓
    // Complete consultation
    //
    // This operation does NOT complete the consultation.
    //
    // =====================================================

    @PatchMapping("/{id}/review-laboratory-results")
    public ResponseEntity<ConsultationResponse>
    reviewLaboratoryResults(
        @PathVariable String id
    ) {

        return ResponseEntity.ok(
            consultationService
                .reviewLaboratoryResults(id)
        );
    }


    // =====================================================
    // COMPLETE CONSULTATION
    // =====================================================
    //
    // This is the ONLY endpoint that completes
    // a consultation.
    //
    // The service must verify:
    //
    // 1. Consultation is not cancelled
    // 2. Consultation is not already completed
    // 3. Required laboratory workflow is satisfied
    // 4. Laboratory results have been reviewed
    //    when laboratory investigations were requested
    // 5. Final diagnosis exists
    // 6. Treatment plan exists
    //
    // =====================================================

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ConsultationResponse>
    completeConsultation(
        @PathVariable String id
    ) {

        return ResponseEntity.ok(
            consultationService
                .completeConsultation(id)
        );
    }


    // =====================================================
    // CANCEL CONSULTATION
    // =====================================================

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ConsultationResponse>
    cancelConsultation(
        @PathVariable String id
    ) {

        return ResponseEntity.ok(
            consultationService
                .cancelConsultation(id)
        );
    }


    // =====================================================
    // DELETE CONSULTATION
    // =====================================================
    //
    // Completed consultations should not be deleted.
    //
    // The service controls this rule.
    //
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteConsultation(
        @PathVariable String id
    ) {

        consultationService
            .deleteConsultation(id);


        return ResponseEntity
            .noContent()
            .build();
    }
}

