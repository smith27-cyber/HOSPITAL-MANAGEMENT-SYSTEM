package com.hms.backend.repository;

import com.hms.backend.entity.Patient;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PatientRepository
        extends JpaRepository<Patient, String> {

    // =====================================================
    // TENANT-SCOPED READ OPERATIONS
    // =====================================================

    List<Patient> findAllByTenant_Id(
        Long tenantId
    );

    Optional<Patient> findByIdAndTenant_Id(
        String id,
        Long tenantId
    );


    // =====================================================
    // TENANT-SCOPED NATIONAL ID
    // =====================================================

    Optional<Patient> findByNationalIdAndTenant_Id(
        String nationalId,
        Long tenantId
    );

    boolean existsByNationalIdAndTenant_Id(
        String nationalId,
        Long tenantId
    );

    boolean existsByNationalIdAndTenant_IdAndIdNot(
        String nationalId,
        Long tenantId,
        String id
    );


    // =====================================================
    // TENANT-SCOPED STATUS
    // =====================================================

    List<Patient> findAllByTenant_IdAndStatus(
        Long tenantId,
        String status
    );


    // =====================================================
    // TENANT-SCOPED SEARCH
    // =====================================================

    List<Patient> findAllByTenant_IdAndFirstNameContainingIgnoreCase(
        Long tenantId,
        String firstName
    );

    List<Patient> findAllByTenant_IdAndLastNameContainingIgnoreCase(
        Long tenantId,
        String lastName
    );
}