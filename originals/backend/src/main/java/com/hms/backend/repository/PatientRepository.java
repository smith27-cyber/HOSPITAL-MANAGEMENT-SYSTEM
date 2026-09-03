package com.hms.backend.repository;

import com.hms.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository
        extends JpaRepository<Patient, String> {

    Optional<Patient> findByNationalId(
            String nationalId
    );

    boolean existsByNationalId(
            String nationalId
    );

    boolean existsByNationalIdAndIdNot(
            String nationalId,
            String id
    );
}