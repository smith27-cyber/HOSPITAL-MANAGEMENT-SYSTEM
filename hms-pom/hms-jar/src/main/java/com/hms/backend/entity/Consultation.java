package com.hms.backend.entity;

import com.hms.backend.tenant.entity.Tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "consultations", indexes = {
        @Index(name = "idx_consultation_tenant", columnList = "tenant_id"),
        @Index(name = "idx_consultation_tenant_patient", columnList = "tenant_id, patient_id"),
        @Index(name = "idx_consultation_tenant_doctor", columnList = "tenant_id, doctor_id"),
        @Index(name = "idx_consultation_tenant_appointment", columnList = "tenant_id, appointment_id"),
        @Index(name = "idx_consultation_tenant_status", columnList = "tenant_id, status"),
        @Index(name = "idx_consultation_tenant_date", columnList = "tenant_id, consultation_date")
})
public class Consultation {

    // =====================================================
    // IDENTIFICATION
    // =====================================================

    @Id
    @Column(name = "id", nullable = false, unique = true, length = 50)
    private String id;

    // =====================================================
    // TENANT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // =====================================================
    // PATIENT
    // =====================================================

    @Column(name = "patient_id", nullable = false, length = 50)
    private String patientId;

    @Transient
    private String patientName;

    // =====================================================
    // DOCTOR
    // =====================================================

    @Column(name = "doctor_id", nullable = false, length = 50)
    private String doctorId;

    // =====================================================
    // APPOINTMENT
    // =====================================================

    @Column(name = "appointment_id", length = 50)
    private String appointmentId;

    // =====================================================
    // CONSULTATION DATE & TIME
    // =====================================================

    @Column(name = "consultation_date", nullable = false)
    private LocalDate consultationDate;

    @Column(name = "consultation_time", nullable = false)
    private LocalTime consultationTime;

    // =====================================================
    // CLINICAL INFORMATION
    // =====================================================

    @Column(name = "chief_complaint", nullable = false, columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(name = "treatment_plan", columnDefinition = "TEXT")
    private String treatmentPlan;

    // =====================================================
    // FOLLOW-UP
    // =====================================================

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    // =====================================================
    // CONSULTATION STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ConsultationStatus status;

    // =====================================================
    // WORKFLOW FLAGS
    // =====================================================

    @Column(name = "has_laboratory_requests", nullable = false)
    private boolean hasLaboratoryRequests = false;

    @Column(name = "has_laboratory_results", nullable = false)
    private boolean hasLaboratoryResults = false;

    @Column(name = "laboratory_results_reviewed", nullable = false)
    private boolean laboratoryResultsReviewed = false;

    @Column(name = "has_prescription", nullable = false)
    private boolean hasPrescription = false;

    @Column(name = "has_billing", nullable = false)
    private boolean hasBilling = false;

    // =====================================================
    // AUDIT
    // =====================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // =====================================================
    // STATUS ENUM
    // =====================================================

    public enum ConsultationStatus {
        OPEN,
        PENDING_RESULTS,
        READY_FOR_REVIEW,
        COMPLETED,
        CANCELLED
    }

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Consultation() {
    }

    // =====================================================
    // GETTERS & SETTERS
    // =====================================================

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }

    public LocalDate getConsultationDate() {
        return consultationDate;
    }

    public void setConsultationDate(LocalDate consultationDate) {
        this.consultationDate = consultationDate;
    }

    public LocalTime getConsultationTime() {
        return consultationTime;
    }

    public void setConsultationTime(LocalTime consultationTime) {
        this.consultationTime = consultationTime;
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getTreatmentPlan() {
        return treatmentPlan;
    }

    public void setTreatmentPlan(String treatmentPlan) {
        this.treatmentPlan = treatmentPlan;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public ConsultationStatus getStatus() {
        return status;
    }

    public void setStatus(ConsultationStatus status) {
        this.status = status;
    }

    public boolean isHasLaboratoryRequests() {
        return hasLaboratoryRequests;
    }

    public void setHasLaboratoryRequests(boolean hasLaboratoryRequests) {
        this.hasLaboratoryRequests = hasLaboratoryRequests;
    }

    public boolean isHasLaboratoryResults() {
        return hasLaboratoryResults;
    }

    public void setHasLaboratoryResults(boolean hasLaboratoryResults) {
        this.hasLaboratoryResults = hasLaboratoryResults;
    }

    public boolean isLaboratoryResultsReviewed() {
        return laboratoryResultsReviewed;
    }

    public void setLaboratoryResultsReviewed(boolean laboratoryResultsReviewed) {
        this.laboratoryResultsReviewed = laboratoryResultsReviewed;
    }

    public boolean isHasPrescription() {
        return hasPrescription;
    }

    public void setHasPrescription(boolean hasPrescription) {
        this.hasPrescription = hasPrescription;
    }

    public boolean isHasBilling() {
        return hasBilling;
    }

    public void setHasBilling(boolean hasBilling) {
        this.hasBilling = hasBilling;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    // =====================================================
    // JPA LIFECYCLE
    // =====================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;

        if (status == null) {
            status = ConsultationStatus.OPEN;
        }

        if (completedAt != null &&
                status != ConsultationStatus.COMPLETED) {
            completedAt = null;
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();

        if (status == ConsultationStatus.COMPLETED) {
            if (completedAt == null) {
                completedAt = LocalDateTime.now();
            }
        } else {
            completedAt = null;
        }
    }
}