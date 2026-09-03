package com.hms.backend.service;

import com.hms.backend.entity.Patient;

import java.util.List;

public interface PatientService {

    List<Patient> getAllPatients();

    Patient getPatientById(String id);

    Patient addPatient(Patient patient);

    Patient updatePatient(
            String id,
            Patient patient
    );

    void deletePatient(String id);

    Patient updatePatientStatus(
            String id,
            String status
    );
}