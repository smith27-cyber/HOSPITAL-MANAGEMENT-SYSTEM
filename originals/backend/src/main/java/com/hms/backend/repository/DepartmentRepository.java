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
    // FIND BY CODE
    // =====================================================

    Optional<Department> findByCode(
            String code
    );


    // =====================================================
    // CHECK CODE
    // =====================================================

    boolean existsByCode(
            String code
    );


    // =====================================================
    // FIND BY NAME
    // =====================================================

    Optional<Department> findByName(
            String name
    );


    // =====================================================
    // CHECK NAME
    // =====================================================

    boolean existsByName(
            String name
    );


    // =====================================================
    // FIND ACTIVE DEPARTMENTS
    // =====================================================

    List<Department> findByStatus(
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