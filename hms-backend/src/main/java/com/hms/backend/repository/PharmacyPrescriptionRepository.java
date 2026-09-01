package com.hms.backend.repository;

import com.hms.backend.entity.PharmacyPrescription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PharmacyPrescriptionRepository
        extends JpaRepository<PharmacyPrescription, Long> {

    // =====================================================
    // PATIENT
    // =====================================================

    List<PharmacyPrescription>
    findByPatientId(
            String patientId
    );


    // =====================================================
    // CONSULTATION
    // =====================================================

    List<PharmacyPrescription>
    findByConsultationId(
            String consultationId
    );


    Optional<PharmacyPrescription>
    findFirstByConsultationIdOrderByIdDesc(
            String consultationId
    );


    // =====================================================
    // STATUS
    // =====================================================

    List<PharmacyPrescription>
    findByStatus(
            String status
    );


    long countByStatusIgnoreCase(
            String status
    );


    // =====================================================
    // PRESCRIPTION NUMBER
    // =====================================================

    Optional<PharmacyPrescription>
    findByPrescriptionNumber(
            String prescriptionNumber
    );


    boolean existsByPrescriptionNumber(
            String prescriptionNumber
    );
}