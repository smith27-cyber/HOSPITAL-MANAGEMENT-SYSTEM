package com.hms.backend.service.impl;

import com.hms.backend.entity.PharmacyPrescription;
import com.hms.backend.entity.PharmacyPrescriptionItem;
import com.hms.backend.repository.PharmacyPrescriptionRepository;
import com.hms.backend.service.PharmacyPrescriptionService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PharmacyPrescriptionServiceImpl
    implements PharmacyPrescriptionService {

    private final PharmacyPrescriptionRepository repository;

    public PharmacyPrescriptionServiceImpl(
        PharmacyPrescriptionRepository repository
    ) {
        this.repository = repository;
    }

    // =====================================================
    // GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyPrescription>
    getAllPrescriptions() {

        return repository.findAll();
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public PharmacyPrescription
    getPrescriptionById(
        Long id
    ) {

        return repository.findById(id)
            .orElseThrow(
                () -> new RuntimeException(
                    "Pharmacy prescription not found: " + id
                )
            );
    }

    // =====================================================
    // GET BY PATIENT
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyPrescription>
    getPrescriptionsByPatient(
        String patientId
    ) {

        return repository.findByPatientId(
            patientId
        );
    }

    // =====================================================
    // GET BY CONSULTATION
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyPrescription>
    getPrescriptionsByConsultation(
        String consultationId
    ) {

        return repository.findByConsultationId(
            consultationId
        );
    }

    // =====================================================
    // GET BY STATUS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyPrescription>
    getPrescriptionsByStatus(
        String status
    ) {

        return repository.findByStatus(
            status
        );
    }

    // =====================================================
    // CREATE
    // =====================================================

    @Override
    public PharmacyPrescription
    createPrescription(
        PharmacyPrescription prescription
    ) {

        if (
            prescription.getPatientId() == null ||
            prescription.getPatientId().isBlank()
        ) {
            throw new IllegalArgumentException(
                "Patient ID is required."
            );
        }

        if (
            prescription.getPatientName() == null ||
            prescription.getPatientName().isBlank()
        ) {
            throw new IllegalArgumentException(
                "Patient name is required."
            );
        }

        if (
            prescription.getItems() == null ||
            prescription.getItems().isEmpty()
        ) {
            throw new IllegalArgumentException(
                "At least one prescription item is required."
            );
        }

        // -------------------------------------------------
        // GENERATE PRESCRIPTION NUMBER
        // -------------------------------------------------

        if (
            prescription.getPrescriptionNumber() == null ||
            prescription.getPrescriptionNumber().isBlank()
        ) {

            prescription.setPrescriptionNumber(
                generatePrescriptionNumber()
            );
        }

        // -------------------------------------------------
        // DEFAULT STATUS
        // -------------------------------------------------

        prescription.setStatus(
            "Waiting"
        );

        prescription.setPrescriptionDate(
            LocalDateTime.now()
        );

        prescription.setCreatedAt(
            LocalDateTime.now()
        );

        // -------------------------------------------------
        // CALCULATE SUBTOTAL
        // -------------------------------------------------

        BigDecimal subtotal =
            BigDecimal.ZERO;

        for (
            PharmacyPrescriptionItem item :
            prescription.getItems()
        ) {

            if (
                item.getQuantity() == null ||
                item.getQuantity() <= 0
            ) {
                throw new IllegalArgumentException(
                    "Prescription quantity must be greater than zero."
                );
            }

            if (
                item.getUnitPrice() == null
            ) {
                item.setUnitPrice(
                    BigDecimal.ZERO
                );
            }

            if (
                item.getTotalPrice() == null
            ) {

                item.setTotalPrice(
                    item.getUnitPrice()
                        .multiply(
                            BigDecimal.valueOf(
                                item.getQuantity()
                            )
                        )
                );
            }

            subtotal =
                subtotal.add(
                    item.getTotalPrice()
                );
        }

        prescription.setSubtotal(
            subtotal
        );

        prescription.setAmountPaid(
            BigDecimal.ZERO
        );

        prescription.setBalance(
            subtotal
        );

        return repository.save(
            prescription
        );
    }

    // =====================================================
    // START PREPARING
    // =====================================================

    @Override
    public PharmacyPrescription
    startPreparing(
        Long id
    ) {

        PharmacyPrescription prescription =
            getPrescriptionById(id);

        if (
            !"Waiting".equals(
                prescription.getStatus()
            )
        ) {

            throw new IllegalStateException(
                "Only Waiting prescriptions can be prepared."
            );
        }

        prescription.setStatus(
            "Preparing"
        );

        prescription.setPreparedAt(
            LocalDateTime.now()
        );

        prescription.setUpdatedAt(
            LocalDateTime.now()
        );

        return repository.save(
            prescription
        );
    }

    // =====================================================
    // SEND TO BILLING
    // =====================================================

    @Override
    public PharmacyPrescription
    sendToBilling(
        Long id
    ) {

        PharmacyPrescription prescription =
            getPrescriptionById(id);

        if (
            !"Preparing".equals(
                prescription.getStatus()
            )
        ) {

            throw new IllegalStateException(
                "Only Preparing prescriptions can be sent to billing."
            );
        }

        prescription.setStatus(
            "Awaiting Payment"
        );

        prescription.setUpdatedAt(
            LocalDateTime.now()
        );

        return repository.save(
            prescription
        );
    }

    // =====================================================
    // CHECK PAYMENT
    // =====================================================

    @Override
    public PharmacyPrescription
    checkPayment(
        Long id
    ) {

        PharmacyPrescription prescription =
            getPrescriptionById(id);

        if (
            prescription.getBillingStatus() == null
        ) {

            throw new IllegalStateException(
                "No billing status is associated with this prescription."
            );
        }

        if (
            "Paid".equalsIgnoreCase(
                prescription.getBillingStatus()
            )
        ) {

            prescription.setAmountPaid(
                prescription.getSubtotal()
            );

            prescription.setBalance(
                BigDecimal.ZERO
            );

            prescription.setStatus(
                "Ready for Pickup"
            );

            prescription.setPaymentDate(
                LocalDateTime.now()
            );

        }

        prescription.setUpdatedAt(
            LocalDateTime.now()
        );

        return repository.save(
            prescription
        );
    }

    // =====================================================
    // DISPENSE
    // =====================================================

    @Override
    public PharmacyPrescription
    dispense(
        Long id,
        String dispensedBy
    ) {

        PharmacyPrescription prescription =
            getPrescriptionById(id);

        if (
            !"Ready for Pickup".equals(
                prescription.getStatus()
            )
        ) {

            throw new IllegalStateException(
                "Only prescriptions Ready for Pickup can be dispensed."
            );
        }

        prescription.setStatus(
            "Dispensed"
        );

        prescription.setDispensedAt(
            LocalDateTime.now()
        );

        prescription.setDispensedBy(
            dispensedBy != null &&
            !dispensedBy.isBlank()
                ? dispensedBy
                : "Pharmacist"
        );

        prescription.setUpdatedAt(
            LocalDateTime.now()
        );

        return repository.save(
            prescription
        );
    }

    // =====================================================
    // CANCEL
    // =====================================================

    @Override
    public PharmacyPrescription
    cancelPrescription(
        Long id
    ) {

        PharmacyPrescription prescription =
            getPrescriptionById(id);

        if (
            "Dispensed".equals(
                prescription.getStatus()
            )
        ) {

            throw new IllegalStateException(
                "A dispensed prescription cannot be cancelled."
            );
        }

        prescription.setStatus(
            "Cancelled"
        );

        prescription.setUpdatedAt(
            LocalDateTime.now()
        );

        return repository.save(
            prescription
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @Override
    public void deletePrescription(
        Long id
    ) {

        PharmacyPrescription prescription =
            getPrescriptionById(id);

        if (
            "Dispensed".equals(
                prescription.getStatus()
            )
        ) {

            throw new IllegalStateException(
                "A dispensed prescription cannot be deleted."
            );
        }

        repository.delete(
            prescription
        );
    }

    // =====================================================
    // GENERATE PRESCRIPTION NUMBER
    // =====================================================

    private String
    generatePrescriptionNumber() {

        String number;

        do {

            number =
                "RX-" +
                LocalDateTime.now()
                    .getYear() +
                "-" +
                String.format(
                    "%05d",
                    (int)
                    (Math.random() * 100000)
                );

        } while (
            repository.existsByPrescriptionNumber(
                number
            )
        );

        return number;
    }
}