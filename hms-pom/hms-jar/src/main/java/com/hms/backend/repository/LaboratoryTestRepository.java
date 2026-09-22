package com.hms.backend.repository;

import com.hms.backend.entity.LaboratoryTest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LaboratoryTestRepository
                extends JpaRepository<LaboratoryTest, Long> {

        // =====================================================
        // TENANT
        // =====================================================

        List<LaboratoryTest> findAllByTenant_Id(
                        Long tenantId);

        Optional<LaboratoryTest> findByIdAndTenant_Id(
                        Long id,
                        Long tenantId);
}