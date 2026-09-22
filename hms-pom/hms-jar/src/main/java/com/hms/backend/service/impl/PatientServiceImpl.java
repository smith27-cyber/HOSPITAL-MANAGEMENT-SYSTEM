package com.hms.backend.service.impl;

import com.hms.backend.entity.Patient;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.service.PatientService;
import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.repository.TenantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final TenantRepository tenantRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PatientServiceImpl(
        PatientRepository patientRepository,
        TenantRepository tenantRepository
    ) {
        this.patientRepository = patientRepository;
        this.tenantRepository = tenantRepository;
    }


    // =====================================================
    // GET CURRENT TENANT ID
    // =====================================================

    private Long getCurrentTenantId() {

        return TenantContext.requireTenantId();
    }


    // =====================================================
    // GET CURRENT TENANT
    // =====================================================

    private Tenant getCurrentTenant() {

        Long tenantId =
            getCurrentTenantId();

        return tenantRepository
            .findById(tenantId)
            .orElseThrow(
                () -> new IllegalStateException(
                    "Current tenant was not found: "
                    + tenantId
                )
            );
    }


    // =====================================================
    // GET ALL PATIENTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Patient> getAllPatients() {

        Long tenantId =
            getCurrentTenantId();

        return patientRepository
            .findAllByTenant_Id(
                tenantId
            );
    }


    // =====================================================
    // GET PATIENT BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Patient getPatientById(
        String id
    ) {

        Long tenantId =
            getCurrentTenantId();

        return patientRepository
    .findByIdAndTenant_Id(
        id,
        tenantId
    )
    .orElseThrow(
        () -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
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


        // =================================================
        // CURRENT TENANT
        // =================================================

        Long tenantId =
            getCurrentTenantId();

        Tenant currentTenant =
            getCurrentTenant();


        // =================================================
        // NATIONAL ID DUPLICATE CHECK
        // =================================================

        if (
            patient.getNationalId() != null &&
            !patient.getNationalId().isBlank()
        ) {

            if (
                patientRepository
                    .existsByNationalIdAndTenant_Id(
                        patient.getNationalId(),
                        tenantId
                    )
            ) {

                throw new IllegalArgumentException(
                    "A patient with National ID "
                    + patient.getNationalId()
                    + " already exists in this organization."
                );
            }
        }


        // =================================================
        // GENERATE ID IF NOT PROVIDED
        // =================================================

        if (
            patient.getId() == null ||
            patient.getId().isBlank()
        ) {

            patient.setId(
                generatePatientId()
            );
        }


        // =================================================
        // DEFAULT STATUS
        // =================================================

        if (
            patient.getStatus() == null ||
            patient.getStatus().isBlank()
        ) {

            patient.setStatus(
                "Active"
            );
        }


        // =================================================
        // FORCE CURRENT TENANT
        // =================================================
        //
        // IMPORTANT:
        // We deliberately ignore any tenant supplied
        // by the frontend.
        //
        // The tenant is determined from the signed JWT.
        // =================================================

        patient.setTenant(
            currentTenant
        );


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

        if (patient == null) {

            throw new IllegalArgumentException(
                "Patient data is required."
            );
        }


        // =================================================
        // LOAD PATIENT ONLY FROM CURRENT TENANT
        // =================================================

        Patient existingPatient =
            getPatientById(id);

        Long tenantId =
            getCurrentTenantId();


        // =================================================
        // NATIONAL ID DUPLICATE CHECK
        // =================================================

        if (
            patient.getNationalId() != null &&
            !patient.getNationalId().isBlank()
        ) {

            if (
                patientRepository
                    .existsByNationalIdAndTenant_IdAndIdNot(
                        patient.getNationalId(),
                        tenantId,
                        id
                    )
            ) {

                throw new IllegalArgumentException(
                    "Another patient with National ID "
                    + patient.getNationalId()
                    + " already exists in this organization."
                );
            }
        }


        // =================================================
        // COPY PATIENT DATA
        // =================================================

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


        // =================================================
        // IMPORTANT
        // =================================================
        //
        // We deliberately do NOT copy:
        //
        // patient.getTenant()
        //
        // The tenant of an existing patient must never
        // be changed through a normal patient update.
        // =================================================


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
                    .substring(
                        0,
                        8
                    )
                    .toUpperCase();

        } while (
            patientRepository.existsById(id)
        );

        return id;
    }
}