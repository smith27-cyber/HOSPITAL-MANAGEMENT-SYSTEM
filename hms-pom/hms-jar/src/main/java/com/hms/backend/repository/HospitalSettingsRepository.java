// =====================================================
// HOSPITAL SETTINGS REPOSITORY
// File:
// src/main/java/com/hms/backend/repository/HospitalSettingsRepository.java
// =====================================================

package com.hms.backend.repository;

import com.hms.backend.entity.HospitalSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HospitalSettingsRepository
        extends JpaRepository<HospitalSettings, Long> {

    // =====================================================
    // GET SETTINGS FOR CURRENT TENANT
    // =====================================================

    Optional<HospitalSettings>
    findFirstByTenant_IdOrderByIdAsc(
            Long tenantId
    );


    // =====================================================
    // GET SPECIFIC SETTINGS FOR CURRENT TENANT
    // =====================================================

    Optional<HospitalSettings>
    findByIdAndTenant_Id(
            Long id,
            Long tenantId
    );
}