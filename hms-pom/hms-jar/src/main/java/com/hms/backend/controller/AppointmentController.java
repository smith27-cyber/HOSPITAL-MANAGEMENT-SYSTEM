// =====================================================
// HMS APPOINTMENT CONTROLLER
// File:
// src/main/java/com/hms/backend/controller/AppointmentController.java
// =====================================================

package com.hms.backend.controller;

import com.hms.backend.dto.AppointmentRequest;
import com.hms.backend.dto.AppointmentResponse;
import com.hms.backend.service.AppointmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AppointmentController(
            AppointmentService appointmentService
    ) {

        this.appointmentService =
                appointmentService;
    }


    // =====================================================
    // CREATE APPOINTMENT
    // =====================================================

    @PreAuthorize("hasAuthority('APPOINTMENT_CREATE')")
    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            @RequestBody AppointmentRequest request
    ) {

        AppointmentResponse response =
                appointmentService.createAppointment(
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =====================================================
    // GET ALL APPOINTMENTS
    // =====================================================

    @PreAuthorize("hasAuthority('APPOINTMENT_VIEW')")
    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {

        List<AppointmentResponse> appointments =
                appointmentService.getAllAppointments();

        return ResponseEntity.ok(
                appointments
        );
    }


    // =====================================================
    // GET APPOINTMENT BY ID
    // =====================================================

    @PreAuthorize("hasAuthority('APPOINTMENT_VIEW')")
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @PathVariable String id
    ) {

        Optional<AppointmentResponse> appointment =
                appointmentService.getAppointmentById(
                        id
                );

        return appointment
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }


    // =====================================================
    // UPDATE APPOINTMENT
    // =====================================================

    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE')")
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @PathVariable String id,
            @RequestBody AppointmentRequest request
    ) {

        AppointmentResponse response =
                appointmentService.updateAppointment(
                        id,
                        request
                );

        return ResponseEntity.ok(
                response
        );
    }


    // =====================================================
    // UPDATE APPOINTMENT STATUS
    // =====================================================

    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable String id,
            @RequestParam String status
    ) {

        AppointmentResponse response =
                appointmentService.updateStatus(
                        id,
                        status
                );

        return ResponseEntity.ok(
                response
        );
    }


    // =====================================================
    // CANCEL APPOINTMENT
    // =====================================================

    @PreAuthorize("hasAuthority('APPOINTMENT_CANCEL')")
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable String id
    ) {

        AppointmentResponse response =
                appointmentService.cancelAppointment(
                        id
                );

        return ResponseEntity.ok(
                response
        );
    }


    // =====================================================
    // DELETE APPOINTMENT
    // =====================================================

    @PreAuthorize("hasAuthority('APPOINTMENT_CANCEL')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable String id
    ) {

        appointmentService.deleteAppointment(
                id
        );

        return ResponseEntity
                .noContent()
                .build();
    }
}