// =====================================================
// HMS PATIENT CONTROLLER
// File:
// src/main/java/com/hms/backend/controller/PatientController.java
// =====================================================

package com.hms.backend.controller;

import com.hms.backend.entity.Patient;
import com.hms.backend.service.PatientService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:4200")
public class PatientController {

    private final PatientService patientService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PatientController(
            PatientService patientService
    ) {
        this.patientService = patientService;
    }


    // =====================================================
    // GET ALL PATIENTS
    // =====================================================

    @PreAuthorize("hasAuthority('PATIENT_VIEW')")
    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {

        return ResponseEntity.ok(
                patientService.getAllPatients()
        );
    }


    // =====================================================
    // GET PATIENT BY ID
    // =====================================================

    @PreAuthorize("hasAuthority('PATIENT_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                patientService.getPatientById(id)
        );
    }


    // =====================================================
    // ADD PATIENT
    // =====================================================

    @PreAuthorize("hasAuthority('PATIENT_CREATE')")
    @PostMapping
    public ResponseEntity<Patient> addPatient(
            @RequestBody Patient patient
    ) {

        Patient savedPatient =
                patientService.addPatient(patient);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedPatient);
    }


    // =====================================================
    // UPDATE PATIENT
    // =====================================================

    @PreAuthorize("hasAuthority('PATIENT_UPDATE')")
    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(
            @PathVariable String id,
            @RequestBody Patient patient
    ) {

        return ResponseEntity.ok(
                patientService.updatePatient(
                        id,
                        patient
                )
        );
    }


    // =====================================================
    // DELETE PATIENT
    // =====================================================

    @PreAuthorize("hasAuthority('PATIENT_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(
            @PathVariable String id
    ) {

        patientService.deletePatient(id);

        return ResponseEntity
                .noContent()
                .build();
    }


    // =====================================================
    // UPDATE PATIENT STATUS
    // =====================================================

    @PreAuthorize("hasAuthority('PATIENT_UPDATE')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Patient> updatePatientStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request
    ) {

        String status = request.get("status");

        if (
                status == null ||
                (
                    !status.equals("Active") &&
                    !status.equals("Inactive")
                )
        ) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        return ResponseEntity.ok(
                patientService.updatePatientStatus(
                        id,
                        status
                )
        );
    }
}