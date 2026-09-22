// =====================================================
// INVENTORY SERVICE IMPLEMENTATION
// File:
// src/main/java/com/hms/backend/service/impl/InventoryServiceImpl.java
// =====================================================

package com.hms.backend.service.impl;

import com.hms.backend.entity.Inventory;
import com.hms.backend.repository.InventoryRepository;
import com.hms.backend.service.InventoryService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class InventoryServiceImpl
        implements InventoryService {

    private final InventoryRepository inventoryRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public InventoryServiceImpl(
            InventoryRepository inventoryRepository
    ) {

        this.inventoryRepository =
                inventoryRepository;

    }


    // =====================================================
    // GET ALL INVENTORY ITEMS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Inventory> getAllItems() {

        return inventoryRepository.findAll();

    }


    // =====================================================
    // GET INVENTORY ITEM BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Inventory getItemById(
            String id
    ) {

        return inventoryRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inventory item not found with ID: "
                                        + id
                        )
                );

    }


    // =====================================================
    // ADD INVENTORY ITEM
    // =====================================================

    @Override
    public Inventory addItem(
            Inventory inventory
    ) {

        // -------------------------------------------------
        // NORMALIZE
        // -------------------------------------------------

        normalizeInventory(
                inventory
        );


        // -------------------------------------------------
        // VALIDATE
        // -------------------------------------------------

        validateInventory(
                inventory
        );


        // -------------------------------------------------
        // GENERATE ID
        // -------------------------------------------------

        if (
                isBlank(
                        inventory.getId()
                )
        ) {

            inventory.setId(
                    generateInventoryId()
            );

        }


        // -------------------------------------------------
        // GENERATE ITEM CODE
        // -------------------------------------------------

        if (
                isBlank(
                        inventory.getItemCode()
                )
        ) {

            inventory.setItemCode(
                    generateItemCode()
            );

        }


        // -------------------------------------------------
        // CHECK DUPLICATE ITEM CODE
        // -------------------------------------------------

        if (
                inventoryRepository
                        .existsByItemCode(
                                inventory.getItemCode()
                        )
        ) {

            throw new RuntimeException(
                    "Inventory item with item code already exists: "
                            + inventory.getItemCode()
            );

        }


        // -------------------------------------------------
        // CALCULATE STATUS
        // -------------------------------------------------

        inventory.setStatus(
                calculateStatus(
                        inventory
                )
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return inventoryRepository.save(
                inventory
        );

    }


    // =====================================================
    // UPDATE INVENTORY ITEM
    // =====================================================

    @Override
    public Inventory updateItem(
            String id,
            Inventory updatedInventory
    ) {

        // -------------------------------------------------
        // FIND EXISTING ITEM
        // -------------------------------------------------

        Inventory existingInventory =
                getItemById(id);


        // -------------------------------------------------
        // NORMALIZE
        // -------------------------------------------------

        normalizeInventory(
                updatedInventory
        );


        // -------------------------------------------------
        // VALIDATE
        // -------------------------------------------------

        validateInventory(
                updatedInventory
        );


        // -------------------------------------------------
        // CHECK ITEM CODE
        // -------------------------------------------------

        if (
                !isBlank(
                        updatedInventory.getItemCode()
                )
        ) {

            inventoryRepository
                    .findByItemCodeAndIdNot(
                            updatedInventory.getItemCode(),
                            id
                    )
                    .ifPresent(
                            existingWithCode -> {

                                throw new RuntimeException(
                                        "Another inventory item already uses item code: "
                                                + updatedInventory.getItemCode()
                                );

                            }
                    );

        }


        // -------------------------------------------------
        // BASIC INFORMATION
        // -------------------------------------------------

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


        // -------------------------------------------------
        // STOCK INFORMATION
        // -------------------------------------------------

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


        // -------------------------------------------------
        // SUPPLIER INFORMATION
        // -------------------------------------------------

        existingInventory.setSupplier(
                updatedInventory.getSupplier()
        );


        existingInventory.setSupplierContact(
                updatedInventory.getSupplierContact()
        );


        // -------------------------------------------------
        // BATCH / EXPIRY
        // -------------------------------------------------

        existingInventory.setBatchNumber(
                updatedInventory.getBatchNumber()
        );


        existingInventory.setExpiryDate(
                updatedInventory.getExpiryDate()
        );


        // -------------------------------------------------
        // STORAGE
        // -------------------------------------------------

        existingInventory.setStorageLocation(
                updatedInventory.getStorageLocation()
        );


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        existingInventory.setStatus(
                calculateStatus(
                        updatedInventory
                )
        );


        // -------------------------------------------------
        // NOTES
        // -------------------------------------------------

        existingInventory.setNotes(
                updatedInventory.getNotes()
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return inventoryRepository.save(
                existingInventory
        );

    }


    // =====================================================
    // DELETE INVENTORY ITEM
    // =====================================================

    @Override
    public void deleteItem(
            String id
    ) {

        if (
                !inventoryRepository.existsById(id)
        ) {

            throw new RuntimeException(
                    "Inventory item not found with ID: "
                            + id
            );

        }


        inventoryRepository.deleteById(
                id
        );

    }


    // =====================================================
    // UPDATE INVENTORY STATUS
    // =====================================================

    @Override
    public Inventory updateItemStatus(
            String id,
            String status
    ) {

        // -------------------------------------------------
        // VALIDATE STATUS
        // -------------------------------------------------

        if (
                isBlank(status)
        ) {

            throw new RuntimeException(
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

            throw new RuntimeException(
                    "Invalid inventory status. "
                            + "Allowed values: In Stock, Low Stock, "
                            + "Out of Stock, Expired, Discontinued."
            );

        }


        // -------------------------------------------------
        // FIND ITEM
        // -------------------------------------------------

        Inventory inventory =
                getItemById(id);


        // -------------------------------------------------
        // UPDATE STATUS
        // -------------------------------------------------

        inventory.setStatus(
                status
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return inventoryRepository.save(
                inventory
        );

    }


    // =====================================================
    // UPDATE STOCK QUANTITY
    // =====================================================

    @Override
    public Inventory updateQuantity(
            String id,
            Integer quantity
    ) {

        // -------------------------------------------------
        // VALIDATE QUANTITY
        // -------------------------------------------------

        if (
                quantity == null ||
                quantity < 0
        ) {

            throw new RuntimeException(
                    "Inventory quantity cannot be negative."
            );

        }


        // -------------------------------------------------
        // FIND ITEM
        // -------------------------------------------------

        Inventory inventory =
                getItemById(id);


        // -------------------------------------------------
        // UPDATE QUANTITY
        // -------------------------------------------------

        inventory.setQuantity(
                quantity
        );


        // -------------------------------------------------
        // RECALCULATE STATUS
        // -------------------------------------------------

        inventory.setStatus(
                calculateStatus(
                        inventory
                )
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return inventoryRepository.save(
                inventory
        );

    }


    // =====================================================
    // SEARCH INVENTORY
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Inventory> searchItems(
            String searchTerm
    ) {

        if (
                isBlank(searchTerm)
        ) {

            return inventoryRepository.findAll();

        }


        return inventoryRepository
                .findByItemNameContainingIgnoreCase(
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


        // -------------------------------------------------
        // OUT OF STOCK
        // -------------------------------------------------

        if (
                quantity == null ||
                quantity <= 0
        ) {

            return "Out of Stock";

        }


        // -------------------------------------------------
        // EXPIRY
        // -------------------------------------------------

        if (
                inventory.getExpiryDate() != null &&
                inventory.getExpiryDate()
                        .isBefore(
                                LocalDate.now()
                        )
        ) {

            return "Expired";

        }


        // -------------------------------------------------
        // LOW STOCK
        // -------------------------------------------------

        if (
                minimumStock != null &&
                quantity <= minimumStock
        ) {

            return "Low Stock";

        }


        // -------------------------------------------------
        // IN STOCK
        // -------------------------------------------------

        return "In Stock";

    }


    // =====================================================
    // NORMALIZE INVENTORY
    // =====================================================

    private void normalizeInventory(
            Inventory inventory
    ) {

        if (
                inventory.getItemName() != null
        ) {

            inventory.setItemName(
                    inventory.getItemName().trim()
            );

        }


        if (
                inventory.getItemCode() != null
        ) {

            inventory.setItemCode(
                    inventory.getItemCode()
                            .trim()
                            .toUpperCase()
            );

        }


        if (
                inventory.getCategory() != null
        ) {

            inventory.setCategory(
                    inventory.getCategory().trim()
            );

        }


        if (
                inventory.getUnit() != null
        ) {

            inventory.setUnit(
                    inventory.getUnit().trim()
            );

        }


        if (
                inventory.getDescription() != null
        ) {

            inventory.setDescription(
                    inventory.getDescription().trim()
            );

        }


        if (
                inventory.getSupplier() != null
        ) {

            inventory.setSupplier(
                    inventory.getSupplier().trim()
            );

        }


        if (
                inventory.getSupplierContact() != null
        ) {

            inventory.setSupplierContact(
                    inventory.getSupplierContact().trim()
            );

        }


        if (
                inventory.getBatchNumber() != null
        ) {

            inventory.setBatchNumber(
                    inventory.getBatchNumber()
                            .trim()
                            .toUpperCase()
            );

        }


        if (
                inventory.getStorageLocation() != null
        ) {

            inventory.setStorageLocation(
                    inventory.getStorageLocation().trim()
            );

        }


        if (
                inventory.getStatus() != null
        ) {

            inventory.setStatus(
                    inventory.getStatus().trim()
            );

        }


        if (
                inventory.getNotes() != null
        ) {

            inventory.setNotes(
                    inventory.getNotes().trim()
            );

        }


        // -------------------------------------------------
        // DEFAULT NUMBERS
        // -------------------------------------------------

        if (
                inventory.getQuantity() == null
        ) {

            inventory.setQuantity(0);

        }


        if (
                inventory.getMinimumStock() == null
        ) {

            inventory.setMinimumStock(0);

        }


        if (
                inventory.getUnitPrice() == null
        ) {

            inventory.setUnitPrice(
                    BigDecimal.ZERO
            );

        }

    }


    // =====================================================
    // VALIDATE INVENTORY
    // =====================================================

    private void validateInventory(
            Inventory inventory
    ) {

        // -------------------------------------------------
        // ITEM NAME
        // -------------------------------------------------

        if (
                isBlank(
                        inventory.getItemName()
                )
        ) {

            throw new RuntimeException(
                    "Inventory item name is required."
            );

        }


        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------

        if (
                isBlank(
                        inventory.getCategory()
                )
        ) {

            throw new RuntimeException(
                    "Inventory category is required."
            );

        }


        // -------------------------------------------------
        // UNIT
        // -------------------------------------------------

        if (
                isBlank(
                        inventory.getUnit()
                )
        ) {

            throw new RuntimeException(
                    "Inventory unit is required."
            );

        }


        // -------------------------------------------------
        // QUANTITY
        // -------------------------------------------------

        if (
                inventory.getQuantity() == null ||
                inventory.getQuantity() < 0
        ) {

            throw new RuntimeException(
                    "Inventory quantity cannot be negative."
            );

        }


        // -------------------------------------------------
        // MINIMUM STOCK
        // -------------------------------------------------

        if (
                inventory.getMinimumStock() == null ||
                inventory.getMinimumStock() < 0
        ) {

            throw new RuntimeException(
                    "Minimum stock cannot be negative."
            );

        }


        // -------------------------------------------------
        // MAXIMUM STOCK
        // -------------------------------------------------

        if (
                inventory.getMaximumStock() != null &&
                inventory.getMaximumStock() < 0
        ) {

            throw new RuntimeException(
                    "Maximum stock cannot be negative."
            );

        }


        if (
                inventory.getMaximumStock() != null &&
                inventory.getMaximumStock() > 0 &&
                inventory.getMaximumStock()
                        < inventory.getMinimumStock()
        ) {

            throw new RuntimeException(
                    "Maximum stock cannot be less than minimum stock."
            );

        }


        // -------------------------------------------------
        // UNIT PRICE
        // -------------------------------------------------

        if (
                inventory.getUnitPrice() == null ||
                inventory.getUnitPrice()
                        .compareTo(BigDecimal.ZERO) < 0
        ) {

            throw new RuntimeException(
                    "Unit price cannot be negative."
            );

        }

    }


    // =====================================================
    // GENERATE INVENTORY ID
    // =====================================================

    private String generateInventoryId() {

        List<Inventory> inventoryList =
                inventoryRepository.findAll();


        int highestNumber = 0;


        for (
                Inventory inventory :
                inventoryList
        ) {

            String id =
                    inventory.getId();


            if (
                    isBlank(id)
            ) {

                continue;

            }


            if (
                    id.startsWith("INV-")
            ) {

                try {

                    String numberPart =
                            id.substring(4);


                    int number =
                            Integer.parseInt(
                                    numberPart
                            );


                    if (
                            number > highestNumber
                    ) {

                        highestNumber =
                                number;
                    }

                } catch (
                        NumberFormatException ignored
                ) {

                    // Ignore invalid IDs.

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

private String generateItemCode() {

    String code;

    do {

        code =
                "ITEM-" +
                System.currentTimeMillis();

    } while (
            inventoryRepository
                    .existsByItemCode(
                            code
                    )
    );


    return code;

}
    // =====================================================
    // CHECK BLANK
    // =====================================================

    private boolean isBlank(
            String value
    ) {

        return value == null ||
                value.trim().isEmpty();

    }

}