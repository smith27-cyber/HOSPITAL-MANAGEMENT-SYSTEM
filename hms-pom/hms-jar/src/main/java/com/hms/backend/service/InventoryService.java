package com.hms.backend.service;

import com.hms.backend.entity.Inventory;

import java.util.List;

public interface InventoryService {

    // =====================================================
    // GET ALL INVENTORY ITEMS
    // =====================================================

    List<Inventory> getAllItems();


    // =====================================================
    // GET INVENTORY ITEM BY ID
    // =====================================================

    Inventory getItemById(
            String id
    );


    // =====================================================
    // ADD INVENTORY ITEM
    // =====================================================

    Inventory addItem(
            Inventory inventory
    );


    // =====================================================
    // UPDATE INVENTORY ITEM
    // =====================================================

    Inventory updateItem(
            String id,
            Inventory inventory
    );


    // =====================================================
    // DELETE INVENTORY ITEM
    // =====================================================

    void deleteItem(
            String id
    );


    // =====================================================
    // UPDATE INVENTORY STATUS
    // =====================================================

    Inventory updateItemStatus(
            String id,
            String status
    );


    // =====================================================
    // UPDATE STOCK QUANTITY
    // =====================================================

    Inventory updateQuantity(
            String id,
            Integer quantity
    );


    // =====================================================
    // SEARCH INVENTORY
    // =====================================================

    List<Inventory> searchItems(
            String searchTerm
    );

}