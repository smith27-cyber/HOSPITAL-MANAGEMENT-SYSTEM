
package com.hms.backend.controller;

import com.hms.backend.entity.Doctor;
import com.hms.backend.service.DoctorService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:4200")
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

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {

        return ResponseEntity.ok(
                doctorService.getAllDoctors()
        );
    }


    // =====================================================
    // GET DOCTOR BY ID
    // =====================================================

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

