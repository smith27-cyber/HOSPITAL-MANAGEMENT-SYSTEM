package com.hms.backend.repository;

import com.hms.backend.entity.LaboratoryRequest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LaboratoryRequestRepository
                extends JpaRepository<LaboratoryRequest, Long> {

        // =====================================================
        // TENANT
        // =====================================================

        List<LaboratoryRequest> findAllByTenant_Id(
                        Long tenantId);

        Optional<LaboratoryRequest> findByIdAndTenant_Id(
                        Long id,
                        Long tenantId);

        // =====================================================
        // PATIENT
        // =====================================================

        List<LaboratoryRequest> findByTenant_IdAndPatientId(
                        Long tenantId,
                        String patientId);

        // =====================================================
        // CONSULTATION
        // =====================================================

        List<LaboratoryRequest> findByTenant_IdAndConsultationId(
                        Long tenantId,
                        String consultationId);

        long countByTenant_IdAndConsultationId(
                        Long tenantId,
                        String consultationId);

        long countByTenant_IdAndConsultationIdAndStatusIgnoreCase(
                        Long tenantId,
                        String consultationId,
                        String status);

        // =====================================================
        // STATUS
        // =====================================================

        List<LaboratoryRequest> findByTenant_IdAndStatus(
                        Long tenantId,
                        String status);

        long countByTenant_IdAndStatusIgnoreCase(
                        Long tenantId,
                        String status);

        // =====================================================
        // PATIENT + STATUS
        // =====================================================

        List<LaboratoryRequest> findByTenant_IdAndPatientIdAndStatus(
                        Long tenantId,
                        String patientId,
                        String status);

        // =====================================================
        // CONSULTATION + STATUS
        // =====================================================

        List<LaboratoryRequest> findByTenant_IdAndConsultationIdAndStatus(
                        Long tenantId,
                        String consultationId,
                        String status);
}