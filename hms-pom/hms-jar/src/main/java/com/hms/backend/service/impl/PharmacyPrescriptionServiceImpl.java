package com.hms.backend.service.impl;

import com.hms.backend.audit.service.AuditLogService;
import com.hms.backend.dto.BillingItemRequest;
import com.hms.backend.entity.Billing;
import com.hms.backend.entity.BillingItem;
import com.hms.backend.entity.Consultation;
import com.hms.backend.entity.Doctor;
import com.hms.backend.entity.Inventory;
import com.hms.backend.entity.PharmacyPrescription;
import com.hms.backend.entity.PharmacyPrescriptionItem;
import com.hms.backend.repository.ConsultationRepository;
import com.hms.backend.repository.DoctorRepository;
import com.hms.backend.repository.InventoryRepository;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.repository.PharmacyPrescriptionRepository;
import com.hms.backend.service.BillingService;
import com.hms.backend.service.PharmacyPrescriptionService;
import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.repository.TenantRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PharmacyPrescriptionServiceImpl
        implements PharmacyPrescriptionService {

    // =====================================================
    // REPOSITORIES / SERVICES
    // =====================================================

    private final PharmacyPrescriptionRepository repository;

    private final ConsultationRepository consultationRepository;

    private final PatientRepository patientRepository;

    private final DoctorRepository doctorRepository;

    private final InventoryRepository inventoryRepository;

    private final TenantRepository tenantRepository;

    private final BillingService billingService;

    private final AuditLogService auditLogService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PharmacyPrescriptionServiceImpl(
            PharmacyPrescriptionRepository repository,
            ConsultationRepository consultationRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            InventoryRepository inventoryRepository,
            TenantRepository tenantRepository,
            BillingService billingService,
            AuditLogService auditLogService) {

        this.repository = repository;
        this.consultationRepository = consultationRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.inventoryRepository = inventoryRepository;
        this.tenantRepository = tenantRepository;
        this.billingService = billingService;
        this.auditLogService = auditLogService;
    }

    // =====================================================
    // CURRENT TENANT
    // =====================================================

    private Long getCurrentTenantId() {

        return TenantContext.requireTenantId();
    }

    private Tenant getCurrentTenant() {

        Long tenantId = getCurrentTenantId();

        return tenantRepository
                .findById(tenantId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Current tenant not found: " + tenantId));
    }

    // =====================================================
    // GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyPrescription> getAllPrescriptions() {

        Long tenantId = getCurrentTenantId();

        return repository.findAllByTenant_Id(tenantId);
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public PharmacyPrescription getPrescriptionById(Long id) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Prescription ID is required.");
        }

        Long tenantId = getCurrentTenantId();

        return repository
                .findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Pharmacy prescription not found: " + id));
    }

    // =====================================================
    // GET BY PATIENT
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyPrescription> getPrescriptionsByPatient(
            String patientId) {

        if (patientId == null || patientId.isBlank()) {

            throw new IllegalArgumentException(
                    "Patient ID is required.");
        }

        Long tenantId = getCurrentTenantId();

        return repository.findByTenant_IdAndPatientId(
                tenantId,
                patientId.trim());
    }

    // =====================================================
    // GET BY CONSULTATION
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyPrescription> getPrescriptionsByConsultation(
            String consultationId) {

        if (consultationId == null ||
                consultationId.isBlank()) {

            throw new IllegalArgumentException(
                    "Consultation ID is required.");
        }

        Long tenantId = getCurrentTenantId();

        return repository.findByTenant_IdAndConsultationId(
                tenantId,
                consultationId.trim());
    }

    // =====================================================
    // GET CURRENT PRESCRIPTION
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public PharmacyPrescription getPrescriptionByConsultation(
            String consultationId) {

        if (consultationId == null ||
                consultationId.isBlank()) {

            return null;
        }

        Long tenantId = getCurrentTenantId();

        return repository
                .findFirstByTenant_IdAndConsultationIdOrderByIdDesc(
                        tenantId,
                        consultationId.trim())
                .orElse(null);
    }

    // =====================================================
    // GET BY STATUS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyPrescription> getPrescriptionsByStatus(
            String status) {

        if (status == null || status.isBlank()) {

            throw new IllegalArgumentException(
                    "Prescription status is required.");
        }

        Long tenantId = getCurrentTenantId();

        return repository.findByTenant_IdAndStatus(
                tenantId,
                status.trim());
    }

    // =====================================================
    // CREATE PRESCRIPTION
    // =====================================================

    @Override
    public PharmacyPrescription createPrescription(
            PharmacyPrescription prescription) {

        if (prescription == null) {

            throw new IllegalArgumentException(
                    "Prescription cannot be null.");
        }

        String requestedPatientId =
                clean(prescription.getPatientId());

        String patientName =
                clean(prescription.getPatientName());

        String consultationId =
                clean(prescription.getConsultationId());

        // =================================================
        // RESOLVE PATIENT
        // =================================================

        final String resolvedPatientId;

        if (requestedPatientId == null) {

            if (consultationId != null) {

                throw new IllegalArgumentException(
                        "A consultation prescription requires a registered patient.");
            }

            resolvedPatientId =
                    generateWalkInPatientId();

            prescription.setPatientId(
                    resolvedPatientId);

        } else {

            resolvedPatientId =
                    requestedPatientId;
        }

        // =================================================
        // BASIC VALIDATION
        // =================================================

        validatePrescriptionForCreate(
                prescription);

        Long tenantId =
                getCurrentTenantId();

        Tenant currentTenant =
                getCurrentTenant();

        // =================================================
        // FORCE TENANT
        // =================================================

        prescription.setTenant(
                currentTenant);

        // =================================================
        // PATIENT
        // =================================================

        if (isWalkInPatientId(
                resolvedPatientId)) {

            prescription.setPatientId(
                    resolvedPatientId);

            prescription.setPatientName(
                    patientName);

            prescription.setPatientNumber(
                    clean(
                            prescription.getPatientNumber()));

        } else {

            patientRepository
                    .findByIdAndTenant_Id(
                            resolvedPatientId,
                            tenantId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Patient not found in the current tenant: "
                                            + resolvedPatientId));

            prescription.setPatientId(
                    resolvedPatientId);

            prescription.setPatientName(
                    patientName);

            prescription.setPatientNumber(
                    clean(
                            prescription.getPatientNumber()));
        }

        // =================================================
        // DOCTOR
        // =================================================

        String doctorId =
                clean(prescription.getDoctorId());

        if (doctorId != null) {

            doctorRepository
                    .findByIdAndTenant_Id(
                            doctorId,
                            tenantId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Doctor not found in the current tenant: "
                                            + doctorId));

            prescription.setDoctorId(
                    doctorId);

            prescription.setDoctorName(
                    clean(
                            prescription.getDoctorName()));

        } else {

            prescription.setDoctorId(null);
            prescription.setDoctorName(null);
        }

        // =================================================
        // CONSULTATION
        // =================================================

        prescription.setConsultationId(
                consultationId);

        if (consultationId != null) {

            if (isWalkInPatientId(
                    resolvedPatientId)) {

                throw new IllegalArgumentException(
                        "A walk-in customer cannot be linked to a consultation.");
            }

            Consultation consultation =
                    consultationRepository
                            .findByIdAndTenant_Id(
                                    consultationId,
                                    tenantId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Consultation not found: "
                                                    + consultationId));

            if (consultation.getStatus()
                    == Consultation.ConsultationStatus.COMPLETED) {

                throw new IllegalStateException(
                        "A prescription cannot be added to a completed consultation.");
            }

            if (consultation.getStatus()
                    == Consultation.ConsultationStatus.CANCELLED) {

                throw new IllegalStateException(
                        "A prescription cannot be added to a cancelled consultation.");
            }

            if (consultation.getPatientId() != null &&
                    !consultation.getPatientId()
                            .equals(resolvedPatientId)) {

                throw new IllegalArgumentException(
                        "The consultation does not belong to the selected patient.");
            }

            if (doctorId != null &&
                    consultation.getDoctorId() != null &&
                    !consultation.getDoctorId()
                            .equals(doctorId)) {

                throw new IllegalArgumentException(
                        "The selected doctor does not match the consultation.");
            }

            PharmacyPrescription existing =
                    repository
                            .findFirstByTenant_IdAndConsultationIdOrderByIdDesc(
                                    tenantId,
                                    consultationId)
                            .orElse(null);

            if (existing != null &&
                    !"Cancelled".equalsIgnoreCase(
                            existing.getStatus())) {

                throw new IllegalStateException(
                        "An active pharmacy prescription already exists for consultation: "
                                + consultationId);
            }
        }

        // =================================================
        // VALIDATE INVENTORY
        // =================================================

        validateInventoryItems(
                prescription,
                tenantId);

        // =================================================
        // PRESCRIPTION NUMBER
        // =================================================

        if (prescription.getPrescriptionNumber() == null ||
                prescription.getPrescriptionNumber().isBlank()) {

            prescription.setPrescriptionNumber(
                    generatePrescriptionNumber());

        } else {

            String suppliedNumber =
                    prescription.getPrescriptionNumber()
                            .trim();

            if (repository
                    .existsByTenant_IdAndPrescriptionNumber(
                            tenantId,
                            suppliedNumber)) {

                throw new IllegalArgumentException(
                        "Prescription number already exists in this tenant: "
                                + suppliedNumber);
            }

            prescription.setPrescriptionNumber(
                    suppliedNumber);
        }

        // =================================================
        // DATE / STATUS
        // =================================================

        LocalDateTime now =
                LocalDateTime.now();

        prescription.setStatus(
                "Waiting");

        prescription.setPrescriptionDate(
                now);

        if (prescription.getCreatedAt() == null) {

            prescription.setCreatedAt(
                    now);
        }

        prescription.setUpdatedAt(
                now);

        // =================================================
        // RESET BILLING
        // =================================================

        prescription.setBillingId(
                null);

        prescription.setBillingStatus(
                null);

        prescription.setAmountPaid(
                BigDecimal.ZERO);

        // =================================================
        // CALCULATE TOTAL
        // =================================================

        BigDecimal subtotal =
                calculateSubtotal(
                        prescription);

        if (subtotal.compareTo(
                BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Prescription total must be greater than zero.");
        }

        prescription.setSubtotal(
                subtotal);

        prescription.setBalance(
                subtotal);

        // =================================================
        // SAVE
        // =================================================

        PharmacyPrescription saved =
                repository.save(
                        prescription);

        // =================================================
        // SYNC CONSULTATION
        // =================================================

        synchronizeConsultationPrescriptionFlag(
                saved.getConsultationId());

        // =================================================
        // AUDIT
        // =================================================

        auditLogService.log(
                "CREATE",
                "PHARMACY_PRESCRIPTION",
                String.valueOf(
                        saved.getId()),
                "Created pharmacy prescription "
                        + saved.getPrescriptionNumber()
                        + " for "
                        + (isWalkInPatientId(
                        saved.getPatientId())
                        ? "walk-in customer "
                        : "patient ")
                        + saved.getPatientId());

        return saved;
    }

    // =====================================================
    // UPDATE PRESCRIPTION
    // =====================================================

    @Override
    public PharmacyPrescription updatePrescription(
            Long id,
            PharmacyPrescription prescription) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Prescription ID is required.");
        }

        if (prescription == null) {

            throw new IllegalArgumentException(
                    "Prescription cannot be null.");
        }

        Long tenantId =
                getCurrentTenantId();

        PharmacyPrescription existing =
                repository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Pharmacy prescription not found: "
                                                + id));

        if (!"Waiting".equalsIgnoreCase(
                existing.getStatus())) {

            throw new IllegalStateException(
                    "Only Waiting prescriptions can be modified.");
        }

        if (prescription.getItems() == null ||
                prescription.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "At least one prescription item is required.");
        }

        // =================================================
        // PATIENT
        // =================================================

        String patientId =
                clean(prescription.getPatientId());

        if (patientId == null) {

            throw new IllegalArgumentException(
                    "Patient ID is required.");
        }

        if (!isWalkInPatientId(
                patientId)) {

            patientRepository
                    .findByIdAndTenant_Id(
                            patientId,
                            tenantId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Patient not found in the current tenant: "
                                            + patientId));
        }

        // =================================================
        // DOCTOR
        // =================================================

        String doctorId =
                clean(prescription.getDoctorId());

        if (doctorId != null) {

            doctorRepository
                    .findByIdAndTenant_Id(
                            doctorId,
                            tenantId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Doctor not found in the current tenant: "
                                            + doctorId));
        }

        // =================================================
        // CONSULTATION
        // =================================================

        String consultationId =
                clean(prescription.getConsultationId());

        if (consultationId != null) {

            if (isWalkInPatientId(
                    patientId)) {

                throw new IllegalArgumentException(
                        "A walk-in customer cannot be linked to a consultation.");
            }

            Consultation consultation =
                    consultationRepository
                            .findByIdAndTenant_Id(
                                    consultationId,
                                    tenantId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Consultation not found: "
                                                    + consultationId));

            if (consultation.getStatus()
                    == Consultation.ConsultationStatus.COMPLETED) {

                throw new IllegalStateException(
                        "A prescription cannot be modified for a completed consultation.");
            }

            if (consultation.getStatus()
                    == Consultation.ConsultationStatus.CANCELLED) {

                throw new IllegalStateException(
                        "A prescription cannot be modified for a cancelled consultation.");
            }

            if (consultation.getPatientId() != null &&
                    !consultation.getPatientId()
                            .equals(patientId)) {

                throw new IllegalArgumentException(
                        "The consultation does not belong to the selected patient.");
            }

            if (doctorId != null &&
                    consultation.getDoctorId() != null &&
                    !consultation.getDoctorId()
                            .equals(doctorId)) {

                throw new IllegalArgumentException(
                        "The selected doctor does not match the consultation.");
            }
        }

        // =================================================
        // VALIDATE INVENTORY
        // =================================================

        validateInventoryItems(
                prescription,
                tenantId);

        // =================================================
        // COPY DATA
        // =================================================

        existing.setPatientId(
                patientId);

        existing.setPatientName(
                clean(
                        prescription.getPatientName()));

        existing.setPatientNumber(
                clean(
                        prescription.getPatientNumber()));

        existing.setConsultationId(
                consultationId);

        existing.setDoctorId(
                doctorId);

        existing.setDoctorName(
                clean(
                        prescription.getDoctorName()));

        existing.setItems(
                prescription.getItems());

        existing.setNotes(
                clean(
                        prescription.getNotes()));

        // =================================================
        // CALCULATE TOTAL
        // =================================================

        BigDecimal subtotal =
                calculateSubtotal(
                        existing);

        if (subtotal.compareTo(
                BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Prescription total must be greater than zero.");
        }

        existing.setSubtotal(
                subtotal);

        BigDecimal amountPaid =
                existing.getAmountPaid() == null
                        ? BigDecimal.ZERO
                        : existing.getAmountPaid();

        existing.setAmountPaid(
                amountPaid
                        .min(subtotal)
                        .max(BigDecimal.ZERO));

        existing.setBalance(
                subtotal
                        .subtract(
                                existing.getAmountPaid())
                        .max(
                                BigDecimal.ZERO));

        existing.setUpdatedAt(
                LocalDateTime.now());

        PharmacyPrescription saved =
                repository.save(
                        existing);

        synchronizeConsultationPrescriptionFlag(
                saved.getConsultationId());

        // =================================================
        // AUDIT
        // =================================================

        auditLogService.log(
                "UPDATE",
                "PHARMACY_PRESCRIPTION",
                String.valueOf(
                        saved.getId()),
                "Updated pharmacy prescription "
                        + saved.getPrescriptionNumber());

        return saved;
    }

    // =====================================================
    // START PREPARING
    // =====================================================

    @Override
    public PharmacyPrescription startPreparing(
            Long id) {

        PharmacyPrescription prescription =
                getPrescriptionById(id);

        if (!"Waiting".equalsIgnoreCase(
                prescription.getStatus())) {

            throw new IllegalStateException(
                    "Only Waiting prescriptions can be prepared.");
        }

        LocalDateTime now =
                LocalDateTime.now();

        prescription.setStatus(
                "Preparing");

        prescription.setPreparedAt(
                now);

        prescription.setUpdatedAt(
                now);

        PharmacyPrescription saved =
                repository.save(
                        prescription);

        auditLogService.log(
                "PREPARE",
                "PHARMACY_PRESCRIPTION",
                String.valueOf(
                        saved.getId()),
                "Started preparing pharmacy prescription "
                        + saved.getPrescriptionNumber());

        return saved;
    }

    // =====================================================
    // SEND TO BILLING
    // =====================================================

    @Override
    public PharmacyPrescription sendToBilling(
            Long id) {

        PharmacyPrescription prescription =
                getPrescriptionById(id);

        if ("Cancelled".equalsIgnoreCase(
                prescription.getStatus())) {

            throw new IllegalStateException(
                    "Cancelled prescriptions cannot be sent to billing.");
        }

        if (!"Preparing".equalsIgnoreCase(
                prescription.getStatus()) &&
                !"Awaiting Payment".equalsIgnoreCase(
                        prescription.getStatus())) {

            throw new IllegalStateException(
                    "Only Preparing prescriptions can be sent to billing.");
        }

        BigDecimal subtotal =
                calculateSubtotal(
                        prescription);

        if (subtotal.compareTo(
                BigDecimal.ZERO) <= 0) {

            throw new IllegalStateException(
                    "Prescription total must be greater than zero before billing.");
        }

        prescription.setSubtotal(
                subtotal);

        // =================================================
        // BILLING ITEM
        // =================================================

        BillingItemRequest billingItem =
                new BillingItemRequest();

        billingItem.setBillingType(
                "Pharmacy");

        billingItem.setDescription(
                buildPharmacyDescription(
                        prescription));

        billingItem.setQuantity(
                1);

        billingItem.setUnitPrice(
                subtotal);

        billingItem.setReferenceId(
                String.valueOf(
                        prescription.getId()));

        // =================================================
        // FIND BILL
        // =================================================

        Billing bill =
                findBillingForPrescription(
                        prescription);

        // =================================================
        // CHECK CHARGE
        // =================================================

        boolean pharmacyChargeExists =
                hasPharmacyCharge(
                        bill,
                        prescription);

        // =================================================
        // ADD CHARGE
        // =================================================

        if (!pharmacyChargeExists) {

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
                                    null);

            if (bill == null ||
                    bill.getId() == null) {

                throw new IllegalStateException(
                        "Unable to create pharmacy billing charge.");
            }
        }

        // =================================================
        // BILLING LINK
        // =================================================

        prescription.setBillingId(
                String.valueOf(
                        bill.getId()));

        prescription.setBillingStatus(
                bill.getStatus() == null
                        ? "Pending"
                        : billingStatusToFrontend(
                                bill.getStatus()));

        // =================================================
        // PAYMENT
        // =================================================

        prescription.setAmountPaid(
                BigDecimal.ZERO);

        prescription.setBalance(
                getPharmacyOutstandingBalance(
                        bill,
                        prescription));

        // =================================================
        // STATUS
        // =================================================

        prescription.setStatus(
                "Awaiting Payment");

        prescription.setUpdatedAt(
                LocalDateTime.now());

        PharmacyPrescription saved =
                repository.save(
                        prescription);

        auditLogService.log(
                "SEND_TO_BILLING",
                "PHARMACY_PRESCRIPTION",
                String.valueOf(
                        saved.getId()),
                "Sent pharmacy prescription "
                        + saved.getPrescriptionNumber()
                        + " to billing");

        return saved;
    }

    // =====================================================
    // CHECK PAYMENT
    // =====================================================

    @Override
    public PharmacyPrescription checkPayment(
            Long id) {

        PharmacyPrescription prescription =
                getPrescriptionById(id);

        if (!"Awaiting Payment".equalsIgnoreCase(
                prescription.getStatus())) {

            throw new IllegalStateException(
                    "Only prescriptions Awaiting Payment can be checked for payment.");
        }

        Billing bill =
                findBillingForPrescription(
                        prescription);

        if (bill == null) {

            throw new IllegalStateException(
                    "No active billing invoice could be found for patient: "
                            + prescription.getPatientId());
        }

        if (!hasPharmacyCharge(
                bill,
                prescription)) {

            throw new IllegalStateException(
                    "The billing invoice does not contain the pharmacy charge for prescription: "
                            + prescription.getId());
        }

        prescription.setBillingId(
                String.valueOf(
                        bill.getId()));

        prescription.setBillingStatus(
                bill.getStatus() == null
                        ? null
                        : billingStatusToFrontend(
                                bill.getStatus()));

        BigDecimal subtotal =
                prescription.getSubtotal() == null
                        ? calculateSubtotal(
                                prescription)
                        : prescription.getSubtotal();

        prescription.setSubtotal(
                subtotal);

        if (bill.getStatus() ==
                Billing.BillingStatus.PAID) {

            prescription.setAmountPaid(
                    subtotal);

            prescription.setBalance(
                    BigDecimal.ZERO);

            prescription.setStatus(
                    "Ready for Pickup");

            if (prescription.getPaymentDate() == null) {

                prescription.setPaymentDate(
                        LocalDateTime.now());
            }

        } else {

            prescription.setAmountPaid(
                    BigDecimal.ZERO);

            prescription.setBalance(
                    getPharmacyOutstandingBalance(
                            bill,
                            prescription));

            prescription.setStatus(
                    "Awaiting Payment");
        }

        prescription.setUpdatedAt(
                LocalDateTime.now());

        PharmacyPrescription saved =
                repository.save(
                        prescription);

        auditLogService.log(
                "CHECK_PAYMENT",
                "PHARMACY_PRESCRIPTION",
                String.valueOf(
                        saved.getId()),
                "Checked payment for pharmacy prescription "
                        + saved.getPrescriptionNumber()
                        + ". Status: "
                        + saved.getStatus());

        return saved;
    }

    // =====================================================
    // FIND BILL FOR PRESCRIPTION
    // =====================================================

    private Billing findBillingForPrescription(
            PharmacyPrescription prescription) {

        if (prescription == null) {
            return null;
        }

        String billingIdValue =
                clean(
                        prescription.getBillingId());

        // -------------------------------------------------
        // FIRST: STORED BILLING ID
        // -------------------------------------------------

        if (billingIdValue != null) {

            Long billingId =
                    parseBillingId(
                            billingIdValue);

            if (billingId != null) {

                Billing bill =
                        billingService
                                .getBillById(
                                        billingId)
                                .orElse(null);

                if (bill != null &&
                        prescription.getPatientId() != null &&
                        prescription.getPatientId()
                                .equals(
                                        bill.getPatientId())) {

                    return bill;
                }
            }
        }

        // -------------------------------------------------
        // SECOND: ACTIVE PATIENT BILL
        // -------------------------------------------------

        return billingService
                .getActiveBillByPatient(
                        prescription.getPatientId())
                .orElse(null);
    }

    // =====================================================
    // HAS PHARMACY CHARGE
    // =====================================================

    private boolean hasPharmacyCharge(
            Billing bill,
            PharmacyPrescription prescription) {

        if (bill == null ||
                bill.getItems() == null ||
                prescription == null ||
                prescription.getId() == null) {

            return false;
        }

        String prescriptionReference =
                String.valueOf(
                        prescription.getId());

        return bill.getItems()
                .stream()
                .anyMatch(item ->
                        item != null &&
                        item.getBillingType()
                                == BillingItem.BillingType.PHARMACY &&
                        prescriptionReference.equals(
                                String.valueOf(
                                        item.getReferenceId())));
    }

    // =====================================================
    // PARSE BILLING ID
    // =====================================================

    private Long parseBillingId(
            String value) {

        String cleaned =
                clean(value);

        if (cleaned == null) {
            return null;
        }

        try {

            return Long.parseLong(
                    cleaned);

        } catch (NumberFormatException exception) {

            return null;
        }
    }

    // =====================================================
    // GET PHARMACY OUTSTANDING BALANCE
    // =====================================================

    private BigDecimal getPharmacyOutstandingBalance(
            Billing bill,
            PharmacyPrescription prescription) {

        if (prescription == null) {

            return BigDecimal.ZERO;
        }

        BigDecimal pharmacyAmount =
                prescription.getSubtotal() == null
                        ? BigDecimal.ZERO
                        : prescription.getSubtotal();

        if (bill == null) {

            return pharmacyAmount.max(
                    BigDecimal.ZERO);
        }

        if (bill.getStatus() ==
                Billing.BillingStatus.PAID) {

            return BigDecimal.ZERO;
        }

        if (bill.getItems() == null) {

            return pharmacyAmount.max(
                    BigDecimal.ZERO);
        }

        return bill.getItems()
                .stream()
                .filter(item ->
                        item != null &&
                        item.getBillingType()
                                == BillingItem.BillingType.PHARMACY)
                .filter(item ->
                        String.valueOf(
                                item.getReferenceId())
                                .equals(
                                        String.valueOf(
                                                prescription.getId())))
                .map(item ->
                        item.getAmount() == null
                                ? pharmacyAmount
                                : item.getAmount())
                .findFirst()
                .orElse(
                        pharmacyAmount)
                .max(
                        BigDecimal.ZERO);
    }

    // =====================================================
    // DISPENSE
    // =====================================================

    @Override
    public PharmacyPrescription dispense(
            Long id,
            String dispensedBy) {

        PharmacyPrescription prescription =
                getPrescriptionById(id);

        // =================================================
        // VALIDATE STATUS
        // =================================================

        if (!"Ready for Pickup".equalsIgnoreCase(
                prescription.getStatus())) {

            throw new IllegalStateException(
                    "Only prescriptions Ready for Pickup can be dispensed.");
        }

        // =================================================
        // VALIDATE ITEMS
        // =================================================

        if (prescription.getItems() == null ||
                prescription.getItems().isEmpty()) {

            throw new IllegalStateException(
                    "Cannot dispense a prescription with no medicines.");
        }

        Long tenantId =
                getCurrentTenantId();

        // =================================================
        // DEDUCT INVENTORY
        // =================================================

        for (PharmacyPrescriptionItem item :
                prescription.getItems()) {

            if (item == null) {
                continue;
            }

            String medicineId =
                    clean(
                            item.getMedicineId());

            if (medicineId == null) {

                throw new IllegalStateException(
                        "Medicine ID is missing for prescription item.");
            }

            Integer requestedQuantity =
                    item.getQuantity();

            if (requestedQuantity == null ||
                    requestedQuantity <= 0) {

                throw new IllegalStateException(
                        "Invalid quantity for medicine: "
                                + medicineId);
            }

            // ---------------------------------------------
            // FIND INVENTORY
            // ---------------------------------------------

            Inventory inventory =
                    inventoryRepository
                            .findByIdAndTenant_Id(
                                    medicineId,
                                    tenantId)
                            .orElseThrow(() ->
                                    new IllegalStateException(
                                            "Medicine not found in the current tenant inventory: "
                                                    + medicineId));

            // ---------------------------------------------
            // CHECK CURRENT STOCK
            // ---------------------------------------------

            int currentQuantity =
                    inventory.getQuantity() == null
                            ? 0
                            : inventory.getQuantity();

            if (currentQuantity <
                    requestedQuantity) {

                throw new IllegalStateException(
                        "Insufficient stock for medicine: "
                                + inventory.getItemName()
                                + ". Available: "
                                + currentQuantity
                                + ", required: "
                                + requestedQuantity);
            }

            // ---------------------------------------------
            // DEDUCT
            // ---------------------------------------------

            int remainingQuantity =
                    currentQuantity -
                            requestedQuantity;

            inventory.setQuantity(
                    remainingQuantity);

            // ---------------------------------------------
            // UPDATE STATUS
            // ---------------------------------------------

            updateInventoryStatus(
                    inventory);

            inventoryRepository.save(
                    inventory);

            // ---------------------------------------------
            // AUDIT
            // ---------------------------------------------

            auditLogService.log(
                    "STOCK_DEDUCTION",
                    "INVENTORY",
                    inventory.getId(),
                    "Deducted "
                            + requestedQuantity
                            + " unit(s) of "
                            + inventory.getItemName()
                            + " from inventory for pharmacy prescription "
                            + prescription.getPrescriptionNumber()
                            + ". Previous stock: "
                            + currentQuantity
                            + ", remaining stock: "
                            + remainingQuantity);
        }

        // =================================================
        // MARK PRESCRIPTION AS DISPENSED
        // =================================================

        prescription.setStatus(
                "Dispensed");

        prescription.setDispensedAt(
                LocalDateTime.now());

        prescription.setDispensedBy(
                dispensedBy != null &&
                        !dispensedBy.isBlank()
                                ? dispensedBy.trim()
                                : "Pharmacist");

        prescription.setUpdatedAt(
                LocalDateTime.now());

        PharmacyPrescription saved =
                repository.save(
                        prescription);

        // =================================================
        // AUDIT PHARMACY DISPENSING
        // =================================================

        auditLogService.log(
                "DISPENSE",
                "PHARMACY_PRESCRIPTION",
                String.valueOf(
                        saved.getId()),
                "Dispensed pharmacy prescription "
                        + saved.getPrescriptionNumber()
                        + " to patient "
                        + saved.getPatientId()
                        + ". Dispensed by: "
                        + saved.getDispensedBy());

        return saved;
    }

    // =====================================================
    // UPDATE INVENTORY STATUS
    // =====================================================

    private void updateInventoryStatus(
            Inventory inventory) {

        if (inventory == null) {
            return;
        }

        // ---------------------------------------------
        // Never overwrite manually discontinued items
        // ---------------------------------------------

        if ("Discontinued".equalsIgnoreCase(
                inventory.getStatus())) {

            return;
        }

        Integer quantity =
                inventory.getQuantity() == null
                        ? 0
                        : inventory.getQuantity();

        Integer minimumStock =
                inventory.getMinimumStock() == null
                        ? 0
                        : inventory.getMinimumStock();

        // ---------------------------------------------
        // OUT OF STOCK
        // ---------------------------------------------

        if (quantity <= 0) {

            inventory.setStatus(
                    "Out of Stock");

            return;
        }

        // ---------------------------------------------
        // LOW STOCK
        // ---------------------------------------------

        if (quantity <= minimumStock) {

            inventory.setStatus(
                    "Low Stock");

            return;
        }

        // ---------------------------------------------
        // NORMAL STOCK
        // ---------------------------------------------

        inventory.setStatus(
                "In Stock");
    }

    // =====================================================
    // CANCEL
    // =====================================================

    @Override
    public PharmacyPrescription cancelPrescription(
            Long id) {

        PharmacyPrescription prescription =
                getPrescriptionById(id);

        if ("Dispensed".equalsIgnoreCase(
                prescription.getStatus())) {

            throw new IllegalStateException(
                    "A dispensed prescription cannot be cancelled.");
        }

        if ("Cancelled".equalsIgnoreCase(
                prescription.getStatus())) {

            return prescription;
        }

        String consultationId =
                prescription.getConsultationId();

        prescription.setStatus(
                "Cancelled");

        prescription.setUpdatedAt(
                LocalDateTime.now());

        PharmacyPrescription saved =
                repository.save(
                        prescription);

        synchronizeConsultationPrescriptionFlag(
                consultationId);

        auditLogService.log(
                "CANCEL",
                "PHARMACY_PRESCRIPTION",
                String.valueOf(
                        saved.getId()),
                "Cancelled pharmacy prescription "
                        + saved.getPrescriptionNumber());

        return saved;
    }

    // =====================================================
    // DELETE
    // =====================================================

    @Override
    public void deletePrescription(
            Long id) {

        PharmacyPrescription prescription =
                getPrescriptionById(id);

        if ("Dispensed".equalsIgnoreCase(
                prescription.getStatus())) {

            throw new IllegalStateException(
                    "A dispensed prescription cannot be deleted.");
        }

        String consultationId =
                prescription.getConsultationId();

        String prescriptionNumber =
                prescription.getPrescriptionNumber();

        repository.delete(
                prescription);

        synchronizeConsultationPrescriptionFlag(
                consultationId);

        auditLogService.log(
                "DELETE",
                "PHARMACY_PRESCRIPTION",
                String.valueOf(id),
                "Deleted pharmacy prescription "
                        + prescriptionNumber);
    }

    // =====================================================
    // SYNCHRONIZE CONSULTATION PRESCRIPTION FLAG
    // =====================================================

    private void synchronizeConsultationPrescriptionFlag(
            String consultationId) {

        if (consultationId == null ||
                consultationId.isBlank()) {

            return;
        }

        Long tenantId =
                getCurrentTenantId();

        String cleanConsultationId =
                consultationId.trim();

        Consultation consultation =
                consultationRepository
                        .findByIdAndTenant_Id(
                                cleanConsultationId,
                                tenantId)
                        .orElse(null);

        if (consultation == null) {
            return;
        }

        List<PharmacyPrescription> prescriptions =
                repository
                        .findByTenant_IdAndConsultationId(
                                tenantId,
                                cleanConsultationId);

        boolean hasActivePrescription =
                prescriptions.stream()
                        .anyMatch(
                                item ->
                                        item != null &&
                                        !"Cancelled"
                                                .equalsIgnoreCase(
                                                        item.getStatus()));

        consultation.setHasPrescription(
                hasActivePrescription);

        consultationRepository.save(
                consultation);
    }

    // =====================================================
    // VALIDATE CREATE
    // =====================================================

    private void validatePrescriptionForCreate(
            PharmacyPrescription prescription) {

        if (prescription == null) {

            throw new IllegalArgumentException(
                    "Prescription cannot be null.");
        }

        if (prescription.getPatientName() == null ||
                prescription.getPatientName().isBlank()) {

            throw new IllegalArgumentException(
                    "Patient name is required.");
        }

        if (prescription.getItems() == null ||
                prescription.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "At least one prescription item is required.");
        }
    }

    // =====================================================
    // VALIDATE INVENTORY ITEMS
    // =====================================================

    private void validateInventoryItems(
            PharmacyPrescription prescription,
            Long tenantId) {

        if (prescription == null ||
                prescription.getItems() == null) {

            throw new IllegalArgumentException(
                    "Prescription items are required.");
        }

        for (PharmacyPrescriptionItem item :
                prescription.getItems()) {

            if (item == null) {

                throw new IllegalArgumentException(
                        "Prescription item cannot be null.");
            }

            if (item.getMedicineId() == null ||
                    item.getMedicineId().isBlank()) {

                throw new IllegalArgumentException(
                        "Medicine ID is required for every prescription item.");
            }

            String medicineId =
                    item.getMedicineId().trim();

            Inventory inventory =
                    inventoryRepository
                            .findByIdAndTenant_Id(
                                    medicineId,
                                    tenantId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Medicine not found in the current tenant inventory: "
                                                    + medicineId));

            if (item.getQuantity() == null ||
                    item.getQuantity() <= 0) {

                throw new IllegalArgumentException(
                        "Prescription quantity must be greater than zero.");
            }

            int availableQuantity =
                    inventory.getQuantity() == null
                            ? 0
                            : inventory.getQuantity();

            if (item.getQuantity() >
                    availableQuantity) {

                throw new IllegalArgumentException(
                        "Insufficient stock for medicine: "
                                + medicineId
                                + ". Available: "
                                + availableQuantity);
            }
        }
    }

    // =====================================================
    // CALCULATE SUBTOTAL
    // =====================================================

    private BigDecimal calculateSubtotal(
            PharmacyPrescription prescription) {

        if (prescription == null ||
                prescription.getItems() == null) {

            return BigDecimal.ZERO;
        }

        BigDecimal subtotal =
                BigDecimal.ZERO;

        for (PharmacyPrescriptionItem item :
                prescription.getItems()) {

            if (item == null) {

                throw new IllegalArgumentException(
                        "Prescription item cannot be null.");
            }

            if (item.getQuantity() == null ||
                    item.getQuantity() <= 0) {

                throw new IllegalArgumentException(
                        "Prescription quantity must be greater than zero.");
            }

            BigDecimal unitPrice =
                    item.getUnitPrice() == null
                            ? BigDecimal.ZERO
                            : item.getUnitPrice();

            if (unitPrice.compareTo(
                    BigDecimal.ZERO) < 0) {

                throw new IllegalArgumentException(
                        "Prescription item price cannot be negative.");
            }

            BigDecimal totalPrice =
                    unitPrice.multiply(
                            BigDecimal.valueOf(
                                    item.getQuantity()));

            item.setUnitPrice(
                    unitPrice);

            item.setTotalPrice(
                    totalPrice);

            subtotal =
                    subtotal.add(
                            totalPrice);
        }

        return subtotal;
    }

    // =====================================================
    // BUILD PHARMACY DESCRIPTION
    // =====================================================

    private String buildPharmacyDescription(
            PharmacyPrescription prescription) {

        if (prescription == null ||
                prescription.getItems() == null ||
                prescription.getItems().isEmpty()) {

            return "Pharmacy prescription";
        }

        StringBuilder description =
                new StringBuilder(
                        "Pharmacy: ");

        boolean firstItem = true;

        for (PharmacyPrescriptionItem item :
                prescription.getItems()) {

            if (item == null) {
                continue;
            }

            if (!firstItem) {

                description.append(
                        ", ");
            }

            description.append(
                    item.getMedicineName());

            description.append(
                    " x");

            description.append(
                    item.getQuantity());

            firstItem = false;
        }

        return description.toString();
    }

    // =====================================================
    // BILLING STATUS TO FRONTEND
    // =====================================================

    private String billingStatusToFrontend(
            Billing.BillingStatus status) {

        if (status == null) {
            return null;
        }

        switch (status) {

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
            String value) {

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
    // GENERATE WALK-IN PATIENT ID
    // =====================================================

    private String generateWalkInPatientId() {

        return "WALKIN-" +
                UUID.randomUUID()
                        .toString()
                        .replace(
                                "-",
                                "")
                        .substring(
                                0,
                                8)
                        .toUpperCase();
    }

    // =====================================================
    // CHECK WALK-IN PATIENT ID
    // =====================================================

    private boolean isWalkInPatientId(
            String patientId) {

        return patientId != null &&
                patientId.startsWith(
                        "WALKIN-");
    }

    // =====================================================
    // GENERATE PRESCRIPTION NUMBER
    // =====================================================

    private String generatePrescriptionNumber() {

        Long tenantId =
                getCurrentTenantId();

        String number;

        do {

            int random =
                    (int) (
                            Math.random()
                                    * 100000);

            number =
                    "RX-" +
                            LocalDateTime
                                    .now()
                                    .getYear()
                            +
                            "-" +
                            String.format(
                                    "%05d",
                                    random);

        } while (
                repository
                        .existsByTenant_IdAndPrescriptionNumber(
                                tenantId,
                                number));

        return number;
    }
}