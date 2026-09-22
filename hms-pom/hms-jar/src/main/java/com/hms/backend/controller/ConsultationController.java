
package com.hms.backend.controller;

import com.hms.backend.dto.ConsultationRequest;
import com.hms.backend.dto.ConsultationResponse;
import com.hms.backend.service.ConsultationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
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
    // GET ALL
    // =====================================================
    //
    // Permission:
    //
    // CONSULTATION_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_VIEW')"
    )
    @GetMapping
    public ResponseEntity<List<ConsultationResponse>>
    getAllConsultations() {

        return ResponseEntity.ok(
                consultationService
                        .getAllConsultations()
        );
    }


    // =====================================================
    // GET BY ID
    // =====================================================
    //
    // Permission:
    //
    // CONSULTATION_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_VIEW')"
    )
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
    // GET BY PATIENT
    // =====================================================
    //
    // Permission:
    //
    // CONSULTATION_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_VIEW')"
    )
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
    // GET BY DOCTOR
    // =====================================================
    //
    // Permission:
    //
    // CONSULTATION_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_VIEW')"
    )
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
    // GET BY APPOINTMENT
    // =====================================================
    //
    // Permission:
    //
    // CONSULTATION_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_VIEW')"
    )
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
    // Permission:
    //
    // CONSULTATION_CREATE
    //
    // Saving a consultation does NOT complete it.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_CREATE')"
    )
    @PostMapping
    public ResponseEntity<ConsultationResponse>
    createConsultation(
            @RequestBody ConsultationRequest request
    ) {

        ConsultationResponse response =
                consultationService
                        .createConsultation(
                                request
                        );


        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        response
                );
    }


    // =====================================================
    // UPDATE / SAVE PROGRESS
    // =====================================================
    //
    // Permission:
    //
    // CONSULTATION_UPDATE
    //
    // This endpoint MUST NOT complete the consultation.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_UPDATE')"
    )
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
    // Permission:
    //
    // CONSULTATION_UPDATE
    //
    // COMPLETED is intentionally rejected by the service.
    //
    // Laboratory workflow statuses are also controlled
    // by the laboratory workflow.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_UPDATE')"
    )
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
    // Permission:
    //
    // CONSULTATION_UPDATE
    //
    // The actual workflow validation remains in the service.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_UPDATE')"
    )
    @PatchMapping(
            "/{id}/review-laboratory-results"
    )
    public ResponseEntity<ConsultationResponse>
    reviewLaboratoryResults(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                consultationService
                        .reviewLaboratoryResults(
                                id
                        )
        );
    }


    // =====================================================
    // COMPLETE CONSULTATION
    // =====================================================
    //
    // Permission:
    //
    // CONSULTATION_COMPLETE
    //
    // IMPORTANT:
    //
    // Having CONSULTATION_UPDATE does NOT grant this action.
    //
    // The service separately verifies:
    //
    // - Consultation is OPEN
    // - Final diagnosis exists
    // - Treatment plan exists
    // - Laboratory results exist when required
    // - Laboratory results have been reviewed when required
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_COMPLETE')"
    )
    @PatchMapping("/{id}/complete")
    public ResponseEntity<ConsultationResponse>
    completeConsultation(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                consultationService
                        .completeConsultation(
                                id
                        )
        );
    }


    // =====================================================
    // CANCEL CONSULTATION
    // =====================================================
    //
    // There is currently no CONSULTATION_CANCEL permission
    // in the RBAC catalog.
    //
    // Therefore cancellation uses:
    //
    // CONSULTATION_UPDATE
    //
    // The service still prevents cancellation of completed
    // consultations.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_UPDATE')"
    )
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ConsultationResponse>
    cancelConsultation(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                consultationService
                        .cancelConsultation(
                                id
                        )
        );
    }


    // =====================================================
    // DELETE
    // =====================================================
    //
    // Permission:
    //
    // CONSULTATION_DELETE
    //
    // This should normally be assigned only to:
    //
    // SUPER_ADMIN
    // ADMIN
    //
    // Completed consultations are protected by the service.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('CONSULTATION_DELETE')"
    )
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

