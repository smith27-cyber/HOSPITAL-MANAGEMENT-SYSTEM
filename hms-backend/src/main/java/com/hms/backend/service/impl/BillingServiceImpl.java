
package com.hms.backend.service.impl;

import com.hms.backend.dto.BillingItemRequest;
import com.hms.backend.dto.BillingRequest;
import com.hms.backend.dto.PaymentRequest;
import com.hms.backend.entity.Billing;
import com.hms.backend.entity.BillingItem;
import com.hms.backend.repository.BillingItemRepository;
import com.hms.backend.repository.BillingRepository;
import com.hms.backend.service.BillingService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;


@Service
@Transactional
public class BillingServiceImpl
        implements BillingService {


    // =====================================================
    // REPOSITORIES
    // =====================================================

    private final BillingRepository billingRepository;

    private final BillingItemRepository billingItemRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public BillingServiceImpl(
            BillingRepository billingRepository,
            BillingItemRepository billingItemRepository
    ) {

        this.billingRepository =
                billingRepository;

        this.billingItemRepository =
                billingItemRepository;

    }


    // =====================================================
    // GET ALL BILLS
    // =====================================================

    @Override
    public List<Billing> getAllBills() {

        return billingRepository
                .findAll();

    }


    // =====================================================
    // GET BILL BY ID
    // =====================================================

    @Override
    public Optional<Billing> getBillById(
            Long id
    ) {

        if (id == null) {

            return Optional.empty();

        }

        return billingRepository
                .findById(id);

    }


    // =====================================================
    // GET BILLS BY PATIENT
    // =====================================================

    @Override
    public List<Billing> getBillsByPatient(
            String patientId
    ) {

        if (
                patientId == null ||
                patientId.isBlank()
        ) {

            return new ArrayList<>();

        }

        return billingRepository
                .findByPatientIdOrderByBillingDateDesc(
                        patientId.trim()
                );

    }


    // =====================================================
    // GET ACTIVE BILL BY PATIENT
    // =====================================================

    @Override
    public Optional<Billing> getActiveBillByPatient(
            String patientId
    ) {

        if (
                patientId == null ||
                patientId.isBlank()
        ) {

            return Optional.empty();

        }

        return billingRepository
                .findFirstByPatientIdAndStatusNotAndStatusNotOrderByBillingDateDesc(
                        patientId.trim(),
                        Billing.BillingStatus.PAID,
                        Billing.BillingStatus.CANCELLED
                );

    }


    // =====================================================
    // GET BILLS BY STATUS
    // =====================================================

    @Override
    public List<Billing> getBillsByStatus(
            Billing.BillingStatus status
    ) {

        if (status == null) {

            return new ArrayList<>();

        }

        return billingRepository
                .findByStatusOrderByBillingDateDesc(
                        status
                );

    }


    // =====================================================
    // CREATE BILL
    // =====================================================

    @Override
    public Billing createBill(
            BillingRequest request
    ) {

        validateBillingRequest(
                request
        );


        Billing bill =
                new Billing();


        // -------------------------------------------------
        // PATIENT
        // -------------------------------------------------

        bill.setPatientId(
                request
                        .getPatientId()
                        .trim()
        );


        bill.setPatientName(
                safeString(
                        request.getPatientName()
                )
        );


        bill.setPatientNumber(
                safeNullableString(
                        request.getPatientNumber()
                )
        );


        // -------------------------------------------------
        // DOCTOR
        // -------------------------------------------------

        bill.setDoctorId(
                safeNullableString(
                        request.getDoctorId()
                )
        );


        bill.setDoctorName(
                safeNullableString(
                        request.getDoctorName()
                )
        );


        // -------------------------------------------------
        // DEPARTMENT
        // -------------------------------------------------

        bill.setDepartmentId(
                safeNullableString(
                        request.getDepartmentId()
                )
        );


        bill.setDepartmentName(
                safeNullableString(
                        request.getDepartmentName()
                )
        );


        // -------------------------------------------------
        // BILLING DATE
        // -------------------------------------------------

        bill.setBillingDate(
                LocalDateTime.now()
        );


        // -------------------------------------------------
        // DUE DATE
        // -------------------------------------------------

        bill.setDueDate(
                toDateTime(
                        request.getDueDate()
                )
        );


        // -------------------------------------------------
        // NOTES
        // -------------------------------------------------

        bill.setNotes(
                safeNullableString(
                        request.getNotes()
                )
        );


        // -------------------------------------------------
        // INITIAL TOTALS
        // -------------------------------------------------

        bill.setAmount(
                BigDecimal.ZERO
        );


        bill.setAmountPaid(
                BigDecimal.ZERO
        );


        bill.setBalance(
                BigDecimal.ZERO
        );


        // -------------------------------------------------
        // INITIAL STATUS
        // -------------------------------------------------

        bill.setStatus(
                Billing.BillingStatus.PENDING
        );


        // -------------------------------------------------
        // INVOICE NUMBER
        // -------------------------------------------------

        bill.setInvoiceNumber(
                generateInvoiceNumber()
        );


        // -------------------------------------------------
        // ITEMS
        // -------------------------------------------------

        bill.setItems(
                new ArrayList<>()
        );


        // -------------------------------------------------
        // DESCRIPTION
        // -------------------------------------------------
        //
        // Billing entity does not contain a description
        // field. Descriptions belong to BillingItem.
        //
        // -------------------------------------------------


        // -------------------------------------------------
        // SAVE BILL FIRST
        // -------------------------------------------------

        Billing savedBill =
                billingRepository.save(
                        bill
                );


        // -------------------------------------------------
        // ADD ITEMS
        // -------------------------------------------------

        if (
                request.getItems() != null &&
                !request.getItems().isEmpty()
        ) {

            for (
                    BillingItemRequest itemRequest :
                    request.getItems()
            ) {

                addItemToBill(
                        savedBill,
                        itemRequest
                );

            }

        }


        // -------------------------------------------------
        // RECALCULATE
        // -------------------------------------------------

        recalculateBill(
                savedBill
        );


        return billingRepository.save(
                savedBill
        );

    }


    // =====================================================
    // ADD CHARGE TO PATIENT BILL
    // =====================================================

    @Override
    public Billing addChargeToPatientBill(
            String patientId,
            BillingItemRequest item,
            String patientName,
            String patientNumber,
            String doctorId,
            String doctorName,
            String departmentId,
            String departmentName
    ) {

        // -------------------------------------------------
        // VALIDATE PATIENT
        // -------------------------------------------------

        if (
                patientId == null ||
                patientId.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );

        }


        // -------------------------------------------------
        // VALIDATE ITEM
        // -------------------------------------------------

        validateBillingItemRequest(
                item
        );


        // -------------------------------------------------
        // GET OR CREATE ACTIVE BILL
        // -------------------------------------------------

        Billing bill =
                getActiveBillByPatient(
                        patientId
                )
                .orElseGet(
                        () ->
                                createEmptyBill(
                                        patientId.trim(),
                                        patientName,
                                        patientNumber,
                                        doctorId,
                                        doctorName,
                                        departmentId,
                                        departmentName
                                )
                );


        // -------------------------------------------------
        // UPDATE PATIENT DETAILS
        // -------------------------------------------------

        if (
                patientName != null &&
                !patientName.isBlank()
        ) {

            bill.setPatientName(
                    patientName.trim()
            );

        }


        if (
                patientNumber != null &&
                !patientNumber.isBlank()
        ) {

            bill.setPatientNumber(
                    patientNumber.trim()
            );

        }


        // -------------------------------------------------
        // UPDATE DOCTOR
        // -------------------------------------------------

        if (
                doctorId != null &&
                !doctorId.isBlank()
        ) {

            bill.setDoctorId(
                    doctorId.trim()
            );

        }


        if (
                doctorName != null &&
                !doctorName.isBlank()
        ) {

            bill.setDoctorName(
                    doctorName.trim()
            );

        }


        // -------------------------------------------------
        // UPDATE DEPARTMENT
        // -------------------------------------------------

        if (
                departmentId != null &&
                !departmentId.isBlank()
        ) {

            bill.setDepartmentId(
                    departmentId.trim()
            );

        }


        if (
                departmentName != null &&
                !departmentName.isBlank()
        ) {

            bill.setDepartmentName(
                    departmentName.trim()
            );

        }


        // =================================================
        // DUPLICATE CHARGE PROTECTION
        // =================================================

        if (
                item.getReferenceId() != null &&
                !item.getReferenceId().isBlank()
        ) {

            BillingItem.BillingType type =
                    parseBillingType(
                            item.getBillingType()
                    );


            boolean exists =
                    billingItemRepository
                            .existsByBillingAndReferenceIdAndBillingType(
                                    bill,
                                    item.getReferenceId().trim(),
                                    type
                            );


            if (exists) {

                return bill;

            }

        }


        // =================================================
        // ADD NEW ITEM
        // =================================================

        addItemToBill(
                bill,
                item
        );


        // =================================================
        // RECALCULATE BILL
        // =================================================

        recalculateBill(
                bill
        );


        bill.setUpdatedAt(
                LocalDateTime.now()
        );


        return billingRepository.save(
                bill
        );

    }


    // =====================================================
    // CREATE EMPTY BILL
    // =====================================================

    private Billing createEmptyBill(
            String patientId,
            String patientName,
            String patientNumber,
            String doctorId,
            String doctorName,
            String departmentId,
            String departmentName
    ) {

        Billing bill =
                new Billing();


        // -------------------------------------------------
        // PATIENT
        // -------------------------------------------------

        bill.setPatientId(
                patientId
        );


        bill.setPatientName(
                safeString(
                        patientName
                )
        );


        bill.setPatientNumber(
                safeNullableString(
                        patientNumber
                )
        );


        // -------------------------------------------------
        // DOCTOR
        // -------------------------------------------------

        bill.setDoctorId(
                safeNullableString(
                        doctorId
                )
        );


        bill.setDoctorName(
                safeNullableString(
                        doctorName
                )
        );


        // -------------------------------------------------
        // DEPARTMENT
        // -------------------------------------------------

        bill.setDepartmentId(
                safeNullableString(
                        departmentId
                )
        );


        bill.setDepartmentName(
                safeNullableString(
                        departmentName
                )
        );


        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        bill.setBillingDate(
                LocalDateTime.now()
        );


        // -------------------------------------------------
        // TOTALS
        // -------------------------------------------------

        bill.setAmount(
                BigDecimal.ZERO
        );


        bill.setAmountPaid(
                BigDecimal.ZERO
        );


        bill.setBalance(
                BigDecimal.ZERO
        );


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        bill.setStatus(
                Billing.BillingStatus.PENDING
        );


        // -------------------------------------------------
        // INVOICE
        // -------------------------------------------------

        bill.setInvoiceNumber(
                generateInvoiceNumber()
        );


        // -------------------------------------------------
        // ITEMS
        // -------------------------------------------------

        bill.setItems(
                new ArrayList<>()
        );


        return billingRepository.save(
                bill
        );

    }


    // =====================================================
    // UPDATE BILL
    // =====================================================

    @Override
    public Billing updateBill(
            Long id,
            BillingRequest request
    ) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Billing ID is required."
            );

        }


        validateBillingRequest(
                request
        );


        Billing bill =
                billingRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Billing record not found."
                                        )
                        );


        // -------------------------------------------------
        // PROTECT PAID
        // -------------------------------------------------

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.PAID
        ) {

            throw new IllegalStateException(
                    "Paid invoices cannot be modified."
            );

        }


        // -------------------------------------------------
        // PROTECT CANCELLED
        // -------------------------------------------------

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "Cancelled invoices cannot be modified."
            );

        }


        // -------------------------------------------------
        // PATIENT
        // -------------------------------------------------

        bill.setPatientId(
                request
                        .getPatientId()
                        .trim()
        );


        bill.setPatientName(
                safeString(
                        request.getPatientName()
                )
        );


        bill.setPatientNumber(
                safeNullableString(
                        request.getPatientNumber()
                )
        );


        // -------------------------------------------------
        // DOCTOR
        // -------------------------------------------------

        bill.setDoctorId(
                safeNullableString(
                        request.getDoctorId()
                )
        );


        bill.setDoctorName(
                safeNullableString(
                        request.getDoctorName()
                )
        );


        // -------------------------------------------------
        // DEPARTMENT
        // -------------------------------------------------

        bill.setDepartmentId(
                safeNullableString(
                        request.getDepartmentId()
                )
        );


        bill.setDepartmentName(
                safeNullableString(
                        request.getDepartmentName()
                )
        );


        // -------------------------------------------------
        // DUE DATE
        // -------------------------------------------------

        bill.setDueDate(
                toDateTime(
                        request.getDueDate()
                )
        );


        // -------------------------------------------------
        // NOTES
        // -------------------------------------------------

        bill.setNotes(
                safeNullableString(
                        request.getNotes()
                )
        );


        // =================================================
        // REPLACE ITEMS
        // =================================================

        if (
                request.getItems() != null
        ) {

            if (
                    bill.getItems() == null
            ) {

                bill.setItems(
                        new ArrayList<>()
                );

            } else {

                bill.getItems().clear();

            }


            for (
                    BillingItemRequest itemRequest :
                    request.getItems()
            ) {

                addItemToBill(
                        bill,
                        itemRequest
                );

            }

        }


        // =================================================
        // RECALCULATE
        // =================================================

        recalculateBill(
                bill
        );


        bill.setUpdatedAt(
                LocalDateTime.now()
        );


        return billingRepository.save(
                bill
        );

    }


    // =====================================================
    // DELETE BILL
    // =====================================================

    @Override
    public void deleteBill(
            Long id
    ) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Billing ID is required."
            );

        }


        Billing bill =
                billingRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Billing record not found."
                                        )
                        );


        if (
                bill.getStatus() ==
                        Billing.BillingStatus.PAID
        ) {

            throw new IllegalStateException(
                    "Paid invoices cannot be deleted."
            );

        }


        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "Cancelled invoices cannot be deleted."
            );

        }


        billingRepository.delete(
                bill
        );

    }


    // =====================================================
    // RECORD PAYMENT
    // =====================================================

    @Override
    public Billing recordPayment(
            Long id,
            PaymentRequest request
    ) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Billing ID is required."
            );

        }


        if (request == null) {

            throw new IllegalArgumentException(
                    "Payment request is required."
            );

        }


        Billing bill =
                billingRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Billing record not found."
                                        )
                        );


        // -------------------------------------------------
        // PROTECT CANCELLED
        // -------------------------------------------------

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "Cancelled invoices cannot receive payments."
            );

        }


        // -------------------------------------------------
        // PROTECT PAID
        // -------------------------------------------------

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.PAID
        ) {

            throw new IllegalStateException(
                    "This invoice is already fully paid."
            );

        }


        // -------------------------------------------------
        // PAYMENT AMOUNT
        // -------------------------------------------------

        BigDecimal payment =
                request.getAmount();


        if (
                payment == null ||
                payment.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero."
            );

        }


        // -------------------------------------------------
        // CURRENT BALANCE
        // -------------------------------------------------

        BigDecimal balance =
                Optional.ofNullable(
                        bill.getBalance()
                )
                .orElse(
                        BigDecimal.ZERO
                );


        // -------------------------------------------------
        // PREVENT OVERPAYMENT
        // -------------------------------------------------

        if (
                payment.compareTo(
                        balance
                ) > 0
        ) {

            payment =
                    balance;

        }


        // -------------------------------------------------
        // CURRENT PAID
        // -------------------------------------------------

        BigDecimal currentPaid =
                Optional.ofNullable(
                        bill.getAmountPaid()
                )
                .orElse(
                        BigDecimal.ZERO
                );


        BigDecimal newPaid =
                currentPaid.add(
                        payment
                );


        BigDecimal amount =
                Optional.ofNullable(
                        bill.getAmount()
                )
                .orElse(
                        BigDecimal.ZERO
                );


        // -------------------------------------------------
        // UPDATE PAID
        // -------------------------------------------------

        bill.setAmountPaid(
                newPaid.min(
                        amount
                )
        );


        // -------------------------------------------------
        // UPDATE BALANCE
        // -------------------------------------------------

        bill.setBalance(
                amount
                        .subtract(
                                bill.getAmountPaid()
                        )
                        .max(
                                BigDecimal.ZERO
                        )
        );


        // -------------------------------------------------
        // PAYMENT METHOD
        // -------------------------------------------------

        bill.setPaymentMethod(
                parsePaymentMethod(
                        request.getPaymentMethod()
                )
        );


        // -------------------------------------------------
        // UPDATE STATUS
        // -------------------------------------------------

        updatePaymentStatus(
                bill
        );


        bill.setUpdatedAt(
                LocalDateTime.now()
        );


        return billingRepository.save(
                bill
        );

    }


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    @Override
    public Billing updateStatus(
            Long id,
            Billing.BillingStatus status
    ) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Billing ID is required."
            );

        }


        if (status == null) {

            throw new IllegalArgumentException(
                    "Billing status is required."
            );

        }


        Billing bill =
                billingRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Billing record not found."
                                        )
                        );


        // -------------------------------------------------
        // PAID CANNOT BE REOPENED
        // -------------------------------------------------

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.PAID &&
                status !=
                        Billing.BillingStatus.PAID
        ) {

            throw new IllegalStateException(
                    "A paid invoice cannot be moved back to another status."
            );

        }


        // -------------------------------------------------
        // CANCELLED CANNOT BE REOPENED
        // -------------------------------------------------

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED &&
                status !=
                        Billing.BillingStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "A cancelled invoice cannot be reopened through this operation."
            );

        }


        bill.setStatus(
                status
        );


        bill.setUpdatedAt(
                LocalDateTime.now()
        );


        return billingRepository.save(
                bill
        );

    }


    // =====================================================
    // COUNT BILLS
    // =====================================================

    @Override
    public long countBills() {

        return billingRepository.count();

    }


    // =====================================================
    // TOTAL AMOUNT
    // =====================================================

    @Override
    public BigDecimal getTotalAmount() {

        return billingRepository
                .findAll()
                .stream()
                .map(
                        bill ->
                                Optional.ofNullable(
                                        bill.getAmount()
                                )
                                .orElse(
                                        BigDecimal.ZERO
                                )
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

    }


    // =====================================================
    // TOTAL PAID
    // =====================================================

    @Override
    public BigDecimal getTotalPaid() {

        return billingRepository
                .findAll()
                .stream()
                .map(
                        bill ->
                                Optional.ofNullable(
                                        bill.getAmountPaid()
                                )
                                .orElse(
                                        BigDecimal.ZERO
                                )
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

    }


    // =====================================================
    // TOTAL BALANCE
    // =====================================================

    @Override
    public BigDecimal getTotalBalance() {

        return billingRepository
                .findAll()
                .stream()
                .map(
                        bill ->
                                Optional.ofNullable(
                                        bill.getBalance()
                                )
                                .orElse(
                                        BigDecimal.ZERO
                                )
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

    }


    // =====================================================
    // ADD ITEM TO BILL
    // =====================================================

    private void addItemToBill(
            Billing bill,
            BillingItemRequest request
    ) {

        if (bill == null) {

            throw new IllegalArgumentException(
                    "Billing record is required."
            );

        }


        validateBillingItemRequest(
                request
        );


        if (
                bill.getItems() == null
        ) {

            bill.setItems(
                    new ArrayList<>()
            );

        }


        BillingItem item =
                new BillingItem();


        // -------------------------------------------------
        // BILL RELATIONSHIP
        // -------------------------------------------------

        item.setBilling(
                bill
        );


        // -------------------------------------------------
        // BILLING TYPE
        // -------------------------------------------------

        item.setBillingType(
                parseBillingType(
                        request.getBillingType()
                )
        );


        // -------------------------------------------------
        // DESCRIPTION
        // -------------------------------------------------

        item.setDescription(
                request
                        .getDescription()
                        .trim()
        );


        // -------------------------------------------------
        // QUANTITY
        // -------------------------------------------------

        item.setQuantity(
                request.getQuantity()
        );


        // -------------------------------------------------
        // UNIT PRICE
        // -------------------------------------------------

        item.setUnitPrice(
                request.getUnitPrice()
        );


        // -------------------------------------------------
        // TOTAL
        // -------------------------------------------------

        BigDecimal quantity =
                BigDecimal.valueOf(
                        request.getQuantity()
                );


        BigDecimal amount =
                request
                        .getUnitPrice()
                        .multiply(
                                quantity
                        );


        item.setAmount(
                amount
        );


        // -------------------------------------------------
        // REFERENCE
        // -------------------------------------------------

        item.setReferenceId(
                safeNullableString(
                        request.getReferenceId()
                )
        );


        // -------------------------------------------------
        // ADD USING ENTITY HELPER
        // -------------------------------------------------

        bill.addItem(
                item
        );

    }


    // =====================================================
    // RECALCULATE BILL
    // =====================================================

    private void recalculateBill(
            Billing bill
    ) {

        if (bill == null) {

            return;

        }


        if (
                bill.getItems() == null
        ) {

            bill.setItems(
                    new ArrayList<>()
            );

        }


        // -------------------------------------------------
        // TOTAL ITEMS
        // -------------------------------------------------

        BigDecimal total =
                bill.getItems()
                        .stream()
                        .map(
                                item ->
                                        Optional.ofNullable(
                                                item.getAmount()
                                        )
                                        .orElse(
                                                BigDecimal.ZERO
                                        )
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        // -------------------------------------------------
        // EXISTING PAYMENTS
        // -------------------------------------------------

        BigDecimal paid =
                Optional.ofNullable(
                        bill.getAmountPaid()
                )
                .orElse(
                        BigDecimal.ZERO
                );


        // -------------------------------------------------
        // PREVENT PAID > TOTAL
        // -------------------------------------------------

        if (
                paid.compareTo(
                        total
                ) > 0
        ) {

            paid =
                    total;

        }


        // -------------------------------------------------
        // SET TOTALS
        // -------------------------------------------------

        bill.setAmount(
                total
        );


        bill.setAmountPaid(
                paid
        );


        bill.setBalance(
                total
                        .subtract(
                                paid
                        )
                        .max(
                                BigDecimal.ZERO
                        )
        );


        // -------------------------------------------------
        // UPDATE STATUS
        // -------------------------------------------------

        updatePaymentStatus(
                bill
        );

    }


    // =====================================================
    // UPDATE PAYMENT STATUS
    // =====================================================

    private void updatePaymentStatus(
            Billing bill
    ) {

        if (bill == null) {

            return;

        }


        // -------------------------------------------------
        // CANCELLED STAYS CANCELLED
        // -------------------------------------------------

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED
        ) {

            return;

        }


        BigDecimal amount =
                Optional.ofNullable(
                        bill.getAmount()
                )
                .orElse(
                        BigDecimal.ZERO
                );


        BigDecimal paid =
                Optional.ofNullable(
                        bill.getAmountPaid()
                )
                .orElse(
                        BigDecimal.ZERO
                );


        // -------------------------------------------------
        // NO CHARGES
        // -------------------------------------------------

        if (
                amount.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            bill.setStatus(
                    Billing.BillingStatus.PENDING
            );

            return;

        }


        // -------------------------------------------------
        // FULLY PAID
        // -------------------------------------------------

        if (
                paid.compareTo(
                        amount
                ) >= 0
        ) {

            bill.setStatus(
                    Billing.BillingStatus.PAID
            );

            return;

        }


        // -------------------------------------------------
        // PARTIALLY PAID
        // -------------------------------------------------

        if (
                paid.compareTo(
                        BigDecimal.ZERO
                ) > 0
        ) {

            bill.setStatus(
                    Billing.BillingStatus.PARTIALLY_PAID
            );

            return;

        }


        // -------------------------------------------------
        // UNPAID
        // -------------------------------------------------

        bill.setStatus(
                Billing.BillingStatus.PENDING
        );

    }


    // =====================================================
    // PARSE BILLING TYPE
    // =====================================================

    private BillingItem.BillingType parseBillingType(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {

            return BillingItem.BillingType.OTHER;

        }


        String normalized =
                value
                        .trim()
                        .replace(
                                " ",
                                "_"
                        )
                        .replace(
                                "-",
                                "_"
                        )
                        .toUpperCase(
                                Locale.ROOT
                        );


        switch (normalized) {

            case "CONSULTATION":

                return BillingItem.BillingType.CONSULTATION;


            case "LAB":

            case "LABORATORY":

            case "LABORATORY_TEST":

            case "LAB_TEST":

                return BillingItem.BillingType.LABORATORY;


            case "PHARMACY":

            case "MEDICINE":

            case "MEDICATION":

                return BillingItem.BillingType.PHARMACY;


            case "ADMISSION":

                return BillingItem.BillingType.ADMISSION;


            case "PROCEDURE":

                return BillingItem.BillingType.PROCEDURE;


            case "OTHER":

                return BillingItem.BillingType.OTHER;


            default:

                throw new IllegalArgumentException(
                        "Invalid billing type: " +
                                value
                );

        }

    }


    // =====================================================
    // PARSE PAYMENT METHOD
    // =====================================================

    private Billing.PaymentMethod parsePaymentMethod(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {

            return Billing.PaymentMethod.OTHER;

        }


        String normalized =
                value
                        .trim()
                        .replace(
                                " ",
                                "_"
                        )
                        .replace(
                                "-",
                                "_"
                        )
                        .toUpperCase(
                                Locale.ROOT
                        );


        switch (normalized) {

            case "CASH":

                return Billing.PaymentMethod.CASH;


            case "MOBILE_MONEY":

            case "MOBILE":

            case "MOMO":

                return Billing.PaymentMethod.MOBILE_MONEY;


            case "CARD":

                return Billing.PaymentMethod.CARD;


            case "BANK_TRANSFER":

            case "BANK":

                return Billing.PaymentMethod.BANK_TRANSFER;


            case "INSURANCE":

                return Billing.PaymentMethod.INSURANCE;


            case "OTHER":

                return Billing.PaymentMethod.OTHER;


            default:

                throw new IllegalArgumentException(
                        "Invalid payment method: " +
                                value
                );

        }

    }


    // =====================================================
    // VALIDATE BILLING REQUEST
    // =====================================================

    private void validateBillingRequest(
            BillingRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Billing request is required."
            );

        }


        if (
                request.getPatientId() == null ||
                request.getPatientId().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );

        }


        if (
                request.getPatientName() == null ||
                request.getPatientName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient name is required."
            );

        }


        // -------------------------------------------------
        // VALIDATE ITEMS
        // -------------------------------------------------

        if (
                request.getItems() != null
        ) {

            for (
                    BillingItemRequest item :
                    request.getItems()
            ) {

                validateBillingItemRequest(
                        item
                );

            }

        }

    }


    // =====================================================
    // VALIDATE BILLING ITEM
    // =====================================================

    private void validateBillingItemRequest(
            BillingItemRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Billing item is required."
            );

        }


        if (
                request.getBillingType() == null ||
                request.getBillingType().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Billing type is required."
            );

        }


        if (
                request.getDescription() == null ||
                request.getDescription().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Billing item description is required."
            );

        }


        if (
                request.getQuantity() == null ||
                request.getQuantity() <= 0
        ) {

            throw new IllegalArgumentException(
                    "Billing item quantity must be greater than zero."
            );

        }


        if (
                request.getUnitPrice() == null
        ) {

            throw new IllegalArgumentException(
                    "Billing item unit price is required."
            );

        }


        if (
                request
                        .getUnitPrice()
                        .compareTo(
                                BigDecimal.ZERO
                        ) < 0
        ) {

            throw new IllegalArgumentException(
                    "Billing item unit price cannot be negative."
            );

        }


        // -------------------------------------------------
        // VERIFY BILLING TYPE
        // -------------------------------------------------

        parseBillingType(
                request.getBillingType()
        );

    }


    // =====================================================
    // CONVERT LOCAL DATE TO LOCAL DATE TIME
    // =====================================================

    private LocalDateTime toDateTime(
            LocalDate date
    ) {

        if (date == null) {

            return null;

        }

        return date.atStartOfDay();

    }


    // =====================================================
    // SAFE STRING
    // =====================================================

    private String safeString(
            String value
    ) {

        if (value == null) {

            return "";

        }

        return value.trim();

    }


    // =====================================================
    // SAFE NULLABLE STRING
    // =====================================================

    private String safeNullableString(
            String value
    ) {

        if (value == null) {

            return null;

        }


        String trimmed =
                value.trim();


        return trimmed.isEmpty()
                ? null
                : trimmed;

    }


    // =====================================================
    // GENERATE INVOICE NUMBER
    // =====================================================

    private String generateInvoiceNumber() {

        int year =
                LocalDate
                        .now()
                        .getYear();


        String invoiceNumber;


        do {

            invoiceNumber =
                    String.format(
                            Locale.ROOT,
                            "INV-%d-%05d",
                            year,
                            (
                                    10000 +
                                    (int)
                                    (
                                            Math.random() *
                                            90000
                                    )
                            )
                    );


        } while (
                billingRepository
                        .existsByInvoiceNumber(
                                invoiceNumber
                        )
        );


        return invoiceNumber;

    }

}

