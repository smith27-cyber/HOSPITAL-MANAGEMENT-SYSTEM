package com.hms.backend.repository;

import com.hms.backend.entity.Department;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository
        extends JpaRepository<Department, String> {

    // =====================================================
    // TENANT-SCOPED DEPARTMENTS
    // =====================================================

    List<Department> findAllByTenant_Id(
            Long tenantId
    );

    Optional<Department> findByIdAndTenant_Id(
            String id,
            Long tenantId
    );

    // =====================================================
    // FIND BY CODE
    // =====================================================

    Optional<Department> findByCodeAndTenant_Id(
            String code,
            Long tenantId
    );

    // =====================================================
    // CHECK CODE
    // =====================================================

    boolean existsByCodeAndTenant_Id(
            String code,
            Long tenantId
    );

    boolean existsByCodeAndTenant_IdAndIdNot(
            String code,
            Long tenantId,
            String id
    );

    // =====================================================
    // FIND BY NAME
    // =====================================================

    Optional<Department> findByNameAndTenant_Id(
            String name,
            Long tenantId
    );

    // =====================================================
    // CHECK NAME
    // =====================================================

    boolean existsByNameAndTenant_Id(
            String name,
            Long tenantId
    );

    boolean existsByNameAndTenant_IdAndIdNot(
            String name,
            Long tenantId,
            String id
    );

    // =====================================================
    // FIND ACTIVE DEPARTMENTS
    // =====================================================

    List<Department> findByTenant_IdAndStatus(
            Long tenantId,
            String status
    );

    // =====================================================
    // COUNT BY STATUS
    // =====================================================

    long countByTenant_IdAndStatusIgnoreCase(
            Long tenantId,
            String status
    );

    // =====================================================
    // FIND LAST DEPARTMENT ID FOR CURRENT YEAR
    // =====================================================

    @Query(
            value = """
                    SELECT id
                    FROM departments
                    WHERE id LIKE
                        'DEP-' ||
                        EXTRACT(YEAR FROM CURRENT_DATE) ||
                        '-%'
                    ORDER BY id DESC
                    LIMIT 1
                    """,
            nativeQuery = true
    )
    Optional<String> findMaxIdForCurrentYear();
}