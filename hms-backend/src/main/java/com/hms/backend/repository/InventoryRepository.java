package com.hms.backend.repository;

import com.hms.backend.entity.Inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository
        extends JpaRepository<Inventory, String> {

    // =====================================================
    // FIND BY ITEM CODE
    // =====================================================

    Optional<Inventory>
    findByItemCode(
            String itemCode
    );


    // =====================================================
    // CHECK ITEM CODE
    // =====================================================

    boolean existsByItemCode(
            String itemCode
    );


    // =====================================================
    // FIND ITEM BY CODE EXCLUDING ID
    // =====================================================

    Optional<Inventory>
    findByItemCodeAndIdNot(
            String itemCode,
            String id
    );


    // =====================================================
    // SEARCH BY ITEM NAME
    // =====================================================

    List<Inventory>
    findByItemNameContainingIgnoreCase(
            String itemName
    );


    // =====================================================
    // FIND BY CATEGORY
    // =====================================================

    List<Inventory>
    findByCategoryIgnoreCase(
            String category
    );


    // =====================================================
    // FIND BY STATUS
    // =====================================================

    List<Inventory>
    findByStatusIgnoreCase(
            String status
    );


    // =====================================================
    // FIND BY SUPPLIER
    // =====================================================

    List<Inventory>
    findBySupplierContainingIgnoreCase(
            String supplier
    );


    // =====================================================
    // LOW STOCK
    // =====================================================
    //
    // Finds items where:
    //
    // quantity <= minimumStock
    //
    // =====================================================

    @Query("""
        SELECT COUNT(i)
        FROM Inventory i
        WHERE i.quantity <= i.minimumStock
    """)
    long countLowStockItems();


    // =====================================================
    // EXPIRING ITEMS
    // =====================================================
    //
    // Items expiring between today and the specified date.
    //
    // =====================================================

    @Query("""
        SELECT COUNT(i)
        FROM Inventory i
        WHERE i.expiryDate IS NOT NULL
        AND i.expiryDate >= :today
        AND i.expiryDate <= :expiryDate
    """)
    long countExpiringItems(
            @Param("today") LocalDate today,
            @Param("expiryDate") LocalDate expiryDate
    );
}