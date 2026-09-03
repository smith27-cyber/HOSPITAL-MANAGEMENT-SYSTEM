package com.hms.backend.controller;

import com.hms.backend.entity.LaboratoryRequest;
import com.hms.backend.service.LaboratoryRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratory/requests")
@CrossOrigin(origins = "http://localhost:4200")
public class LaboratoryRequestController {

    private final LaboratoryRequestService laboratoryRequestService;

    public LaboratoryRequestController(
            LaboratoryRequestService laboratoryRequestService) {

        this.laboratoryRequestService =
                laboratoryRequestService;
    }

    // =====================================================
    // GET ALL REQUESTS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<LaboratoryRequest>>
    getAllRequests() {

        return ResponseEntity.ok(
                laboratoryRequestService
                        .getAllRequests()
        );
    }

    // =====================================================
    // GET REQUEST BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<LaboratoryRequest>
    getRequestById(
            @PathVariable Long id) {

        return laboratoryRequestService
                .getRequestById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // =====================================================
    // CREATE REQUEST
    // =====================================================

    @PostMapping
    public ResponseEntity<LaboratoryRequest>
    createRequest(
            @RequestBody LaboratoryRequest request) {

        LaboratoryRequest createdRequest =
                laboratoryRequestService
                        .createRequest(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdRequest);
    }

    // =====================================================
    // UPDATE REQUEST
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<LaboratoryRequest>
    updateRequest(
            @PathVariable Long id,
            @RequestBody LaboratoryRequest request) {

        try {

            LaboratoryRequest updatedRequest =
                    laboratoryRequestService
                            .updateRequest(
                                    id,
                                    request
                            );

            return ResponseEntity.ok(
                    updatedRequest
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // UPDATE REQUEST STATUS
    // =====================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<LaboratoryRequest>
    updateRequestStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        try {

            boolean updated =
                    laboratoryRequestService
                            .updateRequestStatus(
                                    id,
                                    status
                            );

            if (!updated) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            return laboratoryRequestService
                    .getRequestById(id)
                    .map(ResponseEntity::ok)
                    .orElse(
                            ResponseEntity
                                    .notFound()
                                    .build()
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =====================================================
    // DELETE REQUEST
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(
            @PathVariable Long id) {

        try {

            laboratoryRequestService
                    .deleteRequest(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    // =====================================================
    // GET REQUESTS BY PATIENT
    // =====================================================

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LaboratoryRequest>>
    getRequestsByPatient(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                laboratoryRequestService
                        .getRequestsByPatient(
                                patientId
                        )
        );
    }

    // =====================================================
    // GET REQUESTS BY CONSULTATION
    // =====================================================

    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<List<LaboratoryRequest>>
    getRequestsByConsultation(
            @PathVariable Long consultationId) {

        return ResponseEntity.ok(
                laboratoryRequestService
                        .getRequestsByConsultation(
                                consultationId
                        )
        );
    }

    // =====================================================
    // GET REQUESTS BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LaboratoryRequest>>
    getRequestsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                laboratoryRequestService
                        .getRequestsByStatus(
                                status
                        )
        );
    }

    // =====================================================
    // GET COMPLETED REQUESTS BY PATIENT
    // =====================================================

    @GetMapping("/patient/{patientId}/completed")
    public ResponseEntity<List<LaboratoryRequest>>
    getCompletedRequestsByPatient(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                laboratoryRequestService
                        .getCompletedRequestsByPatient(
                                patientId
                        )
        );
    }

    // =====================================================
    // GET COMPLETED REQUESTS BY CONSULTATION
    // =====================================================

    @GetMapping("/consultation/{consultationId}/completed")
    public ResponseEntity<List<LaboratoryRequest>>
    getCompletedRequestsByConsultation(
            @PathVariable Long consultationId) {

        return ResponseEntity.ok(
                laboratoryRequestService
                        .getCompletedRequestsByConsultation(
                                consultationId
                        )
        );
    }
}