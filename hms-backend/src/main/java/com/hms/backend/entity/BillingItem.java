package com.hms.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "billing_items", indexes = {
                @Index(name = "idx_billing_items_billing_id", columnList = "billing_id"),
                @Index(name = "idx_billing_items_type", columnList = "billing_type"),
                @Index(name = "idx_billing_items_reference", columnList = "reference_id")
})
public class BillingItem {

        // =========================================================
        // PRIMARY KEY
        // =========================================================

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        // =========================================================
        // BILL
        // =========================================================

        @JsonBackReference
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "billing_id", nullable = false)
        private Billing billing;

        // =========================================================
        // BILLING TYPE
        // =========================================================

        @Enumerated(EnumType.STRING)
        @Column(name = "billing_type", nullable = false, length = 50)
        private BillingType billingType;

        // =========================================================
        // DESCRIPTION
        // =========================================================

        @Column(nullable = false, length = 500)
        private String description;

        // =========================================================
        // QUANTITY
        // =========================================================

        @Column(nullable = false)
        private Integer quantity = 1;

        // =========================================================
        // UNIT PRICE
        // =========================================================

        @Column(name = "unit_price", nullable = false, precision = 14, scale = 2)
        private BigDecimal unitPrice = BigDecimal.ZERO;

        // =========================================================
        // AMOUNT
        // =========================================================

        @Column(nullable = false, precision = 14, scale = 2)
        private BigDecimal amount = BigDecimal.ZERO;

        // =========================================================
        // SOURCE REFERENCE
        // =========================================================

        @Column(name = "reference_id", length = 150)
        private String referenceId;

        // =========================================================
        // ENUM
        // =========================================================

        public enum BillingType {

                CONSULTATION,

                LABORATORY,

                PHARMACY,

                ADMISSION,

                PROCEDURE,

                OTHER
        }

        // =========================================================
        // GETTERS / SETTERS
        // =========================================================

        public Long getId() {
                return id;
        }

        public void setId(Long id) {
                this.id = id;
        }

        public Billing getBilling() {
                return billing;
        }

        public void setBilling(Billing billing) {
                this.billing = billing;
        }

        public BillingType getBillingType() {
                return billingType;
        }

        public void setBillingType(
                        BillingType billingType) {
                this.billingType = billingType;
        }

        public String getDescription() {
                return description;
        }

        public void setDescription(
                        String description) {
                this.description = description;
        }

        public Integer getQuantity() {
                return quantity;
        }

        public void setQuantity(
                        Integer quantity) {
                this.quantity = quantity;
        }

        public BigDecimal getUnitPrice() {
                return unitPrice;
        }

        public void setUnitPrice(
                        BigDecimal unitPrice) {
                this.unitPrice = unitPrice;
        }

        public BigDecimal getAmount() {
                return amount;
        }

        public void setAmount(
                        BigDecimal amount) {
                this.amount = amount;
        }

        public String getReferenceId() {
                return referenceId;
        }

        public void setReferenceId(
                        String referenceId) {
                this.referenceId = referenceId;
        }
}