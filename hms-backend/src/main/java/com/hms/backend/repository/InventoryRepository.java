package com.hms.backend.repository;

import com.hms.backend.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository
    extends JpaRepository<Inventory, String> {

    List<Inventory> findAllByTenant_Id(Long tenantId);

    Optional<Inventory> findByIdAndTenant_Id(
        String id,
        Long tenantId
    );

    long countByTenant_Id(Long tenantId);

    Optional<Inventory> findByTenant_IdAndItemCode(
        Long tenantId,
        String itemCode
    );

    boolean existsByTenant_IdAndItemCode(
        Long tenantId,
        String itemCode
    );

    Optional<Inventory> findByTenant_IdAndItemCodeAndIdNot(
        Long tenantId,
        String itemCode,
        String id
    );

    List<Inventory> findByTenant_IdAndItemNameContainingIgnoreCase(
        Long tenantId,
        String itemName
    );

    List<Inventory> findByTenant_IdAndCategoryIgnoreCase(
        Long tenantId,
        String category
    );

    List<Inventory> findByTenant_IdAndStatusIgnoreCase(
        Long tenantId,
        String status
    );

    List<Inventory> findByTenant_IdAndSupplierContainingIgnoreCase(
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
          AND i.quantity > 0
          AND i.quantity <= i.minimumStock
        """)
    long countLowStockItems(
        @Param("tenantId") Long tenantId
    );

    // =====================================================
    // OUT OF STOCK
    // =====================================================

    @Query("""
        SELECT COUNT(i)
        FROM Inventory i
        WHERE i.tenant.id = :tenantId
          AND i.quantity <= 0
        """)
    long countOutOfStockItems(
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

    // =====================================================
    // STOCK VALUE
    // =====================================================

    @Query("""
        SELECT COALESCE(
            SUM(
                i.quantity * i.unitPrice
            ),
            0
        )
        FROM Inventory i
        WHERE i.tenant.id = :tenantId
        """)
    BigDecimal getTotalStockValue(
        @Param("tenantId") Long tenantId
    );
}