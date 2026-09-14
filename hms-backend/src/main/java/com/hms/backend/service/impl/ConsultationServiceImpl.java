package com.hms.backend.service.impl;

import com.hms.backend.dto.ConsultationRequest;
import com.hms.backend.dto.ConsultationResponse;
import com.hms.backend.entity.Appointment;
import com.hms.backend.entity.Consultation;
import com.hms.backend.entity.Doctor;
import com.hms.backend.entity.Patient;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.repository.AppointmentRepository;
import com.hms.backend.repository.ConsultationRepository;
import com.hms.backend.repository.DoctorRepository;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.service.BillingService;
import com.hms.backend.service.ConsultationService;
import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.repository.TenantRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
        private final PatientRepository patientRepository;
        private final DoctorRepository doctorRepository;
        private final AppointmentRepository appointmentRepository;
        private final TenantRepository tenantRepository;

        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public ConsultationServiceImpl(
                        ConsultationRepository consultationRepository,
                        BillingService billingService,
                        PatientRepository patientRepository,
                        DoctorRepository doctorRepository,
                        AppointmentRepository appointmentRepository,
                        TenantRepository tenantRepository) {

                this.consultationRepository = consultationRepository;

                this.billingService = billingService;

                this.patientRepository = patientRepository;

                this.doctorRepository = doctorRepository;

                this.appointmentRepository = appointmentRepository;

                this.tenantRepository = tenantRepository;
        }

        // =====================================================
        // CURRENT TENANT
        // =====================================================

        private Tenant getCurrentTenant() {

                Long tenantId = TenantContext.requireTenantId();

                return tenantRepository
                                .findById(tenantId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.INTERNAL_SERVER_ERROR,
                                                "Current tenant not found: "
                                                                + tenantId));
        }

        // =====================================================
        // GET ALL
        // =====================================================

        @Override
        @Transactional(readOnly = true)
        public List<ConsultationResponse> getAllConsultations() {

                Long tenantId = TenantContext.requireTenantId();

                return consultationRepository
                                .findAllByTenant_Id(tenantId)
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

                Consultation consultation = findConsultation(id);

                return new ConsultationResponse(
                                consultation);
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
                                        "Patient ID is required.");
                }

                Long tenantId = TenantContext.requireTenantId();

                return consultationRepository
                                .findByTenant_IdAndPatientId(
                                                tenantId,
                                                patientId.trim())
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
                                        "Doctor ID is required.");
                }

                Long tenantId = TenantContext.requireTenantId();

                return consultationRepository
                                .findByTenant_IdAndDoctorId(
                                                tenantId,
                                                doctorId.trim())
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

                Long tenantId = TenantContext.requireTenantId();

                return consultationRepository
                                .findByTenant_IdAndAppointmentId(
                                                tenantId,
                                                appointmentId.trim())
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
                                appointmentId);
        }

        // =====================================================
        // CREATE CONSULTATION
        // =====================================================

        @Override
        public ConsultationResponse createConsultation(
                        ConsultationRequest request) {

                validateRequest(request);

                Long tenantId = TenantContext.requireTenantId();

                Tenant currentTenant = getCurrentTenant();

                // -------------------------------------------------
                // PATIENT MUST BELONG TO CURRENT TENANT
                // -------------------------------------------------

                Patient patient = patientRepository
                                .findByIdAndTenant_Id(
                                                request.getPatientId().trim(),
                                                tenantId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Patient not found: "
                                                                + request.getPatientId()));

                // -------------------------------------------------
                // DOCTOR MUST BELONG TO CURRENT TENANT
                // -------------------------------------------------

                Doctor doctor = doctorRepository
                                .findByIdAndTenant_Id(
                                                request.getDoctorId().trim(),
                                                tenantId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Doctor not found: "
                                                                + request.getDoctorId()));

                // -------------------------------------------------
                // APPOINTMENT MUST BELONG TO CURRENT TENANT
                // -------------------------------------------------

                String appointmentId = clean(request.getAppointmentId());

                Appointment appointment = null;

                if (appointmentId != null) {

                        appointment = appointmentRepository
                                        .findByIdAndTenant_Id(
                                                        appointmentId,
                                                        tenantId)
                                        .orElseThrow(() -> new ResponseStatusException(
                                                        HttpStatus.NOT_FOUND,
                                                        "Appointment not found: "
                                                                        + appointmentId));

                        // ---------------------------------------------
                        // APPOINTMENT MUST MATCH PATIENT
                        // ---------------------------------------------

                        if (!appointment.getPatientId()
                                        .equals(patient.getId())) {

                                throw new IllegalArgumentException(
                                                "Appointment does not belong to the selected patient.");
                        }

                        // ---------------------------------------------
                        // APPOINTMENT MUST MATCH DOCTOR
                        // ---------------------------------------------

                        if (!appointment.getDoctorId()
                                        .equals(doctor.getId())) {

                                throw new IllegalArgumentException(
                                                "Appointment does not belong to the selected doctor.");
                        }
                }

                // -------------------------------------------------
                // PREVENT DUPLICATE CONSULTATION
                // -------------------------------------------------

                if (appointmentId != null &&
                                consultationRepository
                                                .existsByTenant_IdAndAppointmentId(
                                                                tenantId,
                                                                appointmentId)) {

                        throw new IllegalArgumentException(
                                        "A consultation already exists for appointment: "
                                                        + appointmentId);
                }

                Consultation consultation = new Consultation();

                // -------------------------------------------------
                // FORCE TENANT
                // -------------------------------------------------

                consultation.setTenant(
                                currentTenant);

                // -------------------------------------------------
                // GENERATE ID
                // -------------------------------------------------

                consultation.setId(
                                generateConsultationId());

                // -------------------------------------------------
                // PATIENT
                // -------------------------------------------------

                consultation.setPatientId(
                                patient.getId());

                consultation.setPatientName(
                                buildPatientName(patient));

                // -------------------------------------------------
                // DOCTOR
                // -------------------------------------------------

                consultation.setDoctorId(
                                doctor.getId());

                // -------------------------------------------------
                // APPOINTMENT
                // -------------------------------------------------

                consultation.setAppointmentId(
                                appointmentId);

                // -------------------------------------------------
                // DATE
                // -------------------------------------------------

                consultation.setConsultationDate(
                                parseRequiredDate(
                                                request.getConsultationDate()));

                // -------------------------------------------------
                // TIME
                // -------------------------------------------------

                consultation.setConsultationTime(
                                parseRequiredTime(
                                                request.getConsultationTime()));

                // -------------------------------------------------
                // CLINICAL INFORMATION
                // -------------------------------------------------

                consultation.setChiefComplaint(
                                request.getChiefComplaint().trim());

                consultation.setSymptoms(
                                clean(request.getSymptoms()));

                consultation.setDiagnosis(
                                clean(request.getDiagnosis()));

                consultation.setClinicalNotes(
                                clean(request.getClinicalNotes()));

                consultation.setTreatmentPlan(
                                clean(request.getTreatmentPlan()));

                consultation.setFollowUpDate(
                                parseOptionalDate(
                                                request.getFollowUpDate()));

                // =================================================
                // INITIAL WORKFLOW STATE
                // =================================================

                consultation.setStatus(
                                Consultation.ConsultationStatus.OPEN);

                consultation.setHasLaboratoryRequests(false);
                consultation.setHasLaboratoryResults(false);
                consultation.setLaboratoryResultsReviewed(false);
                consultation.setHasPrescription(false);
                consultation.setHasBilling(false);

                // =================================================
                // SAVE ONLY
                // =================================================

                Consultation saved = consultationRepository.save(
                                consultation);

                return new ConsultationResponse(
                                saved);
        }

        // =====================================================
        // UPDATE CONSULTATION
        // =====================================================

        @Override
        public ConsultationResponse updateConsultation(
                        String id,
                        ConsultationRequest request) {

                validateRequest(request);

                Consultation consultation = findConsultation(id);

                if (consultation.getStatus() == Consultation.ConsultationStatus.COMPLETED) {

                        throw new IllegalStateException(
                                        "Completed consultations cannot be modified.");
                }

                if (consultation.getStatus() == Consultation.ConsultationStatus.CANCELLED) {

                        throw new IllegalStateException(
                                        "Cancelled consultations cannot be modified. "
                                                        + "Reopen the consultation first.");
                }

                Long tenantId = TenantContext.requireTenantId();

                // -------------------------------------------------
                // PATIENT
                // -------------------------------------------------

                Patient patient = patientRepository
                                .findByIdAndTenant_Id(
                                                request.getPatientId().trim(),
                                                tenantId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Patient not found: "
                                                                + request.getPatientId()));

                consultation.setPatientId(
                                patient.getId());

                consultation.setPatientName(
                                buildPatientName(patient));

                // -------------------------------------------------
                // DOCTOR
                // -------------------------------------------------

                Doctor doctor = doctorRepository
                                .findByIdAndTenant_Id(
                                                request.getDoctorId().trim(),
                                                tenantId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Doctor not found: "
                                                                + request.getDoctorId()));

                consultation.setDoctorId(
                                doctor.getId());

                // -------------------------------------------------
                // APPOINTMENT
                // -------------------------------------------------

                String appointmentId = clean(request.getAppointmentId());

                if (appointmentId != null) {

                        Appointment appointment = appointmentRepository
                                        .findByIdAndTenant_Id(
                                                        appointmentId,
                                                        tenantId)
                                        .orElseThrow(() -> new ResponseStatusException(
                                                        HttpStatus.NOT_FOUND,
                                                        "Appointment not found: "
                                                                        + appointmentId));

                        if (!appointment.getPatientId()
                                        .equals(patient.getId())) {

                                throw new IllegalArgumentException(
                                                "Appointment does not belong to the selected patient.");
                        }

                        if (!appointment.getDoctorId()
                                        .equals(doctor.getId())) {

                                throw new IllegalArgumentException(
                                                "Appointment does not belong to the selected doctor.");
                        }

                        if (!appointmentId.equals(
                                        consultation.getAppointmentId()) &&
                                        consultationRepository
                                                        .existsByTenant_IdAndAppointmentId(
                                                                        tenantId,
                                                                        appointmentId)) {

                                throw new IllegalArgumentException(
                                                "A consultation already exists for appointment: "
                                                                + appointmentId);
                        }
                }

                consultation.setAppointmentId(
                                appointmentId);

                // -------------------------------------------------
                // DATE
                // -------------------------------------------------

                consultation.setConsultationDate(
                                parseRequiredDate(
                                                request.getConsultationDate()));

                // -------------------------------------------------
                // TIME
                // -------------------------------------------------

                consultation.setConsultationTime(
                                parseRequiredTime(
                                                request.getConsultationTime()));

                // -------------------------------------------------
                // CLINICAL INFORMATION
                // -------------------------------------------------

                consultation.setChiefComplaint(
                                request.getChiefComplaint().trim());

                consultation.setSymptoms(
                                clean(request.getSymptoms()));

                consultation.setDiagnosis(
                                clean(request.getDiagnosis()));

                consultation.setClinicalNotes(
                                clean(request.getClinicalNotes()));

                consultation.setTreatmentPlan(
                                clean(request.getTreatmentPlan()));

                consultation.setFollowUpDate(
                                parseOptionalDate(
                                                request.getFollowUpDate()));

                // -------------------------------------------------
                // SAVE PROGRESS ONLY
                // -------------------------------------------------

                Consultation saved = consultationRepository.save(
                                consultation);

                return new ConsultationResponse(
                                saved);
        }

        // =====================================================
        // UPDATE STATUS
        // =====================================================

        @Override
        public ConsultationResponse updateStatus(
                        String id,
                        String status) {

                Consultation consultation = findConsultation(id);

                if (isBlank(status)) {

                        throw new IllegalArgumentException(
                                        "Consultation status is required.");
                }

                Consultation.ConsultationStatus newStatus;

                try {

                        newStatus = Consultation.ConsultationStatus.valueOf(
                                        status.trim().toUpperCase());

                } catch (IllegalArgumentException error) {

                        throw new IllegalArgumentException(
                                        "Invalid consultation status: "
                                                        + status);
                }

                if (newStatus == Consultation.ConsultationStatus.COMPLETED) {

                        throw new IllegalStateException(
                                        "A consultation cannot be completed through the status endpoint. "
                                                        + "Use Complete Consultation.");
                }

                if (newStatus == Consultation.ConsultationStatus.PENDING_RESULTS
                                ||
                                newStatus == Consultation.ConsultationStatus.READY_FOR_REVIEW) {

                        throw new IllegalStateException(
                                        "Laboratory workflow statuses are controlled by the laboratory module.");
                }

                if (consultation.getStatus() == Consultation.ConsultationStatus.COMPLETED) {

                        throw new IllegalStateException(
                                        "Completed consultations cannot be reopened.");
                }

                if (consultation.getStatus() == Consultation.ConsultationStatus.CANCELLED
                                &&
                                newStatus != Consultation.ConsultationStatus.OPEN) {

                        throw new IllegalStateException(
                                        "A cancelled consultation can only be reopened to OPEN.");
                }

                if (consultation.getStatus() == Consultation.ConsultationStatus.PENDING_RESULTS
                                &&
                                newStatus == Consultation.ConsultationStatus.OPEN) {

                        throw new IllegalStateException(
                                        "The consultation is waiting for laboratory results.");
                }

                if (consultation.getStatus() == Consultation.ConsultationStatus.READY_FOR_REVIEW
                                &&
                                newStatus == Consultation.ConsultationStatus.OPEN) {

                        throw new IllegalStateException(
                                        "Use Review Laboratory Results before returning the consultation to OPEN.");
                }

                consultation.setStatus(
                                newStatus);

                Consultation saved = consultationRepository.save(
                                consultation);

                return new ConsultationResponse(
                                saved);
        }

        // =====================================================
        // REVIEW LABORATORY RESULTS
        // =====================================================

        @Override
        public ConsultationResponse reviewLaboratoryResults(
                        String id) {

                Consultation consultation = findConsultation(id);

                if (consultation.getStatus() == Consultation.ConsultationStatus.COMPLETED) {

                        throw new IllegalStateException(
                                        "Completed consultations cannot be reviewed again.");
                }

                if (consultation.getStatus() == Consultation.ConsultationStatus.CANCELLED) {

                        throw new IllegalStateException(
                                        "Cancelled consultations cannot have results reviewed.");
                }

                if (!consultation.isHasLaboratoryRequests()) {

                        throw new IllegalStateException(
                                        "This consultation has no laboratory requests.");
                }

                if (!consultation.isHasLaboratoryResults()) {

                        throw new IllegalStateException(
                                        "Laboratory results are not yet available.");
                }

                if (consultation.getStatus() != Consultation.ConsultationStatus.READY_FOR_REVIEW) {

                        throw new IllegalStateException(
                                        "Laboratory results are not yet ready for review.");
                }

                if (consultation.isLaboratoryResultsReviewed()) {

                        throw new IllegalStateException(
                                        "Laboratory results have already been reviewed.");
                }

                consultation.setLaboratoryResultsReviewed(
                                true);

                consultation.setStatus(
                                Consultation.ConsultationStatus.OPEN);

                Consultation saved = consultationRepository.save(
                                consultation);

                return new ConsultationResponse(
                                saved);
        }

        // =====================================================
        // COMPLETE CONSULTATION
        // =====================================================

        @Override
        public ConsultationResponse completeConsultation(
                        String id) {

                Consultation consultation = findConsultation(id);

                if (consultation.getStatus() != Consultation.ConsultationStatus.OPEN) {

                        throw new IllegalStateException(
                                        "Only OPEN consultations can be completed.");
                }

                if (isBlank(consultation.getDiagnosis())) {

                        throw new IllegalStateException(
                                        "Final diagnosis is required before completing the consultation.");
                }

                if (isBlank(consultation.getTreatmentPlan())) {

                        throw new IllegalStateException(
                                        "Treatment plan is required before completing the consultation.");
                }

                if (consultation.isHasLaboratoryRequests()) {

                        if (!consultation.isHasLaboratoryResults()) {

                                throw new IllegalStateException(
                                                "Laboratory results must be available before completing the consultation.");
                        }

                        if (!consultation.isLaboratoryResultsReviewed()) {

                                throw new IllegalStateException(
                                                "Laboratory results must be reviewed by the doctor before completing the consultation.");
                        }
                }

                // =================================================
                // BILLING ONLY ON COMPLETE
                // =================================================

                billingService.syncConsultationInvoice(
                                consultation.getId());

                consultation.setHasBilling(
                                true);

                consultation.setStatus(
                                Consultation.ConsultationStatus.COMPLETED);

                Consultation completed = consultationRepository.save(
                                consultation);

                return new ConsultationResponse(
                                completed);
        }

        // =====================================================
        // CANCEL
        // =====================================================

        @Override
        public ConsultationResponse cancelConsultation(
                        String id) {

                Consultation consultation = findConsultation(id);

                if (consultation.getStatus() == Consultation.ConsultationStatus.COMPLETED) {

                        throw new IllegalStateException(
                                        "Completed consultations cannot be cancelled.");
                }

                if (consultation.getStatus() == Consultation.ConsultationStatus.CANCELLED) {

                        throw new IllegalStateException(
                                        "Consultation is already cancelled.");
                }

                consultation.setStatus(
                                Consultation.ConsultationStatus.CANCELLED);

                Consultation saved = consultationRepository.save(
                                consultation);

                return new ConsultationResponse(
                                saved);
        }

        // =====================================================
        // DELETE
        // =====================================================

        @Override
        public void deleteConsultation(
                        String id) {

                Consultation consultation = findConsultation(id);

                if (consultation.getStatus() == Consultation.ConsultationStatus.COMPLETED) {

                        throw new IllegalStateException(
                                        "Completed consultations cannot be deleted.");
                }

                consultationRepository.delete(
                                consultation);
        }

        // =====================================================
        // FIND CONSULTATION
        // =====================================================

        private Consultation findConsultation(
                        String id) {

                if (isBlank(id)) {

                        throw new IllegalArgumentException(
                                        "Consultation ID is required.");
                }

                Long tenantId = TenantContext.requireTenantId();

                return consultationRepository
                                .findByIdAndTenant_Id(
                                                id.trim(),
                                                tenantId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Consultation not found: "
                                                                + id));
        }

        // =====================================================
        // PATIENT NAME
        // =====================================================

        private String buildPatientName(
                        Patient patient) {

                String firstName = patient.getFirstName() == null
                                ? ""
                                : patient.getFirstName().trim();

                String lastName = patient.getLastName() == null
                                ? ""
                                : patient.getLastName().trim();

                return (firstName + " " + lastName).trim();
        }

        // =====================================================
        // VALIDATE REQUEST
        // =====================================================

        private void validateRequest(
                        ConsultationRequest request) {

                if (request == null) {

                        throw new IllegalArgumentException(
                                        "Consultation request cannot be null.");
                }

                if (isBlank(request.getPatientId())) {

                        throw new IllegalArgumentException(
                                        "Patient ID is required.");
                }

                if (isBlank(request.getPatientName())) {

                        throw new IllegalArgumentException(
                                        "Patient name is required.");
                }

                if (isBlank(request.getDoctorId())) {

                        throw new IllegalArgumentException(
                                        "Doctor ID is required.");
                }

                if (isBlank(request.getConsultationDate())) {

                        throw new IllegalArgumentException(
                                        "Consultation date is required.");
                }

                if (isBlank(request.getConsultationTime())) {

                        throw new IllegalArgumentException(
                                        "Consultation time is required.");
                }

                if (isBlank(request.getChiefComplaint())) {

                        throw new IllegalArgumentException(
                                        "Chief complaint is required.");
                }

                try {

                        LocalDate.parse(
                                        request.getConsultationDate().trim());

                } catch (Exception error) {

                        throw new IllegalArgumentException(
                                        "Invalid consultation date. "
                                                        + "Expected format: YYYY-MM-DD.");
                }

                try {

                        LocalTime.parse(
                                        request.getConsultationTime().trim());

                } catch (Exception error) {

                        throw new IllegalArgumentException(
                                        "Invalid consultation time. "
                                                        + "Expected format: HH:mm or HH:mm:ss.");
                }

                String followUpDate = clean(request.getFollowUpDate());

                if (followUpDate != null) {

                        try {

                                LocalDate.parse(
                                                followUpDate);

                        } catch (Exception error) {

                                throw new IllegalArgumentException(
                                                "Invalid follow-up date. "
                                                                + "Expected format: YYYY-MM-DD.");
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
                                        value.trim());

                } catch (Exception error) {

                        throw new IllegalArgumentException(
                                        "Invalid consultation date. "
                                                        + "Expected format: YYYY-MM-DD.");
                }
        }

        // =====================================================
        // REQUIRED TIME
        // =====================================================

        private LocalTime parseRequiredTime(
                        String value) {

                try {

                        return LocalTime.parse(
                                        value.trim());

                } catch (Exception error) {

                        throw new IllegalArgumentException(
                                        "Invalid consultation time. "
                                                        + "Expected format: HH:mm or HH:mm:ss.");
                }
        }

        // =====================================================
        // OPTIONAL DATE
        // =====================================================

        private LocalDate parseOptionalDate(
                        String value) {

                String cleaned = clean(value);

                if (cleaned == null) {
                        return null;
                }

                try {

                        return LocalDate.parse(
                                        cleaned);

                } catch (Exception error) {

                        throw new IllegalArgumentException(
                                        "Invalid follow-up date. "
                                                        + "Expected format: YYYY-MM-DD.");
                }
        }

        // =====================================================
        // CLEAN STRING
        // =====================================================

        private String clean(
                        String value) {

                if (isBlank(value)) {
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
                                                .substring(0, 8)
                                                .toUpperCase();
        }
}