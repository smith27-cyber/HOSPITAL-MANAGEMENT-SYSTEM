package com.hms.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "pharmacy_prescriptions"
)
public class PharmacyPrescription {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Long id;

    // =====================================================
    // PRESCRIPTION NUMBER
    // =====================================================

    @Column(
        nullable = false,
        unique = true,
        length = 50
    )
    private String prescriptionNumber;

    // =====================================================
    // PATIENT
    // =====================================================

    @Column(
        nullable = false,
        length = 100
    )
    private String patientId;

    @Column(
        nullable = false,
        length = 150
    )
    private String patientName;

    @Column(length = 50)
    private String patientNumber;

    // =====================================================
    // CONSULTATION
    // =====================================================

    @Column(length = 100)
    private String consultationId;

    // =====================================================
    // DOCTOR
    // =====================================================

    @Column(length = 100)
    private String doctorId;

    @Column(length = 150)
    private String doctorName;

    // =====================================================
    // PRESCRIPTION ITEMS
    // =====================================================

    @ElementCollection(
        fetch = FetchType.EAGER
    )
    @CollectionTable(
        name = "pharmacy_prescription_items",
        joinColumns = @JoinColumn(
            name = "prescription_id"
        )
    )
    private List<PharmacyPrescriptionItem> items =
        new ArrayList<>();

    // =====================================================
    // FINANCIAL INFORMATION
    // =====================================================

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal subtotal =
        BigDecimal.ZERO;

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal amountPaid =
        BigDecimal.ZERO;

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal balance =
        BigDecimal.ZERO;

    // =====================================================
    // BILLING
    // =====================================================

    @Column(length = 100)
    private String billingId;

    @Column(length = 50)
    private String billingStatus;

    // =====================================================
    // STATUS
    // =====================================================

    @Column(
        nullable = false,
        length = 50
    )
    private String status = "Waiting";

    // =====================================================
    // DATES
    // =====================================================

    @Column(
        nullable = false
    )
    private LocalDateTime prescriptionDate;

    @Column
    private LocalDateTime preparedAt;

    @Column
    private LocalDateTime paymentDate;

    @Column
    private LocalDateTime dispensedAt;

    // =====================================================
    // DISPENSED BY
    // =====================================================

    @Column(length = 150)
    private String dispensedBy;

    // =====================================================
    // NOTES
    // =====================================================

    @Column(
        columnDefinition = "TEXT"
    )
    private String notes;

    // =====================================================
    // AUDIT
    // =====================================================

    @Column(
        nullable = false
    )
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    // =====================================================
    // PRE-PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
            LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (prescriptionDate == null) {
            prescriptionDate = now;
        }

        if (subtotal == null) {
            subtotal = BigDecimal.ZERO;
        }

        if (amountPaid == null) {
            amountPaid = BigDecimal.ZERO;
        }

        if (balance == null) {
            balance = BigDecimal.ZERO;
        }

        if (status == null || status.isBlank()) {
            status = "Waiting";
        }
    }

    // =====================================================
    // PRE-UPDATE
    // =====================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
            LocalDateTime.now();
    }

    // =====================================================
    // GETTERS AND SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public String getPrescriptionNumber() {
        return prescriptionNumber;
    }

    public void setPrescriptionNumber(
        String prescriptionNumber
    ) {
        this.prescriptionNumber =
            prescriptionNumber;
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

    public String getPatientNumber() {
        return patientNumber;
    }

    public void setPatientNumber(
        String patientNumber
    ) {
        this.patientNumber =
            patientNumber;
    }

    public String getConsultationId() {
        return consultationId;
    }

    public void setConsultationId(
        String consultationId
    ) {
        this.consultationId =
            consultationId;
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

    public List<PharmacyPrescriptionItem> getItems() {
        return items;
    }

    public void setItems(
        List<PharmacyPrescriptionItem> items
    ) {
        this.items = items;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(
        BigDecimal subtotal
    ) {
        this.subtotal = subtotal;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(
        BigDecimal amountPaid
    ) {
        this.amountPaid = amountPaid;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(
        BigDecimal balance
    ) {
        this.balance = balance;
    }

    public String getBillingId() {
        return billingId;
    }

    public void setBillingId(
        String billingId
    ) {
        this.billingId = billingId;
    }

    public String getBillingStatus() {
        return billingStatus;
    }

    public void setBillingStatus(
        String billingStatus
    ) {
        this.billingStatus = billingStatus;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(
        String status
    ) {
        this.status = status;
    }

    public LocalDateTime getPrescriptionDate() {
        return prescriptionDate;
    }

    public void setPrescriptionDate(
        LocalDateTime prescriptionDate
    ) {
        this.prescriptionDate =
            prescriptionDate;
    }

    public LocalDateTime getPreparedAt() {
        return preparedAt;
    }

    public void setPreparedAt(
        LocalDateTime preparedAt
    ) {
        this.preparedAt = preparedAt;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(
        LocalDateTime paymentDate
    ) {
        this.paymentDate = paymentDate;
    }

    public LocalDateTime getDispensedAt() {
        return dispensedAt;
    }

    public void setDispensedAt(
        LocalDateTime dispensedAt
    ) {
        this.dispensedAt = dispensedAt;
    }

    public String getDispensedBy() {
        return dispensedBy;
    }

    public void setDispensedBy(
        String dispensedBy
    ) {
        this.dispensedBy = dispensedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(
        String notes
    ) {
        this.notes = notes;
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