package com.hms.backend.repository;

import com.hms.backend.entity.Consultation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ConsultationRepository
        extends JpaRepository<Consultation, String> {

    // =====================================================
    // PATIENT
    // =====================================================

    List<Consultation>
    findByPatientId(
            String patientId
    );


    // =====================================================
    // DOCTOR
    // =====================================================

    List<Consultation>
    findByDoctorId(
            String doctorId
    );


    // =====================================================
    // APPOINTMENT
    // =====================================================

    Optional<Consultation>
    findByAppointmentId(
            String appointmentId
    );


    boolean existsByAppointmentId(
            String appointmentId
    );


    // =====================================================
    // STATUS
    // =====================================================

    List<Consultation>
    findByStatus(
            Consultation.ConsultationStatus status
    );


    long countByStatus(
            Consultation.ConsultationStatus status
    );


    // =====================================================
    // DATE
    // =====================================================

    long countByConsultationDate(
            LocalDate consultationDate
    );
}