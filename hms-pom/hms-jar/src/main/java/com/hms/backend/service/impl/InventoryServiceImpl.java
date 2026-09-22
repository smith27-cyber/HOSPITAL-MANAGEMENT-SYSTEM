package com.hms.backend.service.impl;

import com.hms.backend.entity.Inventory;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.repository.InventoryRepository;
import com.hms.backend.service.InventoryService;
import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.repository.TenantRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class InventoryServiceImpl
        implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final TenantRepository tenantRepository;

    public InventoryServiceImpl(
            InventoryRepository inventoryRepository,
            TenantRepository tenantRepository
    ) {

        this.inventoryRepository =
                inventoryRepository;

        this.tenantRepository =
                tenantRepository;
    }

    // =====================================================
    // CURRENT TENANT
    // =====================================================

    private Tenant getCurrentTenant() {

        Long tenantId =
                TenantContext.requireTenantId();

        return tenantRepository
                .findById(tenantId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Current tenant not found: "
                                        + tenantId
                        )
                );
    }

    // =====================================================
    // GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Inventory> getAllItems() {

        return inventoryRepository.findAllByTenant_Id(
                TenantContext.requireTenantId()
        );
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Inventory getItemById(
            String id
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        return inventoryRepository
                .findByIdAndTenant_Id(
                        id,
                        tenantId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Inventory item not found with ID: "
                                        + id
                        )
                );
    }

    // =====================================================
    // ADD
    // =====================================================

    @Override
    public Inventory addItem(
            Inventory inventory
    ) {

        Tenant currentTenant =
                getCurrentTenant();

        Long tenantId =
                currentTenant.getId();

        normalizeInventory(inventory);

        validateInventory(inventory);

        inventory.setTenant(
                currentTenant
        );

        if (isBlank(inventory.getId())) {
            inventory.setId(
                    generateInventoryId(
                            tenantId
                    )
            );
        }

        if (isBlank(inventory.getItemCode())) {
            inventory.setItemCode(
                    generateItemCode(
                            tenantId
                    )
            );
        }

        if (
                inventoryRepository
                        .existsByTenant_IdAndItemCode(
                                tenantId,
                                inventory.getItemCode()
                        )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Inventory item with item code already exists: "
                            + inventory.getItemCode()
            );
        }

        inventory.setStatus(
                calculateStatus(inventory)
        );

        return inventoryRepository.save(
                inventory
        );
    }

    // =====================================================
    // UPDATE
    // =====================================================

    @Override
    public Inventory updateItem(
            String id,
            Inventory updatedInventory
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        Inventory existingInventory =
                getItemById(id);

        normalizeInventory(
                updatedInventory
        );

        validateInventory(
                updatedInventory
        );

        if (
                !isBlank(
                        updatedInventory.getItemCode()
                )
        ) {

            inventoryRepository
                    .findByTenant_IdAndItemCodeAndIdNot(
                            tenantId,
                            updatedInventory.getItemCode(),
                            id
                    )
                    .ifPresent(existingWithCode -> {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Another inventory item already uses item code: "
                                        + updatedInventory.getItemCode()
                        );
                    });
        }

        existingInventory.setItemName(
                updatedInventory.getItemName()
        );

        existingInventory.setItemCode(
                updatedInventory.getItemCode()
        );

        existingInventory.setCategory(
                updatedInventory.getCategory()
        );

        existingInventory.setUnit(
                updatedInventory.getUnit()
        );

        existingInventory.setDescription(
                updatedInventory.getDescription()
        );

        existingInventory.setQuantity(
                updatedInventory.getQuantity()
        );

        existingInventory.setMinimumStock(
                updatedInventory.getMinimumStock()
        );

        existingInventory.setMaximumStock(
                updatedInventory.getMaximumStock()
        );

        existingInventory.setUnitPrice(
                updatedInventory.getUnitPrice()
        );

        existingInventory.setSupplier(
                updatedInventory.getSupplier()
        );

        existingInventory.setSupplierContact(
                updatedInventory.getSupplierContact()
        );

        existingInventory.setBatchNumber(
                updatedInventory.getBatchNumber()
        );

        existingInventory.setExpiryDate(
                updatedInventory.getExpiryDate()
        );

        existingInventory.setStorageLocation(
                updatedInventory.getStorageLocation()
        );

        existingInventory.setStatus(
                calculateStatus(
                        updatedInventory
                )
        );

        existingInventory.setNotes(
                updatedInventory.getNotes()
        );

        // tenant is intentionally NOT changed

        return inventoryRepository.save(
                existingInventory
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @Override
    public void deleteItem(
            String id
    ) {

        Inventory inventory =
                getItemById(id);

        inventoryRepository.delete(
                inventory
        );
    }

    // =====================================================
    // STATUS
    // =====================================================

    @Override
    public Inventory updateItemStatus(
            String id,
            String status
    ) {

        if (isBlank(status)) {
            throw new IllegalArgumentException(
                    "Inventory status is required."
            );
        }

        if (
                !status.equals("In Stock") &&
                !status.equals("Low Stock") &&
                !status.equals("Out of Stock") &&
                !status.equals("Expired") &&
                !status.equals("Discontinued")
        ) {

            throw new IllegalArgumentException(
                    "Invalid inventory status."
            );
        }

        Inventory inventory =
                getItemById(id);

        inventory.setStatus(status);

        return inventoryRepository.save(
                inventory
        );
    }

    // =====================================================
    // QUANTITY
    // =====================================================

    @Override
    public Inventory updateQuantity(
            String id,
            Integer quantity
    ) {

        if (
                quantity == null ||
                quantity < 0
        ) {

            throw new IllegalArgumentException(
                    "Inventory quantity cannot be negative."
            );
        }

        Inventory inventory =
                getItemById(id);

        inventory.setQuantity(quantity);

        inventory.setStatus(
                calculateStatus(inventory)
        );

        return inventoryRepository.save(
                inventory
        );
    }

    // =====================================================
    // SEARCH
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Inventory> searchItems(
            String searchTerm
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        if (isBlank(searchTerm)) {

            return inventoryRepository
                    .findAllByTenant_Id(
                            tenantId
                    );
        }

        return inventoryRepository
                .findByTenant_IdAndItemNameContainingIgnoreCase(
                        tenantId,
                        searchTerm.trim()
                );
    }

    // =====================================================
    // CALCULATE STATUS
    // =====================================================

    private String calculateStatus(
            Inventory inventory
    ) {

        Integer quantity =
                inventory.getQuantity();

        Integer minimumStock =
                inventory.getMinimumStock();

        if (
                quantity == null ||
                quantity <= 0
        ) {

            return "Out of Stock";
        }

        if (
                inventory.getExpiryDate() != null &&
                inventory.getExpiryDate()
                        .isBefore(LocalDate.now())
        ) {

            return "Expired";
        }

        if (
                minimumStock != null &&
                quantity <= minimumStock
        ) {

            return "Low Stock";
        }

        return "In Stock";
    }

    // =====================================================
    // NORMALIZE
    // =====================================================

    private void normalizeInventory(
            Inventory inventory
    ) {

        if (inventory.getItemName() != null) {
            inventory.setItemName(
                    inventory.getItemName().trim()
            );
        }

        if (inventory.getItemCode() != null) {
            inventory.setItemCode(
                    inventory.getItemCode()
                            .trim()
                            .toUpperCase()
            );
        }

        if (inventory.getCategory() != null) {
            inventory.setCategory(
                    inventory.getCategory().trim()
            );
        }

        if (inventory.getUnit() != null) {
            inventory.setUnit(
                    inventory.getUnit().trim()
            );
        }

        if (inventory.getDescription() != null) {
            inventory.setDescription(
                    inventory.getDescription().trim()
            );
        }

        if (inventory.getSupplier() != null) {
            inventory.setSupplier(
                    inventory.getSupplier().trim()
            );
        }

        if (inventory.getSupplierContact() != null) {
            inventory.setSupplierContact(
                    inventory.getSupplierContact().trim()
            );
        }

        if (inventory.getBatchNumber() != null) {
            inventory.setBatchNumber(
                    inventory.getBatchNumber()
                            .trim()
                            .toUpperCase()
            );
        }

        if (inventory.getStorageLocation() != null) {
            inventory.setStorageLocation(
                    inventory.getStorageLocation().trim()
            );
        }

        if (inventory.getStatus() != null) {
            inventory.setStatus(
                    inventory.getStatus().trim()
            );
        }

        if (inventory.getNotes() != null) {
            inventory.setNotes(
                    inventory.getNotes().trim()
            );
        }

        if (inventory.getQuantity() == null) {
            inventory.setQuantity(0);
        }

        if (inventory.getMinimumStock() == null) {
            inventory.setMinimumStock(0);
        }

        if (inventory.getUnitPrice() == null) {
            inventory.setUnitPrice(
                    BigDecimal.ZERO
            );
        }
    }

    // =====================================================
    // VALIDATE
    // =====================================================

    private void validateInventory(
            Inventory inventory
    ) {

        if (isBlank(inventory.getItemName())) {
            throw new IllegalArgumentException(
                    "Inventory item name is required."
            );
        }

        if (isBlank(inventory.getCategory())) {
            throw new IllegalArgumentException(
                    "Inventory category is required."
            );
        }

        if (isBlank(inventory.getUnit())) {
            throw new IllegalArgumentException(
                    "Inventory unit is required."
            );
        }

        if (
                inventory.getQuantity() == null ||
                inventory.getQuantity() < 0
        ) {
            throw new IllegalArgumentException(
                    "Inventory quantity cannot be negative."
            );
        }

        if (
                inventory.getMinimumStock() == null ||
                inventory.getMinimumStock() < 0
        ) {
            throw new IllegalArgumentException(
                    "Minimum stock cannot be negative."
            );
        }

        if (
                inventory.getMaximumStock() != null &&
                inventory.getMaximumStock() < 0
        ) {
            throw new IllegalArgumentException(
                    "Maximum stock cannot be negative."
            );
        }

        if (
                inventory.getMaximumStock() != null &&
                inventory.getMaximumStock() > 0 &&
                inventory.getMaximumStock()
                        < inventory.getMinimumStock()
        ) {
            throw new IllegalArgumentException(
                    "Maximum stock cannot be less than minimum stock."
            );
        }

        if (
                inventory.getUnitPrice() == null ||
                inventory.getUnitPrice()
                        .compareTo(BigDecimal.ZERO) < 0
        ) {
            throw new IllegalArgumentException(
                    "Unit price cannot be negative."
            );
        }
    }

    // =====================================================
    // GENERATE ID
    // =====================================================

    private String generateInventoryId(
            Long tenantId
    ) {

        List<Inventory> items =
                inventoryRepository
                        .findAllByTenant_Id(
                                tenantId
                        );

        int highestNumber = 0;

        for (Inventory inventory : items) {

            String id =
                    inventory.getId();

            if (isBlank(id)) {
                continue;
            }

            if (id.startsWith("INV-")) {

                try {

                    int number =
                            Integer.parseInt(
                                    id.substring(4)
                            );

                    highestNumber =
                            Math.max(
                                    highestNumber,
                                    number
                            );

                } catch (
                        NumberFormatException ignored
                ) {
                    // Ignore invalid IDs
                }
            }
        }

        return String.format(
                "INV-%03d",
                highestNumber + 1
        );
    }

    // =====================================================
    // GENERATE ITEM CODE
    // =====================================================

    private String generateItemCode(
            Long tenantId
    ) {

        String code;

        do {

            code =
                    "ITEM-" +
                            System.currentTimeMillis();

        } while (
                inventoryRepository
                        .existsByTenant_IdAndItemCode(
                                tenantId,
                                code
                        )
        );

        return code;
    }

    // =====================================================
    // BLANK
    // =====================================================

    private boolean isBlank(
            String value
    ) {

        return value == null ||
                value.trim().isEmpty();
    }
}