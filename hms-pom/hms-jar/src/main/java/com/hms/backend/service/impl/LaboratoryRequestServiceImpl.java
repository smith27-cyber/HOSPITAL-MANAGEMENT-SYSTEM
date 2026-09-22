
package com.hms.backend.service.impl;

import com.hms.backend.dto.BillingItemRequest;
import com.hms.backend.entity.Billing;
import com.hms.backend.entity.Consultation;
import com.hms.backend.entity.LaboratoryRequest;
import com.hms.backend.repository.ConsultationRepository;
import com.hms.backend.repository.LaboratoryRequestRepository;
import com.hms.backend.service.BillingService;
import com.hms.backend.service.LaboratoryRequestService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LaboratoryRequestServiceImpl
        implements LaboratoryRequestService {

    private final LaboratoryRequestRepository laboratoryRequestRepository;

    private final ConsultationRepository consultationRepository;

    private final BillingService billingService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public LaboratoryRequestServiceImpl(
            LaboratoryRequestRepository laboratoryRequestRepository,
            ConsultationRepository consultationRepository,
            BillingService billingService
    ) {

        this.laboratoryRequestRepository =
                laboratoryRequestRepository;

        this.consultationRepository =
                consultationRepository;

        this.billingService =
                billingService;
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<LaboratoryRequest> getAllRequests() {

        return laboratoryRequestRepository.findAll();
    }


    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Optional<LaboratoryRequest> getRequestById(
            Long id) {

        return laboratoryRequestRepository.findById(id);
    }


    // =====================================================
    // CREATE REQUEST
    // =====================================================

    @Override
    public LaboratoryRequest createRequest(
            LaboratoryRequest request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Laboratory request cannot be null."
            );
        }


        if (
                request.getPatientId() == null ||
                request.getPatientId().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );
        }


        if (
                request.getPatientName() == null ||
                request.getPatientName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient name is required."
            );
        }


        if (
                request.getTestId() == null
        ) {

            throw new IllegalArgumentException(
                    "Laboratory test ID is required."
            );
        }


        if (
                request.getTestName() == null ||
                request.getTestName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Laboratory test name is required."
            );
        }


        if (
                request.getPrice() == null ||
                request.getPrice()
                        .compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Laboratory test price must be greater than zero."
            );
        }


        // -------------------------------------------------
        // DEFAULT STATUS
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
        // REQUESTED DATE
        // -------------------------------------------------

        if (
                request.getRequestedAt() == null
        ) {

            request.setRequestedAt(
                    LocalDateTime.now()
            );
        }


        // -------------------------------------------------
        // CONSULTATION VALIDATION
        // -------------------------------------------------

        String consultationId =
                clean(
                        request.getConsultationId()
                );


        request.setConsultationId(
                consultationId
        );


        if (consultationId != null) {

            Consultation consultation =
                    consultationRepository
                            .findById(
                                    consultationId
                            )
                            .orElseThrow(
                                    () ->
                                            new IllegalArgumentException(
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
        }


        // -------------------------------------------------
        // SAVE REQUEST
        // -------------------------------------------------

        LaboratoryRequest savedRequest =
                laboratoryRequestRepository.save(
                        request
                );


        // =================================================
        // ADD LABORATORY CHARGE
        // =================================================

        Billing bill =
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
                "Laboratory test - " +
                        request.getTestName()
        );


        billingItem.setQuantity(
                1
        );


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
            LaboratoryRequest request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Laboratory request cannot be null."
            );
        }


        LaboratoryRequest existingRequest =
                laboratoryRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Laboratory request not found with id: "
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


        existingRequest.setPatientId(
                clean(
                        request.getPatientId()
                )
        );


        existingRequest.setPatientName(
                clean(
                        request.getPatientName()
                )
        );


        existingRequest.setConsultationId(
                clean(
                        request.getConsultationId()
                )
        );


        existingRequest.setDoctorId(
                clean(
                        request.getDoctorId()
                )
        );


        existingRequest.setDoctorName(
                clean(
                        request.getDoctorName()
                )
        );


        existingRequest.setTestId(
                request.getTestId()
        );


        existingRequest.setTestName(
                clean(
                        request.getTestName()
                )
        );


        existingRequest.setCategory(
                clean(
                        request.getCategory()
                )
        );


        existingRequest.setSampleType(
                clean(
                        request.getSampleType()
                )
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


        existingRequest.setPrice(
                request.getPrice()
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
                    existingRequest.getResult() == null ||
                    existingRequest
                            .getResult()
                            .trim()
                            .isEmpty()
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
            String status) {

        if (
                status == null ||
                status.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Laboratory request status is required."
            );
        }


        LaboratoryRequest request =
                laboratoryRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Laboratory request not found with id: "
                                                + id
                                )
                        );


        String currentStatus =
                request.getStatus();


        String normalizedStatus =
                normalizeStatus(
                        status
                );


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
                    request.getResult() == null ||
                    request.getResult()
                            .trim()
                            .isEmpty()
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
            Long id) {

        LaboratoryRequest request =
                laboratoryRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Laboratory request not found with id: "
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
                request.getResult() == null ||
                request.getResult()
                        .trim()
                        .isEmpty()
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
            Long id) {

        LaboratoryRequest request =
                laboratoryRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Laboratory request not found with id: "
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
            String patientId) {

        return laboratoryRequestRepository
                .findByPatientId(
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
            String consultationId) {

        return laboratoryRequestRepository
                .findByConsultationId(
                        consultationId
                );
    }


    // =====================================================
    // GET BY STATUS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<LaboratoryRequest> getRequestsByStatus(
            String status) {

        return laboratoryRequestRepository
                .findByStatus(
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
            String patientId) {

        return laboratoryRequestRepository
                .findByPatientIdAndStatus(
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
            String consultationId) {

        return laboratoryRequestRepository
                .findByConsultationIdAndStatus(
                        consultationId,
                        "Completed"
                );
    }


    // =====================================================
    // SYNCHRONIZE CONSULTATION
    // =====================================================

    private void synchronizeConsultation(
            String consultationId) {

        if (
                consultationId == null ||
                consultationId.isBlank()
        ) {

            return;
        }


        String cleanConsultationId =
                consultationId.trim();


        Consultation consultation =
                consultationRepository
                        .findById(
                                cleanConsultationId
                        )
                        .orElse(null);


        if (
                consultation == null
        ) {

            return;
        }


        List<LaboratoryRequest> requests =
                laboratoryRequestRepository
                        .findByConsultationId(
                                cleanConsultationId
                        );


        if (
                requests.isEmpty()
        ) {

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


        if (
                !allCompleted
        ) {

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
            String status) {

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
    // CLEAN
    // =====================================================

    private String clean(
            String value) {

        if (
                value == null
        ) {

            return null;
        }


        String cleaned =
                value.trim();


        return cleaned.isEmpty()
                ? null
                : cleaned;
    }
}

