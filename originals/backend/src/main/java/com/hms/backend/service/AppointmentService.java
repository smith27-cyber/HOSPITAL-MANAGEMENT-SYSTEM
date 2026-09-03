package com.hms.backend.service;

import com.hms.backend.dto.AppointmentRequest;
import com.hms.backend.dto.AppointmentResponse;

import java.util.List;
import java.util.Optional;

public interface AppointmentService {

    // =====================================================
    // CREATE APPOINTMENT
    // =====================================================

    AppointmentResponse createAppointment(
            AppointmentRequest request
    );


    // =====================================================
    // GET ALL APPOINTMENTS
    // =====================================================

    List<AppointmentResponse> getAllAppointments();


    // =====================================================
    // GET APPOINTMENT BY ID
    // =====================================================

    Optional<AppointmentResponse> getAppointmentById(
            String id
    );


    // =====================================================
    // UPDATE APPOINTMENT
    // =====================================================

    AppointmentResponse updateAppointment(
            String id,
            AppointmentRequest request
    );


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    AppointmentResponse updateStatus(
            String id,
            String status
    );


    // =====================================================
    // CANCEL APPOINTMENT
    // =====================================================

    AppointmentResponse cancelAppointment(
            String id
    );


    // =====================================================
    // DELETE APPOINTMENT
    // =====================================================

    void deleteAppointment(
            String id
    );
}