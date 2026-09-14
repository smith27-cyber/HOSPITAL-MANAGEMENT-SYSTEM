package com.hms.backend.repository;

import com.hms.backend.entity.PharmacyPrescription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PharmacyPrescriptionRepository
        extends JpaRepository<PharmacyPrescription, Long> {

    // =====================================================
    // TENANT
    // =====================================================

    List<PharmacyPrescription> findAllByTenant_Id(
            Long tenantId
    );

    Optional<PharmacyPrescription> findByIdAndTenant_Id(
            Long id,
            Long tenantId
    );

    // =====================================================
    // PATIENT
    // =====================================================

    List<PharmacyPrescription> findByTenant_IdAndPatientId(
            Long tenantId,
            String patientId
    );

    // =====================================================
    // CONSULTATION
    // =====================================================

    List<PharmacyPrescription>
    findByTenant_IdAndConsultationId(
            Long tenantId,
            String consultationId
    );

    Optional<PharmacyPrescription>
    findFirstByTenant_IdAndConsultationIdOrderByIdDesc(
            Long tenantId,
            String consultationId
    );

    // =====================================================
    // STATUS
    // =====================================================

    List<PharmacyPrescription>
    findByTenant_IdAndStatus(
            Long tenantId,
            String status
    );

    long countByTenant_IdAndStatusIgnoreCase(
            Long tenantId,
            String status
    );

    // =====================================================
    // PRESCRIPTION NUMBER
    // =====================================================

    Optional<PharmacyPrescription>
    findByTenant_IdAndPrescriptionNumber(
            Long tenantId,
            String prescriptionNumber
    );

    boolean existsByTenant_IdAndPrescriptionNumber(
            Long tenantId,
            String prescriptionNumber
    );
}