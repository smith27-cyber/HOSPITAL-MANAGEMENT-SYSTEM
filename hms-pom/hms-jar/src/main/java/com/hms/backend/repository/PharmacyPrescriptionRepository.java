package com.hms.backend.repository;

import com.hms.backend.dto.ReportPharmacyTotals;
import com.hms.backend.entity.PharmacyPrescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyPrescriptionRepository
    extends JpaRepository<PharmacyPrescription, Long> {

    // =====================================================
    // EXISTING METHODS
    // =====================================================

    List<PharmacyPrescription> findAllByTenant_Id(Long tenantId);

    Optional<PharmacyPrescription> findByIdAndTenant_Id(
        Long id,
        Long tenantId
    );

    long countByTenant_IdAndPrescriptionDateGreaterThanEqualAndPrescriptionDateLessThan(
        Long tenantId,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime
    );

    List<PharmacyPrescription> findByTenant_IdAndPatientId(
        Long tenantId,
        String patientId
    );

    List<PharmacyPrescription> findByTenant_IdAndConsultationId(
        Long tenantId,
        String consultationId
    );

    Optional<PharmacyPrescription>
    findFirstByTenant_IdAndConsultationIdOrderByIdDesc(
        Long tenantId,
        String consultationId
    );

    List<PharmacyPrescription> findByTenant_IdAndStatus(
        Long tenantId,
        String status
    );

    long countByTenant_IdAndStatusIgnoreCase(
        Long tenantId,
        String status
    );

    Optional<PharmacyPrescription>
    findByTenant_IdAndPrescriptionNumber(
        Long tenantId,
        String prescriptionNumber
    );

    boolean existsByTenant_IdAndPrescriptionNumber(
        Long tenantId,
        String prescriptionNumber
    );

    // =====================================================
    // REPORTING
    // =====================================================

    /**
     * Pharmacy financial totals for the current tenant.
     *
     * Important:
     * - tenant is explicitly restricted
     * - cancelled statuses are NOT assumed here because
     *   the application currently stores status as String
     * - the report therefore uses the actual financial records
     *   within the selected period
     */
    @Query("""
        SELECT new com.hms.backend.dto.ReportPharmacyTotals(
            COUNT(p),
            COALESCE(SUM(p.subtotal), 0),
            COALESCE(SUM(p.amountPaid), 0),
            COALESCE(SUM(p.balance), 0)
        )
        FROM PharmacyPrescription p
        WHERE p.tenant.id = :tenantId
          AND p.prescriptionDate >= :startDateTime
          AND p.prescriptionDate < :endDateTime
        """)
    ReportPharmacyTotals getReportTotals(
        @Param("tenantId") Long tenantId,
        @Param("startDateTime") LocalDateTime startDateTime,
        @Param("endDateTime") LocalDateTime endDateTime
    );

    /**
     * Aggregate pharmacy item quantities and revenue.
     *
     * PharmacyPrescription.items is an @ElementCollection,
     * therefore JPQL can aggregate directly over it.
     */
    @Query("""
        SELECT
            i.medicineName,
            COALESCE(SUM(i.quantity), 0),
            COALESCE(SUM(i.totalPrice), 0)
        FROM PharmacyPrescription p
        JOIN p.items i
        WHERE p.tenant.id = :tenantId
          AND p.prescriptionDate >= :startDateTime
          AND p.prescriptionDate < :endDateTime
        GROUP BY i.medicineName
        ORDER BY SUM(i.totalPrice) DESC
        """)
    List<Object[]> getTopMedicines(
        @Param("tenantId") Long tenantId,
        @Param("startDateTime") LocalDateTime startDateTime,
        @Param("endDateTime") LocalDateTime endDateTime
    );

    /**
     * Total number of pharmacy items prescribed during
     * the selected reporting period.
     */
    @Query("""
        SELECT COALESCE(SUM(i.quantity), 0)
        FROM PharmacyPrescription p
        JOIN p.items i
        WHERE p.tenant.id = :tenantId
          AND p.prescriptionDate >= :startDateTime
          AND p.prescriptionDate < :endDateTime
        """)
    Long getTotalItemQuantity(
        @Param("tenantId") Long tenantId,
        @Param("startDateTime") LocalDateTime startDateTime,
        @Param("endDateTime") LocalDateTime endDateTime
    );
}