package com.hms.backend.service;

import com.hms.backend.entity.Admission;
import com.hms.backend.entity.Admission.AdmissionStatus;
import com.hms.backend.entity.Admission.WardType;

import java.util.List;
import java.util.Optional;

public interface AdmissionService {

    // =========================================================
    // GET ALL
    // =========================================================

    List<Admission> getAllAdmissions();

    // =========================================================
    // GET BY ID
    // =========================================================

    Optional<Admission> getAdmissionById(
            String id
    );

    // =========================================================
    // GET BY PATIENT
    // =========================================================

    List<Admission> getAdmissionsByPatient(
            String patientId
    );

    // =========================================================
    // GET BY STATUS
    // =========================================================

    List<Admission> getAdmissionsByStatus(
            AdmissionStatus status
    );

    // =========================================================
    // GET BY DOCTOR
    // =========================================================

    List<Admission> getAdmissionsByDoctor(
            String doctorId
    );

    // =========================================================
    // GET BY DEPARTMENT
    // =========================================================

    List<Admission> getAdmissionsByDepartment(
            String departmentId
    );

    // =========================================================
    // GET ACTIVE WARD PATIENTS
    // =========================================================

    List<Admission> getActiveAdmissionsByWard(
            WardType ward
    );

    // =========================================================
    // GET ACTIVE PATIENT ADMISSION
    // =========================================================

    Optional<Admission> getActiveAdmissionByPatient(
            String patientId
    );

    // =========================================================
    // CREATE
    // =========================================================

    Admission createAdmission(
            Admission admission
    );

    // =========================================================
    // UPDATE
    // =========================================================

    Admission updateAdmission(
            String id,
            Admission admission
    );

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    Admission updateAdmissionStatus(
            String id,
            AdmissionStatus status
    );

    // =========================================================
    // DISCHARGE
    // =========================================================

    Admission dischargeAdmission(
            String id
    );

    // =========================================================
    // TRANSFER
    // =========================================================

    Admission transferAdmission(
            String id,
            WardType newWard,
            String newBedNumber
    );

    // =========================================================
    // CANCEL
    // =========================================================

    Admission cancelAdmission(
            String id
    );

    // =========================================================
    // DELETE
    // =========================================================

    void deleteAdmission(
            String id
    );

    // =========================================================
    // COUNT
    // =========================================================

    long countAdmissions();

    long countActiveAdmissions();

    long countDischargedAdmissions();

    long countTransferredAdmissions();

    long countCancelledAdmissions();
}