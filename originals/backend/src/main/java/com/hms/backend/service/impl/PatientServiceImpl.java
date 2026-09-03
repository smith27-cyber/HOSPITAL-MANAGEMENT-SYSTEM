package com.hms.backend.service.impl;

import com.hms.backend.entity.Patient;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.service.PatientService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PatientServiceImpl(
            PatientRepository patientRepository
    ) {
        this.patientRepository = patientRepository;
    }

    // =====================================================
    // GET ALL PATIENTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Patient> getAllPatients() {

        return patientRepository.findAll();
    }

    // =====================================================
    // GET PATIENT BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Patient getPatientById(
            String id
    ) {

        return patientRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Patient not found: " + id
                        )
                );
    }

    // =====================================================
    // ADD PATIENT
    // =====================================================

    @Override
    public Patient addPatient(
            Patient patient
    ) {

        if (patient == null) {

            throw new IllegalArgumentException(
                    "Patient data is required."
            );
        }

        if (
                patient.getFirstName() == null ||
                patient.getFirstName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient first name is required."
            );
        }

        if (
                patient.getLastName() == null ||
                patient.getLastName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient last name is required."
            );
        }

        if (
                patient.getNationalId() != null &&
                !patient.getNationalId().isBlank()
        ) {

            if (
                    patientRepository.existsByNationalId(
                            patient.getNationalId()
                    )
            ) {

                throw new IllegalArgumentException(
                        "A patient with National ID "
                        + patient.getNationalId()
                        + " already exists."
                );
            }
        }

        // -------------------------------------------------
        // GENERATE ID IF NOT PROVIDED
        // -------------------------------------------------

        if (
                patient.getId() == null ||
                patient.getId().isBlank()
        ) {

            patient.setId(
                    generatePatientId()
            );
        }

        // -------------------------------------------------
        // DEFAULT STATUS
        // -------------------------------------------------

        if (
                patient.getStatus() == null ||
                patient.getStatus().isBlank()
        ) {

            patient.setStatus("Active");
        }

        return patientRepository.save(
                patient
        );
    }

    // =====================================================
    // UPDATE PATIENT
    // =====================================================

    @Override
    public Patient updatePatient(
            String id,
            Patient patient
    ) {

        Patient existingPatient =
                getPatientById(id);

        if (patient == null) {

            throw new IllegalArgumentException(
                    "Patient data is required."
            );
        }

        // -------------------------------------------------
        // NATIONAL ID DUPLICATE CHECK
        // -------------------------------------------------

        if (
                patient.getNationalId() != null &&
                !patient.getNationalId().isBlank()
        ) {

            if (
                    patientRepository
                            .existsByNationalIdAndIdNot(
                                    patient.getNationalId(),
                                    id
                            )
            ) {

                throw new IllegalArgumentException(
                        "Another patient with National ID "
                        + patient.getNationalId()
                        + " already exists."
                );
            }
        }

        // -------------------------------------------------
        // COPY PATIENT DATA
        // -------------------------------------------------

        existingPatient.setFirstName(
                patient.getFirstName()
        );

        existingPatient.setLastName(
                patient.getLastName()
        );

        existingPatient.setDateOfBirth(
                patient.getDateOfBirth()
        );

        existingPatient.setGender(
                patient.getGender()
        );

        existingPatient.setPhone(
                patient.getPhone()
        );

        existingPatient.setEmail(
                patient.getEmail()
        );

        existingPatient.setAddress(
                patient.getAddress()
        );

        existingPatient.setNationalId(
                patient.getNationalId()
        );

        existingPatient.setEmergencyContactName(
                patient.getEmergencyContactName()
        );

        existingPatient.setEmergencyContactPhone(
                patient.getEmergencyContactPhone()
        );

        existingPatient.setBloodGroup(
                patient.getBloodGroup()
        );

        existingPatient.setDepartment(
                patient.getDepartment()
        );

        existingPatient.setStatus(
                patient.getStatus()
        );

        return patientRepository.save(
                existingPatient
        );
    }

    // =====================================================
    // DELETE PATIENT
    // =====================================================

    @Override
    public void deletePatient(
            String id
    ) {

        Patient patient =
                getPatientById(id);

        patientRepository.delete(
                patient
        );
    }

    // =====================================================
    // UPDATE PATIENT STATUS
    // =====================================================

    @Override
    public Patient updatePatientStatus(
            String id,
            String status
    ) {

        Patient patient =
                getPatientById(id);

        if (
                status == null ||
                (
                        !status.equals("Active") &&
                        !status.equals("Inactive")
                )
        ) {

            throw new IllegalArgumentException(
                    "Patient status must be Active or Inactive."
            );
        }

        patient.setStatus(
                status
        );

        return patientRepository.save(
                patient
        );
    }

    // =====================================================
    // GENERATE PATIENT ID
    // =====================================================

    private String generatePatientId() {

        String id;

        do {

            id =
                    "PAT-" +
                    UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase();

        } while (
                patientRepository.existsById(id)
        );

        return id;
    }
}