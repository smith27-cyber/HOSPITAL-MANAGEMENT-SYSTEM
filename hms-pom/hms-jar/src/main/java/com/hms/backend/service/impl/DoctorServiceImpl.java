package com.hms.backend.service.impl;

import com.hms.backend.entity.Doctor;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.repository.DoctorRepository;
import com.hms.backend.tenant.repository.TenantRepository;
import com.hms.backend.service.DoctorService;
import com.hms.backend.tenant.context.TenantContext;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final TenantRepository tenantRepository;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public DoctorServiceImpl(
            DoctorRepository doctorRepository,
            TenantRepository tenantRepository) {

        this.doctorRepository = doctorRepository;
        this.tenantRepository = tenantRepository;
    }

    // =====================================================
    // GET CURRENT TENANT
    // =====================================================

    private Tenant getCurrentTenant() {

        Long tenantId = TenantContext.requireTenantId();

        return tenantRepository.findById(tenantId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Current tenant not found: " + tenantId
                        )
                );
    }

    // =====================================================
    // GET ALL DOCTORS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> getAllDoctors() {

        Long tenantId = TenantContext.requireTenantId();

        return doctorRepository.findAllByTenant_Id(tenantId);
    }

    // =====================================================
    // GET DOCTOR BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Doctor getDoctorById(String id) {

        Long tenantId = TenantContext.requireTenantId();

        return doctorRepository
                .findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Doctor not found: " + id
                        )
                );
    }

    // =====================================================
    // ADD DOCTOR
    // =====================================================

    @Override
    public Doctor addDoctor(Doctor doctor) {

        // -------------------------------------------------
        // GET CURRENT TENANT
        // -------------------------------------------------

        Tenant currentTenant = getCurrentTenant();

        Long tenantId = currentTenant.getId();

        // -------------------------------------------------
        // FORCE TENANT FROM SERVER
        // -------------------------------------------------

        doctor.setTenant(currentTenant);

        // -------------------------------------------------
        // NORMALIZE INPUT
        // -------------------------------------------------

        normalizeDoctor(doctor);

        // -------------------------------------------------
        // VALIDATE REQUIRED FIELDS
        // -------------------------------------------------

        validateRequiredFields(doctor);

        // -------------------------------------------------
        // CHECK EMAIL
        // -------------------------------------------------

        if (doctorRepository.existsByEmailAndTenant_Id(
                doctor.getEmail(),
                tenantId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Doctor with email already exists: "
                            + doctor.getEmail()
            );
        }

        // -------------------------------------------------
        // CHECK NATIONAL ID
        // -------------------------------------------------

        if (doctor.getNationalId() != null &&
                doctorRepository.existsByNationalIdAndTenant_Id(
                        doctor.getNationalId(),
                        tenantId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Doctor with national ID already exists: "
                            + doctor.getNationalId()
            );
        }

        // -------------------------------------------------
        // CHECK LICENSE NUMBER
        // -------------------------------------------------

        if (doctorRepository.existsByLicenseNumberAndTenant_Id(
                doctor.getLicenseNumber(),
                tenantId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Doctor with license number already exists: "
                            + doctor.getLicenseNumber()
            );
        }

        // -------------------------------------------------
        // GENERATE DOCTOR ID
        //
        // Example:
        //
        // DOC-2026-0001
        // DOC-2026-0002
        // DOC-2026-0003
        // -------------------------------------------------

        doctor.setId(generateDoctorId());

        // -------------------------------------------------
        // DEFAULT STATUS
        // -------------------------------------------------

        doctor.setStatus("Active");

        // -------------------------------------------------
        // CREATED DATE
        // -------------------------------------------------

        doctor.setCreatedAt(LocalDateTime.now());

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return doctorRepository.save(doctor);
    }

    // =====================================================
    // UPDATE DOCTOR
    // =====================================================

    @Override
    public Doctor updateDoctor(
            String id,
            Doctor updatedDoctor) {

        Long tenantId = TenantContext.requireTenantId();

        // -------------------------------------------------
        // FIND EXISTING DOCTOR IN CURRENT TENANT ONLY
        // -------------------------------------------------

        Doctor existingDoctor = doctorRepository
                .findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Doctor not found: " + id
                        )
                );

        // -------------------------------------------------
        // NORMALIZE INPUT
        // -------------------------------------------------

        normalizeDoctor(updatedDoctor);

        // -------------------------------------------------
        // VALIDATE
        // -------------------------------------------------

        validateRequiredFields(updatedDoctor);

        // -------------------------------------------------
        // CHECK EMAIL
        // -------------------------------------------------

        if (doctorRepository.existsByEmailAndTenant_IdAndIdNot(
                updatedDoctor.getEmail(),
                tenantId,
                id)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Another doctor already uses email: "
                            + updatedDoctor.getEmail()
            );
        }

        // -------------------------------------------------
        // CHECK NATIONAL ID
        // -------------------------------------------------

        if (updatedDoctor.getNationalId() != null &&
                doctorRepository.existsByNationalIdAndTenant_IdAndIdNot(
                        updatedDoctor.getNationalId(),
                        tenantId,
                        id)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Another doctor already uses national ID: "
                            + updatedDoctor.getNationalId()
            );
        }

        // -------------------------------------------------
        // CHECK LICENSE NUMBER
        // -------------------------------------------------

        if (doctorRepository.existsByLicenseNumberAndTenant_IdAndIdNot(
                updatedDoctor.getLicenseNumber(),
                tenantId,
                id)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Another doctor already uses license number: "
                            + updatedDoctor.getLicenseNumber()
            );
        }

        // -------------------------------------------------
        // UPDATE PERSONAL INFORMATION
        // -------------------------------------------------

        existingDoctor.setFirstName(
                updatedDoctor.getFirstName());

        existingDoctor.setLastName(
                updatedDoctor.getLastName());

        existingDoctor.setGender(
                updatedDoctor.getGender());

        existingDoctor.setDateOfBirth(
                updatedDoctor.getDateOfBirth());

        existingDoctor.setPhone(
                updatedDoctor.getPhone());

        existingDoctor.setEmail(
                updatedDoctor.getEmail());

        existingDoctor.setNationalId(
                updatedDoctor.getNationalId());

        // -------------------------------------------------
        // UPDATE PROFESSIONAL INFORMATION
        // -------------------------------------------------

        existingDoctor.setSpecialization(
                updatedDoctor.getSpecialization());

        existingDoctor.setDepartment(
                updatedDoctor.getDepartment());

        existingDoctor.setLicenseNumber(
                updatedDoctor.getLicenseNumber());

        // -------------------------------------------------
        // UPDATE CONSULTATION FEE
        // -------------------------------------------------

        existingDoctor.setConsultationFee(
                updatedDoctor.getConsultationFee());

        // -------------------------------------------------
        // IMPORTANT:
        // DO NOT CHANGE existingDoctor.tenant
        // -------------------------------------------------

        return doctorRepository.save(existingDoctor);
    }

    // =====================================================
    // DELETE DOCTOR
    // =====================================================

    @Override
    public void deleteDoctor(String id) {

        Doctor doctor = getDoctorById(id);

        doctorRepository.delete(doctor);
    }

    // =====================================================
    // UPDATE DOCTOR STATUS
    // =====================================================

    @Override
    public Doctor updateDoctorStatus(
            String id,
            String status) {

        // -------------------------------------------------
        // VALIDATE STATUS
        // -------------------------------------------------

        if (status == null ||
                (!status.equals("Active") &&
                        !status.equals("Inactive"))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid doctor status. "
                            + "Allowed values: Active, Inactive."
            );
        }

        // -------------------------------------------------
        // FIND DOCTOR IN CURRENT TENANT
        // -------------------------------------------------

        Doctor doctor = getDoctorById(id);

        // -------------------------------------------------
        // UPDATE STATUS
        // -------------------------------------------------

        doctor.setStatus(status);

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return doctorRepository.save(doctor);
    }

    // =====================================================
    // NORMALIZE DOCTOR
    // =====================================================

    private void normalizeDoctor(Doctor doctor) {

        if (doctor.getFirstName() != null) {
            doctor.setFirstName(
                    doctor.getFirstName().trim());
        }

        if (doctor.getLastName() != null) {
            doctor.setLastName(
                    doctor.getLastName().trim());
        }

        if (doctor.getGender() != null) {
            doctor.setGender(
                    doctor.getGender().trim());
        }

        if (doctor.getPhone() != null) {
            doctor.setPhone(
                    doctor.getPhone().trim());
        }

        if (doctor.getEmail() != null) {
            doctor.setEmail(
                    doctor.getEmail()
                            .trim()
                            .toLowerCase());
        }

        if (doctor.getNationalId() != null) {

            String nationalId =
                    doctor.getNationalId().trim();

            doctor.setNationalId(
                    nationalId.isEmpty()
                            ? null
                            : nationalId);
        }

        if (doctor.getSpecialization() != null) {
            doctor.setSpecialization(
                    doctor.getSpecialization().trim());
        }

        if (doctor.getDepartment() != null) {
            doctor.setDepartment(
                    doctor.getDepartment().trim());
        }

        if (doctor.getLicenseNumber() != null) {
            doctor.setLicenseNumber(
                    doctor.getLicenseNumber()
                            .trim()
                            .toUpperCase());
        }
    }

    // =====================================================
    // VALIDATE REQUIRED FIELDS
    // =====================================================

    private void validateRequiredFields(
            Doctor doctor) {

        if (isBlank(doctor.getFirstName())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor first name is required."
            );
        }

        if (isBlank(doctor.getLastName())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor last name is required."
            );
        }

        if (isBlank(doctor.getGender())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor gender is required."
            );
        }

        if (doctor.getDateOfBirth() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor date of birth is required."
            );
        }

        if (isBlank(doctor.getPhone())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor phone number is required."
            );
        }

        if (isBlank(doctor.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor email is required."
            );
        }

        if (isBlank(doctor.getSpecialization())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor specialization is required."
            );
        }

        if (isBlank(doctor.getDepartment())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor department is required."
            );
        }

        if (isBlank(doctor.getLicenseNumber())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor license number is required."
            );
        }

        // -------------------------------------------------
        // GENDER VALIDATION
        // -------------------------------------------------

        if (!doctor.getGender().equals("Male") &&
                !doctor.getGender().equals("Female") &&
                !doctor.getGender().equals("Other")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid gender. "
                            + "Allowed values: Male, Female, Other."
            );
        }
    }

    // =====================================================
    // CHECK BLANK
    // =====================================================

    private boolean isBlank(String value) {

        return value == null ||
                value.trim().isEmpty();
    }

    // =====================================================
    // GENERATE DOCTOR ID
    // =====================================================

    private String generateDoctorId() {

        int currentYear =
                LocalDate.now().getYear();

        int nextSequence = 1;

        var lastIdOpt =
                doctorRepository.findMaxIdForCurrentYear();

        if (lastIdOpt.isPresent()) {

            String lastId =
                    lastIdOpt.get();

            try {

                String[] parts =
                        lastId.split("-");

                if (parts.length == 3) {

                    nextSequence =
                            Integer.parseInt(parts[2]) + 1;
                }

            } catch (NumberFormatException ignored) {
                // Start from 0001
            }
        }

        return String.format(
                "DOC-%d-%04d",
                currentYear,
                nextSequence);
    }
}