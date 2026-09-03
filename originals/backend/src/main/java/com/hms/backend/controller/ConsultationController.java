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
    // GET ALL
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
    // GET BY ID
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
    // GET BY PATIENT
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
    // GET BY DOCTOR
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
    // GET BY APPOINTMENT
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
    // CREATE
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
    // UPDATE
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
    // COMPLETE
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
    // CANCEL
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
    // DELETE
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