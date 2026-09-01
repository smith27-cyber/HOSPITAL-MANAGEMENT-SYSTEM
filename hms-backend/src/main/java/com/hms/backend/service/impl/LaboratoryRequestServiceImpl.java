
package com.hms.backend.service.impl;

import com.hms.backend.entity.Consultation;
import com.hms.backend.entity.LaboratoryRequest;
import com.hms.backend.repository.ConsultationRepository;
import com.hms.backend.repository.LaboratoryRequestRepository;
import com.hms.backend.service.LaboratoryRequestService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LaboratoryRequestServiceImpl
        implements LaboratoryRequestService {

    private final LaboratoryRequestRepository laboratoryRequestRepository;

    private final ConsultationRepository consultationRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public LaboratoryRequestServiceImpl(
            LaboratoryRequestRepository laboratoryRequestRepository,
            ConsultationRepository consultationRepository) {

        this.laboratoryRequestRepository =
                laboratoryRequestRepository;

        this.consultationRepository =
                consultationRepository;
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


        // -------------------------------------------------
        // DEFAULT STATUS
        // -------------------------------------------------

        if (request.getStatus() == null ||
                request.getStatus().isBlank()) {

            request.setStatus("Pending");

        } else {

            request.setStatus(
                    normalizeStatus(request.getStatus())
            );
        }


        // -------------------------------------------------
        // REQUESTED DATE
        // -------------------------------------------------

        if (request.getRequestedAt() == null) {

            request.setRequestedAt(
                    LocalDateTime.now()
            );
        }


        // -------------------------------------------------
        // SAVE REQUEST
        // -------------------------------------------------

        LaboratoryRequest savedRequest =
                laboratoryRequestRepository.save(
                        request
                );


        // -------------------------------------------------
        // SYNCHRONIZE CONSULTATION
        // -------------------------------------------------

        synchronizeConsultation(
                savedRequest.getConsultationId()
        );


        return savedRequest;
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


        // -------------------------------------------------
        // PROTECT COMPLETED
        // -------------------------------------------------

        if ("Completed".equalsIgnoreCase(
                existingRequest.getStatus())) {

            throw new IllegalStateException(
                    "Completed laboratory requests cannot be modified."
            );
        }


        // -------------------------------------------------
        // PROTECT CANCELLED
        // -------------------------------------------------

        if ("Cancelled".equalsIgnoreCase(
                existingRequest.getStatus())) {

            throw new IllegalStateException(
                    "Cancelled laboratory requests cannot be modified."
            );
        }


        // =================================================
        // UPDATE BASIC FIELDS
        // =================================================

        existingRequest.setPatientId(
                request.getPatientId()
        );

        existingRequest.setPatientName(
                request.getPatientName()
        );

        existingRequest.setConsultationId(
                request.getConsultationId()
        );

        existingRequest.setDoctorId(
                request.getDoctorId()
        );

        existingRequest.setDoctorName(
                request.getDoctorName()
        );

        existingRequest.setTestId(
                request.getTestId()
        );

        existingRequest.setTestName(
                request.getTestName()
        );

        existingRequest.setCategory(
                request.getCategory()
        );

        existingRequest.setSampleType(
                request.getSampleType()
        );


        // =================================================
        // STATUS
        // =================================================

        String newStatus =
                request.getStatus();


        if (newStatus == null ||
                newStatus.isBlank()) {

            newStatus =
                    existingRequest.getStatus();

        } else {

            newStatus =
                    normalizeStatus(newStatus);

        }


        existingRequest.setStatus(
                newStatus
        );


        // =================================================
        // RESULT
        // =================================================

        existingRequest.setResult(
                request.getResult()
        );


        // =================================================
        // NOTES
        // =================================================

        existingRequest.setNotes(
                request.getNotes()
        );


        // =================================================
        // PRICE
        // =================================================

        existingRequest.setPrice(
                request.getPrice()
        );


        // =================================================
        // REQUESTED AT
        // =================================================

        if (request.getRequestedAt() != null) {

            existingRequest.setRequestedAt(
                    request.getRequestedAt()
            );
        }


        // =================================================
        // COMPLETION
        // =================================================

        if ("Completed".equalsIgnoreCase(
                newStatus)) {

            if (existingRequest.getResult() == null ||
                    existingRequest.getResult()
                            .trim()
                            .isEmpty()) {

                throw new IllegalStateException(
                        "Laboratory result is required before completing the request."
                );
            }


            if (existingRequest.getCompletedAt() == null) {

                existingRequest.setCompletedAt(
                        LocalDateTime.now()
                );
            }

        } else {

            // Do not accidentally erase completion time
            // for requests that are still being processed.
            if (!"Completed".equalsIgnoreCase(
                    existingRequest.getStatus())) {

                existingRequest.setCompletedAt(
                        null
                );
            }
        }


        // =================================================
        // SAVE
        // =================================================

        LaboratoryRequest savedRequest =
                laboratoryRequestRepository.save(
                        existingRequest
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
    // UPDATE REQUEST STATUS
    // =====================================================
    //
    // IMPORTANT:
    //
    // Returns LaboratoryRequest rather than boolean.
    //
    // Frontend can therefore receive the updated request
    // directly and refresh its UI correctly.
    //
    // =====================================================

    @Override
    public LaboratoryRequest updateRequestStatus(
            Long id,
            String status) {

        if (status == null ||
                status.isBlank()) {

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
                normalizeStatus(status);


        // =================================================
        // COMPLETED REQUEST
        // =================================================

        if ("Completed".equalsIgnoreCase(
                currentStatus)) {

            if (!"Completed".equalsIgnoreCase(
                    normalizedStatus)) {

                throw new IllegalStateException(
                        "Completed laboratory requests cannot be reopened."
                );
            }

            return request;
        }


        // =================================================
        // CANCELLED REQUEST
        // =================================================

        if ("Cancelled".equalsIgnoreCase(
                currentStatus)) {

            if (!"Cancelled".equalsIgnoreCase(
                    normalizedStatus)) {

                throw new IllegalStateException(
                        "Cancelled laboratory requests cannot be reopened."
                );
            }

            return request;
        }


        // =================================================
        // COMPLETE REQUEST
        // =================================================

        if ("Completed".equalsIgnoreCase(
                normalizedStatus)) {

            if (request.getResult() == null ||
                    request.getResult()
                            .trim()
                            .isEmpty()) {

                throw new IllegalStateException(
                        "Laboratory result is required before completing the request."
                );
            }


            request.setCompletedAt(
                    LocalDateTime.now()
            );
        }


        // =================================================
        // NON-COMPLETED STATUS
        // =================================================

        else {

            request.setCompletedAt(
                    null
            );
        }


        // =================================================
        // SET STATUS
        // =================================================

        request.setStatus(
                normalizedStatus
        );


        // =================================================
        // SAVE
        // =================================================

        LaboratoryRequest savedRequest =
                laboratoryRequestRepository.save(
                        request
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
    // COMPLETE REQUEST
    // =====================================================
    //
    // Explicit operation used by the laboratory details
    // screen.
    //
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


        // -------------------------------------------------
        // ALREADY COMPLETED
        // -------------------------------------------------

        if ("Completed".equalsIgnoreCase(
                request.getStatus())) {

            return request;
        }


        // -------------------------------------------------
        // CANCELLED
        // -------------------------------------------------

        if ("Cancelled".equalsIgnoreCase(
                request.getStatus())) {

            throw new IllegalStateException(
                    "Cancelled laboratory requests cannot be completed."
            );
        }


        // -------------------------------------------------
        // RESULT REQUIRED
        // -------------------------------------------------

        if (request.getResult() == null ||
                request.getResult()
                        .trim()
                        .isEmpty()) {

            throw new IllegalStateException(
                    "Laboratory result is required before completing the request."
            );
        }


        // -------------------------------------------------
        // COMPLETE
        // -------------------------------------------------

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


        // -------------------------------------------------
        // UPDATE CONSULTATION WORKFLOW
        // -------------------------------------------------

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


        // -------------------------------------------------
        // PROTECT COMPLETED
        // -------------------------------------------------

        if ("Completed".equalsIgnoreCase(
                request.getStatus())) {

            throw new IllegalStateException(
                    "Completed laboratory requests cannot be deleted."
            );
        }


        String consultationId =
                request.getConsultationId();


        laboratoryRequestRepository.delete(
                request
        );


        // -------------------------------------------------
        // UPDATE CONSULTATION AFTER DELETE
        // -------------------------------------------------

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
                .findByPatientId(patientId);
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
                .findByConsultationId(consultationId);
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
    //
    // LAB WORKFLOW:
    //
    // Request created
    //      ↓
    // PENDING_RESULTS
    //
    // Some requests completed
    //      ↓
    // PENDING_RESULTS
    //
    // ALL requests completed
    //      ↓
    // READY_FOR_REVIEW
    //
    // Doctor reviews results
    //      ↓
    // OPEN
    //
    // Doctor completes consultation
    //      ↓
    // COMPLETED
    //
    // =====================================================

    private void synchronizeConsultation(
            String consultationId) {

        if (consultationId == null ||
                consultationId.isBlank()) {

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


        if (consultation == null) {

            return;
        }


        List<LaboratoryRequest> requests =
                laboratoryRequestRepository
                        .findByConsultationId(
                                cleanConsultationId
                        );


        // =================================================
        // NO LABORATORY REQUESTS
        // =================================================

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


            // Never overwrite final states.
            if (consultation.getStatus() !=
                    Consultation.ConsultationStatus.COMPLETED &&
                consultation.getStatus() !=
                    Consultation.ConsultationStatus.CANCELLED) {

                consultation.setStatus(
                        Consultation.ConsultationStatus.OPEN
                );
            }


            consultationRepository.save(
                    consultation
            );

            return;
        }


        // =================================================
        // REQUESTS EXIST
        // =================================================

        consultation.setHasLaboratoryRequests(
                true
        );


        // =================================================
        // RESULT STATE
        // =================================================

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


        // =================================================
        // PENDING RESULTS
        // =================================================

        if (!allCompleted) {

            consultation.setHasLaboratoryResults(
                    anyCompleted
            );

            consultation.setLaboratoryResultsReviewed(
                    false
            );


            if (consultation.getStatus() !=
                    Consultation.ConsultationStatus.COMPLETED &&
                consultation.getStatus() !=
                    Consultation.ConsultationStatus.CANCELLED) {

                consultation.setStatus(
                        Consultation.ConsultationStatus.PENDING_RESULTS
                );
            }

        }


        // =================================================
        // READY FOR REVIEW
        // =================================================

        else {

            consultation.setHasLaboratoryResults(
                    true
            );

            consultation.setLaboratoryResultsReviewed(
                    false
            );


            if (consultation.getStatus() !=
                    Consultation.ConsultationStatus.COMPLETED &&
                consultation.getStatus() !=
                    Consultation.ConsultationStatus.CANCELLED) {

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
    //
    // IMPORTANT:
    //
    // Frontend vocabulary is:
    //
    // Pending
    // In Progress
    // Completed
    // Cancelled
    //
    // We deliberately do NOT use "Processing".
    //
    // =====================================================

  // =====================================================
// NORMALIZE STATUS
// =====================================================

private String normalizeStatus(
        String status) {

    if (status == null) {

        throw new IllegalArgumentException(
                "Laboratory request status is required."
        );
    }


    String cleaned =
            status.trim();


    // -------------------------------------------------
    // PENDING
    // -------------------------------------------------

    if ("pending".equalsIgnoreCase(cleaned)) {

        return "Pending";
    }


    // -------------------------------------------------
    // IN PROGRESS
    // -------------------------------------------------

    if (
            "in progress".equalsIgnoreCase(cleaned) ||
            "processing".equalsIgnoreCase(cleaned)
    ) {

        return "In Progress";
    }


    // -------------------------------------------------
    // COMPLETED
    // -------------------------------------------------

    if ("completed".equalsIgnoreCase(cleaned)) {

        return "Completed";
    }


    // -------------------------------------------------
    // CANCELLED
    // -------------------------------------------------

    if ("cancelled".equalsIgnoreCase(cleaned)) {

        return "Cancelled";
    }


    throw new IllegalArgumentException(
            "Invalid laboratory request status: "
                    + status
    );
}}