package com.hms.backend.repository;

import com.hms.backend.entity.Billing;
import com.hms.backend.entity.BillingItem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillingItemRepository
        extends JpaRepository<BillingItem, Long> {

    boolean existsByBillingAndReferenceIdAndBillingType(
            Billing billing,
            String referenceId,
            BillingItem.BillingType billingType
    );
}