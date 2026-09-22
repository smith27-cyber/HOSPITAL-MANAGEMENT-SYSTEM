package com.hms.backend.service.impl;

import com.hms.backend.dto.AppointmentRequest;
import com.hms.backend.dto.AppointmentResponse;
import com.hms.backend.entity.Appointment;
import com.hms.backend.entity.Department;
import com.hms.backend.entity.Doctor;
import com.hms.backend.entity.Patient;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.repository.AppointmentRepository;
import com.hms.backend.repository.DepartmentRepository;
import com.hms.backend.repository.DoctorRepository;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.service.AppointmentService;
import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.repository.TenantRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentServiceImpl
        implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final TenantRepository tenantRepository;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AppointmentServiceImpl(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            DepartmentRepository departmentRepository,
            TenantRepository tenantRepository
    ) {

        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.tenantRepository = tenantRepository;
    }

    // =====================================================
    // CURRENT TENANT
    // =====================================================

    private Tenant getCurrentTenant() {

        Long tenantId =
                TenantContext.requireTenantId();

        return tenantRepository
                .findById(tenantId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Current tenant not found: "
                                        + tenantId
                        )
                );
    }

    // =====================================================
    // CREATE APPOINTMENT
    // =====================================================

    @Override
    public AppointmentResponse createAppointment(
            AppointmentRequest request
    ) {

        validateAppointmentRequest(request);

        Tenant currentTenant =
                getCurrentTenant();

        Long tenantId =
                currentTenant.getId();

        // -------------------------------------------------
        // VERIFY PATIENT BELONGS TO CURRENT TENANT
        // -------------------------------------------------

        Patient patient =
                patientRepository
                        .findByIdAndTenant_Id(
                                request.getPatientId(),
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Patient not found: "
                                                + request.getPatientId()
                                )
                        );

        // -------------------------------------------------
        // VERIFY DOCTOR BELONGS TO CURRENT TENANT
        // -------------------------------------------------

        Doctor doctor =
                doctorRepository
                        .findByIdAndTenant_Id(
                                request.getDoctorId(),
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Doctor not found: "
                                                + request.getDoctorId()
                                )
                        );

        // -------------------------------------------------
        // VERIFY DEPARTMENT BELONGS TO CURRENT TENANT
        // -------------------------------------------------

        Department department =
                departmentRepository
                        .findByNameAndTenant_Id(
                                request.getDepartment(),
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Department not found: "
                                                + request.getDepartment()
                                )
                        );

        // -------------------------------------------------
        // CREATE ENTITY
        // -------------------------------------------------

        Appointment appointment =
                new Appointment();

        // -------------------------------------------------
        // FORCE TENANT
        // -------------------------------------------------

        appointment.setTenant(
                currentTenant
        );

        // -------------------------------------------------
        // GENERATE ID
        // -------------------------------------------------

        String appointmentId =
                request.getId();

        if (
                appointmentId == null ||
                appointmentId.isBlank()
        ) {

            appointmentId =
                    generateAppointmentId();
        }

        appointment.setId(
                appointmentId
        );

        // -------------------------------------------------
        // SET PATIENT FROM DATABASE
        // -------------------------------------------------

        appointment.setPatientId(
                patient.getId()
        );

        appointment.setPatientName(
                patient.getFirstName()
                        + " "
                        + patient.getLastName()
        );

        // -------------------------------------------------
        // SET DOCTOR FROM DATABASE
        // -------------------------------------------------

        appointment.setDoctorId(
                doctor.getId()
        );

        appointment.setDoctorName(
                doctor.getFirstName()
                        + " "
                        + doctor.getLastName()
        );

        // -------------------------------------------------
        // SET DEPARTMENT FROM DATABASE
        // -------------------------------------------------

        appointment.setDepartment(
                department.getName()
        );

        // -------------------------------------------------
        // OTHER FIELDS
        // -------------------------------------------------

        appointment.setAppointmentDate(
                request.getAppointmentDate()
        );

        appointment.setAppointmentTime(
                request.getAppointmentTime()
        );

        appointment.setType(
                request.getType()
        );

        appointment.setReason(
                request.getReason()
        );

        appointment.setNotes(
                request.getNotes()
        );

        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        if (
                request.getStatus() == null ||
                request.getStatus().isBlank()
        ) {

            appointment.setStatus(
                    "Scheduled"
            );

        } else {

            appointment.setStatus(
                    request.getStatus()
            );
        }

        // -------------------------------------------------
        // CREATED AT
        // -------------------------------------------------

        appointment.setCreatedAt(
                LocalDateTime.now()
        );

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        Appointment savedAppointment =
                appointmentRepository.save(
                        appointment
                );

        return mapToResponse(
                savedAppointment
        );
    }

    // =====================================================
    // GET ALL APPOINTMENTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {

        Long tenantId =
                TenantContext.requireTenantId();

        return appointmentRepository
                .findAllByTenant_Id(tenantId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =====================================================
    // GET APPOINTMENT BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Optional<AppointmentResponse> getAppointmentById(
            String id
    ) {

        if (
                id == null ||
                id.isBlank()
        ) {

            return Optional.empty();
        }

        Long tenantId =
                TenantContext.requireTenantId();

        return appointmentRepository
                .findByIdAndTenant_Id(
                        id,
                        tenantId
                )
                .map(this::mapToResponse);
    }

    // =====================================================
    // UPDATE APPOINTMENT
    // =====================================================

    @Override
    public AppointmentResponse updateAppointment(
            String id,
            AppointmentRequest request
    ) {

        if (
                id == null ||
                id.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment ID is required"
            );
        }

        validateAppointmentRequest(request);

        Long tenantId =
                TenantContext.requireTenantId();

        Appointment existingAppointment =
                appointmentRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Appointment not found: "
                                                + id
                                )
                        );

        // -------------------------------------------------
        // VERIFY PATIENT
        // -------------------------------------------------

        Patient patient =
                patientRepository
                        .findByIdAndTenant_Id(
                                request.getPatientId(),
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Patient not found: "
                                                + request.getPatientId()
                                )
                        );

        // -------------------------------------------------
        // VERIFY DOCTOR
        // -------------------------------------------------

        Doctor doctor =
                doctorRepository
                        .findByIdAndTenant_Id(
                                request.getDoctorId(),
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Doctor not found: "
                                                + request.getDoctorId()
                                )
                        );

        // -------------------------------------------------
        // VERIFY DEPARTMENT
        // -------------------------------------------------

        Department department =
                departmentRepository
                        .findByNameAndTenant_Id(
                                request.getDepartment(),
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Department not found: "
                                                + request.getDepartment()
                                )
                        );

        // -------------------------------------------------
        // UPDATE TENANT-OWNED DATA
        // -------------------------------------------------

        existingAppointment.setPatientId(
                patient.getId()
        );

        existingAppointment.setPatientName(
                patient.getFirstName()
                        + " "
                        + patient.getLastName()
        );

        existingAppointment.setDoctorId(
                doctor.getId()
        );

        existingAppointment.setDoctorName(
                doctor.getFirstName()
                        + " "
                        + doctor.getLastName()
        );

        existingAppointment.setDepartment(
                department.getName()
        );

        existingAppointment.setAppointmentDate(
                request.getAppointmentDate()
        );

        existingAppointment.setAppointmentTime(
                request.getAppointmentTime()
        );

        existingAppointment.setType(
                request.getType()
        );

        existingAppointment.setReason(
                request.getReason()
        );

        existingAppointment.setNotes(
                request.getNotes()
        );

        // -------------------------------------------------
        // PRESERVE / UPDATE STATUS
        // -------------------------------------------------

        if (
                request.getStatus() != null &&
                !request.getStatus().isBlank()
        ) {

            existingAppointment.setStatus(
                    request.getStatus()
            );
        }

        // -------------------------------------------------
        // DO NOT CHANGE TENANT
        // -------------------------------------------------

        Appointment updatedAppointment =
                appointmentRepository.save(
                        existingAppointment
                );

        return mapToResponse(
                updatedAppointment
        );
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    @Override
    public AppointmentResponse updateStatus(
            String id,
            String status
    ) {

        if (
                id == null ||
                id.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment ID is required"
            );
        }

        if (
                status == null ||
                status.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment status is required"
            );
        }

        Long tenantId =
                TenantContext.requireTenantId();

        Appointment appointment =
                appointmentRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Appointment not found: "
                                                + id
                                )
                        );

        appointment.setStatus(
                status
        );

        Appointment updatedAppointment =
                appointmentRepository.save(
                        appointment
                );

        return mapToResponse(
                updatedAppointment
        );
    }

    // =====================================================
    // CANCEL APPOINTMENT
    // =====================================================

    @Override
    public AppointmentResponse cancelAppointment(
            String id
    ) {

        if (
                id == null ||
                id.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment ID is required"
            );
        }

        Long tenantId =
                TenantContext.requireTenantId();

        Appointment appointment =
                appointmentRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Appointment not found: "
                                                + id
                                )
                        );

        if (
                "Completed".equals(
                        appointment.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "Completed appointments cannot be cancelled"
            );
        }

        appointment.setStatus(
                "Cancelled"
        );

        Appointment cancelledAppointment =
                appointmentRepository.save(
                        appointment
                );

        return mapToResponse(
                cancelledAppointment
        );
    }

    // =====================================================
    // DELETE APPOINTMENT
    // =====================================================

    @Override
    public void deleteAppointment(
            String id
    ) {

        if (
                id == null ||
                id.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment ID is required"
            );
        }

        Long tenantId =
                TenantContext.requireTenantId();

        Appointment appointment =
                appointmentRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Appointment not found: "
                                                + id
                                )
                        );

        appointmentRepository.delete(
                appointment
        );
    }

    // =====================================================
    // VALIDATE REQUEST
    // =====================================================

    private void validateAppointmentRequest(
            AppointmentRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Appointment request cannot be null"
            );
        }

        if (
                request.getPatientId() == null ||
                request.getPatientId().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient ID is required"
            );
        }

        if (
                request.getDoctorId() == null ||
                request.getDoctorId().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Doctor ID is required"
            );
        }

        if (
                request.getDepartment() == null ||
                request.getDepartment().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Department is required"
            );
        }

        if (
                request.getAppointmentDate() == null
        ) {

            throw new IllegalArgumentException(
                    "Appointment date is required"
            );
        }

        if (
                request.getAppointmentTime() == null
        ) {

            throw new IllegalArgumentException(
                    "Appointment time is required"
            );
        }

        if (
                request.getType() == null ||
                request.getType().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Appointment type is required"
            );
        }

        if (
                request.getReason() == null ||
                request.getReason().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Reason for appointment is required"
            );
        }
    }

    // =====================================================
    // MAP ENTITY TO RESPONSE
    // =====================================================

    private AppointmentResponse mapToResponse(
            Appointment appointment
    ) {

        AppointmentResponse response =
                new AppointmentResponse();

        response.setId(
                appointment.getId()
        );

        response.setPatientId(
                appointment.getPatientId()
        );

        response.setPatientName(
                appointment.getPatientName()
        );

        response.setDoctorId(
                appointment.getDoctorId()
        );

        response.setDoctorName(
                appointment.getDoctorName()
        );

        response.setDepartment(
                appointment.getDepartment()
        );

        response.setAppointmentDate(
                appointment.getAppointmentDate()
        );

        response.setAppointmentTime(
                appointment.getAppointmentTime()
        );

        response.setType(
                appointment.getType()
        );

        response.setReason(
                appointment.getReason()
        );

        response.setStatus(
                appointment.getStatus()
        );

        response.setNotes(
                appointment.getNotes()
        );

        response.setCreatedAt(
                appointment.getCreatedAt()
        );

        return response;
    }

    // =====================================================
    // GENERATE APPOINTMENT ID
    // =====================================================

    private String generateAppointmentId() {

        String timestamp =
                String.valueOf(
                        System.currentTimeMillis()
                );

        String suffix =
                timestamp.substring(
                        Math.max(
                                0,
                                timestamp.length() - 6
                        )
                );

        return "APT-" + suffix;
    }
}