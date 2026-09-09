package com.hms.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.math.BigDecimal;

@Embeddable
public class PharmacyPrescriptionItem {

    // =====================================================
    // MEDICINE
    // =====================================================

    @Column(nullable = false)
    private String medicineId;

    @Column(nullable = false)
    private String medicineName;

    @Column
    private String itemCode;

    // =====================================================
    // QUANTITY
    // =====================================================

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private String unit;

    // =====================================================
    // PRICING
    // =====================================================

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal unitPrice;

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal totalPrice;

    // =====================================================
    // DOSAGE
    // =====================================================

    @Column
    private String dosage;

    @Column
    private String frequency;

    @Column
    private String duration;

    @Column(
        columnDefinition = "TEXT"
    )
    private String instructions;

    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public PharmacyPrescriptionItem() {
    }

    // =====================================================
    // GETTERS AND SETTERS
    // =====================================================

    public String getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(String medicineId) {
        this.medicineId = medicineId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getItemCode() {
        return itemCode;
    }

    public void setItemCode(String itemCode) {
        this.itemCode = itemCode;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}