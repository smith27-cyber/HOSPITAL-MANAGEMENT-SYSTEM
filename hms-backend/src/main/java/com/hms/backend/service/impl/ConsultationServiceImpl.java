package com.hms.backend.service.impl;

import com.hms.backend.dto.ConsultationRequest;
import com.hms.backend.dto.ConsultationResponse;
import com.hms.backend.entity.Consultation;
import com.hms.backend.repository.ConsultationRepository;
import com.hms.backend.service.BillingService;
import com.hms.backend.service.ConsultationService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConsultationServiceImpl
        implements ConsultationService {


    private final ConsultationRepository consultationRepository;

    private final BillingService billingService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ConsultationServiceImpl(
            ConsultationRepository consultationRepository,
            BillingService billingService
    ) {

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
    public List<ConsultationResponse> getAllConsultations() {

        return consultationRepository
                .findAll()
                .stream()
                .map(ConsultationResponse::new)
                .collect(Collectors.toList());
    }


    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ConsultationResponse getConsultationById(
            String id
    ) {

        Consultation consultation =
                findConsultation(id);

        return new ConsultationResponse(
                consultation
        );
    }


    // =====================================================
    // GET BY PATIENT
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ConsultationResponse> getConsultationsByPatient(
            String patientId
    ) {

        if (isBlank(patientId)) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );
        }

        return consultationRepository
                .findByPatientId(
                        patientId.trim()
                )
                .stream()
                .map(ConsultationResponse::new)
                .collect(Collectors.toList());
    }


    // =====================================================
    // GET BY DOCTOR
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ConsultationResponse> getConsultationsByDoctor(
            String doctorId
    ) {

        if (isBlank(doctorId)) {

            throw new IllegalArgumentException(
                    "Doctor ID is required."
            );
        }

        return consultationRepository
                .findByDoctorId(
                        doctorId.trim()
                )
                .stream()
                .map(ConsultationResponse::new)
                .collect(Collectors.toList());
    }


    // =====================================================
    // GET BY APPOINTMENT
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ConsultationResponse getConsultationByAppointment(
            String appointmentId
    ) {

        if (isBlank(appointmentId)) {

            return null;
        }

        return consultationRepository
                .findByAppointmentId(
                        appointmentId.trim()
                )
                .map(ConsultationResponse::new)
                .orElse(null);
    }


    // =====================================================
    // GET BY APPOINTMENT OR NULL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ConsultationResponse getConsultationByAppointmentOrNull(
            String appointmentId
    ) {

        return getConsultationByAppointment(
                appointmentId
        );
    }


    // =====================================================
    // CREATE CONSULTATION
    // =====================================================

    @Override
    public ConsultationResponse createConsultation(
            ConsultationRequest request
    ) {

        validateRequest(request);


        String appointmentId =
                clean(
                        request.getAppointmentId()
                );


        // -------------------------------------------------
        // PREVENT DUPLICATE CONSULTATION
        // -------------------------------------------------

        if (
                appointmentId != null &&
                consultationRepository
                        .existsByAppointmentId(
                                appointmentId
                        )
        ) {

            throw new IllegalArgumentException(
                    "A consultation already exists for appointment: "
                            + appointmentId
            );
        }


        String patientName =
                clean(
                        request.getPatientName()
                );


        if (patientName == null) {

            throw new IllegalArgumentException(
                    "Patient name is required."
            );
        }


        Consultation consultation =
                new Consultation();


        // -------------------------------------------------
        // GENERATE ID
        // -------------------------------------------------

        consultation.setId(
                generateConsultationId()
        );


        // -------------------------------------------------
        // PATIENT
        // -------------------------------------------------

        consultation.setPatientId(
                request.getPatientId().trim()
        );


        /*
         * patientName is @Transient in the current
         * Consultation entity.
         *
         * It is useful for the response/UI but is NOT
         * persisted in the consultations table.
         */
        consultation.setPatientName(
                patientName
        );


        // -------------------------------------------------
        // DOCTOR
        // -------------------------------------------------

        consultation.setDoctorId(
                request.getDoctorId().trim()
        );


        // -------------------------------------------------
        // APPOINTMENT
        // -------------------------------------------------

        consultation.setAppointmentId(
                appointmentId
        );


        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        consultation.setConsultationDate(
                parseRequiredDate(
                        request.getConsultationDate()
                )
        );


        // -------------------------------------------------
        // TIME
        // -------------------------------------------------

        consultation.setConsultationTime(
                parseRequiredTime(
                        request.getConsultationTime()
                )
        );


        // -------------------------------------------------
        // CLINICAL INFORMATION
        // -------------------------------------------------

        consultation.setChiefComplaint(
                request.getChiefComplaint().trim()
        );


        consultation.setSymptoms(
                clean(
                        request.getSymptoms()
                )
        );


        consultation.setDiagnosis(
                clean(
                        request.getDiagnosis()
                )
        );


        consultation.setClinicalNotes(
                clean(
                        request.getClinicalNotes()
                )
        );


        consultation.setTreatmentPlan(
                clean(
                        request.getTreatmentPlan()
                )
        );


        consultation.setFollowUpDate(
                parseOptionalDate(
                        request.getFollowUpDate()
                )
        );


        // =================================================
        // INITIAL WORKFLOW STATE
        // =================================================

        consultation.setStatus(
                Consultation.ConsultationStatus.OPEN
        );


        consultation.setHasLaboratoryRequests(
                false
        );


        consultation.setHasLaboratoryResults(
                false
        );


        consultation.setLaboratoryResultsReviewed(
                false
        );


        consultation.setHasPrescription(
                false
        );


        consultation.setHasBilling(
                false
        );


        // =================================================
        // SAVE CONSULTATION FIRST
        // =================================================

        Consultation saved =
                consultationRepository.save(
                        consultation
                );


        // =================================================
        // CREATE / SYNC CONSULTATION INVOICE
        // =================================================
        //
        // IMPORTANT:
        //
        // This creates the invoice belonging specifically
        // to this consultation.
        //
        // It does NOT complete the consultation.
        //
        // =================================================

        try {

            billingService
                    .syncConsultationInvoice(
                            saved.getId()
                    );


            saved.setHasBilling(
                    true
            );


            saved =
                    consultationRepository.save(
                            saved
                    );

        } catch (Exception error) {

            /*
             * The consultation itself has already been saved.
             *
             * We deliberately do not mark the consultation
             * as completed.
             *
             * Re-throwing allows the transaction to roll back
             * if billing synchronization fails.
             */

            throw error;
        }


        return new ConsultationResponse(
                saved
        );
    }


    // =====================================================
    // UPDATE CONSULTATION
    // =====================================================

    @Override
    public ConsultationResponse updateConsultation(
            String id,
            ConsultationRequest request
    ) {

        validateRequest(request);


        Consultation consultation =
                findConsultation(id);


        // -------------------------------------------------
        // COMPLETED PROTECTION
        // -------------------------------------------------

        if (
                consultation.getStatus() ==
                        Consultation.ConsultationStatus.COMPLETED
        ) {

            throw new IllegalStateException(
                    "Completed consultations cannot be modified."
            );
        }


        // -------------------------------------------------
        // CANCELLED PROTECTION
        // -------------------------------------------------

        if (
                consultation.getStatus() ==
                        Consultation.ConsultationStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "Cancelled consultations cannot be modified. "
                            + "Reopen the consultation first."
            );
        }


        // -------------------------------------------------
        // PATIENT
        // -------------------------------------------------

        consultation.setPatientId(
                request.getPatientId().trim()
        );


        String patientName =
                clean(
                        request.getPatientName()
                );


        if (patientName != null) {

            consultation.setPatientName(
                    patientName
            );
        }


        // -------------------------------------------------
        // DOCTOR
        // -------------------------------------------------

        consultation.setDoctorId(
                request.getDoctorId().trim()
        );


        // -------------------------------------------------
        // APPOINTMENT
        // -------------------------------------------------

        String appointmentId =
                clean(
                        request.getAppointmentId()
                );


        if (
                appointmentId != null &&
                !appointmentId.equals(
                        consultation.getAppointmentId()
                ) &&
                consultationRepository
                        .existsByAppointmentId(
                                appointmentId
                        )
        ) {

            throw new IllegalArgumentException(
                    "A consultation already exists for appointment: "
                            + appointmentId
            );
        }


        consultation.setAppointmentId(
                appointmentId
        );


        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        consultation.setConsultationDate(
                parseRequiredDate(
                        request.getConsultationDate()
                )
        );


        // -------------------------------------------------
        // TIME
        // -------------------------------------------------

        consultation.setConsultationTime(
                parseRequiredTime(
                        request.getConsultationTime()
                )
        );


        // -------------------------------------------------
        // CLINICAL INFORMATION
        // -------------------------------------------------

        consultation.setChiefComplaint(
                request.getChiefComplaint().trim()
        );


        consultation.setSymptoms(
                clean(
                        request.getSymptoms()
                )
        );


        consultation.setDiagnosis(
                clean(
                        request.getDiagnosis()
                )
        );


        consultation.setClinicalNotes(
                clean(
                        request.getClinicalNotes()
                )
        );


        consultation.setTreatmentPlan(
                clean(
                        request.getTreatmentPlan()
                )
        );


        consultation.setFollowUpDate(
                parseOptionalDate(
                        request.getFollowUpDate()
                )
        );


        // -------------------------------------------------
        // SAVE PROGRESS
        // -------------------------------------------------
        //
        // IMPORTANT:
        //
        // Updating the consultation does NOT complete it.
        //
        // -------------------------------------------------

        Consultation saved =
                consultationRepository.save(
                        consultation
                );


        // -------------------------------------------------
        // KEEP BILLING LINK SYNCHRONIZED
        // -------------------------------------------------

        try {

            billingService
                    .syncConsultationInvoice(
                            saved.getId()
                    );


            if (!saved.isHasBilling()) {

                saved.setHasBilling(
                        true
                );

                saved =
                        consultationRepository.save(
                                saved
                        );
            }

        } catch (Exception error) {

            /*
             * Do not silently ignore billing failures.
             */
            throw error;
        }


        return new ConsultationResponse(
                saved
        );
    }


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    @Override
    public ConsultationResponse updateStatus(
            String id,
            String status
    ) {

        Consultation consultation =
                findConsultation(id);


        if (isBlank(status)) {

            throw new IllegalArgumentException(
                    "Consultation status is required."
            );
        }


        Consultation.ConsultationStatus newStatus;


        try {

            newStatus =
                    Consultation.ConsultationStatus
                            .valueOf(
                                    status
                                            .trim()
                                            .toUpperCase()
                            );

        } catch (IllegalArgumentException error) {

            throw new IllegalArgumentException(
                    "Invalid consultation status: "
                            + status
            );
        }


        // -------------------------------------------------
        // COMPLETED MUST USE DEDICATED ENDPOINT
        // -------------------------------------------------

        if (
                newStatus ==
                        Consultation.ConsultationStatus.COMPLETED
        ) {

            throw new IllegalStateException(
                    "A consultation cannot be completed through the status endpoint. "
                            + "Use Complete Consultation."
            );
        }


        // -------------------------------------------------
        // LABORATORY WORKFLOW STATUSES
        // -------------------------------------------------

        if (
                newStatus ==
                        Consultation.ConsultationStatus.PENDING_RESULTS
                ||
                newStatus ==
                        Consultation.ConsultationStatus.READY_FOR_REVIEW
        ) {

            throw new IllegalStateException(
                    "Laboratory workflow statuses are controlled by the laboratory module."
            );
        }


        // -------------------------------------------------
        // COMPLETED PROTECTION
        // -------------------------------------------------

        if (
                consultation.getStatus() ==
                        Consultation.ConsultationStatus.COMPLETED
        ) {

            throw new IllegalStateException(
                    "Completed consultations cannot be reopened."
            );
        }


        // -------------------------------------------------
        // CANCELLED
        // -------------------------------------------------

        if (
                consultation.getStatus() ==
                        Consultation.ConsultationStatus.CANCELLED
                &&
                newStatus !=
                        Consultation.ConsultationStatus.OPEN
        ) {

            throw new IllegalStateException(
                    "A cancelled consultation can only be reopened to OPEN."
            );
        }


        // -------------------------------------------------
        // PENDING RESULTS
        // -------------------------------------------------

        if (
                consultation.getStatus() ==
                        Consultation.ConsultationStatus.PENDING_RESULTS
                &&
                newStatus ==
                        Consultation.ConsultationStatus.OPEN
        ) {

            throw new IllegalStateException(
                    "The consultation is waiting for laboratory results."
            );
        }


        // -------------------------------------------------
        // READY FOR REVIEW
        // -------------------------------------------------

        if (
                consultation.getStatus() ==
                        Consultation.ConsultationStatus.READY_FOR_REVIEW
                &&
                newStatus ==
                        Consultation.ConsultationStatus.OPEN
        ) {

            throw new IllegalStateException(
                    "Use Review Laboratory Results before returning the consultation to OPEN."
            );
        }


        consultation.setStatus(
                newStatus
        );


        Consultation saved =
                consultationRepository.save(
                        consultation
                );


        return new ConsultationResponse(
                saved
        );
    }


    // =====================================================
    // REVIEW LABORATORY RESULTS
    // =====================================================

    @Override
    public ConsultationResponse reviewLaboratoryResults(
            String id
    ) {

        Consultation consultation =
                findConsultation(id);


        // -------------------------------------------------
        // COMPLETED
        // -------------------------------------------------

        if (
                consultation.getStatus() ==
                        Consultation.ConsultationStatus.COMPLETED
        ) {

            throw new IllegalStateException(
                    "Completed consultations cannot be reviewed again."
            );
        }


        // -------------------------------------------------
        // CANCELLED
        // -------------------------------------------------

        if (
                consultation.getStatus() ==
                        Consultation.ConsultationStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "Cancelled consultations cannot have results reviewed."
            );
        }


        // -------------------------------------------------
        // LAB REQUESTS
        // -------------------------------------------------

        if (
                !consultation.isHasLaboratoryRequests()
        ) {

            throw new IllegalStateException(
                    "This consultation has no laboratory requests."
            );
        }


        // -------------------------------------------------
        // LAB RESULTS
        // -------------------------------------------------

        if (
                !consultation.isHasLaboratoryResults()
        ) {

            throw new IllegalStateException(
                    "Laboratory results are not yet available."
            );
        }


        // -------------------------------------------------
        // READY FOR REVIEW
        // -------------------------------------------------

        if (
                consultation.getStatus() !=
                        Consultation.ConsultationStatus.READY_FOR_REVIEW
        ) {

            throw new IllegalStateException(
                    "Laboratory results are not yet ready for review."
            );
        }


        // -------------------------------------------------
        // PREVENT DOUBLE REVIEW
        // -------------------------------------------------

        if (
                consultation.isLaboratoryResultsReviewed()
        ) {

            throw new IllegalStateException(
                    "Laboratory results have already been reviewed."
            );
        }


        // -------------------------------------------------
        // MARK RESULTS REVIEWED
        // -------------------------------------------------

        consultation.setLaboratoryResultsReviewed(
                true
        );


        // -------------------------------------------------
        // RETURN TO OPEN
        // -------------------------------------------------

        consultation.setStatus(
                Consultation.ConsultationStatus.OPEN
        );


        Consultation saved =
                consultationRepository.save(
                        consultation
                );


        return new ConsultationResponse(
                saved
        );
    }


    // =====================================================
    // COMPLETE CONSULTATION
    // =====================================================

    @Override
    public ConsultationResponse completeConsultation(
            String id
    ) {

        Consultation consultation =
                findConsultation(id);


        // -------------------------------------------------
        // ONLY OPEN CAN COMPLETE
        // -------------------------------------------------

        if (
                consultation.getStatus() !=
                        Consultation.ConsultationStatus.OPEN
        ) {

            throw new IllegalStateException(
                    "Only OPEN consultations can be completed."
            );
        }


        // -------------------------------------------------
        // FINAL DIAGNOSIS
        // -------------------------------------------------

        if (
                isBlank(
                        consultation.getDiagnosis()
                )
        ) {

            throw new IllegalStateException(
                    "Final diagnosis is required before completing the consultation."
            );
        }


        // -------------------------------------------------
        // TREATMENT PLAN
        // -------------------------------------------------

        if (
                isBlank(
                        consultation.getTreatmentPlan()
                )
        ) {

            throw new IllegalStateException(
                    "Treatment plan is required before completing the consultation."
            );
        }


        // -------------------------------------------------
        // LABORATORY REQUIREMENTS
        // -------------------------------------------------

        if (
                consultation.isHasLaboratoryRequests()
        ) {

            if (
                    !consultation.isHasLaboratoryResults()
            ) {

                throw new IllegalStateException(
                        "Laboratory results must be available before completing the consultation."
                );
            }


            if (
                    !consultation.isLaboratoryResultsReviewed()
            ) {

                throw new IllegalStateException(
                        "Laboratory results must be reviewed by the doctor before completing the consultation."
                );
            }
        }


        // -------------------------------------------------
        // FINAL BILLING SYNCHRONIZATION
        // -------------------------------------------------
        //
        // This ensures that laboratory/pharmacy charges
        // already associated with the consultation are
        // reflected on the consultation invoice.
        //
        // It does NOT create a second invoice.
        //
        // -------------------------------------------------

        billingService
                .syncConsultationInvoice(
                        consultation.getId()
                );


        consultation.setHasBilling(
                true
        );


        // -------------------------------------------------
        // COMPLETE
        // -------------------------------------------------

        consultation.setStatus(
                Consultation.ConsultationStatus.COMPLETED
        );


        Consultation completed =
                consultationRepository.save(
                        consultation
                );


        return new ConsultationResponse(
                completed
        );
    }


    // =====================================================
    // CANCEL CONSULTATION
    // =====================================================

    @Override
    public ConsultationResponse cancelConsultation(
            String id
    ) {

        Consultation consultation =
                findConsultation(id);


        if (
                consultation.getStatus() ==
                        Consultation.ConsultationStatus.COMPLETED
        ) {

            throw new IllegalStateException(
                    "Completed consultations cannot be cancelled."
            );
        }


        if (
                consultation.getStatus() ==
                        Consultation.ConsultationStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "Consultation is already cancelled."
            );
        }


        consultation.setStatus(
                Consultation.ConsultationStatus.CANCELLED
        );


        Consultation saved =
                consultationRepository.save(
                        consultation
                );


        return new ConsultationResponse(
                saved
        );
    }


    // =====================================================
    // DELETE CONSULTATION
    // =====================================================

    @Override
    public void deleteConsultation(
            String id
    ) {

        Consultation consultation =
                findConsultation(id);


        if (
                consultation.getStatus() ==
                        Consultation.ConsultationStatus.COMPLETED
        ) {

            throw new IllegalStateException(
                    "Completed consultations cannot be deleted."
            );
        }


        consultationRepository.delete(
                consultation
        );
    }


    // =====================================================
    // FIND CONSULTATION
    // =====================================================

    private Consultation findConsultation(
            String id
    ) {

        if (isBlank(id)) {

            throw new IllegalArgumentException(
                    "Consultation ID is required."
            );
        }


        return consultationRepository
                .findById(
                        id.trim()
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Consultation not found: "
                                                + id
                                )
                );
    }


    // =====================================================
    // VALIDATE REQUEST
    // =====================================================

    private void validateRequest(
            ConsultationRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Consultation request cannot be null."
            );
        }


        if (
                isBlank(
                        request.getPatientId()
                )
        ) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );
        }


        if (
                isBlank(
                        request.getPatientName()
                )
        ) {

            throw new IllegalArgumentException(
                    "Patient name is required."
            );
        }


        if (
                isBlank(
                        request.getDoctorId()
                )
        ) {

            throw new IllegalArgumentException(
                    "Doctor ID is required."
            );
        }


        if (
                isBlank(
                        request.getConsultationDate()
                )
        ) {

            throw new IllegalArgumentException(
                    "Consultation date is required."
            );
        }


        if (
                isBlank(
                        request.getConsultationTime()
                )
        ) {

            throw new IllegalArgumentException(
                    "Consultation time is required."
            );
        }


        if (
                isBlank(
                        request.getChiefComplaint()
                )
        ) {

            throw new IllegalArgumentException(
                    "Chief complaint is required."
            );
        }


        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        try {

            LocalDate.parse(
                    request
                            .getConsultationDate()
                            .trim()
            );

        } catch (Exception error) {

            throw new IllegalArgumentException(
                    "Invalid consultation date. "
                            + "Expected format: YYYY-MM-DD."
            );
        }


        // -------------------------------------------------
        // TIME
        // -------------------------------------------------

        try {

            LocalTime.parse(
                    request
                            .getConsultationTime()
                            .trim()
            );

        } catch (Exception error) {

            throw new IllegalArgumentException(
                    "Invalid consultation time. "
                            + "Expected format: HH:mm or HH:mm:ss."
            );
        }


        // -------------------------------------------------
        // FOLLOW-UP DATE
        // -------------------------------------------------

        String followUpDate =
                clean(
                        request.getFollowUpDate()
                );


        if (followUpDate != null) {

            try {

                LocalDate.parse(
                        followUpDate
                );

            } catch (Exception error) {

                throw new IllegalArgumentException(
                        "Invalid follow-up date. "
                                + "Expected format: YYYY-MM-DD."
                );
            }
        }
    }


    // =====================================================
    // REQUIRED DATE
    // =====================================================

    private LocalDate parseRequiredDate(
            String value
    ) {

        try {

            return LocalDate.parse(
                    value.trim()
            );

        } catch (Exception error) {

            throw new IllegalArgumentException(
                    "Invalid consultation date. "
                            + "Expected format: YYYY-MM-DD."
            );
        }
    }


    // =====================================================
    // REQUIRED TIME
    // =====================================================

    private LocalTime parseRequiredTime(
            String value
    ) {

        try {

            return LocalTime.parse(
                    value.trim()
            );

        } catch (Exception error) {

            throw new IllegalArgumentException(
                    "Invalid consultation time. "
                            + "Expected format: HH:mm or HH:mm:ss."
            );
        }
    }


    // =====================================================
    // OPTIONAL DATE
    // =====================================================

    private LocalDate parseOptionalDate(
            String value
    ) {

        String cleaned =
                clean(value);


        if (cleaned == null) {

            return null;
        }


        try {

            return LocalDate.parse(
                    cleaned
            );

        } catch (Exception error) {

            throw new IllegalArgumentException(
                    "Invalid follow-up date. "
                            + "Expected format: YYYY-MM-DD."
            );
        }
    }


    // =====================================================
    // CLEAN STRING
    // =====================================================

    private String clean(
            String value
    ) {

        if (isBlank(value)) {

            return null;
        }

        return value.trim();
    }


    // =====================================================
    // BLANK CHECK
    // =====================================================

    private boolean isBlank(
            String value
    ) {

        return value == null ||
                value.trim().isEmpty();
    }


    // =====================================================
    // GENERATE CONSULTATION ID
    // =====================================================

    private String generateConsultationId() {

        return "CON-" +
                UUID.randomUUID()
                        .toString()
                        .substring(
                                0,
                                8
                        )
                        .toUpperCase();
    }
}