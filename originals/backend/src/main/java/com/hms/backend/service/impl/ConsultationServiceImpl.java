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
        ConsultationRepository consultationRepository
    ) {
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
        String id
    ) {

        Consultation consultation =
            consultationRepository
                .findById(id)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Consultation not found: " + id
                    )
                );

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

        return consultationRepository
            .findByPatientId(patientId)
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

        return consultationRepository
            .findByDoctorId(doctorId)
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

        return consultationRepository
            .findByAppointmentId(appointmentId)
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

        if (
            appointmentId == null ||
            appointmentId.trim().isEmpty()
        ) {

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
    // CREATE
    // =====================================================

    @Override
    public ConsultationResponse createConsultation(
        ConsultationRequest request
    ) {

        validateRequest(request);


        // -------------------------------------------------
        // APPOINTMENT ID
        // -------------------------------------------------

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


        // -------------------------------------------------
        // CREATE ENTITY
        // -------------------------------------------------

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
        // CONSULTATION DATE
        // -------------------------------------------------

        consultation.setConsultationDate(
            parseRequiredDate(
                request.getConsultationDate()
            )
        );


        // -------------------------------------------------
        // CONSULTATION TIME
        // -------------------------------------------------

        consultation.setConsultationTime(
            parseRequiredTime(
                request.getConsultationTime()
            )
        );


        // -------------------------------------------------
        // CHIEF COMPLAINT
        // -------------------------------------------------

        consultation.setChiefComplaint(
            request.getChiefComplaint().trim()
        );


        // -------------------------------------------------
        // OPTIONAL FIELDS
        // -------------------------------------------------

        consultation.setSymptoms(
            clean(request.getSymptoms())
        );

        consultation.setDiagnosis(
            clean(request.getDiagnosis())
        );

        consultation.setClinicalNotes(
            clean(request.getClinicalNotes())
        );

        consultation.setTreatmentPlan(
            clean(request.getTreatmentPlan())
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
        // SAVE
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
    // UPDATE
    // =====================================================

    @Override
    public ConsultationResponse updateConsultation(
        String id,
        ConsultationRequest request
    ) {

        validateRequest(request);


        Consultation consultation =
            consultationRepository
                .findById(id)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Consultation not found: " + id
                    )
                );


        // -------------------------------------------------
        // PATIENT
        // -------------------------------------------------

        consultation.setPatientId(
            request.getPatientId().trim()
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

        String appointmentId =
            clean(request.getAppointmentId());


        /*
         * If the appointment is being changed,
         * make sure the new appointment does not
         * already belong to another consultation.
         */

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
        // CHIEF COMPLAINT
        // -------------------------------------------------

        consultation.setChiefComplaint(
            request.getChiefComplaint().trim()
        );


        // -------------------------------------------------
        // OPTIONAL FIELDS
        // -------------------------------------------------

        consultation.setSymptoms(
            clean(request.getSymptoms())
        );

        consultation.setDiagnosis(
            clean(request.getDiagnosis())
        );

        consultation.setClinicalNotes(
            clean(request.getClinicalNotes())
        );

        consultation.setTreatmentPlan(
            clean(request.getTreatmentPlan())
        );

        consultation.setFollowUpDate(
            parseOptionalDate(
                request.getFollowUpDate()
            )
        );


        // -------------------------------------------------
        // SAVE
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

    @Override
    public ConsultationResponse updateStatus(
        String id,
        String status
    ) {

        Consultation consultation =
            consultationRepository
                .findById(id)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Consultation not found: " + id
                    )
                );


        if (
            status == null ||
            status.trim().isEmpty()
        ) {

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
                    + ". Allowed values: OPEN, COMPLETED, CANCELLED."
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
    // COMPLETE
    // =====================================================

    @Override
    public ConsultationResponse completeConsultation(
        String id
    ) {

        return updateStatus(
            id,
            "COMPLETED"
        );
    }


    // =====================================================
    // CANCEL
    // =====================================================

    @Override
    public ConsultationResponse cancelConsultation(
        String id
    ) {

        return updateStatus(
            id,
            "CANCELLED"
        );
    }


    // =====================================================
    // DELETE
    // =====================================================

    @Override
    public void deleteConsultation(
        String id
    ) {

        if (
            id == null ||
            id.trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                "Consultation ID is required."
            );
        }


        if (
            !consultationRepository
                .existsById(id)
        ) {

            throw new RuntimeException(
                "Consultation not found: " + id
            );
        }


        consultationRepository.deleteById(
            id
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


        // -------------------------------------------------
        // PATIENT
        // -------------------------------------------------

        if (
            request.getPatientId() == null ||
            request.getPatientId().trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                "Patient ID is required."
            );
        }


        // -------------------------------------------------
        // DOCTOR
        // -------------------------------------------------

        if (
            request.getDoctorId() == null ||
            request.getDoctorId().trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                "Doctor ID is required."
            );
        }


        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        if (
            request.getConsultationDate() == null ||
            request.getConsultationDate().trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                "Consultation date is required."
            );
        }


        // -------------------------------------------------
        // TIME
        // -------------------------------------------------

        if (
            request.getConsultationTime() == null ||
            request.getConsultationTime().trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                "Consultation time is required."
            );
        }


        // -------------------------------------------------
        // CHIEF COMPLAINT
        // -------------------------------------------------

        if (
            request.getChiefComplaint() == null ||
            request.getChiefComplaint().trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                "Chief complaint is required."
            );
        }


        // -------------------------------------------------
        // VALIDATE DATE FORMAT
        // -------------------------------------------------

        try {

            LocalDate.parse(
                request.getConsultationDate().trim()
            );

        } catch (Exception error) {

            throw new IllegalArgumentException(
                "Invalid consultation date. "
                    + "Expected format: YYYY-MM-DD."
            );
        }


        // -------------------------------------------------
        // VALIDATE TIME FORMAT
        // -------------------------------------------------

        try {

            LocalTime.parse(
                request.getConsultationTime().trim()
            );

        } catch (Exception error) {

            throw new IllegalArgumentException(
                "Invalid consultation time. "
                    + "Expected format: HH:mm or HH:mm:ss."
            );
        }


        // -------------------------------------------------
        // VALIDATE OPTIONAL FOLLOW-UP DATE
        // -------------------------------------------------

        String followUpDate =
            clean(request.getFollowUpDate());


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
    // CLEAN STRING
    // =====================================================

    private String clean(
        String value
    ) {

        if (
            value == null ||
            value.trim().isEmpty()
        ) {

            return null;
        }

        return value.trim();
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
    // GENERATE CONSULTATION ID
    // =====================================================

    private String generateConsultationId() {

        return "CON-" +
            UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }
}