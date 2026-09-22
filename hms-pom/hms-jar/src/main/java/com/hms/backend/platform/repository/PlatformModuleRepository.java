package com.hms.backend.platform.repository;

import com.hms.backend.platform.entity.ModuleCode;
import com.hms.backend.platform.entity.PlatformModule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PlatformModuleRepository extends JpaRepository<PlatformModule, Long> {
    Optional<PlatformModule> findByCode(ModuleCode code);
    boolean existsByCode(ModuleCode code);
}
