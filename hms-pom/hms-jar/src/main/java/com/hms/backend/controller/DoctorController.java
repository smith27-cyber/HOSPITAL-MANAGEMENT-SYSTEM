// =====================================================
// HMS DOCTOR CONTROLLER
// File:
// src/main/java/com/hms/backend/controller/DoctorController.java
// =====================================================

package com.hms.backend.controller;

import com.hms.backend.entity.Doctor;
import com.hms.backend.service.DoctorService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public DoctorController(
            DoctorService doctorService
    ) {
        this.doctorService = doctorService;
    }


    // =====================================================
    // GET ALL DOCTORS
    // =====================================================

    @PreAuthorize("hasAuthority('DOCTOR_VIEW')")
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {

        return ResponseEntity.ok(
                doctorService.getAllDoctors()
        );
    }


    // =====================================================
    // GET DOCTOR BY ID
    // =====================================================

    @PreAuthorize("hasAuthority('DOCTOR_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                doctorService.getDoctorById(id)
        );
    }


    // =====================================================
    // ADD DOCTOR
    // =====================================================

    @PreAuthorize("hasAuthority('DOCTOR_CREATE')")
    @PostMapping
    public ResponseEntity<Doctor> addDoctor(
            @RequestBody Doctor doctor
    ) {

        Doctor savedDoctor =
                doctorService.addDoctor(doctor);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedDoctor);
    }


    // =====================================================
    // UPDATE DOCTOR
    // =====================================================

    @PreAuthorize("hasAuthority('DOCTOR_UPDATE')")
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(
            @PathVariable String id,
            @RequestBody Doctor doctor
    ) {

        return ResponseEntity.ok(
                doctorService.updateDoctor(
                        id,
                        doctor
                )
        );
    }


    // =====================================================
    // DELETE DOCTOR
    // =====================================================

    @PreAuthorize("hasAuthority('DOCTOR_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(
            @PathVariable String id
    ) {

        doctorService.deleteDoctor(id);

        return ResponseEntity
                .noContent()
                .build();
    }


    // =====================================================
    // UPDATE DOCTOR STATUS
    // =====================================================

    @PreAuthorize("hasAuthority('DOCTOR_UPDATE')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Doctor> updateDoctorStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request
    ) {

        String status =
                request.get("status");

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
                doctorService.updateDoctorStatus(
                        id,
                        status
                )
        );
    }
}