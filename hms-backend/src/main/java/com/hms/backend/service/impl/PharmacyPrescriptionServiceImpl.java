package com.hms.backend.service.impl;

import com.hms.backend.entity.Consultation;
import com.hms.backend.entity.PharmacyPrescription;
import com.hms.backend.entity.PharmacyPrescriptionItem;

import com.hms.backend.repository.ConsultationRepository;
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

    private final ConsultationRepository consultationRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PharmacyPrescriptionServiceImpl(
            PharmacyPrescriptionRepository repository,
            ConsultationRepository consultationRepository
    ) {

        this.repository =
                repository;

        this.consultationRepository =
                consultationRepository;
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
                        () ->
                                new RuntimeException(
                                        "Pharmacy prescription not found: "
                                                + id
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

        if (
                patientId == null ||
                patientId.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );
        }

        return repository.findByPatientId(
                patientId.trim()
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

        if (
                consultationId == null ||
                consultationId.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Consultation ID is required."
            );
        }

        return repository.findByConsultationId(
                consultationId.trim()
        );
    }


    // =====================================================
    // GET CURRENT PRESCRIPTION BY CONSULTATION
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public PharmacyPrescription
    getPrescriptionByConsultation(
            String consultationId
    ) {

        if (
                consultationId == null ||
                consultationId.isBlank()
        ) {

            return null;
        }

        return repository
                .findFirstByConsultationIdOrderByIdDesc(
                        consultationId.trim()
                )
                .orElse(null);
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

        if (
                status == null ||
                status.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Prescription status is required."
            );
        }

        return repository.findByStatus(
                status.trim()
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

        if (prescription == null) {

            throw new IllegalArgumentException(
                    "Prescription cannot be null."
            );
        }


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


        String consultationId =
                clean(
                        prescription.getConsultationId()
                );


        prescription.setConsultationId(
                consultationId
        );


        // =================================================
        // CONSULTATION VALIDATION
        // =================================================

        if (consultationId != null) {

            Consultation consultation =
                    consultationRepository
                            .findById(
                                    consultationId
                            )
                            .orElseThrow(
                                    () ->
                                            new IllegalArgumentException(
                                                    "Consultation not found: "
                                                            + consultationId
                                            )
                            );


            if (
                    consultation.getStatus() ==
                            Consultation.ConsultationStatus.COMPLETED
            ) {

                throw new IllegalStateException(
                        "A prescription cannot be added to a completed consultation."
                );
            }


            if (
                    consultation.getStatus() ==
                            Consultation.ConsultationStatus.CANCELLED
            ) {

                throw new IllegalStateException(
                        "A prescription cannot be added to a cancelled consultation."
                );
            }


            // =================================================
            // PREVENT DUPLICATE ACTIVE PRESCRIPTION
            // =================================================

            PharmacyPrescription existing =
                    repository
                            .findFirstByConsultationIdOrderByIdDesc(
                                    consultationId
                            )
                            .orElse(null);


            if (
                    existing != null &&
                    !"Cancelled".equalsIgnoreCase(
                            existing.getStatus()
                    )
            ) {

                throw new IllegalStateException(
                        "An active pharmacy prescription already exists for consultation: "
                                + consultationId
                );
            }
        }


        // =================================================
        // PRESCRIPTION NUMBER
        // =================================================

        if (
                prescription.getPrescriptionNumber() == null ||
                prescription.getPrescriptionNumber().isBlank()
        ) {

            prescription.setPrescriptionNumber(
                    generatePrescriptionNumber()
            );
        }


        LocalDateTime now =
                LocalDateTime.now();


        prescription.setStatus(
                "Waiting"
        );


        prescription.setPrescriptionDate(
                now
        );


        if (
                prescription.getCreatedAt() == null
        ) {

            prescription.setCreatedAt(
                    now
            );
        }


        BigDecimal subtotal =
                calculateSubtotal(
                        prescription
                );


        prescription.setSubtotal(
                subtotal
        );


        prescription.setAmountPaid(
                BigDecimal.ZERO
        );


        prescription.setBalance(
                subtotal
        );


        PharmacyPrescription saved =
                repository.save(
                        prescription
                );


        synchronizeConsultationPrescriptionFlag(
                saved.getConsultationId()
        );


        return saved;
    }


    // =====================================================
    // UPDATE
    // =====================================================

    @Override
    public PharmacyPrescription
    updatePrescription(
            Long id,
            PharmacyPrescription prescription
    ) {

        if (prescription == null) {

            throw new IllegalArgumentException(
                    "Prescription cannot be null."
            );
        }


        PharmacyPrescription existing =
                getPrescriptionById(id);


        // =================================================
        // ONLY WAITING MAY BE MODIFIED
        // =================================================

        if (
                !"Waiting".equalsIgnoreCase(
                        existing.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "Only Waiting prescriptions can be modified."
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


        // =================================================
        // CONSULTATION
        // =================================================

        String consultationId =
                clean(
                        prescription.getConsultationId()
                );


        if (consultationId != null) {

            Consultation consultation =
                    consultationRepository
                            .findById(
                                    consultationId
                            )
                            .orElseThrow(
                                    () ->
                                            new IllegalArgumentException(
                                                    "Consultation not found: "
                                                            + consultationId
                                            )
                            );


            if (
                    consultation.getStatus() ==
                            Consultation.ConsultationStatus.COMPLETED
            ) {

                throw new IllegalStateException(
                        "A prescription cannot be modified for a completed consultation."
                );
            }


            if (
                    consultation.getStatus() ==
                            Consultation.ConsultationStatus.CANCELLED
            ) {

                throw new IllegalStateException(
                        "A prescription cannot be modified for a cancelled consultation."
                );
            }
        }


        // =================================================
        // BASIC INFORMATION
        // =================================================

        existing.setPatientId(
                clean(
                        prescription.getPatientId()
                )
        );


        existing.setPatientName(
                clean(
                        prescription.getPatientName()
                )
        );


        existing.setPatientNumber(
                clean(
                        prescription.getPatientNumber()
                )
        );


        existing.setConsultationId(
                consultationId
        );


        existing.setDoctorId(
                clean(
                        prescription.getDoctorId()
                )
        );


        existing.setDoctorName(
                clean(
                        prescription.getDoctorName()
                )
        );


        existing.setItems(
                prescription.getItems()
        );


        existing.setNotes(
                clean(
                        prescription.getNotes()
                )
        );


        // =================================================
        // RECALCULATE TOTALS
        // =================================================

        BigDecimal subtotal =
                calculateSubtotal(
                        existing
                );


        existing.setSubtotal(
                subtotal
        );


        BigDecimal amountPaid =
                existing.getAmountPaid() == null
                        ? BigDecimal.ZERO
                        : existing.getAmountPaid();


        existing.setAmountPaid(
                amountPaid
        );


        existing.setBalance(
                subtotal
                        .subtract(amountPaid)
                        .max(BigDecimal.ZERO)
        );


        existing.setUpdatedAt(
                LocalDateTime.now()
        );


        PharmacyPrescription saved =
                repository.save(
                        existing
                );


        synchronizeConsultationPrescriptionFlag(
                saved.getConsultationId()
        );


        return saved;
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
                !"Waiting".equalsIgnoreCase(
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
                !"Preparing".equalsIgnoreCase(
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
                !"Awaiting Payment".equalsIgnoreCase(
                        prescription.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "Only prescriptions Awaiting Payment can be checked for payment."
            );
        }


        if (
                prescription.getBillingStatus() == null ||
                prescription.getBillingStatus().isBlank()
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

            BigDecimal subtotal =
                    prescription.getSubtotal() == null
                            ? BigDecimal.ZERO
                            : prescription.getSubtotal();


            prescription.setAmountPaid(
                    subtotal
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
                !"Ready for Pickup".equalsIgnoreCase(
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
                        ? dispensedBy.trim()
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
                "Dispensed".equalsIgnoreCase(
                        prescription.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "A dispensed prescription cannot be cancelled."
            );
        }


        if (
                "Cancelled".equalsIgnoreCase(
                        prescription.getStatus()
                )
        ) {

            return prescription;
        }


        String consultationId =
                prescription.getConsultationId();


        prescription.setStatus(
                "Cancelled"
        );


        prescription.setUpdatedAt(
                LocalDateTime.now()
        );


        PharmacyPrescription saved =
                repository.save(
                        prescription
                );


        synchronizeConsultationPrescriptionFlag(
                consultationId
        );


        return saved;
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
                "Dispensed".equalsIgnoreCase(
                        prescription.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "A dispensed prescription cannot be deleted."
            );
        }


        String consultationId =
                prescription.getConsultationId();


        repository.delete(
                prescription
        );


        synchronizeConsultationPrescriptionFlag(
                consultationId
        );
    }


    // =====================================================
    // SYNCHRONIZE CONSULTATION FLAG
    // =====================================================

    private void synchronizeConsultationPrescriptionFlag(
            String consultationId
    ) {

        if (
                consultationId == null ||
                consultationId.isBlank()
        ) {

            return;
        }


        Consultation consultation =
                consultationRepository
                        .findById(
                                consultationId.trim()
                        )
                        .orElse(null);


        if (consultation == null) {

            return;
        }


        List<PharmacyPrescription> prescriptions =
                repository.findByConsultationId(
                        consultationId.trim()
                );


        boolean hasActivePrescription =
                prescriptions.stream()
                        .anyMatch(
                                prescription ->
                                        !"Cancelled"
                                                .equalsIgnoreCase(
                                                        prescription.getStatus()
                                                )
                        );


        consultation.setHasPrescription(
                hasActivePrescription
        );


        consultationRepository.save(
                consultation
        );
    }


    // =====================================================
    // CALCULATE SUBTOTAL
    // =====================================================

    private BigDecimal calculateSubtotal(
            PharmacyPrescription prescription
    ) {

        BigDecimal subtotal =
                BigDecimal.ZERO;


        for (
                PharmacyPrescriptionItem item :
                prescription.getItems()
        ) {

            if (item == null) {

                throw new IllegalArgumentException(
                        "Prescription item cannot be null."
                );
            }


            if (
                    item.getQuantity() == null ||
                    item.getQuantity() <= 0
            ) {

                throw new IllegalArgumentException(
                        "Prescription quantity must be greater than zero."
                );
            }


            BigDecimal unitPrice =
                    item.getUnitPrice() == null
                            ? BigDecimal.ZERO
                            : item.getUnitPrice();


            BigDecimal totalPrice =
                    unitPrice.multiply(
                            BigDecimal.valueOf(
                                    item.getQuantity()
                            )
                    );


            item.setUnitPrice(
                    unitPrice
            );


            item.setTotalPrice(
                    totalPrice
            );


            subtotal =
                    subtotal.add(
                            totalPrice
                    );
        }


        return subtotal;
    }


    // =====================================================
    // CLEAN
    // =====================================================

    private String clean(
            String value
    ) {

        if (value == null) {

            return null;
        }


        String cleaned =
                value.trim();


        return cleaned.isEmpty()
                ? null
                : cleaned;
    }


    // =====================================================
    // GENERATE PRESCRIPTION NUMBER
    // =====================================================

    private String generatePrescriptionNumber() {

        String number;

        do {

            int random =
                    (int)
                            (Math.random() * 100000);


            number =
                    "RX-" +
                    LocalDateTime
                            .now()
                            .getYear() +
                    "-" +
                    String.format(
                            "%05d",
                            random
                    );

        } while (
                repository.existsByPrescriptionNumber(
                        number
                )
        );

        return number;
    }
}