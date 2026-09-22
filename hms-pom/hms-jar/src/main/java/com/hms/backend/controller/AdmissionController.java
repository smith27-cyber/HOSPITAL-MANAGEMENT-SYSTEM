package com.hms.backend.controller;

import com.hms.backend.entity.Admission;
import com.hms.backend.entity.Admission.AdmissionStatus;
import com.hms.backend.entity.Admission.WardType;
import com.hms.backend.service.AdmissionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admissions")
public class AdmissionController {

    private final AdmissionService admissionService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AdmissionController(
            AdmissionService admissionService
    ) {
        this.admissionService =
                admissionService;
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<List<Admission>> getAllAdmissions() {

        return ResponseEntity.ok(
                admissionService.getAllAdmissions()
        );
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<Admission> getAdmissionById(
            @PathVariable String id
    ) {

        return admissionService
                .getAdmissionById(id)
                .map(ResponseEntity::ok)
                .orElseGet(
                        () -> ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // GET BY PATIENT
    // =========================================================

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<List<Admission>>
    getAdmissionsByPatient(
            @PathVariable String patientId
    ) {

        return ResponseEntity.ok(
                admissionService
                        .getAdmissionsByPatient(patientId)
        );
    }


    // =========================================================
    // GET ACTIVE ADMISSION BY PATIENT
    // =========================================================

    @GetMapping("/patient/{patientId}/active")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<Admission>
    getActiveAdmissionByPatient(
            @PathVariable String patientId
    ) {

        return admissionService
                .getActiveAdmissionByPatient(patientId)
                .map(ResponseEntity::ok)
                .orElseGet(
                        () -> ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<List<Admission>>
    getAdmissionsByStatus(
            @PathVariable AdmissionStatus status
    ) {

        return ResponseEntity.ok(
                admissionService
                        .getAdmissionsByStatus(status)
        );
    }


    // =========================================================
    // GET BY DOCTOR
    // =========================================================

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<List<Admission>>
    getAdmissionsByDoctor(
            @PathVariable String doctorId
    ) {

        return ResponseEntity.ok(
                admissionService
                        .getAdmissionsByDoctor(doctorId)
        );
    }


    // =========================================================
    // GET BY DEPARTMENT
    // =========================================================

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<List<Admission>>
    getAdmissionsByDepartment(
            @PathVariable String departmentId
    ) {

        return ResponseEntity.ok(
                admissionService
                        .getAdmissionsByDepartment(
                                departmentId
                        )
        );
    }


    // =========================================================
    // GET ACTIVE BY WARD
    // =========================================================

    @GetMapping("/ward/{ward}/active")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<List<Admission>>
    getActiveAdmissionsByWard(
            @PathVariable WardType ward
    ) {

        return ResponseEntity.ok(
                admissionService
                        .getActiveAdmissionsByWard(ward)
        );
    }


    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAuthority('ADMISSION_CREATE')")
    public ResponseEntity<Admission> createAdmission(
            @Valid @RequestBody Admission admission
    ) {

        Admission created =
                admissionService.createAdmission(
                        admission
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMISSION_UPDATE')")
    public ResponseEntity<Admission> updateAdmission(
            @PathVariable String id,
            @Valid @RequestBody Admission admission
    ) {

        return ResponseEntity.ok(
                admissionService.updateAdmission(
                        id,
                        admission
                )
        );
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMISSION_UPDATE')")
    public ResponseEntity<Admission> updateStatus(
            @PathVariable String id,
            @RequestParam AdmissionStatus status
    ) {

        return ResponseEntity.ok(
                admissionService.updateAdmissionStatus(
                        id,
                        status
                )
        );
    }


    // =========================================================
    // DISCHARGE
    // =========================================================

    @PatchMapping("/{id}/discharge")
    @PreAuthorize("hasAuthority('ADMISSION_DISCHARGE')")
    public ResponseEntity<Admission> dischargeAdmission(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                admissionService.dischargeAdmission(
                        id
                )
        );
    }


    // =========================================================
    // TRANSFER
    // =========================================================

    @PatchMapping("/{id}/transfer")
    @PreAuthorize("hasAuthority('ADMISSION_TRANSFER')")
    public ResponseEntity<Admission> transferAdmission(
            @PathVariable String id,
            @RequestParam WardType ward,
            @RequestParam(required = false) String bedNumber
    ) {

        return ResponseEntity.ok(
                admissionService.transferAdmission(
                        id,
                        ward,
                        bedNumber
                )
        );
    }


    // =========================================================
    // CANCEL
    // =========================================================

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ADMISSION_CANCEL')")
    public ResponseEntity<Admission> cancelAdmission(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                admissionService.cancelAdmission(
                        id
                )
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    /*
     * There is currently no ADMISSION_DELETE permission.
     *
     * Therefore ADMISSION_UPDATE is used temporarily.
     *
     * The AdmissionService should protect important
     * clinical records from inappropriate deletion.
     */

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMISSION_UPDATE')")
    public ResponseEntity<Void> deleteAdmission(
            @PathVariable String id
    ) {

        admissionService.deleteAdmission(id);

        return ResponseEntity
                .noContent()
                .build();
    }


    // =========================================================
    // STATISTICS
    // =========================================================

    @GetMapping("/statistics/count")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<Long> countAdmissions() {

        return ResponseEntity.ok(
                admissionService.countAdmissions()
        );
    }


    @GetMapping("/statistics/active")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<Long> countActiveAdmissions() {

        return ResponseEntity.ok(
                admissionService.countActiveAdmissions()
        );
    }


    @GetMapping("/statistics/discharged")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<Long> countDischargedAdmissions() {

        return ResponseEntity.ok(
                admissionService.countDischargedAdmissions()
        );
    }


    @GetMapping("/statistics/transferred")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<Long> countTransferredAdmissions() {

        return ResponseEntity.ok(
                admissionService.countTransferredAdmissions()
        );
    }


    @GetMapping("/statistics/cancelled")
    @PreAuthorize("hasAuthority('ADMISSION_VIEW')")
    public ResponseEntity<Long> countCancelledAdmissions() {

        return ResponseEntity.ok(
                admissionService.countCancelledAdmissions()
        );
    }
}