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
    // TENANT
    // =====================================================

    List<Inventory> findAllByTenant_Id(
            Long tenantId
    );

    Optional<Inventory> findByIdAndTenant_Id(
            String id,
            Long tenantId
    );

    // =====================================================
    // ITEM CODE
    // =====================================================

    Optional<Inventory> findByTenant_IdAndItemCode(
            Long tenantId,
            String itemCode
    );

    boolean existsByTenant_IdAndItemCode(
            Long tenantId,
            String itemCode
    );

    Optional<Inventory>
    findByTenant_IdAndItemCodeAndIdNot(
            Long tenantId,
            String itemCode,
            String id
    );

    // =====================================================
    // SEARCH
    // =====================================================

    List<Inventory>
    findByTenant_IdAndItemNameContainingIgnoreCase(
            Long tenantId,
            String itemName
    );

    // =====================================================
    // CATEGORY
    // =====================================================

    List<Inventory>
    findByTenant_IdAndCategoryIgnoreCase(
            Long tenantId,
            String category
    );

    // =====================================================
    // STATUS
    // =====================================================

    List<Inventory>
    findByTenant_IdAndStatusIgnoreCase(
            Long tenantId,
            String status
    );

    // =====================================================
    // SUPPLIER
    // =====================================================

    List<Inventory>
    findByTenant_IdAndSupplierContainingIgnoreCase(
            Long tenantId,
            String supplier
    );

    // =====================================================
    // LOW STOCK
    // =====================================================

    @Query("""
        SELECT COUNT(i)
        FROM Inventory i
        WHERE i.tenant.id = :tenantId
        AND i.quantity <= i.minimumStock
    """)
    long countLowStockItems(
            @Param("tenantId") Long tenantId
    );

    // =====================================================
    // EXPIRING ITEMS
    // =====================================================

    @Query("""
        SELECT COUNT(i)
        FROM Inventory i
        WHERE i.tenant.id = :tenantId
        AND i.expiryDate IS NOT NULL
        AND i.expiryDate >= :today
        AND i.expiryDate <= :expiryDate
    """)
    long countExpiringItems(
            @Param("tenantId") Long tenantId,
            @Param("today") LocalDate today,
            @Param("expiryDate") LocalDate expiryDate
    );
}