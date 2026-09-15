package com.hms.backend.platform.repository;

import com.hms.backend.platform.entity.Subscription;
import com.hms.backend.platform.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findAllByOrderByStartDateDesc();
    List<Subscription> findAllByStatusOrderByStartDateDesc(SubscriptionStatus status);
    Optional<Subscription> findFirstByTenant_IdOrderByStartDateDesc(Long tenantId);
}
