package com.hms.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.hms.backend.tenant.entity.Tenant;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "billing", uniqueConstraints = {
        @UniqueConstraint(name = "uk_billing_tenant_invoice_number", columnNames = {
                "tenant_id",
                "invoice_number"
        })
}, indexes = {
        @Index(name = "idx_billing_tenant", columnList = "tenant_id"),
        @Index(name = "idx_billing_tenant_patient", columnList = "tenant_id, patient_id"),
        @Index(name = "idx_billing_tenant_status", columnList = "tenant_id, status"),
        @Index(name = "idx_billing_tenant_invoice_number", columnList = "tenant_id, invoice_number"),
        @Index(name = "idx_billing_tenant_consultation", columnList = "tenant_id, consultation_id")
})
public class Billing {

    // =====================================================
    // PRIMARY KEY
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // TENANT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // =====================================================
    // PATIENT
    // =====================================================

    @Column(name = "patient_id", nullable = false, length = 100)
    private String patientId;

    @Column(name = "patient_name", nullable = false, length = 200)
    private String patientName;

    @Column(name = "patient_number", length = 100)
    private String patientNumber;

    // =====================================================
    // DOCTOR
    // =====================================================

    @Column(name = "doctor_id", length = 100)
    private String doctorId;

    @Column(name = "doctor_name", length = 200)
    private String doctorName;

    // =====================================================
    // DEPARTMENT
    // =====================================================

    @Column(name = "department_id", length = 100)
    private String departmentId;

    @Column(name = "department_name", length = 200)
    private String departmentName;

    // =====================================================
    // CONSULTATION
    // =====================================================

    @Column(name = "consultation_id", length = 50)
    private String consultationId;

    // =====================================================
    // BILLING TOTALS
    // =====================================================

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "amount_paid", nullable = false, precision = 14, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    // =====================================================
    // PAYMENT
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 50)
    private PaymentMethod paymentMethod;

    // =====================================================
    // BILLING STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private BillingStatus status = BillingStatus.PENDING;

    // =====================================================
    // INVOICE
    // =====================================================

    @Column(name = "invoice_number", nullable = false, length = 100)
    private String invoiceNumber;

    @Column(name = "billing_date", nullable = false)
    private LocalDateTime billingDate;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    // =====================================================
    // NOTES
    // =====================================================

    @Column(columnDefinition = "TEXT")
    private String notes;

    // =====================================================
    // AUDIT
    // =====================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // =====================================================
    // BILL ITEMS
    // =====================================================

    @JsonManagedReference
    @OneToMany(mappedBy = "billing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BillingItem> items = new ArrayList<>();

    // =====================================================
    // LIFECYCLE
    // =====================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (billingDate == null) {
            billingDate = now;
        }

        if (createdAt == null) {
            createdAt = now;
        }

        if (amount == null) {
            amount = BigDecimal.ZERO;
        }

        if (amountPaid == null) {
            amountPaid = BigDecimal.ZERO;
        }

        if (balance == null) {
            balance = BigDecimal.ZERO;
        }

        if (status == null) {
            status = BillingStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    // =====================================================
    // ENUMS
    // =====================================================

    public enum BillingStatus {

        PENDING,

        PARTIALLY_PAID,

        PAID,

        CANCELLED
    }

    public enum PaymentMethod {

        CASH,

        MOBILE_MONEY,

        CARD,

        BANK_TRANSFER,

        INSURANCE,

        OTHER
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

    public String getConsultationId() {
        return consultationId;
    }

    public void setConsultationId(String consultationId) {
        this.consultationId = consultationId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(
            PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BillingStatus getStatus() {
        return status;
    }

    public void setStatus(
            BillingStatus status) {
        this.status = status;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(
            String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public LocalDateTime getBillingDate() {
        return billingDate;
    }

    public void setBillingDate(
            LocalDateTime billingDate) {
        this.billingDate = billingDate;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(
            LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<BillingItem> getItems() {
        return items;
    }

    public void setItems(
            List<BillingItem> items) {

        this.items = items;

        if (items != null) {

            for (BillingItem item : items) {

                if (item != null) {
                    item.setBilling(this);
                }
            }
        }
    }

    // =====================================================
    // HELPER
    // =====================================================

    public void addItem(
            BillingItem item) {

        if (item == null) {
            return;
        }

        items.add(item);

        item.setBilling(this);
    }

    public void removeItem(
            BillingItem item) {

        if (item == null) {
            return;
        }

        items.remove(item);

        item.setBilling(null);
    }
}