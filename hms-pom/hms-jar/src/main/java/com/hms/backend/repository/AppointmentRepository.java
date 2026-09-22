package com.hms.backend.repository;

import com.hms.backend.entity.Appointment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository
        extends JpaRepository<Appointment, String> {

    // =====================================================
    // DATE
    // =====================================================

    List<Appointment>
    findByAppointmentDateOrderByAppointmentTimeAsc(
            LocalDate appointmentDate
    );


    // =====================================================
    // COUNT BY DATE
    // =====================================================

    long countByAppointmentDate(
            LocalDate appointmentDate
    );


    // =====================================================
    // STATUS
    // =====================================================

    long countByStatusIgnoreCase(
            String status
    );


    List<Appointment>
    findByStatusIgnoreCase(
            String status
    );
}