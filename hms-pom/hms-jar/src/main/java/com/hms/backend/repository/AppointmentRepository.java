package com.hms.backend.repository;

import com.hms.backend.entity.Appointment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository
        extends JpaRepository<Appointment, String> {

    // =====================================================
    // TENANT-SCOPED LOOKUP
    // =====================================================

    List<Appointment> findAllByTenant_Id(
            Long tenantId
    );

    Optional<Appointment> findByIdAndTenant_Id(
            String id,
            Long tenantId
    );
// =====================================================
// REPORT AGGREGATION
// =====================================================

long countByTenant_IdAndAppointmentDateBetween(
        Long tenantId,
        LocalDate startDate,
        LocalDate endDate
);
    // =====================================================
    // DATE
    // =====================================================

    List<Appointment>
    findByTenant_IdAndAppointmentDateOrderByAppointmentTimeAsc(
            Long tenantId,
            LocalDate appointmentDate
    );

    // =====================================================
    // COUNT BY DATE
    // =====================================================

    long countByTenant_IdAndAppointmentDate(
            Long tenantId,
            LocalDate appointmentDate
    );

    // =====================================================
    // STATUS
    // =====================================================

    long countByTenant_IdAndStatusIgnoreCase(
            Long tenantId,
            String status
    );

    List<Appointment>
    findByTenant_IdAndStatusIgnoreCase(
            Long tenantId,
            String status
    );
}