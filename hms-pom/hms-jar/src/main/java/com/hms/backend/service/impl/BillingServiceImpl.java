
package com.hms.backend.service.impl;

import com.hms.backend.dto.BillingItemRequest;
import com.hms.backend.dto.BillingRequest;
import com.hms.backend.dto.PaymentRequest;

import com.hms.backend.entity.Billing;
import com.hms.backend.entity.BillingItem;
import com.hms.backend.entity.Consultation;
import com.hms.backend.entity.Department;
import com.hms.backend.entity.Doctor;
import com.hms.backend.entity.Patient;
import com.hms.backend.entity.PaymentTransaction;

import com.hms.backend.tenant.entity.Tenant;

import com.hms.backend.repository.BillingItemRepository;
import com.hms.backend.repository.BillingRepository;
import com.hms.backend.repository.ConsultationRepository;
import com.hms.backend.repository.DepartmentRepository;
import com.hms.backend.repository.DoctorRepository;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.repository.PaymentTransactionRepository;

import com.hms.backend.service.BillingService;

import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.repository.TenantRepository;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class BillingServiceImpl implements BillingService {

    private final BillingRepository billingRepository;

    private final BillingItemRepository billingItemRepository;

    private final PatientRepository patientRepository;

    private final DoctorRepository doctorRepository;

    private final DepartmentRepository departmentRepository;

    private final ConsultationRepository consultationRepository;

    private final TenantRepository tenantRepository;

    private final PaymentTransactionRepository paymentTransactionRepository;

    public BillingServiceImpl(
            BillingRepository billingRepository,
            BillingItemRepository billingItemRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            DepartmentRepository departmentRepository,
            ConsultationRepository consultationRepository,
            TenantRepository tenantRepository,
            PaymentTransactionRepository paymentTransactionRepository) {

        this.billingRepository = billingRepository;

        this.billingItemRepository = billingItemRepository;

        this.patientRepository = patientRepository;

        this.doctorRepository = doctorRepository;

        this.departmentRepository = departmentRepository;

        this.consultationRepository = consultationRepository;

        this.tenantRepository = tenantRepository;

        this.paymentTransactionRepository =
                paymentTransactionRepository;
    }

    // =========================================================
    // CURRENT TENANT
    // =========================================================

    private Long getCurrentTenantId() {

        return TenantContext.requireTenantId();
    }

    private Tenant getCurrentTenant() {

        Long tenantId = getCurrentTenantId();

        return tenantRepository
                .findById(tenantId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Current tenant not found: " + tenantId));
    }

    // =========================================================
    // GET ALL BILLS
    // =========================================================

    @Override
    public List<Billing> getAllBills() {

        return billingRepository
                .findAllByTenant_Id(
                        getCurrentTenantId());
    }

    // =========================================================
    // GET BILL BY ID
    // =========================================================

    @Override
    public Optional<Billing> getBillById(Long id) {

        if (id == null) {
            return Optional.empty();
        }

        return billingRepository
                .findByIdAndTenant_Id(
                        id,
                        getCurrentTenantId());
    }

    // =========================================================
    // GET BILLS BY PATIENT
    // =========================================================

    @Override
    public List<Billing> getBillsByPatient(String patientId) {

        if (isBlank(patientId)) {
            return new ArrayList<>();
        }

        return billingRepository
                .findByTenant_IdAndPatientIdOrderByBillingDateDesc(
                        getCurrentTenantId(),
                        patientId.trim());
    }

    // =========================================================
    // GET ACTIVE BILL BY PATIENT
    // =========================================================

    @Override
    public Optional<Billing> getActiveBillByPatient(
            String patientId) {

        if (isBlank(patientId)) {
            return Optional.empty();
        }

        return billingRepository
                .findFirstByTenant_IdAndPatientIdAndStatusNotAndStatusNotOrderByBillingDateDesc(
                        getCurrentTenantId(),
                        patientId.trim(),
                        Billing.BillingStatus.PAID,
                        Billing.BillingStatus.CANCELLED);
    }

    // =========================================================
    // GET BILL BY CONSULTATION
    // =========================================================

    @Override
    public Optional<Billing> getBillByConsultation(
            String consultationId) {

        if (isBlank(consultationId)) {
            return Optional.empty();
        }

        return billingRepository
                .findFirstByTenant_IdAndConsultationIdAndStatusNotAndStatusNotOrderByBillingDateDesc(
                        getCurrentTenantId(),
                        consultationId.trim(),
                        Billing.BillingStatus.PAID,
                        Billing.BillingStatus.CANCELLED);
    }

    // =========================================================
    // GET BILLS BY STATUS
    // =========================================================

    @Override
    public List<Billing> getBillsByStatus(
            Billing.BillingStatus status) {

        if (status == null) {
            return new ArrayList<>();
        }

        return billingRepository
                .findByTenant_IdAndStatusOrderByBillingDateDesc(
                        getCurrentTenantId(),
                        status);
    }

    // =========================================================
    // CREATE BILL
    // =========================================================

    @Override
    public Billing createBill(
            BillingRequest request) {

        validateBillingRequest(request);

        Long tenantId = getCurrentTenantId();

        Tenant tenant = getCurrentTenant();

        // =====================================================
        // VALIDATE PATIENT
        // =====================================================

        Patient patient = patientRepository
                .findByIdAndTenant_Id(
                        request.getPatientId().trim(),
                        tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Patient not found in the current tenant: "
                                + request.getPatientId()));

        // =====================================================
        // VALIDATE DOCTOR
        // =====================================================

        String doctorId = clean(request.getDoctorId());

        if (doctorId != null) {

            doctorRepository
                    .findByIdAndTenant_Id(
                            doctorId,
                            tenantId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Doctor not found in the current tenant: "
                                    + doctorId));
        }

        // =====================================================
        // VALIDATE DEPARTMENT
        // =====================================================

        String departmentId = clean(request.getDepartmentId());

        if (departmentId != null) {

            departmentRepository
                    .findByIdAndTenant_Id(
                            departmentId,
                            tenantId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Department not found in the current tenant: "
                                    + departmentId));
        }

        // =====================================================
        // VALIDATE CONSULTATION
        // =====================================================

        String consultationId = clean(
                getConsultationIdSafely(request));

        if (consultationId != null) {

            Consultation consultation = consultationRepository
                    .findByIdAndTenant_Id(
                            consultationId,
                            tenantId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Consultation not found in the current tenant: "
                                    + consultationId));

            if (consultation.getPatientId() != null
                    && !consultation.getPatientId()
                            .equals(request.getPatientId().trim())) {

                throw new IllegalArgumentException(
                        "The consultation does not belong to the selected patient.");
            }
        }

        // =====================================================
        // CREATE BILL
        // =====================================================

        Billing bill = new Billing();

        bill.setTenant(tenant);

        bill.setPatientId(patient.getId());

        bill.setPatientName(
                request.getPatientName().trim());

        bill.setPatientNumber(
                clean(request.getPatientNumber()));

        bill.setDoctorId(doctorId);

        bill.setDoctorName(
                clean(request.getDoctorName()));

        bill.setDepartmentId(departmentId);

        bill.setDepartmentName(
                clean(request.getDepartmentName()));

        bill.setConsultationId(consultationId);

        bill.setDueDate(
                request.getDueDate());

        bill.setNotes(
                clean(request.getNotes()));

        bill.setAmount(
                BigDecimal.ZERO);

        bill.setAmountPaid(
                BigDecimal.ZERO);

        bill.setBalance(
                BigDecimal.ZERO);

        bill.setStatus(
                Billing.BillingStatus.PENDING);

        bill.setBillingDate(
                LocalDateTime.now());

        bill.setInvoiceNumber(
                generateInvoiceNumber());

        Billing savedBill = billingRepository.save(bill);

        // =====================================================
        // ADD ITEMS
        // =====================================================

        if (request.getItems() != null
                && !request.getItems().isEmpty()) {

            for (BillingItemRequest itemRequest :
                    request.getItems()) {

                if (itemRequest == null) {
                    continue;
                }

                addItemToBill(
                        savedBill,
                        itemRequest);
            }
        }

        recalculateBill(savedBill);

        return billingRepository.save(savedBill);
    }

    // =========================================================
    // ADD CHARGE TO PATIENT BILL
    //
    // SUPPORTS:
    // 1. Registered patients
    // 2. Pharmacy walk-in customers using WALKIN-* IDs
    // =========================================================

    @Override
    public Billing addChargeToPatientBill(
            String patientId,
            BillingItemRequest item,
            String patientName,
            String patientNumber,
            String doctorId,
            String doctorName,
            String departmentId,
            String departmentName) {

        if (isBlank(patientId)) {

            throw new IllegalArgumentException(
                    "Patient ID is required.");
        }

        if (item == null) {

            throw new IllegalArgumentException(
                    "Billing item is required.");
        }

        if (isBlank(patientName)) {

            throw new IllegalArgumentException(
                    "Patient name is required.");
        }

        Long tenantId = getCurrentTenantId();

        String cleanPatientId = patientId.trim();

        // =====================================================
        // WALK-IN SUPPORT
        // =====================================================

        boolean walkInCustomer =
                isWalkInPatientId(cleanPatientId);

        final Patient patient;

        if (walkInCustomer) {

            patient = null;

        } else {

            patient = patientRepository
                    .findByIdAndTenant_Id(
                            cleanPatientId,
                            tenantId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Patient not found in the current tenant: "
                                    + cleanPatientId));
        }

        // =====================================================
        // VERIFY DOCTOR
        // =====================================================

        String cleanDoctorId = clean(doctorId);

        if (cleanDoctorId != null) {

            doctorRepository
                    .findByIdAndTenant_Id(
                            cleanDoctorId,
                            tenantId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Doctor not found in the current tenant: "
                                    + cleanDoctorId));
        }

        // =====================================================
        // VERIFY DEPARTMENT
        // =====================================================

        String cleanDepartmentId = clean(departmentId);

        if (cleanDepartmentId != null) {

            departmentRepository
                    .findByIdAndTenant_Id(
                            cleanDepartmentId,
                            tenantId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Department not found in the current tenant: "
                                    + cleanDepartmentId));
        }

        // =====================================================
        // GET OR CREATE ACTIVE BILL
        // =====================================================

        Billing bill = getActiveBillByPatient(
                cleanPatientId)
                .orElseGet(() -> createEmptyBill(
                        cleanPatientId,
                        patient != null
                                ? patient.getId()
                                : null,
                        patientName,
                        patientNumber,
                        cleanDoctorId,
                        doctorName,
                        cleanDepartmentId,
                        departmentName));

        ensureBillCanReceiveCharges(bill);

        updateBillInformation(
                bill,
                patientName,
                patientNumber,
                cleanDoctorId,
                doctorName,
                cleanDepartmentId,
                departmentName);

        BillingItem.BillingType billingType =
                parseBillingType(item.getBillingType());

        String referenceId =
                clean(item.getReferenceId());

        // =====================================================
        // PREVENT DUPLICATE CHARGE
        // =====================================================

        if (!isBlank(referenceId)) {

            boolean exists =
                    billingItemRepository
                            .existsByBillingAndReferenceIdAndBillingType(
                                    bill,
                                    referenceId,
                                    billingType);

            if (exists) {

                recalculateBill(bill);

                return billingRepository.save(bill);
            }
        }

        // =====================================================
        // ADD NEW ITEM
        // =====================================================

        addItemToBill(
                bill,
                item);

        recalculateBill(bill);

        return billingRepository.save(bill);
    }

    // =========================================================
    // UPDATE BILL
    // =========================================================

    @Override
    public Billing updateBill(
            Long id,
            BillingRequest request) {

        validateBillingRequest(request);

        Long tenantId = getCurrentTenantId();

        Billing bill = billingRepository
                .findByIdAndTenant_Id(
                        id,
                        tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Billing record not found."));

        if (bill.getStatus() ==
                Billing.BillingStatus.PAID) {

            throw new IllegalStateException(
                    "A paid invoice cannot be modified.");
        }

        if (bill.getStatus() ==
                Billing.BillingStatus.CANCELLED) {

            throw new IllegalStateException(
                    "A cancelled invoice cannot be modified.");
        }

        // =====================================================
        // UPDATE BILL REMAINS FOR REGISTERED PATIENTS
        // =====================================================

        Patient patient = patientRepository
                .findByIdAndTenant_Id(
                        request.getPatientId().trim(),
                        tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Patient not found in the current tenant."));

        String doctorId = clean(request.getDoctorId());

        if (doctorId != null) {

            doctorRepository
                    .findByIdAndTenant_Id(
                            doctorId,
                            tenantId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Doctor not found in the current tenant."));
        }

        String departmentId = clean(
                request.getDepartmentId());

        if (departmentId != null) {

            departmentRepository
                    .findByIdAndTenant_Id(
                            departmentId,
                            tenantId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Department not found in the current tenant."));
        }

        String consultationId = clean(
                getConsultationIdSafely(request));

        if (consultationId != null) {

            Consultation consultation =
                    consultationRepository
                            .findByIdAndTenant_Id(
                                    consultationId,
                                    tenantId)
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Consultation not found in the current tenant."));

            if (consultation.getPatientId() != null
                    && !consultation.getPatientId()
                            .equals(patient.getId())) {

                throw new IllegalArgumentException(
                        "The consultation does not belong to the selected patient.");
            }
        }

        bill.setPatientId(patient.getId());

        bill.setPatientName(
                request.getPatientName().trim());

        bill.setPatientNumber(
                clean(request.getPatientNumber()));

        bill.setDoctorId(doctorId);

        bill.setDoctorName(
                clean(request.getDoctorName()));

        bill.setDepartmentId(departmentId);

        bill.setDepartmentName(
                clean(request.getDepartmentName()));

        bill.setConsultationId(consultationId);

        bill.setDueDate(
                request.getDueDate());

        bill.setNotes(
                clean(request.getNotes()));

        if (request.getItems() != null) {

            bill.getItems().clear();

            for (BillingItemRequest itemRequest :
                    request.getItems()) {

                if (itemRequest == null) {
                    continue;
                }

                addItemToBill(
                        bill,
                        itemRequest);
            }
        }

        recalculateBill(bill);

        return billingRepository.save(bill);
    }

    // =========================================================
    // DELETE BILL
    // =========================================================

    @Override
    public void deleteBill(Long id) {

        Billing bill = billingRepository
                .findByIdAndTenant_Id(
                        id,
                        getCurrentTenantId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Billing record not found."));

        if (bill.getStatus() ==
                Billing.BillingStatus.PAID) {

            throw new IllegalStateException(
                    "A paid invoice cannot be deleted.");
        }

        if (bill.getStatus() ==
                Billing.BillingStatus.CANCELLED) {

            throw new IllegalStateException(
                    "A cancelled invoice cannot be deleted.");
        }

        billingRepository.delete(bill);
    }

    // =========================================================
    // RECORD PAYMENT
    //
    // ALSO CREATES PAYMENT TRANSACTION / RECEIPT
    // =========================================================

    @Override
    public Billing recordPayment(
            Long id,
            PaymentRequest request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Payment request is required.");
        }

        Long tenantId =
                getCurrentTenantId();

        Tenant tenant =
                getCurrentTenant();

        // =====================================================
        // GET BILL WITHIN CURRENT TENANT
        // =====================================================

        Billing bill = billingRepository
                .findByIdAndTenant_Id(
                        id,
                        tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Billing record not found."));

        // =====================================================
        // VALIDATE BILL STATUS
        // =====================================================

        if (bill.getStatus() ==
                Billing.BillingStatus.CANCELLED) {

            throw new IllegalStateException(
                    "A cancelled invoice cannot receive payment.");
        }

        if (bill.getStatus() ==
                Billing.BillingStatus.PAID) {

            throw new IllegalStateException(
                    "This invoice is already fully paid.");
        }

        // =====================================================
        // VALIDATE PAYMENT AMOUNT
        // =====================================================

        BigDecimal payment =
                request.getAmount();

        if (payment == null) {

            throw new IllegalArgumentException(
                    "Payment amount is required.");
        }

        if (payment.compareTo(
                BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero.");
        }

        // =====================================================
        // CURRENT BALANCE
        // =====================================================

        BigDecimal balance =
                safe(bill.getBalance());

        if (balance.compareTo(
                BigDecimal.ZERO) <= 0) {

            throw new IllegalStateException(
                    "There is no outstanding balance.");
        }

        // =====================================================
        // PREVENT OVERPAYMENT
        // =====================================================

        if (payment.compareTo(balance) > 0) {

            payment = balance;
        }

        // =====================================================
        // CALCULATE NEW TOTAL PAID
        // =====================================================

        BigDecimal currentPaid =
                safe(bill.getAmountPaid());

        BigDecimal newPaid =
                currentPaid.add(payment);

        BigDecimal amount =
                safe(bill.getAmount());

        if (newPaid.compareTo(amount) > 0) {

            newPaid = amount;
        }

        // =====================================================
        // CALCULATE NEW BALANCE
        // =====================================================

        BigDecimal newBalance =
                amount
                        .subtract(newPaid)
                        .max(BigDecimal.ZERO);

        // =====================================================
        // PAYMENT METHOD
        // =====================================================

        Billing.PaymentMethod paymentMethod =
                parsePaymentMethod(
                        request.getPaymentMethod());

        // =====================================================
        // UPDATE BILL
        // =====================================================

        bill.setAmountPaid(newPaid);

        bill.setBalance(newBalance);

        bill.setPaymentMethod(
                paymentMethod);

        updatePaymentStatus(bill);

        bill.setUpdatedAt(
                LocalDateTime.now());

        Billing savedBill =
                billingRepository.save(bill);

        // =====================================================
        // CREATE PAYMENT TRANSACTION
        // =====================================================

        PaymentTransaction transaction =
                new PaymentTransaction();

        transaction.setTenant(tenant);

        transaction.setBilling(savedBill);

        transaction.setReceiptNumber(
                generateReceiptNumber(
                        tenantId));

        transaction.setAmount(payment);

        transaction.setPaymentMethod(
                paymentMethod);

        transaction.setPaymentDate(
                LocalDateTime.now());

        transaction.setReceivedBy(
                getCurrentUsername());

        transaction.setNotes(
                clean(request.getNotes()));

        transaction.setCreatedAt(
                LocalDateTime.now());

        paymentTransactionRepository.save(
                transaction);

        // =====================================================
        // RETURN UPDATED BILL
        // =====================================================

        return savedBill;
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @Override
    public Billing updateStatus(
            Long id,
            Billing.BillingStatus status) {

        if (status == null) {

            throw new IllegalArgumentException(
                    "Billing status is required.");
        }

        Billing bill = billingRepository
                .findByIdAndTenant_Id(
                        id,
                        getCurrentTenantId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Billing record not found."));

        if (bill.getStatus() ==
                    Billing.BillingStatus.PAID
                && status !=
                    Billing.BillingStatus.PAID) {

            throw new IllegalStateException(
                    "A paid invoice cannot be moved back to another status.");
        }

        bill.setStatus(status);

        bill.setUpdatedAt(
                LocalDateTime.now());

        return billingRepository.save(bill);
    }

    // =========================================================
    // BILL COUNT
    // =========================================================

    @Override
    public long countBills() {

        return billingRepository
                .countByTenant_Id(
                        getCurrentTenantId());
    }

    // =========================================================
    // TOTAL BILLING AMOUNT
    // =========================================================

    @Override
    public BigDecimal getTotalAmount() {

        return billingRepository
                .findAllByTenant_Id(
                        getCurrentTenantId())
                .stream()
                .map(bill ->
                        safe(bill.getAmount()))
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add);
    }

    // =========================================================
    // TOTAL PAID
    // =========================================================

    @Override
    public BigDecimal getTotalPaid() {

        return billingRepository
                .findAllByTenant_Id(
                        getCurrentTenantId())
                .stream()
                .map(bill ->
                        safe(bill.getAmountPaid()))
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add);
    }

    // =========================================================
    // TOTAL BALANCE
    // =========================================================

    @Override
    public BigDecimal getTotalBalance() {

        return billingRepository
                .findAllByTenant_Id(
                        getCurrentTenantId())
                .stream()
                .map(bill ->
                        safe(bill.getBalance()))
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add);
    }

    // =========================================================
    // CONSULTATION INVOICE
    // =========================================================

    @Override
    public Billing syncConsultationInvoice(
            String consultationId) {

        if (isBlank(consultationId)) {

            throw new IllegalArgumentException(
                    "Consultation ID is required.");
        }

        Long tenantId =
                getCurrentTenantId();

        String cleanConsultationId =
                consultationId.trim();

        Optional<Billing> existing =
                billingRepository
                        .findFirstByTenant_IdAndConsultationIdAndStatusNotAndStatusNotOrderByBillingDateDesc(
                                tenantId,
                                cleanConsultationId,
                                Billing.BillingStatus.PAID,
                                Billing.BillingStatus.CANCELLED);

        if (existing.isPresent()) {

            return existing.get();
        }

        throw new IllegalStateException(
                "No active invoice exists for consultation "
                        + cleanConsultationId
                        + ".");
    }

    // =========================================================
    // CREATE EMPTY BILL
    // =========================================================

    private Billing createEmptyBill(
            String patientId,
            String patientNumberId,
            String patientName,
            String patientNumber,
            String doctorId,
            String doctorName,
            String departmentId,
            String departmentName) {

        Billing bill = new Billing();

        bill.setTenant(
                getCurrentTenant());

        bill.setPatientId(
                patientId);

        bill.setPatientName(
                patientName.trim());

        bill.setPatientNumber(
                clean(patientNumber));

        bill.setDoctorId(
                clean(doctorId));

        bill.setDoctorName(
                clean(doctorName));

        bill.setDepartmentId(
                clean(departmentId));

        bill.setDepartmentName(
                clean(departmentName));

        bill.setInvoiceNumber(
                generateInvoiceNumber());

        bill.setBillingDate(
                LocalDateTime.now());

        bill.setAmount(
                BigDecimal.ZERO);

        bill.setAmountPaid(
                BigDecimal.ZERO);

        bill.setBalance(
                BigDecimal.ZERO);

        bill.setStatus(
                Billing.BillingStatus.PENDING);

        return billingRepository.save(bill);
    }

    // =========================================================
    // ADD ITEM TO BILL
    // =========================================================

    private void addItemToBill(
            Billing bill,
            BillingItemRequest request) {

        if (request == null) {
            return;
        }

        if (isBlank(
                request.getDescription())) {

            throw new IllegalArgumentException(
                    "Billing item description is required.");
        }

        if (request.getUnitPrice() == null) {

            throw new IllegalArgumentException(
                    "Billing item unit price is required.");
        }

        BigDecimal unitPrice =
                request.getUnitPrice();

        if (unitPrice.compareTo(
                BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Billing item unit price cannot be negative.");
        }

        Integer quantity =
                request.getQuantity();

        if (quantity == null
                || quantity <= 0) {

            quantity = 1;
        }

        BillingItem.BillingType billingType =
                parseBillingType(
                        request.getBillingType());

        BigDecimal amount =
                unitPrice.multiply(
                        BigDecimal.valueOf(quantity));

        BillingItem billingItem =
                new BillingItem();

        billingItem.setBilling(bill);

        billingItem.setBillingType(
                billingType);

        billingItem.setDescription(
                request.getDescription().trim());

        billingItem.setQuantity(
                quantity);

        billingItem.setUnitPrice(
                unitPrice);

        billingItem.setAmount(
                amount);

        billingItem.setReferenceId(
                clean(request.getReferenceId()));

        if (bill.getItems() == null) {

            bill.setItems(
                    new ArrayList<>());
        }

        bill.getItems().add(
                billingItem);
    }

    // =========================================================
    // RECALCULATE BILL
    // =========================================================

    private void recalculateBill(
            Billing bill) {

        if (bill == null) {
            return;
        }

        BigDecimal total =
                BigDecimal.ZERO;

        if (bill.getItems() != null) {

            for (BillingItem item :
                    bill.getItems()) {

                if (item == null) {
                    continue;
                }

                BigDecimal unitPrice =
                        safe(item.getUnitPrice());

                int quantity =
                        item.getQuantity() == null
                                ? 1
                                : item.getQuantity();

                if (quantity <= 0) {
                    quantity = 1;
                }

                BigDecimal itemAmount =
                        unitPrice.multiply(
                                BigDecimal.valueOf(
                                        quantity));

                item.setAmount(
                        itemAmount);

                item.setBilling(
                        bill);

                total = total.add(
                        itemAmount);
            }
        }

        bill.setAmount(total);

        BigDecimal amountPaid =
                safe(bill.getAmountPaid());

        if (amountPaid.compareTo(total) > 0) {

            amountPaid = total;

            bill.setAmountPaid(
                    amountPaid);
        }

        BigDecimal balance =
                total.subtract(amountPaid)
                        .max(BigDecimal.ZERO);

        bill.setBalance(balance);

        updatePaymentStatus(bill);
    }

    // =========================================================
    // UPDATE PAYMENT STATUS
    // =========================================================

    private void updatePaymentStatus(
            Billing bill) {

        if (bill.getStatus()
                == Billing.BillingStatus.CANCELLED) {

            return;
        }

        BigDecimal amount =
                safe(bill.getAmount());

        BigDecimal paid =
                safe(bill.getAmountPaid());

        if (amount.compareTo(
                BigDecimal.ZERO) <= 0) {

            bill.setStatus(
                    Billing.BillingStatus.PENDING);

            return;
        }

        if (paid.compareTo(amount) >= 0) {

            bill.setStatus(
                    Billing.BillingStatus.PAID);

            return;
        }

        if (paid.compareTo(
                BigDecimal.ZERO) > 0) {

            bill.setStatus(
                    Billing.BillingStatus.PARTIALLY_PAID);

            return;
        }

        bill.setStatus(
                Billing.BillingStatus.PENDING);
    }

    // =========================================================
    // UPDATE BILL INFORMATION
    // =========================================================

    private void updateBillInformation(
            Billing bill,
            String patientName,
            String patientNumber,
            String doctorId,
            String doctorName,
            String departmentId,
            String departmentName) {

        if (!isBlank(patientName)) {

            bill.setPatientName(
                    patientName.trim());
        }

        if (!isBlank(patientNumber)) {

            bill.setPatientNumber(
                    patientNumber.trim());
        }

        if (!isBlank(doctorId)) {

            bill.setDoctorId(
                    doctorId.trim());
        }

        if (!isBlank(doctorName)) {

            bill.setDoctorName(
                    doctorName.trim());
        }

        if (!isBlank(departmentId)) {

            bill.setDepartmentId(
                    departmentId.trim());
        }

        if (!isBlank(departmentName)) {

            bill.setDepartmentName(
                    departmentName.trim());
        }
    }

    // =========================================================
    // CHECK WHETHER BILL CAN RECEIVE CHARGES
    // =========================================================

    private void ensureBillCanReceiveCharges(
            Billing bill) {

        if (bill == null) {

            throw new IllegalArgumentException(
                    "Billing record is required.");
        }

        if (bill.getStatus()
                == Billing.BillingStatus.PAID) {

            throw new IllegalStateException(
                    "The invoice is already paid and cannot receive new charges.");
        }

        if (bill.getStatus()
                == Billing.BillingStatus.CANCELLED) {

            throw new IllegalStateException(
                    "The invoice is cancelled and cannot receive new charges.");
        }
    }

    // =========================================================
    // VALIDATE BILL REQUEST
    // =========================================================

    private void validateBillingRequest(
            BillingRequest request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Billing request is required.");
        }

        if (isBlank(request.getPatientId())) {

            throw new IllegalArgumentException(
                    "Patient ID is required.");
        }

        if (isBlank(request.getPatientName())) {

            throw new IllegalArgumentException(
                    "Patient name is required.");
        }
    }

    // =========================================================
    // CONSULTATION ID
    // =========================================================

    private String getConsultationIdSafely(
            BillingRequest request) {

        return request.getConsultationId();
    }

    // =========================================================
    // PARSE BILLING TYPE
    // =========================================================

    private BillingItem.BillingType parseBillingType(
            String value) {

        if (isBlank(value)) {

            return BillingItem.BillingType.OTHER;
        }

        String normalized =
                value.trim()
                        .toUpperCase()
                        .replace("-", "_")
                        .replace(" ", "_");

        return switch (normalized) {

            case "CONSULTATION" ->
                    BillingItem.BillingType.CONSULTATION;

            case "LAB",
                    "LABORATORY",
                    "LABORATORY_TEST",
                    "LAB_TEST" ->
                    BillingItem.BillingType.LABORATORY;

            case "PHARMACY",
                    "MEDICINE",
                    "MEDICATION" ->
                    BillingItem.BillingType.PHARMACY;

            case "ADMISSION" ->
                    BillingItem.BillingType.ADMISSION;

            case "PROCEDURE" ->
                    BillingItem.BillingType.PROCEDURE;

            case "OTHER" ->
                    BillingItem.BillingType.OTHER;

            default ->
                    BillingItem.BillingType.OTHER;
        };
    }

    // =========================================================
    // PARSE PAYMENT METHOD
    // =========================================================

    private Billing.PaymentMethod parsePaymentMethod(
            String value) {

        if (isBlank(value)) {

            return Billing.PaymentMethod.OTHER;
        }

        String normalized =
                value.trim()
                        .toUpperCase()
                        .replace("-", "_")
                        .replace(" ", "_");

        return switch (normalized) {

            case "CASH" ->
                    Billing.PaymentMethod.CASH;

            case "MOBILE",
                    "MOBILE_MONEY",
                    "MOMO" ->
                    Billing.PaymentMethod.MOBILE_MONEY;

            case "CARD" ->
                    Billing.PaymentMethod.CARD;

            case "BANK",
                    "BANK_TRANSFER" ->
                    Billing.PaymentMethod.BANK_TRANSFER;

            case "INSURANCE" ->
                    Billing.PaymentMethod.INSURANCE;

            case "OTHER" ->
                    Billing.PaymentMethod.OTHER;

            default ->
                    Billing.PaymentMethod.OTHER;
        };
    }

    // =========================================================
    // GENERATE INVOICE NUMBER
    // =========================================================

    private String generateInvoiceNumber() {

        Long tenantId =
                getCurrentTenantId();

        String invoiceNumber;

        do {

            String randomPart =
                    UUID.randomUUID()
                            .toString()
                            .replace("-", "")
                            .substring(0, 8)
                            .toUpperCase();

            invoiceNumber =
                    "INV-"
                            + LocalDate.now()
                            + "-"
                            + randomPart;

        } while (billingRepository
                .existsByTenant_IdAndInvoiceNumber(
                        tenantId,
                        invoiceNumber));

        return invoiceNumber;
    }

    // =========================================================
    // GENERATE RECEIPT NUMBER
    // =========================================================

    private String generateReceiptNumber(
            Long tenantId) {

        String receiptNumber;

        do {

            String randomPart =
                    UUID.randomUUID()
                            .toString()
                            .replace("-", "")
                            .substring(0, 8)
                            .toUpperCase();

            receiptNumber =
                    "RCPT-"
                            + LocalDate.now()
                                    .getYear()
                            + "-"
                            + randomPart;

        } while (paymentTransactionRepository
                .existsByTenant_IdAndReceiptNumber(
                        tenantId,
                        receiptNumber));

        return receiptNumber;
    }

    // =========================================================
    // CURRENT AUTHENTICATED USER
    // =========================================================

    private String getCurrentUsername() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return "SYSTEM";
        }

        String username =
                authentication.getName();

        if (username == null
                || username.isBlank()) {

            return "SYSTEM";
        }

        return username;
    }

    // =========================================================
    // WALK-IN PATIENT ID
    // =========================================================

    private boolean isWalkInPatientId(
            String patientId) {

        return patientId != null
                && patientId
                        .toUpperCase()
                        .startsWith("WALKIN-");
    }

    // =========================================================
    // SAFE BIG DECIMAL
    // =========================================================

    private BigDecimal safe(
            BigDecimal value) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }

    // =========================================================
    // CLEAN STRING
    // =========================================================

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

    // =========================================================
    // BLANK CHECK
    // =========================================================

    private boolean isBlank(
            String value) {

        return value == null
                || value.trim().isEmpty();
    }
}

