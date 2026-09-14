package com.hms.backend.repository;

import com.hms.backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, String> {

    // =====================================================
    // TENANT-SCOPED DOCTORS
    // =====================================================

    List<Doctor> findAllByTenant_Id(Long tenantId);

    Optional<Doctor> findByIdAndTenant_Id(
            String id,
            Long tenantId
    );

    // =====================================================
    // STATUS
    // =====================================================

    long countByTenant_IdAndStatusIgnoreCase(
            Long tenantId,
            String status
    );

    // =====================================================
    // NATIONAL ID
    // =====================================================

    Optional<Doctor> findByNationalIdAndTenant_Id(
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
    // LICENSE NUMBER
    // =====================================================

    Optional<Doctor> findByLicenseNumberAndTenant_Id(
            String licenseNumber,
            Long tenantId
    );

    boolean existsByLicenseNumberAndTenant_Id(
            String licenseNumber,
            Long tenantId
    );

    boolean existsByLicenseNumberAndTenant_IdAndIdNot(
            String licenseNumber,
            Long tenantId,
            String id
    );

    // =====================================================
    // EMAIL
    // =====================================================

    Optional<Doctor> findByEmailAndTenant_Id(
            String email,
            Long tenantId
    );

    boolean existsByEmailAndTenant_Id(
            String email,
            Long tenantId
    );

    boolean existsByEmailAndTenant_IdAndIdNot(
            String email,
            Long tenantId,
            String id
    );

    // =====================================================
    // FIND LAST DOCTOR ID FOR CURRENT YEAR
    // =====================================================

    @Query(
            value = """
                    SELECT id
                    FROM doctors
                    WHERE id LIKE
                        'DOC-' ||
                        EXTRACT(YEAR FROM CURRENT_DATE) ||
                        '-%'
                    ORDER BY id DESC
                    LIMIT 1
                    """,
            nativeQuery = true
    )
    Optional<String> findMaxIdForCurrentYear();
}