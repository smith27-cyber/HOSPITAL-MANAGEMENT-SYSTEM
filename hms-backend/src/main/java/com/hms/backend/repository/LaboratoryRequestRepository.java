
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

    List<LaboratoryRequest> findByPatientId(
            String patientId
    );


    // =====================================================
    // CONSULTATION
    // =====================================================

    List<LaboratoryRequest> findByConsultationId(
            String consultationId
    );


    long countByConsultationId(
            String consultationId
    );


    long countByConsultationIdAndStatusIgnoreCase(
            String consultationId,
            String status
    );


    // =====================================================
    // STATUS
    // =====================================================

    List<LaboratoryRequest> findByStatus(
            String status
    );


    long countByStatusIgnoreCase(
            String status
    );


    // =====================================================
    // PATIENT + STATUS
    // =====================================================

    List<LaboratoryRequest> findByPatientIdAndStatus(
            String patientId,
            String status
    );


    // =====================================================
    // CONSULTATION + STATUS
    // =====================================================

    List<LaboratoryRequest> findByConsultationIdAndStatus(
            String consultationId,
            String status
    );
}

