package com.hms.backend.repository;

import com.hms.backend.entity.Consultation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ConsultationRepository
        extends JpaRepository<Consultation, String> {

    // =====================================================
    // TENANT
    // =====================================================

    List<Consultation> findAllByTenant_Id(
            Long tenantId
    );

    Optional<Consultation> findByIdAndTenant_Id(
            String id,
            Long tenantId
    );
// =====================================================
// REPORT AGGREGATION
// =====================================================

long countByTenant_IdAndConsultationDateBetween(
        Long tenantId,
        LocalDate startDate,
        LocalDate endDate
);
    // =====================================================
    // PATIENT
    // =====================================================

    List<Consultation> findByTenant_IdAndPatientId(
            Long tenantId,
            String patientId
    );

    // =====================================================
    // DOCTOR
    // =====================================================

    List<Consultation> findByTenant_IdAndDoctorId(
            Long tenantId,
            String doctorId
    );

    // =====================================================
    // APPOINTMENT
    // =====================================================

    Optional<Consultation> findByTenant_IdAndAppointmentId(
            Long tenantId,
            String appointmentId
    );

    boolean existsByTenant_IdAndAppointmentId(
            Long tenantId,
            String appointmentId
    );

    // =====================================================
    // STATUS
    // =====================================================

    List<Consultation> findByTenant_IdAndStatus(
            Long tenantId,
            Consultation.ConsultationStatus status
    );

    long countByTenant_IdAndStatus(
            Long tenantId,
            Consultation.ConsultationStatus status
    );

    // =====================================================
    // DATE
    // =====================================================

    long countByTenant_IdAndConsultationDate(
            Long tenantId,
            LocalDate consultationDate
    );
}