package com.hms.backend.service.impl;

import com.hms.backend.dto.BillingItemRequest;
import com.hms.backend.entity.Billing;
import com.hms.backend.entity.Consultation;
import com.hms.backend.entity.Doctor;
import com.hms.backend.entity.LaboratoryRequest;
import com.hms.backend.entity.LaboratoryTest;
import com.hms.backend.entity.Patient;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.repository.ConsultationRepository;
import com.hms.backend.repository.DoctorRepository;
import com.hms.backend.repository.LaboratoryRequestRepository;
import com.hms.backend.repository.LaboratoryTestRepository;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.service.BillingService;
import com.hms.backend.service.LaboratoryRequestService;
import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.repository.TenantRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LaboratoryRequestServiceImpl
        implements LaboratoryRequestService {

    private final LaboratoryRequestRepository laboratoryRequestRepository;
    private final LaboratoryTestRepository laboratoryTestRepository;
    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final TenantRepository tenantRepository;
    private final BillingService billingService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public LaboratoryRequestServiceImpl(
            LaboratoryRequestRepository laboratoryRequestRepository,
            LaboratoryTestRepository laboratoryTestRepository,
            ConsultationRepository consultationRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            TenantRepository tenantRepository,
            BillingService billingService
    ) {

        this.laboratoryRequestRepository =
                laboratoryRequestRepository;

        this.laboratoryTestRepository =
                laboratoryTestRepository;

        this.consultationRepository =
                consultationRepository;

        this.patientRepository =
                patientRepository;

        this.doctorRepository =
                doctorRepository;

        this.tenantRepository =
                tenantRepository;

        this.billingService =
                billingService;
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
    // GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<LaboratoryRequest> getAllRequests() {

        Long tenantId =
                TenantContext.requireTenantId();

        return laboratoryRequestRepository
                .findAllByTenant_Id(tenantId);
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Optional<LaboratoryRequest> getRequestById(
            Long id
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        return laboratoryRequestRepository
                .findByIdAndTenant_Id(
                        id,
                        tenantId
                );
    }

    // =====================================================
    // CREATE REQUEST
    // =====================================================

    @Override
    public LaboratoryRequest createRequest(
            LaboratoryRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Laboratory request cannot be null."
            );
        }

        Long tenantId =
                TenantContext.requireTenantId();

        Tenant currentTenant =
                getCurrentTenant();

        // -------------------------------------------------
        // PATIENT
        // -------------------------------------------------

        if (
                request.getPatientId() == null ||
                request.getPatientId().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );
        }

        Patient patient =
                patientRepository
                        .findByIdAndTenant_Id(
                                request.getPatientId().trim(),
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
        // LAB TEST
        // -------------------------------------------------

        if (request.getTestId() == null) {

            throw new IllegalArgumentException(
                    "Laboratory test ID is required."
            );
        }

        LaboratoryTest test =
                laboratoryTestRepository
                        .findByIdAndTenant_Id(
                                request.getTestId(),
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Laboratory test not found: "
                                                + request.getTestId()
                                )
                        );

        // -------------------------------------------------
        // DOCTOR
        // -------------------------------------------------

        Doctor doctor = null;

        String doctorId =
                clean(request.getDoctorId());

        if (doctorId != null) {

            doctor =
                    doctorRepository
                            .findByIdAndTenant_Id(
                                    doctorId,
                                    tenantId
                            )
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Doctor not found: "
                                                    + doctorId
                                    )
                            );
        }

        // -------------------------------------------------
        // CONSULTATION
        // -------------------------------------------------

        String consultationId =
                clean(request.getConsultationId());

        Consultation consultation = null;

        if (consultationId != null) {

            consultation =
                    consultationRepository
                            .findByIdAndTenant_Id(
                                    consultationId,
                                    tenantId
                            )
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Consultation not found: "
                                                    + consultationId
                                    )
                            );

            if (
                    consultation.getStatus() ==
                            Consultation.ConsultationStatus.COMPLETED
            ) {

                throw new IllegalStateException(
                        "Laboratory requests cannot be added to a completed consultation."
                );
            }

            if (
                    consultation.getStatus() ==
                            Consultation.ConsultationStatus.CANCELLED
            ) {

                throw new IllegalStateException(
                        "Laboratory requests cannot be added to a cancelled consultation."
                );
            }

            // ---------------------------------------------
            // CONSULTATION/PATIENT MATCH
            // ---------------------------------------------

            if (!consultation.getPatientId()
                    .equals(patient.getId())) {

                throw new IllegalArgumentException(
                        "Consultation does not belong to the selected patient."
                );
            }

            // ---------------------------------------------
            // CONSULTATION/DOCTOR MATCH
            // ---------------------------------------------

            if (
                    doctor != null &&
                    !consultation.getDoctorId()
                            .equals(doctor.getId())
            ) {

                throw new IllegalArgumentException(
                        "Consultation does not belong to the selected doctor."
                );
            }
        }

        // -------------------------------------------------
        // TEST PRICE MUST COME FROM DB
        // -------------------------------------------------

        BigDecimal price =
                test.getPrice();

        if (
                price == null ||
                price.compareTo(BigDecimal.ZERO) <= 0
        ) {

            throw new IllegalStateException(
                    "Laboratory test price must be greater than zero."
            );
        }

        // -------------------------------------------------
        // BUILD REQUEST
        // -------------------------------------------------

        request.setTenant(
                currentTenant
        );

        request.setPatientId(
                patient.getId()
        );

        request.setPatientName(
                buildPatientName(patient)
        );

        request.setConsultationId(
                consultationId
        );

        request.setDoctorId(
                doctor == null
                        ? null
                        : doctor.getId()
        );

        request.setDoctorName(
                doctor == null
                        ? null
                        : buildDoctorName(doctor)
        );

        request.setTestId(
                test.getId()
        );

        request.setTestName(
                test.getTestName()
        );

        request.setCategory(
                test.getCategory()
        );

        request.setSampleType(
                test.getSampleType()
        );

        request.setPrice(
                price
        );

        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        if (
                request.getStatus() == null ||
                request.getStatus().isBlank()
        ) {

            request.setStatus(
                    "Pending"
            );

        } else {

            request.setStatus(
                    normalizeStatus(
                            request.getStatus()
                    )
            );
        }

        // -------------------------------------------------
        // REQUESTED AT
        // -------------------------------------------------

        if (request.getRequestedAt() == null) {

            request.setRequestedAt(
                    LocalDateTime.now()
            );
        }

        // =================================================
        // SAVE
        // =================================================

        LaboratoryRequest savedRequest =
                laboratoryRequestRepository.save(
                        request
                );

        // =================================================
        // ADD LABORATORY CHARGE
        // =================================================
        //
        // Billing itself is still awaiting tenant
        // conversion. Keep this call for now so existing
        // billing workflow is not broken.
        //
        // =================================================

        addLaboratoryCharge(
                savedRequest
        );

        // =================================================
        // SYNCHRONIZE CONSULTATION
        // =================================================

        synchronizeConsultation(
                savedRequest.getConsultationId()
        );

        return savedRequest;
    }

    // =====================================================
    // ADD LABORATORY CHARGE
    // =====================================================

    private Billing addLaboratoryCharge(
            LaboratoryRequest request
    ) {

        BillingItemRequest billingItem =
                new BillingItemRequest();

        billingItem.setBillingType(
                "Laboratory"
        );

        billingItem.setDescription(
                "Laboratory test - "
                        + request.getTestName()
        );

        billingItem.setQuantity(1);

        billingItem.setUnitPrice(
                request.getPrice()
        );

        billingItem.setReferenceId(
                String.valueOf(
                        request.getId()
                )
        );

        return billingService
                .addChargeToPatientBill(
                        request.getPatientId(),
                        billingItem,
                        request.getPatientName(),
                        null,
                        request.getDoctorId(),
                        request.getDoctorName(),
                        null,
                        null
                );
    }

    // =====================================================
    // UPDATE REQUEST
    // =====================================================

    @Override
    public LaboratoryRequest updateRequest(
            Long id,
            LaboratoryRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Laboratory request cannot be null."
            );
        }

        Long tenantId =
                TenantContext.requireTenantId();

        LaboratoryRequest existingRequest =
                laboratoryRequestRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Laboratory request not found: "
                                                + id
                                )
                        );

        if (
                "Completed".equalsIgnoreCase(
                        existingRequest.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "Completed laboratory requests cannot be modified."
            );
        }

        if (
                "Cancelled".equalsIgnoreCase(
                        existingRequest.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "Cancelled laboratory requests cannot be modified."
            );
        }

        // -------------------------------------------------
        // PATIENT
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
        // TEST
        // -------------------------------------------------

        LaboratoryTest test =
                laboratoryTestRepository
                        .findByIdAndTenant_Id(
                                request.getTestId(),
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Laboratory test not found: "
                                                + request.getTestId()
                                )
                        );

        // -------------------------------------------------
        // DOCTOR
        // -------------------------------------------------

        Doctor doctor = null;

        String doctorId =
                clean(request.getDoctorId());

        if (doctorId != null) {

            doctor =
                    doctorRepository
                            .findByIdAndTenant_Id(
                                    doctorId,
                                    tenantId
                            )
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Doctor not found: "
                                                    + doctorId
                                    )
                            );
        }

        // -------------------------------------------------
        // CONSULTATION
        // -------------------------------------------------

        String consultationId =
                clean(request.getConsultationId());

        if (consultationId != null) {

            Consultation consultation =
                    consultationRepository
                            .findByIdAndTenant_Id(
                                    consultationId,
                                    tenantId
                            )
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Consultation not found: "
                                                    + consultationId
                                    )
                            );

            if (!consultation.getPatientId()
                    .equals(patient.getId())) {

                throw new IllegalArgumentException(
                        "Consultation does not belong to the selected patient."
                );
            }

            if (
                    doctor != null &&
                    !consultation.getDoctorId()
                            .equals(doctor.getId())
            ) {

                throw new IllegalArgumentException(
                        "Consultation does not belong to the selected doctor."
                );
            }

            if (
                    consultation.getStatus() ==
                            Consultation.ConsultationStatus.COMPLETED
            ) {

                throw new IllegalStateException(
                        "Laboratory requests cannot be added to a completed consultation."
                );
            }

            if (
                    consultation.getStatus() ==
                            Consultation.ConsultationStatus.CANCELLED
            ) {

                throw new IllegalStateException(
                        "Laboratory requests cannot be added to a cancelled consultation."
                );
            }
        }

        existingRequest.setPatientId(
                patient.getId()
        );

        existingRequest.setPatientName(
                buildPatientName(patient)
        );

        existingRequest.setConsultationId(
                consultationId
        );

        existingRequest.setDoctorId(
                doctor == null
                        ? null
                        : doctor.getId()
        );

        existingRequest.setDoctorName(
                doctor == null
                        ? null
                        : buildDoctorName(doctor)
        );

        existingRequest.setTestId(
                test.getId()
        );

        existingRequest.setTestName(
                test.getTestName()
        );

        existingRequest.setCategory(
                test.getCategory()
        );

        existingRequest.setSampleType(
                test.getSampleType()
        );

        existingRequest.setPrice(
                test.getPrice()
        );

        String newStatus =
                request.getStatus();

        if (
                newStatus == null ||
                newStatus.isBlank()
        ) {

            newStatus =
                    existingRequest.getStatus();

        } else {

            newStatus =
                    normalizeStatus(
                            newStatus
                    );
        }

        existingRequest.setStatus(
                newStatus
        );

        existingRequest.setResult(
                request.getResult()
        );

        existingRequest.setNotes(
                request.getNotes()
        );

        if (
                request.getRequestedAt() != null
        ) {

            existingRequest.setRequestedAt(
                    request.getRequestedAt()
            );
        }

        // =================================================
        // COMPLETION
        // =================================================

        if (
                "Completed".equalsIgnoreCase(
                        newStatus
                )
        ) {

            if (
                    isBlank(
                            existingRequest.getResult()
                    )
            ) {

                throw new IllegalStateException(
                        "Laboratory result is required before completing the request."
                );
            }

            if (
                    existingRequest.getCompletedAt() == null
            ) {

                existingRequest.setCompletedAt(
                        LocalDateTime.now()
                );
            }

        } else {

            existingRequest.setCompletedAt(
                    null
            );
        }

        LaboratoryRequest savedRequest =
                laboratoryRequestRepository.save(
                        existingRequest
                );

        synchronizeConsultation(
                savedRequest.getConsultationId()
        );

        return savedRequest;
    }

    // =====================================================
    // UPDATE REQUEST STATUS
    // =====================================================

    @Override
    public LaboratoryRequest updateRequestStatus(
            Long id,
            String status
    ) {

        if (
                status == null ||
                status.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Laboratory request status is required."
            );
        }

        Long tenantId =
                TenantContext.requireTenantId();

        LaboratoryRequest request =
                laboratoryRequestRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Laboratory request not found: "
                                                + id
                                )
                        );

        String currentStatus =
                request.getStatus();

        String normalizedStatus =
                normalizeStatus(status);

        if (
                "Completed".equalsIgnoreCase(
                        currentStatus
                )
        ) {

            if (
                    !"Completed".equalsIgnoreCase(
                            normalizedStatus
                    )
            ) {

                throw new IllegalStateException(
                        "Completed laboratory requests cannot be reopened."
                );
            }

            return request;
        }

        if (
                "Cancelled".equalsIgnoreCase(
                        currentStatus
                )
        ) {

            if (
                    !"Cancelled".equalsIgnoreCase(
                            normalizedStatus
                    )
            ) {

                throw new IllegalStateException(
                        "Cancelled laboratory requests cannot be reopened."
                );
            }

            return request;
        }

        if (
                "Completed".equalsIgnoreCase(
                        normalizedStatus
                )
        ) {

            if (
                    isBlank(
                            request.getResult()
                    )
            ) {

                throw new IllegalStateException(
                        "Laboratory result is required before completing the request."
                );
            }

            request.setCompletedAt(
                    LocalDateTime.now()
            );

        } else {

            request.setCompletedAt(
                    null
            );
        }

        request.setStatus(
                normalizedStatus
        );

        LaboratoryRequest savedRequest =
                laboratoryRequestRepository.save(
                        request
                );

        synchronizeConsultation(
                savedRequest.getConsultationId()
        );

        return savedRequest;
    }

    // =====================================================
    // COMPLETE REQUEST
    // =====================================================

    @Override
    public LaboratoryRequest completeRequest(
            Long id
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        LaboratoryRequest request =
                laboratoryRequestRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Laboratory request not found: "
                                                + id
                                )
                        );

        if (
                "Completed".equalsIgnoreCase(
                        request.getStatus()
                )
        ) {

            return request;
        }

        if (
                "Cancelled".equalsIgnoreCase(
                        request.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "Cancelled laboratory requests cannot be completed."
            );
        }

        if (
                isBlank(
                        request.getResult()
                )
        ) {

            throw new IllegalStateException(
                    "Laboratory result is required before completing the request."
            );
        }

        request.setStatus(
                "Completed"
        );

        request.setCompletedAt(
                LocalDateTime.now()
        );

        LaboratoryRequest savedRequest =
                laboratoryRequestRepository.save(
                        request
                );

        synchronizeConsultation(
                savedRequest.getConsultationId()
        );

        return savedRequest;
    }

    // =====================================================
    // DELETE REQUEST
    // =====================================================

    @Override
    public void deleteRequest(
            Long id
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        LaboratoryRequest request =
                laboratoryRequestRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Laboratory request not found: "
                                                + id
                                )
                        );

        if (
                "Completed".equalsIgnoreCase(
                        request.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "Completed laboratory requests cannot be deleted."
            );
        }

        String consultationId =
                request.getConsultationId();

        laboratoryRequestRepository.delete(
                request
        );

        synchronizeConsultation(
                consultationId
        );
    }

    // =====================================================
    // GET BY PATIENT
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<LaboratoryRequest> getRequestsByPatient(
            String patientId
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        return laboratoryRequestRepository
                .findByTenant_IdAndPatientId(
                        tenantId,
                        patientId
                );
    }

    // =====================================================
    // GET BY CONSULTATION
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<LaboratoryRequest>
    getRequestsByConsultation(
            String consultationId
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        return laboratoryRequestRepository
                .findByTenant_IdAndConsultationId(
                        tenantId,
                        consultationId
                );
    }

    // =====================================================
    // GET BY STATUS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<LaboratoryRequest> getRequestsByStatus(
            String status
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        return laboratoryRequestRepository
                .findByTenant_IdAndStatus(
                        tenantId,
                        normalizeStatus(status)
                );
    }

    // =====================================================
    // COMPLETED BY PATIENT
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<LaboratoryRequest>
    getCompletedRequestsByPatient(
            String patientId
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        return laboratoryRequestRepository
                .findByTenant_IdAndPatientIdAndStatus(
                        tenantId,
                        patientId,
                        "Completed"
                );
    }

    // =====================================================
    // COMPLETED BY CONSULTATION
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<LaboratoryRequest>
    getCompletedRequestsByConsultation(
            String consultationId
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        return laboratoryRequestRepository
                .findByTenant_IdAndConsultationIdAndStatus(
                        tenantId,
                        consultationId,
                        "Completed"
                );
    }

    // =====================================================
    // SYNCHRONIZE CONSULTATION
    // =====================================================

    private void synchronizeConsultation(
            String consultationId
    ) {

        if (
                consultationId == null ||
                consultationId.isBlank()
        ) {

            return;
        }

        Long tenantId =
                TenantContext.requireTenantId();

        String cleanConsultationId =
                consultationId.trim();

        Consultation consultation =
                consultationRepository
                        .findByIdAndTenant_Id(
                                cleanConsultationId,
                                tenantId
                        )
                        .orElse(null);

        if (consultation == null) {
            return;
        }

        List<LaboratoryRequest> requests =
                laboratoryRequestRepository
                        .findByTenant_IdAndConsultationId(
                                tenantId,
                                cleanConsultationId
                        );

        if (requests.isEmpty()) {

            consultation.setHasLaboratoryRequests(
                    false
            );

            consultation.setHasLaboratoryResults(
                    false
            );

            consultation.setLaboratoryResultsReviewed(
                    false
            );

            if (
                    consultation.getStatus() !=
                            Consultation.ConsultationStatus.COMPLETED
                    &&
                    consultation.getStatus() !=
                            Consultation.ConsultationStatus.CANCELLED
            ) {

                consultation.setStatus(
                        Consultation.ConsultationStatus.OPEN
                );
            }

            consultationRepository.save(
                    consultation
            );

            return;
        }

        consultation.setHasLaboratoryRequests(
                true
        );

        boolean allCompleted =
                requests.stream()
                        .allMatch(
                                request ->
                                        "Completed"
                                                .equalsIgnoreCase(
                                                        request.getStatus()
                                                )
                        );

        boolean anyCompleted =
                requests.stream()
                        .anyMatch(
                                request ->
                                        "Completed"
                                                .equalsIgnoreCase(
                                                        request.getStatus()
                                                )
                        );

        if (!allCompleted) {

            consultation.setHasLaboratoryResults(
                    anyCompleted
            );

            consultation.setLaboratoryResultsReviewed(
                    false
            );

            if (
                    consultation.getStatus() !=
                            Consultation.ConsultationStatus.COMPLETED
                    &&
                    consultation.getStatus() !=
                            Consultation.ConsultationStatus.CANCELLED
            ) {

                consultation.setStatus(
                        Consultation.ConsultationStatus.PENDING_RESULTS
                );
            }

        } else {

            consultation.setHasLaboratoryResults(
                    true
            );

            consultation.setLaboratoryResultsReviewed(
                    false
            );

            if (
                    consultation.getStatus() !=
                            Consultation.ConsultationStatus.COMPLETED
                    &&
                    consultation.getStatus() !=
                            Consultation.ConsultationStatus.CANCELLED
            ) {

                consultation.setStatus(
                        Consultation.ConsultationStatus.READY_FOR_REVIEW
                );
            }
        }

        consultationRepository.save(
                consultation
        );
    }

    // =====================================================
    // NORMALIZE STATUS
    // =====================================================

    private String normalizeStatus(
            String status
    ) {

        if (
                status == null
        ) {

            throw new IllegalArgumentException(
                    "Laboratory request status is required."
            );
        }

        String cleaned =
                status.trim();

        if (
                "pending".equalsIgnoreCase(
                        cleaned
                )
        ) {
            return "Pending";
        }

        if (
                "in progress".equalsIgnoreCase(
                        cleaned
                )
                ||
                "processing".equalsIgnoreCase(
                        cleaned
                )
        ) {
            return "In Progress";
        }

        if (
                "completed".equalsIgnoreCase(
                        cleaned
                )
        ) {
            return "Completed";
        }

        if (
                "cancelled".equalsIgnoreCase(
                        cleaned
                )
        ) {
            return "Cancelled";
        }

        throw new IllegalArgumentException(
                "Invalid laboratory request status: "
                        + status
        );
    }

    // =====================================================
    // BUILD PATIENT NAME
    // =====================================================

    private String buildPatientName(
            Patient patient
    ) {

        String firstName =
                patient.getFirstName() == null
                        ? ""
                        : patient.getFirstName().trim();

        String lastName =
                patient.getLastName() == null
                        ? ""
                        : patient.getLastName().trim();

        return (
                firstName
                        + " "
                        + lastName
        ).trim();
    }

    // =====================================================
    // BUILD DOCTOR NAME
    // =====================================================

    private String buildDoctorName(
            Doctor doctor
    ) {

        String firstName =
                doctor.getFirstName() == null
                        ? ""
                        : doctor.getFirstName().trim();

        String lastName =
                doctor.getLastName() == null
                        ? ""
                        : doctor.getLastName().trim();

        return (
                firstName
                        + " "
                        + lastName
        ).trim();
    }

    // =====================================================
    // CLEAN
    // =====================================================

    private String clean(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String cleaned =
                value.trim();

        return cleaned.isEmpty()
                ? null
                : cleaned;
    }

    // =====================================================
    // BLANK
    // =====================================================

    private boolean isBlank(
            String value
    ) {

        return value == null ||
                value.trim().isEmpty();
    }
}