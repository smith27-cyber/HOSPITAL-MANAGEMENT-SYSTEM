
package com.hms.backend.controller;

import com.hms.backend.entity.LaboratoryRequest;
import com.hms.backend.service.LaboratoryRequestService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratory/requests")
@CrossOrigin(origins = "http://localhost:4200")
public class LaboratoryRequestController {

    private final LaboratoryRequestService laboratoryRequestService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public LaboratoryRequestController(
            LaboratoryRequestService laboratoryRequestService
    ) {

        this.laboratoryRequestService =
                laboratoryRequestService;
    }


    // =====================================================
    // GET ALL REQUESTS
    // =====================================================
    //
    // Permission:
    //
    // LABORATORY_REQUEST_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_VIEW')"
    )
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
    //
    // Permission:
    //
    // LABORATORY_REQUEST_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_VIEW')"
    )
    @GetMapping("/{id}")
    public ResponseEntity<LaboratoryRequest>
    getRequestById(
            @PathVariable Long id
    ) {

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
    //
    // Permission:
    //
    // LABORATORY_REQUEST_CREATE
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_CREATE')"
    )
    @PostMapping
    public ResponseEntity<LaboratoryRequest>
    createRequest(
            @RequestBody LaboratoryRequest request
    ) {

        try {

            LaboratoryRequest createdRequest =
                    laboratoryRequestService
                            .createRequest(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(createdRequest);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }


    // =====================================================
    // UPDATE REQUEST
    // =====================================================
    //
    // Permission:
    //
    // LABORATORY_REQUEST_UPDATE
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_UPDATE')"
    )
    @PutMapping("/{id}")
    public ResponseEntity<LaboratoryRequest>
    updateRequest(
            @PathVariable Long id,
            @RequestBody LaboratoryRequest request
    ) {

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

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .build();

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .badRequest()
                    .build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // =====================================================
    // UPDATE REQUEST STATUS
    // =====================================================
    //
    // Permission:
    //
    // LABORATORY_REQUEST_UPDATE
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_UPDATE')"
    )
    @PatchMapping("/{id}/status")
    public ResponseEntity<LaboratoryRequest>
    updateRequestStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        try {

            LaboratoryRequest updatedRequest =
                    laboratoryRequestService
                            .updateRequestStatus(
                                    id,
                                    status
                            );

            if (updatedRequest == null) {

                return ResponseEntity
                        .badRequest()
                        .build();
            }

            return ResponseEntity.ok(
                    updatedRequest
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .build();

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .badRequest()
                    .build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // =====================================================
    // COMPLETE REQUEST
    // =====================================================
    //
    // Permission:
    //
    // LABORATORY_REQUEST_UPDATE
    //
    // NOTE:
    //
    // Completion is not the same as entering the result.
    //
    // The result-entry endpoint should separately require:
    //
    // LABORATORY_RESULT_ENTER
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_UPDATE')"
    )
    @PatchMapping("/{id}/complete")
    public ResponseEntity<LaboratoryRequest>
    completeRequest(
            @PathVariable Long id
    ) {

        try {

            LaboratoryRequest completedRequest =
                    laboratoryRequestService
                            .completeRequest(id);

            return ResponseEntity.ok(
                    completedRequest
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .build();

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .badRequest()
                    .build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // =====================================================
    // DELETE REQUEST
    // =====================================================
    //
    // Permission:
    //
    // LABORATORY_REQUEST_UPDATE
    //
    // The service still protects completed requests.
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_UPDATE')"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteRequest(
            @PathVariable Long id
    ) {

        try {

            laboratoryRequestService
                    .deleteRequest(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .badRequest()
                    .build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // =====================================================
    // GET REQUESTS BY PATIENT
    // =====================================================
    //
    // Permission:
    //
    // LABORATORY_REQUEST_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_VIEW')"
    )
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LaboratoryRequest>>
    getRequestsByPatient(
            @PathVariable String patientId
    ) {

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
    //
    // Permission:
    //
    // LABORATORY_REQUEST_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_VIEW')"
    )
    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<List<LaboratoryRequest>>
    getRequestsByConsultation(
            @PathVariable String consultationId
    ) {

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
    //
    // Permission:
    //
    // LABORATORY_REQUEST_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_VIEW')"
    )
    @GetMapping("/status/{status}")
    public ResponseEntity<List<LaboratoryRequest>>
    getRequestsByStatus(
            @PathVariable String status
    ) {

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
    //
    // Permission:
    //
    // LABORATORY_REQUEST_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_VIEW')"
    )
    @GetMapping("/patient/{patientId}/completed")
    public ResponseEntity<List<LaboratoryRequest>>
    getCompletedRequestsByPatient(
            @PathVariable String patientId
    ) {

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
    //
    // Permission:
    //
    // LABORATORY_REQUEST_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_REQUEST_VIEW')"
    )
    @GetMapping("/consultation/{consultationId}/completed")
    public ResponseEntity<List<LaboratoryRequest>>
    getCompletedRequestsByConsultation(
            @PathVariable String consultationId
    ) {

        return ResponseEntity.ok(
                laboratoryRequestService
                        .getCompletedRequestsByConsultation(
                                consultationId
                        )
        );
    }
}

