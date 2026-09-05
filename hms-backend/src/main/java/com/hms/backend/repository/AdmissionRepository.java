package com.hms.backend.repository;

import com.hms.backend.entity.Admission;
import com.hms.backend.entity.Admission.AdmissionStatus;
import com.hms.backend.entity.Admission.WardType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionRepository
        extends JpaRepository<Admission, String> {

    // =========================================================
    // PATIENT
    // =========================================================

    List<Admission> findByPatientIdOrderByAdmissionDateDesc(
            String patientId
    );

    // =========================================================
    // STATUS
    // =========================================================

    List<Admission> findByStatusOrderByAdmissionDateDesc(
            AdmissionStatus status
    );

    // =========================================================
    // ACTIVE PATIENT ADMISSION
    // =========================================================

    Optional<Admission> findFirstByPatientIdAndStatusOrderByAdmissionDateDesc(
            String patientId,
            AdmissionStatus status
    );

    // =========================================================
    // DOCTOR
    // =========================================================

    List<Admission> findByDoctorIdOrderByAdmissionDateDesc(
            String doctorId
    );

    // =========================================================
    // DEPARTMENT
    // =========================================================

    List<Admission> findByDepartmentIdOrderByAdmissionDateDesc(
            String departmentId
    );

    // =========================================================
    // WARD
    // =========================================================

    List<Admission> findByWardAndStatusOrderByAdmissionDateDesc(
            WardType ward,
            AdmissionStatus status
    );

    // =========================================================
    // BED
    // =========================================================

    Optional<Admission> findFirstByWardAndBedNumberAndStatus(
            WardType ward,
            String bedNumber,
            AdmissionStatus status
    );

    // =========================================================
    // ACTIVE ADMISSION CHECK
    // =========================================================

    boolean existsByPatientIdAndStatus(
            String patientId,
            AdmissionStatus status
    );
}