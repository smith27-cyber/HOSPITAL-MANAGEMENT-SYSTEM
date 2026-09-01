
package com.hms.backend.service.impl;

import com.hms.backend.dto.ConsultationRequest;
import com.hms.backend.dto.ConsultationResponse;
import com.hms.backend.entity.Consultation;
import com.hms.backend.repository.ConsultationRepository;
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


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ConsultationServiceImpl(
            ConsultationRepository consultationRepository) {

        this.consultationRepository =
                consultationRepository;
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
            String id) {

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
            String patientId) {

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
            String doctorId) {

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
            String appointmentId) {

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
            String appointmentId) {

        return getConsultationByAppointment(
                appointmentId
        );
    }


    // =====================================================
    // CREATE CONSULTATION
    // =====================================================
    //
    // Appointment
    //      ↓
    // Consultation created
    //      ↓
    // OPEN
    //
    // Creation NEVER completes the consultation.
    //
    // =====================================================

    @Override
    public ConsultationResponse createConsultation(
            ConsultationRequest request) {

        validateRequest(request);


        String appointmentId =
                clean(request.getAppointmentId());


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


        Consultation consultation =
                new Consultation();


        consultation.setId(
                generateConsultationId()
        );


        consultation.setPatientId(
                request.getPatientId().trim()
        );


        consultation.setDoctorId(
                request.getDoctorId().trim()
        );


        consultation.setAppointmentId(
                appointmentId
        );


        consultation.setConsultationDate(
                parseRequiredDate(
                        request.getConsultationDate()
                )
        );


        consultation.setConsultationTime(
                parseRequiredTime(
                        request.getConsultationTime()
                )
        );


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
        // INITIAL STATUS
        // -------------------------------------------------

        consultation.setStatus(
                Consultation.ConsultationStatus.OPEN
        );


        // -------------------------------------------------
        // INITIAL WORKFLOW FLAGS
        // -------------------------------------------------

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


        Consultation saved =
                consultationRepository.save(
                        consultation
                );


        return new ConsultationResponse(
                saved
        );
    }


    // =====================================================
    // UPDATE CONSULTATION
    // =====================================================
    //
    // SAVE PROGRESS ONLY.
    //
    // It DOES NOT complete the consultation.
    //
    // =====================================================

    @Override
    public ConsultationResponse updateConsultation(
            String id,
            ConsultationRequest request) {

        validateRequest(request);


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
                    "Completed consultations cannot be modified."
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
                    "Cancelled consultations cannot be modified. "
                            + "Reopen the consultation first."
            );
        }


        consultation.setPatientId(
                request.getPatientId().trim()
        );


        consultation.setDoctorId(
                request.getDoctorId().trim()
        );


        String appointmentId =
                clean(
                        request.getAppointmentId()
                );


        // -------------------------------------------------
        // PREVENT DUPLICATE APPOINTMENT
        // -------------------------------------------------

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


        consultation.setConsultationDate(
                parseRequiredDate(
                        request.getConsultationDate()
                )
        );


        consultation.setConsultationTime(
                parseRequiredTime(
                        request.getConsultationTime()
                )
        );


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
        // DO NOT CHANGE STATUS
        // -------------------------------------------------
        //
        // SAVE PROGRESS MUST PRESERVE:
        //
        // OPEN
        // PENDING_RESULTS
        // READY_FOR_REVIEW
        //
        // The laboratory module controls the laboratory
        // workflow states.
        //
        // -------------------------------------------------

        Consultation saved =
                consultationRepository.save(
                        consultation
                );


        return new ConsultationResponse(
                saved
        );
    }


    // =====================================================
    // UPDATE STATUS
    // =====================================================
    //
    // Allowed manual transitions:
    //
    // OPEN
    // CANCELLED
    //
    // System-controlled:
    //
    // PENDING_RESULTS
    // READY_FOR_REVIEW
    // COMPLETED
    //
    // =====================================================

    @Override
    public ConsultationResponse updateStatus(
            String id,
            String status) {

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
        // COMPLETED CANNOT BE SET HERE
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
        // LABORATORY STATES ARE SYSTEM CONTROLLED
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
        // COMPLETED CANNOT BE REOPENED
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
        // CANCELLED CAN ONLY GO TO OPEN
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
        // READY FOR REVIEW → OPEN
        // -------------------------------------------------
        //
        // Doctor MUST use reviewLaboratoryResults().
        //
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


        // -------------------------------------------------
        // PENDING RESULTS → OPEN
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
    //
    // READY_FOR_REVIEW
    //        ↓
    // Doctor reviews results
    //        ↓
    // OPEN
    //        ↓
    // Doctor adds final diagnosis
    //        ↓
    // Doctor adds treatment plan
    //        ↓
    // Doctor may add medicines
    //        ↓
    // COMPLETE CONSULTATION
    //
    // =====================================================

    @Override
    public ConsultationResponse reviewLaboratoryResults(
            String id) {

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
        // RESULTS
        // -------------------------------------------------

        if (
                !consultation.isHasLaboratoryResults()
        ) {

            throw new IllegalStateException(
                    "Laboratory results are not yet available."
            );
        }


        // -------------------------------------------------
        // MUST BE READY FOR REVIEW
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
        // ALREADY REVIEWED
        // -------------------------------------------------

        if (
                consultation.isLaboratoryResultsReviewed()
        ) {

            throw new IllegalStateException(
                    "Laboratory results have already been reviewed."
            );
        }


        // -------------------------------------------------
        // MARK REVIEWED
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
    //
    // THIS IS THE ONLY OPERATION THAT SETS COMPLETED.
    //
    // Requirements:
    //
    // 1. Consultation exists
    // 2. Not cancelled
    // 3. Not already completed
    // 4. Final diagnosis exists
    // 5. Treatment plan exists
    // 6. If laboratory requests exist:
    //      a. Results available
    //      b. Results reviewed
    //
    // IMPORTANT:
    //
    // Adding medicines DOES NOT block completion.
    //
    // =====================================================

    @Override
    public ConsultationResponse completeConsultation(
            String id) {

        Consultation consultation =
                findConsultation(id);


        // -------------------------------------------------
        // MUST BE OPEN
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
        // LABORATORY WORKFLOW
        // -------------------------------------------------

        if (
                consultation.isHasLaboratoryRequests()
        ) {

            // Results required.
            if (
                    !consultation.isHasLaboratoryResults()
            ) {

                throw new IllegalStateException(
                        "Laboratory results must be available before completing the consultation."
                );
            }


            // Results must be reviewed.
            if (
                    !consultation.isLaboratoryResultsReviewed()
            ) {

                throw new IllegalStateException(
                        "Laboratory results must be reviewed by the doctor before completing the consultation."
                );
            }
        }


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
            String id) {

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
            String id) {

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
            String id) {

        if (
                isBlank(id)
        ) {

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
            ConsultationRequest request) {

        if (
                request == null
        ) {

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


        String followUpDate =
                clean(
                        request.getFollowUpDate()
                );


        if (
                followUpDate != null
        ) {

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
            String value) {

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
            String value) {

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
            String value) {

        String cleaned =
                clean(value);


        if (
                cleaned == null
        ) {

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
            String value) {

        if (
                isBlank(value)
        ) {

            return null;
        }

        return value.trim();
    }


    // =====================================================
    // BLANK CHECK
    // =====================================================

    private boolean isBlank(
            String value) {

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

