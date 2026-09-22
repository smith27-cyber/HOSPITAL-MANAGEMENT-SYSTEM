
package com.hms.backend.service.impl;

import com.hms.backend.dto.AppointmentRequest;
import com.hms.backend.dto.AppointmentResponse;
import com.hms.backend.entity.Appointment;
import com.hms.backend.repository.AppointmentRepository;
import com.hms.backend.service.AppointmentService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


// =====================================================
// APPOINTMENT SERVICE IMPLEMENTATION
// File:
// src/main/java/com/hms/backend/service/impl/AppointmentServiceImpl.java
// =====================================================

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    // =====================================================
    // REPOSITORY
    // =====================================================

    private final AppointmentRepository appointmentRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AppointmentServiceImpl(
            AppointmentRepository appointmentRepository
    ) {

        this.appointmentRepository =
                appointmentRepository;

    }


    // =====================================================
    // CREATE APPOINTMENT
    // =====================================================

    @Override
    public AppointmentResponse createAppointment(
            AppointmentRequest request
    ) {

        // -------------------------------------------------
        // VALIDATE REQUEST
        // -------------------------------------------------

        validateAppointmentRequest(
                request
        );


        // -------------------------------------------------
        // CREATE ENTITY
        // -------------------------------------------------

        Appointment appointment =
                new Appointment();


        // -------------------------------------------------
        // GENERATE ID IF NOT PROVIDED
        // -------------------------------------------------

        String appointmentId =
                request.getId();

        if (
                appointmentId == null ||
                appointmentId.isBlank()
        ) {

            appointmentId =
                    generateAppointmentId();

        }


        appointment.setId(
                appointmentId
        );


        // -------------------------------------------------
        // MAP REQUEST TO ENTITY
        // -------------------------------------------------

        mapRequestToEntity(
                request,
                appointment
        );


        // -------------------------------------------------
        // DEFAULT STATUS
        // -------------------------------------------------

        if (
                appointment.getStatus() == null ||
                appointment.getStatus().isBlank()
        ) {

            appointment.setStatus(
                    "Scheduled"
            );

        }


        // -------------------------------------------------
        // CREATED AT
        // -------------------------------------------------

        appointment.setCreatedAt(
                LocalDateTime.now()
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        Appointment savedAppointment =
                appointmentRepository.save(
                        appointment
                );


        // -------------------------------------------------
        // RETURN RESPONSE DTO
        // -------------------------------------------------

        return mapToResponse(
                savedAppointment
        );

    }


    // =====================================================
    // GET ALL APPOINTMENTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {

        return appointmentRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

    }


    // =====================================================
    // GET APPOINTMENT BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Optional<AppointmentResponse> getAppointmentById(
            String id
    ) {

        if (
                id == null ||
                id.isBlank()
        ) {

            return Optional.empty();

        }


        return appointmentRepository
                .findById(id)
                .map(this::mapToResponse);

    }


    // =====================================================
    // UPDATE APPOINTMENT
    // =====================================================

    @Override
    public AppointmentResponse updateAppointment(
            String id,
            AppointmentRequest request
    ) {

        // -------------------------------------------------
        // VALIDATE ID
        // -------------------------------------------------

        if (
                id == null ||
                id.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment ID is required"
            );

        }


        // -------------------------------------------------
        // VALIDATE REQUEST
        // -------------------------------------------------

        validateAppointmentRequest(
                request
        );


        // -------------------------------------------------
        // FIND EXISTING APPOINTMENT
        // -------------------------------------------------

        Appointment existingAppointment =
                appointmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with ID: "
                                                + id
                                )
                        );


        // -------------------------------------------------
        // UPDATE ENTITY
        // -------------------------------------------------

        mapRequestToEntity(
                request,
                existingAppointment
        );


        // -------------------------------------------------
        // PRESERVE EXISTING ID
        // -------------------------------------------------

        existingAppointment.setId(
                id
        );


        // -------------------------------------------------
        // PRESERVE STATUS
        // -------------------------------------------------

        if (
                request.getStatus() != null &&
                !request.getStatus().isBlank()
        ) {

            existingAppointment.setStatus(
                    request.getStatus()
            );

        }


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        Appointment updatedAppointment =
                appointmentRepository.save(
                        existingAppointment
                );


        // -------------------------------------------------
        // RETURN RESPONSE
        // -------------------------------------------------

        return mapToResponse(
                updatedAppointment
        );

    }


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    @Override
    public AppointmentResponse updateStatus(
            String id,
            String status
    ) {

        // -------------------------------------------------
        // VALIDATE ID
        // -------------------------------------------------

        if (
                id == null ||
                id.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment ID is required"
            );

        }


        // -------------------------------------------------
        // VALIDATE STATUS
        // -------------------------------------------------

        if (
                status == null ||
                status.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment status is required"
            );

        }


        // -------------------------------------------------
        // FIND APPOINTMENT
        // -------------------------------------------------

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with ID: "
                                                + id
                                )
                        );


        // -------------------------------------------------
        // UPDATE STATUS
        // -------------------------------------------------

        appointment.setStatus(
                status
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        Appointment updatedAppointment =
                appointmentRepository.save(
                        appointment
                );


        // -------------------------------------------------
        // RETURN RESPONSE
        // -------------------------------------------------

        return mapToResponse(
                updatedAppointment
        );

    }


    // =====================================================
    // CANCEL APPOINTMENT
    // =====================================================

    @Override
    public AppointmentResponse cancelAppointment(
            String id
    ) {

        // -------------------------------------------------
        // VALIDATE ID
        // -------------------------------------------------

        if (
                id == null ||
                id.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment ID is required"
            );

        }


        // -------------------------------------------------
        // FIND APPOINTMENT
        // -------------------------------------------------

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with ID: "
                                                + id
                                )
                        );


        // -------------------------------------------------
        // PREVENT CANCELLING COMPLETED APPOINTMENT
        // -------------------------------------------------

        if (
                "Completed".equals(
                        appointment.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "Completed appointments cannot be cancelled"
            );

        }


        // -------------------------------------------------
        // CANCEL
        // -------------------------------------------------

        appointment.setStatus(
                "Cancelled"
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        Appointment cancelledAppointment =
                appointmentRepository.save(
                        appointment
                );


        // -------------------------------------------------
        // RETURN RESPONSE
        // -------------------------------------------------

        return mapToResponse(
                cancelledAppointment
        );

    }


    // =====================================================
    // DELETE APPOINTMENT
    // =====================================================

    @Override
    public void deleteAppointment(
            String id
    ) {

        // -------------------------------------------------
        // VALIDATE ID
        // -------------------------------------------------

        if (
                id == null ||
                id.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment ID is required"
            );

        }


        // -------------------------------------------------
        // CHECK EXISTENCE
        // -------------------------------------------------

        if (
                !appointmentRepository.existsById(id)
        ) {

            throw new RuntimeException(
                    "Appointment not found with ID: "
                            + id
            );

        }


        // -------------------------------------------------
        // DELETE
        // -------------------------------------------------

        appointmentRepository.deleteById(
                id
        );

    }


    // =====================================================
    // VALIDATE APPOINTMENT REQUEST
    // =====================================================

    private void validateAppointmentRequest(
            AppointmentRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Appointment request cannot be null"
            );

        }


        // -------------------------------------------------
        // PATIENT ID
        // -------------------------------------------------

        if (
                request.getPatientId() == null ||
                request.getPatientId().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient ID is required"
            );

        }


        // -------------------------------------------------
        // PATIENT NAME
        // -------------------------------------------------

        if (
                request.getPatientName() == null ||
                request.getPatientName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient name is required"
            );

        }


        // -------------------------------------------------
        // DOCTOR ID
        // -------------------------------------------------

        if (
                request.getDoctorId() == null ||
                request.getDoctorId().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Doctor ID is required"
            );

        }


        // -------------------------------------------------
        // DOCTOR NAME
        // -------------------------------------------------

        if (
                request.getDoctorName() == null ||
                request.getDoctorName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Doctor name is required"
            );

        }


        // -------------------------------------------------
        // DEPARTMENT
        // -------------------------------------------------

        if (
                request.getDepartment() == null ||
                request.getDepartment().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Department is required"
            );

        }


        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        if (
                request.getAppointmentDate() == null
        ) {

            throw new IllegalArgumentException(
                    "Appointment date is required"
            );

        }


        // -------------------------------------------------
        // TIME
        // -------------------------------------------------

        if (
                request.getAppointmentTime() == null
        ) {

            throw new IllegalArgumentException(
                    "Appointment time is required"
            );

        }


        // -------------------------------------------------
        // TYPE
        // -------------------------------------------------

        if (
                request.getType() == null ||
                request.getType().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment type is required"
            );

        }


        // -------------------------------------------------
        // REASON
        // -------------------------------------------------

        if (
                request.getReason() == null ||
                request.getReason().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Reason for appointment is required"
            );

        }

    }


    // =====================================================
    // MAP REQUEST TO ENTITY
    // =====================================================

    private void mapRequestToEntity(
            AppointmentRequest request,
            Appointment appointment
    ) {

        appointment.setPatientId(
                request.getPatientId()
        );

        appointment.setPatientName(
                request.getPatientName()
        );

        appointment.setDoctorId(
                request.getDoctorId()
        );

        appointment.setDoctorName(
                request.getDoctorName()
        );

        appointment.setDepartment(
                request.getDepartment()
        );

        appointment.setAppointmentDate(
                request.getAppointmentDate()
        );

        appointment.setAppointmentTime(
                request.getAppointmentTime()
        );

        appointment.setType(
                request.getType()
        );

        appointment.setReason(
                request.getReason()
        );

        appointment.setNotes(
                request.getNotes()
        );

    }


    // =====================================================
    // MAP ENTITY TO RESPONSE
    // =====================================================

    private AppointmentResponse mapToResponse(
            Appointment appointment
    ) {

        AppointmentResponse response =
                new AppointmentResponse();


        response.setId(
                appointment.getId()
        );

        response.setPatientId(
                appointment.getPatientId()
        );

        response.setPatientName(
                appointment.getPatientName()
        );

        response.setDoctorId(
                appointment.getDoctorId()
        );

        response.setDoctorName(
                appointment.getDoctorName()
        );

        response.setDepartment(
                appointment.getDepartment()
        );

        response.setAppointmentDate(
                appointment.getAppointmentDate()
        );

        response.setAppointmentTime(
                appointment.getAppointmentTime()
        );

        response.setType(
                appointment.getType()
        );

        response.setReason(
                appointment.getReason()
        );

        response.setStatus(
                appointment.getStatus()
        );

        response.setNotes(
                appointment.getNotes()
        );

        response.setCreatedAt(
                appointment.getCreatedAt()
        );


        return response;

    }


    // =====================================================
    // GENERATE APPOINTMENT ID
    // =====================================================

    private String generateAppointmentId() {

        String timestamp =
                String.valueOf(
                        System.currentTimeMillis()
                );


        String suffix =
                timestamp.substring(
                        Math.max(
                                0,
                                timestamp.length() - 6
                        )
                );


        return "APT-" + suffix;

    }

}

