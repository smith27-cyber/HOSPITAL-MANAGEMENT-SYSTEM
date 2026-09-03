package com.hms.backend.repository;

import com.hms.backend.entity.LaboratoryRequest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LaboratoryRequestRepository
        extends JpaRepository<LaboratoryRequest, Long> {

    // =====================================================
    // PATIENT
    // =====================================================

    List<LaboratoryRequest>
    findByPatientId(
            Long patientId
    );


    // =====================================================
    // CONSULTATION
    // =====================================================

    List<LaboratoryRequest>
    findByConsultationId(
            Long consultationId
    );


    // =====================================================
    // STATUS
    // =====================================================

    List<LaboratoryRequest>
    findByStatus(
            String status
    );


    long countByStatusIgnoreCase(
            String status
    );


    // =====================================================
    // PATIENT + STATUS
    // =====================================================

    List<LaboratoryRequest>
    findByPatientIdAndStatus(
            Long patientId,
            String status
    );


    // =====================================================
    // CONSULTATION + STATUS
    // =====================================================

    List<LaboratoryRequest>
    findByConsultationIdAndStatus(
            Long consultationId,
            String status
    );
}