package com.hms.backend.entity;

import com.hms.backend.tenant.entity.Tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "laboratory_requests",
        indexes = {
                @Index(
                        name = "idx_lab_request_tenant",
                        columnList = "tenant_id"
                ),
                @Index(
                        name = "idx_lab_request_tenant_patient",
                        columnList = "tenant_id, patient_id"
                ),
                @Index(
                        name = "idx_lab_request_tenant_consultation",
                        columnList = "tenant_id, consultation_id"
                ),
                @Index(
                        name = "idx_lab_request_tenant_doctor",
                        columnList = "tenant_id, doctor_id"
                ),
                @Index(
                        name = "idx_lab_request_tenant_status",
                        columnList = "tenant_id, status"
                )
        }
)
public class LaboratoryRequest {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // TENANT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "tenant_id",
            nullable = false
    )
    private Tenant tenant;

    // =====================================================
    // PATIENT
    // =====================================================

    @Column(nullable = false)
    private String patientId;

    @Column(nullable = false)
    private String patientName;

    // =====================================================
    // CONSULTATION
    // =====================================================

    private String consultationId;

    // =====================================================
    // DOCTOR
    // =====================================================

    private String doctorId;

    private String doctorName;

    // =====================================================
    // TEST
    // =====================================================

    @Column(nullable = false)
    private Long testId;

    @Column(nullable = false)
    private String testName;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String sampleType;

    // =====================================================
    // STATUS
    // =====================================================

    @Column(nullable = false)
    private String status;

    // =====================================================
    // RESULT / NOTES
    // =====================================================

    @Column(length = 3000)
    private String result;

    @Column(length = 3000)
    private String notes;

    // =====================================================
    // PRICE
    // =====================================================

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    // =====================================================
    // AUDIT
    // =====================================================

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime completedAt;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public LaboratoryRequest() {
    }

    // =====================================================
    // PRE-PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        if (requestedAt == null) {
            requestedAt =
                    LocalDateTime.now();
        }

        if (status == null || status.isBlank()) {
            status = "Pending";
        }
    }

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public void setPatientId(
            String patientId
    ) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(
            String patientName
    ) {
        this.patientName = patientName;
    }

    public String getConsultationId() {
        return consultationId;
    }

    public void setConsultationId(
            String consultationId
    ) {
        this.consultationId = consultationId;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(
            String doctorId
    ) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(
            String doctorName
    ) {
        this.doctorName = doctorName;
    }

    public Long getTestId() {
        return testId;
    }

    public void setTestId(
            Long testId
    ) {
        this.testId = testId;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(
            String testName
    ) {
        this.testName = testName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(
            String category
    ) {
        this.category = category;
    }

    public String getSampleType() {
        return sampleType;
    }

    public void setSampleType(
            String sampleType
    ) {
        this.sampleType = sampleType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(
            String status
    ) {
        this.status = status;
    }

    public String getResult() {
        return result;
    }

    public void setResult(
            String result
    ) {
        this.result = result;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(
            String notes
    ) {
        this.notes = notes;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(
            BigDecimal price
    ) {
        this.price = price;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(
            LocalDateTime requestedAt
    ) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(
            LocalDateTime completedAt
    ) {
        this.completedAt = completedAt;
    }
}