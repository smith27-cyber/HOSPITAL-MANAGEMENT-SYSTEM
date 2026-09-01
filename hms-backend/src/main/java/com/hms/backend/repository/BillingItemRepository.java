
package com.hms.backend.repository;

import com.hms.backend.entity.Billing;
import com.hms.backend.entity.BillingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * =====================================================
 * BILLING ITEM REPOSITORY
 * =====================================================
 */
@Repository
public interface BillingItemRepository
        extends JpaRepository<BillingItem, Long> {

    /**
     * Check whether a billing item already exists for
     * the same bill, reference ID and billing type.
     *
     * This prevents duplicate charges from modules such
     * as Consultation, Laboratory and Pharmacy.
     */
    boolean existsByBillingAndReferenceIdAndBillingType(
            Billing billing,
            String referenceId,
            BillingItem.BillingType billingType
    );

}

