package com.hms.backend.platform.repository;

import com.hms.backend.platform.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    Optional<Plan> findByCode(String code);
    boolean existsByCode(String code);
}
