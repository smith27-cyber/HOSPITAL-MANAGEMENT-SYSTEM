package com.hms.backend.entity;

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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hms.backend.tenant.entity.Tenant;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "admissions",
        indexes = {
                @Index(
                        name = "idx_admission_tenant",
                        columnList = "tenant_id"
                ),
                @Index(
                        name = "idx_admission_tenant_patient",
                        columnList = "tenant_id,patient_id"
                ),
                @Index(
                        name = "idx_admission_patient",
                        columnList = "patient_id"
                ),
                @Index(
                        name = "idx_admission_doctor",
                        columnList = "doctor_id"
                ),
                @Index(
                        name = "idx_admission_department",
                        columnList = "department_id"
                ),
                @Index(
                        name = "idx_admission_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_admission_ward",
                        columnList = "ward"
                ),
                @Index(
                        name = "idx_admission_admission_date",
                        columnList = "admission_date"
                )
        }
)
public class Admission {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    // =========================================================
    // ID
    // =========================================================

    @Column(
            name = "id",
            nullable = false,
            unique = true,
            length = 50
    )
    @Id
    private String id;

    // =========================================================
    // PATIENT
    // =========================================================

    @Column(
            name = "patient_id",
            nullable = false,
            length = 100
    )
    private String patientId;

    @Column(
            name = "patient_name",
            nullable = false,
            length = 200
    )
    private String patientName;

    @Column(
            name = "patient_number",
            length = 100
    )
    private String patientNumber;

    // =========================================================
    // DOCTOR
    // =========================================================

    @Column(
            name = "doctor_id",
            length = 100
    )
    private String doctorId;

    @Column(
            name = "doctor_name",
            length = 200
    )
    private String doctorName;

    // =========================================================
    // DEPARTMENT
    // =========================================================

    @Column(
            name = "department_id",
            length = 100
    )
    private String departmentId;

    @Column(
            name = "department_name",
            length = 200
    )
    private String departmentName;

    // =========================================================
    // WARD
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "ward",
            nullable = false,
            length = 50
    )
    private WardType ward;

    // =========================================================
    // BED
    // =========================================================

    @Column(
            name = "bed_number",
            length = 50
    )
    private String bedNumber;

    // =========================================================
    // ADMISSION TYPE
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "admission_type",
            nullable = false,
            length = 50
    )
    private AdmissionType admissionType;

    // =========================================================
    // DATES
    // =========================================================

    @Column(
            name = "admission_date",
            nullable = false
    )
    private LocalDateTime admissionDate;

    @Column(
            name = "expected_discharge_date"
    )
    private LocalDateTime expectedDischargeDate;

    @Column(
            name = "discharge_date"
    )
    private LocalDateTime dischargeDate;

    // =========================================================
    // CLINICAL INFORMATION
    // =========================================================

    @Column(
            name = "reason",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String reason;

    @Column(
            name = "diagnosis",
            columnDefinition = "TEXT"
    )
    private String diagnosis;

    @Column(
            name = "notes",
            columnDefinition = "TEXT"
    )
    private String notes;

    // =========================================================
    // STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private AdmissionStatus status;

    // =========================================================
    // AUDIT
    // =========================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at"
    )
    private LocalDateTime updatedAt;

    // =========================================================
    // ENUMS
    // =========================================================

    public enum AdmissionStatus {

        ADMITTED,
        DISCHARGED,
        TRANSFERRED,
        CANCELLED
    }

    public enum AdmissionType {

        EMERGENCY,
        ROUTINE,
        REFERRAL,
        SURGICAL,
        MATERNITY,
        OTHER
    }

    public enum WardType {

        GENERAL,
        PRIVATE,
        PEDIATRIC,
        MATERNITY,
        SURGICAL,
        ICU,
        EMERGENCY,
        OTHER
    }

    // =========================================================
    // PRE-PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (admissionDate == null) {
            admissionDate = now;
        }

        if (status == null) {
            status = AdmissionStatus.ADMITTED;
        }
    }

    // =========================================================
    // PRE-UPDATE
    // =========================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getPatientNumber() {
        return patientNumber;
    }

    public void setPatientNumber(String patientNumber) {
        this.patientNumber = patientNumber;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public WardType getWard() {
        return ward;
    }

    public void setWard(WardType ward) {
        this.ward = ward;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }

    public AdmissionType getAdmissionType() {
        return admissionType;
    }

    public void setAdmissionType(AdmissionType admissionType) {
        this.admissionType = admissionType;
    }

    public LocalDateTime getAdmissionDate() {
        return admissionDate;
    }

    public void setAdmissionDate(LocalDateTime admissionDate) {
        this.admissionDate = admissionDate;
    }

    public LocalDateTime getExpectedDischargeDate() {
        return expectedDischargeDate;
    }

    public void setExpectedDischargeDate(
            LocalDateTime expectedDischargeDate
    ) {
        this.expectedDischargeDate =
                expectedDischargeDate;
    }

    public LocalDateTime getDischargeDate() {
        return dischargeDate;
    }

    public void setDischargeDate(
            LocalDateTime dischargeDate
    ) {
        this.dischargeDate =
                dischargeDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public AdmissionStatus getStatus() {
        return status;
    }

    public void setStatus(AdmissionStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt = updatedAt;
    }
}