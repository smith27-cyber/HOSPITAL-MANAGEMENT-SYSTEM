// =====================================================
// INVENTORY CONTROLLER
// File:
// src/main/java/com/hms/backend/controller/InventoryController.java
// =====================================================

package com.hms.backend.controller;

import com.hms.backend.entity.Inventory;
import com.hms.backend.service.InventoryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:4200")
public class InventoryController {


    // =====================================================
    // SERVICE
    // =====================================================

    private final InventoryService inventoryService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public InventoryController(
            InventoryService inventoryService
    ) {

        this.inventoryService =
                inventoryService;

    }


    // =====================================================
    // GET ALL INVENTORY
    // GET /api/inventory
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllItems() {

        return ResponseEntity.ok(
                inventoryService.getAllItems()
        );

    }


    // =====================================================
    // GET INVENTORY ITEM BY ID
    // GET /api/inventory/{id}
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getItemById(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                inventoryService.getItemById(id)
        );

    }


    // =====================================================
    // SEARCH INVENTORY
    // GET /api/inventory/search?term=paracetamol
    // =====================================================

    @GetMapping("/search")
    public ResponseEntity<List<Inventory>> searchItems(
            @RequestParam(
                    name = "term",
                    required = false
            )
            String searchTerm
    ) {

        return ResponseEntity.ok(
                inventoryService.searchItems(
                        searchTerm
                )
        );

    }


    // =====================================================
    // ADD INVENTORY ITEM
    // POST /api/inventory
    // =====================================================

    @PostMapping
    public ResponseEntity<Inventory> addItem(
            @RequestBody Inventory inventory
    ) {

        Inventory savedInventory =
                inventoryService.addItem(
                        inventory
                );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedInventory);

    }


    // =====================================================
    // UPDATE INVENTORY ITEM
    // PUT /api/inventory/{id}
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateItem(
            @PathVariable String id,
            @RequestBody Inventory inventory
    ) {

        return ResponseEntity.ok(
                inventoryService.updateItem(
                        id,
                        inventory
                )
        );

    }


    // =====================================================
    // DELETE INVENTORY ITEM
    // DELETE /api/inventory/{id}
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable String id
    ) {

        inventoryService.deleteItem(
                id
        );


        return ResponseEntity.noContent()
                .build();

    }


    // =====================================================
    // UPDATE INVENTORY STATUS
    // PATCH /api/inventory/{id}/status
    // =====================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<Inventory> updateItemStatus(
            @PathVariable String id,
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                inventoryService.updateItemStatus(
                        id,
                        status
                )
        );

    }


    // =====================================================
    // UPDATE STOCK QUANTITY
    // PATCH /api/inventory/{id}/quantity
    // =====================================================

    @PatchMapping("/{id}/quantity")
    public ResponseEntity<Inventory> updateQuantity(
            @PathVariable String id,
            @RequestParam Integer quantity
    ) {

        return ResponseEntity.ok(
                inventoryService.updateQuantity(
                        id,
                        quantity
                )
        );

    }

}