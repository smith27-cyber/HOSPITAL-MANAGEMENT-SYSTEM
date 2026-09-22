
package com.hms.backend.service.impl;

import com.hms.backend.dto.BillingItemRequest;

import com.hms.backend.entity.Billing;
import com.hms.backend.entity.BillingItem;
import com.hms.backend.entity.Consultation;
import com.hms.backend.entity.PharmacyPrescription;
import com.hms.backend.entity.PharmacyPrescriptionItem;

import com.hms.backend.repository.ConsultationRepository;
import com.hms.backend.repository.PharmacyPrescriptionRepository;

import com.hms.backend.service.BillingService;
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


    // =====================================================
    // REPOSITORIES / SERVICES
    // =====================================================

    private final PharmacyPrescriptionRepository repository;

    private final ConsultationRepository consultationRepository;

    private final BillingService billingService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PharmacyPrescriptionServiceImpl(
            PharmacyPrescriptionRepository repository,
            ConsultationRepository consultationRepository,
            BillingService billingService
    ) {

        this.repository =
                repository;

        this.consultationRepository =
                consultationRepository;

        this.billingService =
                billingService;
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

        if (
                id == null
        ) {

            throw new IllegalArgumentException(
                    "Prescription ID is required."
            );
        }


        return repository
                .findById(id)
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
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


        return repository
                .findByPatientId(
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


        return repository
                .findByConsultationId(
                        consultationId.trim()
                );
    }


    // =====================================================
    // GET CURRENT PRESCRIPTION
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


        return repository
                .findByStatus(
                        status.trim()
                );
    }


    // =====================================================
    // CREATE PRESCRIPTION
    // =====================================================

    @Override
    public PharmacyPrescription
    createPrescription(
            PharmacyPrescription prescription
    ) {

        validatePrescriptionForCreate(
                prescription
        );


        String consultationId =
                clean(
                        prescription.getConsultationId()
                );


        prescription.setConsultationId(
                consultationId
        );


        // =================================================
        // VALIDATE CONSULTATION
        // =================================================

        if (
                consultationId != null
        ) {

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


        // =================================================
        // RESET BILLING VALUES
        // =================================================

        prescription.setBillingId(
                null
        );


        prescription.setBillingStatus(
                null
        );


        // =================================================
        // CALCULATE TOTAL
        // =================================================

        BigDecimal subtotal =
                calculateSubtotal(
                        prescription
                );


        if (
                subtotal.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Prescription total must be greater than zero."
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
    // UPDATE PRESCRIPTION
    // =====================================================

    @Override
    public PharmacyPrescription
    updatePrescription(
            Long id,
            PharmacyPrescription prescription
    ) {

        if (
                id == null
        ) {

            throw new IllegalArgumentException(
                    "Prescription ID is required."
            );
        }


        if (
                prescription == null
        ) {

            throw new IllegalArgumentException(
                    "Prescription cannot be null."
            );
        }


        PharmacyPrescription existing =
                getPrescriptionById(
                        id
                );


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


        String consultationId =
                clean(
                        prescription.getConsultationId()
                );


        if (
                consultationId != null
        ) {

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


        BigDecimal subtotal =
                calculateSubtotal(
                        existing
                );


        if (
                subtotal.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Prescription total must be greater than zero."
            );
        }


        existing.setSubtotal(
                subtotal
        );


        BigDecimal amountPaid =
                existing.getAmountPaid() == null
                        ? BigDecimal.ZERO
                        : existing.getAmountPaid();


        existing.setAmountPaid(
                amountPaid
                        .min(subtotal)
                        .max(BigDecimal.ZERO)
        );


        existing.setBalance(
                subtotal
                        .subtract(
                                existing.getAmountPaid()
                        )
                        .max(
                                BigDecimal.ZERO
                        )
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
                getPrescriptionById(
                        id
                );


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
                getPrescriptionById(
                        id
                );


        // =================================================
        // CANCELLED
        // =================================================

        if (
                "Cancelled".equalsIgnoreCase(
                        prescription.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "Cancelled prescriptions cannot be sent to billing."
            );
        }


        // =================================================
        // ONLY PREPARING
        // =================================================

        if (
                !"Preparing".equalsIgnoreCase(
                        prescription.getStatus()
                )
        ) {

            // Allow retry when an existing valid billing
            // link is already present.
            if (
                    !"Awaiting Payment".equalsIgnoreCase(
                            prescription.getStatus()
                    )
            ) {

                throw new IllegalStateException(
                        "Only Preparing prescriptions can be sent to billing."
                );
            }
        }


        // =================================================
        // CALCULATE TOTAL
        // =================================================

        BigDecimal subtotal =
                calculateSubtotal(
                        prescription
                );


        if (
                subtotal.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new IllegalStateException(
                    "Prescription total must be greater than zero before billing."
            );
        }


        prescription.setSubtotal(
                subtotal
        );


        // =================================================
        // BUILD PHARMACY BILLING ITEM
        // =================================================

        BillingItemRequest billingItem =
                new BillingItemRequest();


        billingItem.setBillingType(
                "Pharmacy"
        );


        billingItem.setDescription(
                buildPharmacyDescription(
                        prescription
                )
        );


        billingItem.setQuantity(
                1
        );


        billingItem.setUnitPrice(
                subtotal
        );


        billingItem.setReferenceId(
                String.valueOf(
                        prescription.getId()
                )
        );


        // =================================================
        // TRY EXISTING BILL
        // =================================================

        Billing bill =
                findBillingForPrescription(
                        prescription
                );


        // =================================================
        // VERIFY EXISTING PHARMACY CHARGE
        // =================================================

        boolean pharmacyChargeExists =
                hasPharmacyCharge(
                        bill,
                        prescription
                );


        // =================================================
        // ADD PHARMACY CHARGE IF MISSING
        // =================================================

        if (
                !pharmacyChargeExists
        ) {

            bill =
                    billingService
                            .addChargeToPatientBill(

                                    prescription.getPatientId(),

                                    billingItem,

                                    prescription.getPatientName(),

                                    prescription.getPatientNumber(),

                                    prescription.getDoctorId(),

                                    prescription.getDoctorName(),

                                    null,

                                    null
                            );


            if (
                    bill == null ||
                    bill.getId() == null
            ) {

                throw new IllegalStateException(
                        "Unable to create pharmacy billing charge."
                );
            }
        }


        // =================================================
        // SAVE BILLING LINK
        // =================================================

        prescription.setBillingId(
                String.valueOf(
                        bill.getId()
                )
        );


        prescription.setBillingStatus(
                bill.getStatus() == null
                        ? "Pending"
                        : billingStatusToFrontend(
                                bill.getStatus()
                        )
        );


        // =================================================
        // UPDATE PAYMENT
        // =================================================

        prescription.setAmountPaid(
                BigDecimal.ZERO
        );


        prescription.setBalance(
                getPharmacyOutstandingBalance(
                        bill,
                        prescription
                )
        );


        // =================================================
        // UPDATE STATUS
        // =================================================

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
                getPrescriptionById(
                        id
                );


        // =================================================
        // STATUS
        // =================================================

        if (
                !"Awaiting Payment".equalsIgnoreCase(
                        prescription.getStatus()
                )
        ) {

            throw new IllegalStateException(
                    "Only prescriptions Awaiting Payment can be checked for payment."
            );
        }


        // =================================================
        // FIND BILL
        // =================================================

        Billing bill =
                findBillingForPrescription(
                        prescription
                );


        if (
                bill == null
        ) {

            throw new IllegalStateException(
                    "No active billing invoice could be found for patient: "
                            + prescription.getPatientId()
            );
        }


        // =================================================
        // VERIFY PHARMACY CHARGE
        // =================================================

        if (
                !hasPharmacyCharge(
                        bill,
                        prescription
                )
        ) {

            throw new IllegalStateException(
                    "The billing invoice does not contain the pharmacy charge for prescription: "
                            + prescription.getId()
            );
        }


        // =================================================
        // REPAIR BILLING LINK
        // =================================================

        prescription.setBillingId(
                String.valueOf(
                        bill.getId()
                )
        );


        // =================================================
        // BILLING STATUS
        // =================================================

        prescription.setBillingStatus(
                bill.getStatus() == null
                        ? null
                        : billingStatusToFrontend(
                                bill.getStatus()
                        )
        );


        // =================================================
        // PRESCRIPTION TOTAL
        // =================================================

        BigDecimal subtotal =
                prescription.getSubtotal() == null
                        ? calculateSubtotal(
                                prescription
                        )
                        : prescription.getSubtotal();


        prescription.setSubtotal(
                subtotal
        );


        // =================================================
        // FULLY PAID
        // =================================================

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.PAID
        ) {

            prescription.setAmountPaid(
                    subtotal
            );


            prescription.setBalance(
                    BigDecimal.ZERO
            );


            prescription.setStatus(
                    "Ready for Pickup"
            );


            if (
                    prescription.getPaymentDate() == null
            ) {

                prescription.setPaymentDate(
                        LocalDateTime.now()
                );
            }


        } else {

            // -------------------------------------------------
            // Shared invoice is not fully paid.
            // -------------------------------------------------

            prescription.setAmountPaid(
                    BigDecimal.ZERO
            );


            prescription.setBalance(
                    getPharmacyOutstandingBalance(
                            bill,
                            prescription
                    )
            );


            prescription.setStatus(
                    "Awaiting Payment"
            );
        }


        // =================================================
        // SAVE
        // =================================================

        prescription.setUpdatedAt(
                LocalDateTime.now()
        );


        return repository.save(
                prescription
        );
    }


    // =====================================================
    // FIND BILL FOR PRESCRIPTION
    // =====================================================

    private Billing
    findBillingForPrescription(
            PharmacyPrescription prescription
    ) {

        if (
                prescription == null
        ) {

            return null;
        }


        // =================================================
        // FIRST: STORED BILLING ID
        // =================================================

        String billingIdValue =
                clean(
                        prescription.getBillingId()
                );


        if (
                billingIdValue != null
        ) {

            Long billingId =
                    parseBillingId(
                            billingIdValue
                    );


            if (
                    billingId != null
            ) {

                Billing bill =
                        billingService
                                .getBillById(
                                        billingId
                                )
                                .orElse(null);


                if (
                        bill != null &&
                        prescription.getPatientId()
                                .equals(
                                        bill.getPatientId()
                                )
                ) {

                    return bill;
                }
            }
        }


        // =================================================
        // SECOND: ACTIVE PATIENT BILL
        // =================================================

        return billingService
                .getActiveBillByPatient(
                        prescription.getPatientId()
                )
                .orElse(null);
    }


    // =====================================================
    // HAS PHARMACY CHARGE
    // =====================================================

    private boolean hasPharmacyCharge(
            Billing bill,
            PharmacyPrescription prescription
    ) {

        if (
                bill == null ||
                bill.getItems() == null ||
                prescription == null ||
                prescription.getId() == null
        ) {

            return false;
        }


        String prescriptionReference =
                String.valueOf(
                        prescription.getId()
                );


        return bill.getItems()
                .stream()
                .anyMatch(
                        item ->

                                item != null &&

                                item.getBillingType() ==
                                        BillingItem.BillingType.PHARMACY &&

                                prescriptionReference.equals(
                                        String.valueOf(
                                                item.getReferenceId()
                                        )
                                )
                );
    }


    // =====================================================
    // PARSE BILLING ID
    // =====================================================

    private Long parseBillingId(
            String value
    ) {

        String cleaned =
                clean(
                        value
                );


        if (
                cleaned == null
        ) {

            return null;
        }


        try {

            return Long.parseLong(
                    cleaned
            );

        } catch (
                NumberFormatException exception
        ) {

            return null;
        }
    }


    // =====================================================
    // GET PHARMACY OUTSTANDING BALANCE
    // =====================================================

    private BigDecimal
    getPharmacyOutstandingBalance(
            Billing bill,
            PharmacyPrescription prescription
    ) {

        if (
                prescription == null
        ) {

            return BigDecimal.ZERO;
        }


        BigDecimal pharmacyAmount =
                prescription.getSubtotal() == null
                        ? BigDecimal.ZERO
                        : prescription.getSubtotal();


        if (
                bill == null
        ) {

            return pharmacyAmount.max(
                    BigDecimal.ZERO
            );
        }


        // -------------------------------------------------
        // Fully paid shared invoice.
        // -------------------------------------------------

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.PAID
        ) {

            return BigDecimal.ZERO;
        }


        if (
                bill.getItems() == null
        ) {

            return pharmacyAmount.max(
                    BigDecimal.ZERO
            );
        }


        // -------------------------------------------------
        // Find this prescription's pharmacy charge.
        // -------------------------------------------------

        return bill.getItems()
                .stream()
                .filter(
                        item ->

                                item != null &&

                                item.getBillingType() ==
                                        BillingItem.BillingType.PHARMACY
                )
                .filter(
                        item ->

                                String.valueOf(
                                        item.getReferenceId()
                                )
                                .equals(
                                        String.valueOf(
                                                prescription.getId()
                                        )
                                )
                )
                .map(
                        item ->

                                item.getAmount() == null
                                        ? pharmacyAmount
                                        : item.getAmount()
                )
                .findFirst()
                .orElse(
                        pharmacyAmount
                )
                .max(
                        BigDecimal.ZERO
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
                getPrescriptionById(
                        id
                );


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
                getPrescriptionById(
                        id
                );


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
                getPrescriptionById(
                        id
                );


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
    // SYNCHRONIZE CONSULTATION PRESCRIPTION FLAG
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


        if (
                consultation == null
        ) {

            return;
        }


        List<PharmacyPrescription> prescriptions =
                repository
                        .findByConsultationId(
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
    // VALIDATE CREATE
    // =====================================================

    private void validatePrescriptionForCreate(
            PharmacyPrescription prescription
    ) {

        if (
                prescription == null
        ) {

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
    }


    // =====================================================
    // CALCULATE SUBTOTAL
    // =====================================================

    private BigDecimal
    calculateSubtotal(
            PharmacyPrescription prescription
    ) {

        if (
                prescription == null ||
                prescription.getItems() == null
        ) {

            return BigDecimal.ZERO;
        }


        BigDecimal subtotal =
                BigDecimal.ZERO;


        for (
                PharmacyPrescriptionItem item :
                prescription.getItems()
        ) {

            if (
                    item == null
            ) {

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


            if (
                    unitPrice.compareTo(
                            BigDecimal.ZERO
                    ) < 0
            ) {

                throw new IllegalArgumentException(
                        "Prescription item price cannot be negative."
                );
            }


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
    // BUILD PHARMACY DESCRIPTION
    // =====================================================

    private String buildPharmacyDescription(
            PharmacyPrescription prescription
    ) {

        if (
                prescription == null ||
                prescription.getItems() == null ||
                prescription.getItems().isEmpty()
        ) {

            return "Pharmacy prescription";
        }


        StringBuilder description =
                new StringBuilder(
                        "Pharmacy: "
                );


        boolean firstItem =
                true;


        for (
                PharmacyPrescriptionItem item :
                prescription.getItems()
        ) {

            if (
                    item == null
            ) {

                continue;
            }


            if (
                    !firstItem
            ) {

                description.append(
                        ", "
                );
            }


            description.append(
                    item.getMedicineName()
            );


            description.append(
                    " x"
            );


            description.append(
                    item.getQuantity()
            );


            firstItem =
                    false;
        }


        return description.toString();
    }


    // =====================================================
    // BILLING STATUS TO FRONTEND
    // =====================================================

    private String billingStatusToFrontend(
            Billing.BillingStatus status
    ) {

        if (
                status == null
        ) {

            return null;
        }


        switch (
                status
        ) {

            case PENDING:

                return "Pending";


            case PARTIALLY_PAID:

                return "Partially Paid";


            case PAID:

                return "Paid";


            case CANCELLED:

                return "Cancelled";


            default:

                return status.name();
        }
    }


    // =====================================================
    // CLEAN
    // =====================================================

    private String clean(
            String value
    ) {

        if (
                value == null
        ) {

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
                            (
                                    Math.random() *
                                    100000
                            );


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
                repository
                        .existsByPrescriptionNumber(
                                number
                        )
        );


        return number;
    }
}

