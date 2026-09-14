package com.hms.backend.repository;

import com.hms.backend.entity.HospitalSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HospitalSettingsRepository extends JpaRepository<HospitalSettings, Long> {

    Optional<HospitalSettings> findFirstByTenant_Id(Long tenantId);

    Optional<HospitalSettings> findByIdAndTenant_Id(Long id, Long tenantId);
}