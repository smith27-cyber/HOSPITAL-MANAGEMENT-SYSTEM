package com.hms.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "inventory",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_inventory_item_code",
                        columnNames = "item_code"
                )
        }
)
public class Inventory {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @Column(
            nullable = false,
            length = 50
    )
    private String id;


    // =====================================================
    // BASIC INFORMATION
    // =====================================================

    @Column(
            name = "item_name",
            nullable = false,
            length = 200
    )
    private String itemName;


    @Column(
            name = "item_code",
            nullable = false,
            unique = true,
            length = 100
    )
    private String itemCode;


    @Column(
            nullable = false,
            length = 50
    )
    private String category;


    @Column(
            nullable = false,
            length = 50
    )
    private String unit;


    @Column(
            columnDefinition = "TEXT"
    )
    private String description;


    // =====================================================
    // STOCK INFORMATION
    // =====================================================

    @Column(
            nullable = false
    )
    private Integer quantity = 0;


    @Column(
            name = "minimum_stock",
            nullable = false
    )
    private Integer minimumStock = 0;


    @Column(
            name = "maximum_stock"
    )
    private Integer maximumStock;


    @Column(
            name = "unit_price",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal unitPrice = BigDecimal.ZERO;


    // =====================================================
    // SUPPLIER INFORMATION
    // =====================================================

    @Column(
            length = 200
    )
    private String supplier;


    @Column(
            name = "supplier_contact",
            length = 100
    )
    private String supplierContact;


    // =====================================================
    // BATCH / EXPIRY
    // =====================================================

    @Column(
            name = "batch_number",
            length = 100
    )
    private String batchNumber;


    @Column(
            name = "expiry_date"
    )
    private LocalDate expiryDate;


    // =====================================================
    // STORAGE
    // =====================================================

    @Column(
            name = "storage_location",
            length = 200
    )
    private String storageLocation;


    // =====================================================
    // STATUS
    // =====================================================

    @Column(
            nullable = false,
            length = 50
    )
    private String status;


    // =====================================================
    // NOTES
    // =====================================================

    @Column(
            columnDefinition = "TEXT"
    )
    private String notes;


    // =====================================================
    // AUDIT DATES
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
    // PRE-PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {

            createdAt = now;

        }

        updatedAt = now;


        if (quantity == null) {

            quantity = 0;

        }


        if (minimumStock == null) {

            minimumStock = 0;

        }


        if (unitPrice == null) {

            unitPrice = BigDecimal.ZERO;

        }


        if (status == null ||
                status.isBlank()) {

            status = "In Stock";

        }

    }


    // =====================================================
    // PRE UPDATE
    // =====================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();

    }


    // =====================================================
    // GETTERS AND SETTERS
    // =====================================================

    public String getId() {

        return id;

    }


    public void setId(
            String id
    ) {

        this.id = id;

    }


    public String getItemName() {

        return itemName;

    }


    public void setItemName(
            String itemName
    ) {

        this.itemName = itemName;

    }


    public String getItemCode() {

        return itemCode;

    }


    public void setItemCode(
            String itemCode
    ) {

        this.itemCode = itemCode;

    }


    public String getCategory() {

        return category;

    }


    public void setCategory(
            String category
    ) {

        this.category = category;

    }


    public String getUnit() {

        return unit;

    }


    public void setUnit(
            String unit
    ) {

        this.unit = unit;

    }


    public String getDescription() {

        return description;

    }


    public void setDescription(
            String description
    ) {

        this.description = description;

    }


    public Integer getQuantity() {

        return quantity;

    }


    public void setQuantity(
            Integer quantity
    ) {

        this.quantity = quantity;

    }


    public Integer getMinimumStock() {

        return minimumStock;

    }


    public void setMinimumStock(
            Integer minimumStock
    ) {

        this.minimumStock = minimumStock;

    }


    public Integer getMaximumStock() {

        return maximumStock;

    }


    public void setMaximumStock(
            Integer maximumStock
    ) {

        this.maximumStock = maximumStock;

    }


    public BigDecimal getUnitPrice() {

        return unitPrice;

    }


    public void setUnitPrice(
            BigDecimal unitPrice
    ) {

        this.unitPrice = unitPrice;

    }


    public String getSupplier() {

        return supplier;

    }


    public void setSupplier(
            String supplier
    ) {

        this.supplier = supplier;

    }


    public String getSupplierContact() {

        return supplierContact;

    }


    public void setSupplierContact(
            String supplierContact
    ) {

        this.supplierContact = supplierContact;

    }


    public String getBatchNumber() {

        return batchNumber;

    }


    public void setBatchNumber(
            String batchNumber
    ) {

        this.batchNumber = batchNumber;

    }


    public LocalDate getExpiryDate() {

        return expiryDate;

    }


    public void setExpiryDate(
            LocalDate expiryDate
    ) {

        this.expiryDate = expiryDate;

    }


    public String getStorageLocation() {

        return storageLocation;

    }


    public void setStorageLocation(
            String storageLocation
    ) {

        this.storageLocation = storageLocation;

    }


    public String getStatus() {

        return status;

    }


    public void setStatus(
            String status
    ) {

        this.status = status;

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