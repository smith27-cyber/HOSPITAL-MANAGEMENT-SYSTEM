
package com.hms.backend.repository;

import com.hms.backend.entity.Doctor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository
        extends JpaRepository<Doctor, String> {
long countByStatusIgnoreCase(String status);

    // =====================================================
    // FIND BY NATIONAL ID
    // =====================================================

    Optional<Doctor> findByNationalId(
            String nationalId
    );


    // =====================================================
    // CHECK NATIONAL ID
    // =====================================================

    boolean existsByNationalId(
            String nationalId
    );


    // =====================================================
    // FIND BY LICENSE NUMBER
    // =====================================================

    Optional<Doctor> findByLicenseNumber(
            String licenseNumber
    );


    // =====================================================
    // CHECK LICENSE NUMBER
    // =====================================================

    boolean existsByLicenseNumber(
            String licenseNumber
    );


    // =====================================================
    // FIND BY EMAIL
    // =====================================================

    Optional<Doctor> findByEmail(
            String email
    );


    // =====================================================
    // CHECK EMAIL
    // =====================================================

    boolean existsByEmail(
            String email
    );


    // =====================================================
    // FIND LAST DOCTOR ID FOR CURRENT YEAR
    // =====================================================
    //
    // Expected format:
    //
    // DOC-2026-0001
    // DOC-2026-0002
    // DOC-2026-0003
    //
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

