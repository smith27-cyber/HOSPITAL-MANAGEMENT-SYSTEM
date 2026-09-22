package com.hms.backend.settings.repository;

import com.hms.backend.settings.entity.SystemPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemPreferencesRepository
        extends JpaRepository<SystemPreferences, Long> {

    Optional<SystemPreferences>
    findFirstByTenant_IdOrderByIdAsc(Long tenantId);

    Optional<SystemPreferences>
    findByIdAndTenant_Id(
        Long id,
        Long tenantId
    );
}