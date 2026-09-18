package com.hms.backend.entity;

import com.hms.backend.tenant.entity.Tenant;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * =====================================================
 * HMS PAYMENT TRANSACTION
 * =====================================================
 *
 * Represents one actual payment made against one invoice.
 *
 * IMPORTANT:
 *
 * Billing.amountPaid
 *     = aggregate amount paid on the invoice
 *
 * PaymentTransaction
 *     = individual payment history
 *
 * Therefore:
 *
 * Invoice UGX 100,000
 *
 * Payment 1 = UGX 40,000
 * Payment 2 = UGX 60,000
 *
 * Billing.amountPaid
 *     = UGX 100,000
 *
 * PaymentTransaction records:
 *
 *     RCPT-001 = UGX 40,000
 *     RCPT-002 = UGX 60,000
 *
 * =====================================================
 */
@Entity
@Table(
        name = "payment_transactions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_payment_transaction_tenant_receipt",
                        columnNames = {
                                "tenant_id",
                                "receipt_number"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_payment_transaction_tenant",
                        columnList = "tenant_id"
                ),
                @Index(
                        name = "idx_payment_transaction_tenant_billing",
                        columnList = "tenant_id, billing_id"
                ),
                @Index(
                        name = "idx_payment_transaction_tenant_payment_date",
                        columnList = "tenant_id, payment_date"
                ),
                @Index(
                        name = "idx_payment_transaction_tenant_method",
                        columnList = "tenant_id, payment_method"
                )
        }
)
public class PaymentTransaction {

    // =====================================================
    // PRIMARY KEY
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // TENANT
    // =====================================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "tenant_id",
            nullable = false
    )
    private Tenant tenant;


    // =====================================================
    // BILLING / INVOICE
    // =====================================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "billing_id",
            nullable = false
    )
    private Billing billing;


    // =====================================================
    // RECEIPT NUMBER
    // =====================================================

    @Column(
            name = "receipt_number",
            nullable = false,
            length = 100
    )
    private String receiptNumber;


    // =====================================================
    // PAYMENT AMOUNT
    // =====================================================

    @Column(
            nullable = false,
            precision = 14,
            scale = 2
    )
    private BigDecimal amount = BigDecimal.ZERO;


    // =====================================================
    // PAYMENT METHOD
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "payment_method",
            nullable = false,
            length = 50
    )
    private Billing.PaymentMethod paymentMethod =
            Billing.PaymentMethod.OTHER;


    // =====================================================
    // PAYMENT DATE
    // =====================================================

    @Column(
            name = "payment_date",
            nullable = false
    )
    private LocalDateTime paymentDate;


    // =====================================================
    // RECEIVED BY
    // =====================================================
    //
    // Username of the authenticated staff member who
    // recorded the payment.
    //
    // We store the username as a snapshot so historical
    // receipts remain readable even if the user account
    // is later changed.
    //
    // =====================================================

    @Column(
            name = "received_by",
            length = 150
    )
    private String receivedBy;


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
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;


    @Column(
            name = "updated_at"
    )
    private LocalDateTime updatedAt;


    // =====================================================
    // LIFECYCLE
    // =====================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (paymentDate == null) {

            paymentDate = now;
        }

        if (createdAt == null) {

            createdAt = now;
        }

        if (amount == null) {

            amount = BigDecimal.ZERO;
        }

        if (paymentMethod == null) {

            paymentMethod =
                    Billing.PaymentMethod.OTHER;
        }
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
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


    public Billing getBilling() {
        return billing;
    }

    public void setBilling(Billing billing) {
        this.billing = billing;
    }


    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(
            String receiptNumber) {

        this.receiptNumber =
                receiptNumber;
    }


    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(
            BigDecimal amount) {

        this.amount =
                amount;
    }


    public Billing.PaymentMethod getPaymentMethod() {

        return paymentMethod;
    }

    public void setPaymentMethod(
            Billing.PaymentMethod paymentMethod) {

        this.paymentMethod =
                paymentMethod;
    }


    public LocalDateTime getPaymentDate() {

        return paymentDate;
    }

    public void setPaymentDate(
            LocalDateTime paymentDate) {

        this.paymentDate =
                paymentDate;
    }


    public String getReceivedBy() {

        return receivedBy;
    }

    public void setReceivedBy(
            String receivedBy) {

        this.receivedBy =
                receivedBy;
    }


    public String getNotes() {

        return notes;
    }

    public void setNotes(
            String notes) {

        this.notes =
                notes;
    }


    public LocalDateTime getCreatedAt() {

        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt =
                createdAt;
    }


    public LocalDateTime getUpdatedAt() {

        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt) {

        this.updatedAt =
                updatedAt;
    }
}