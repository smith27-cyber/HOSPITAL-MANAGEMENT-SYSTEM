
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


/**
 * =====================================================
 * BILLING SERVICE IMPLEMENTATION
 * =====================================================
 */
@Service
@Transactional
public class BillingServiceImpl
        implements BillingService {


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

        return billingRepository.findAll();

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

        return billingRepository.findById(id);

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
                        patientId
                );

    }


    // =====================================================
    // GET ACTIVE BILL
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
                        patientId,
                        Billing.BillingStatus.PAID,
                        Billing.BillingStatus.CANCELLED
                );

    }


    // =====================================================
    // GET BY STATUS
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


        bill.setPatientId(
                request.getPatientId().trim()
        );


        bill.setPatientName(
                safeString(
                        request.getPatientName()
                )
        );


        bill.setPatientNumber(
                request.getPatientNumber()
        );


        bill.setDoctorId(
                request.getDoctorId()
        );


        bill.setDoctorName(
                request.getDoctorName()
        );


        bill.setDepartmentId(
                request.getDepartmentId()
        );


        bill.setDepartmentName(
                request.getDepartmentName()
        );


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


        bill.setNotes(
                request.getNotes()
        );


        bill.setAmount(
                BigDecimal.ZERO
        );


        bill.setAmountPaid(
                BigDecimal.ZERO
        );


        bill.setBalance(
                BigDecimal.ZERO
        );


        bill.setStatus(
                Billing.BillingStatus.PENDING
        );


        bill.setInvoiceNumber(
                generateInvoiceNumber()
        );


        bill.setItems(
                new ArrayList<>()
        );


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

        if (
                patientId == null ||
                patientId.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );

        }


        validateBillingItemRequest(
                item
        );


        Billing bill =
                getActiveBillByPatient(
                        patientId
                )
                .orElseGet(
                        () ->
                                createEmptyBill(
                                        patientId,
                                        patientName,
                                        patientNumber,
                                        doctorId,
                                        doctorName,
                                        departmentId,
                                        departmentName
                                )
                );


        // -------------------------------------------------
        // UPDATE PATIENT INFORMATION
        // -------------------------------------------------

        if (
                patientName != null &&
                !patientName.isBlank()
        ) {

            bill.setPatientName(
                    patientName
            );

        }


        if (
                patientNumber != null &&
                !patientNumber.isBlank()
        ) {

            bill.setPatientNumber(
                    patientNumber
            );

        }


        if (
                doctorId != null &&
                !doctorId.isBlank()
        ) {

            bill.setDoctorId(
                    doctorId
            );

        }


        if (
                doctorName != null &&
                !doctorName.isBlank()
        ) {

            bill.setDoctorName(
                    doctorName
            );

        }


        if (
                departmentId != null &&
                !departmentId.isBlank()
        ) {

            bill.setDepartmentId(
                    departmentId
            );

        }


        if (
                departmentName != null &&
                !departmentName.isBlank()
        ) {

            bill.setDepartmentName(
                    departmentName
            );

        }


        // =================================================
        // DUPLICATE PROTECTION
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
                                    item.getReferenceId(),
                                    type
                            );


            if (exists) {

                return bill;

            }

        }


        // =================================================
        // ADD CHARGE
        // =================================================

        addItemToBill(
                bill,
                item
        );


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


        bill.setPatientId(
                patientId
        );


        bill.setPatientName(
                safeString(
                        patientName
                )
        );


        bill.setPatientNumber(
                patientNumber
        );


        bill.setDoctorId(
                doctorId
        );


        bill.setDoctorName(
                doctorName
        );


        bill.setDepartmentId(
                departmentId
        );


        bill.setDepartmentName(
                departmentName
        );


        bill.setBillingDate(
                LocalDateTime.now()
        );


        bill.setAmount(
                BigDecimal.ZERO
        );


        bill.setAmountPaid(
                BigDecimal.ZERO
        );


        bill.setBalance(
                BigDecimal.ZERO
        );


        bill.setStatus(
                Billing.BillingStatus.PENDING
        );


        bill.setInvoiceNumber(
                generateInvoiceNumber()
        );


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


        if (
                bill.getStatus() ==
                        Billing.BillingStatus.PAID
        ) {

            throw new IllegalStateException(
                    "Paid invoices cannot be modified."
            );

        }


        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "Cancelled invoices cannot be modified."
            );

        }


        bill.setPatientId(
                request.getPatientId().trim()
        );


        bill.setPatientName(
                safeString(
                        request.getPatientName()
                )
        );


        bill.setPatientNumber(
                request.getPatientNumber()
        );


        bill.setDoctorId(
                request.getDoctorId()
        );


        bill.setDoctorName(
                request.getDoctorName()
        );


        bill.setDepartmentId(
                request.getDepartmentId()
        );


        bill.setDepartmentName(
                request.getDepartmentName()
        );


        bill.setDueDate(
                toDateTime(
                        request.getDueDate()
                )
        );


        bill.setNotes(
                request.getNotes()
        );


        // -------------------------------------------------
        // REPLACE ITEMS
        // -------------------------------------------------

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


        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "Cancelled invoices cannot receive payments."
            );

        }


        if (
                bill.getStatus() ==
                        Billing.BillingStatus.PAID
        ) {

            throw new IllegalStateException(
                    "This invoice is already fully paid."
            );

        }


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


        BigDecimal balance =
                Optional.ofNullable(
                        bill.getBalance()
                )
                .orElse(
                        BigDecimal.ZERO
                );


        if (
                payment.compareTo(
                        balance
                ) > 0
        ) {

            payment =
                    balance;

        }


        BigDecimal currentPaid =
                Optional.ofNullable(
                        bill.getAmountPaid()
                )
                .orElse(
                        BigDecimal.ZERO
                );


        bill.setAmountPaid(
                currentPaid.add(
                        payment
                )
        );


        BigDecimal total =
                Optional.ofNullable(
                        bill.getAmount()
                )
                .orElse(
                        BigDecimal.ZERO
                );


        bill.setBalance(
                total
                        .subtract(
                                bill.getAmountPaid()
                        )
                        .max(
                                BigDecimal.ZERO
                        )
        );


        bill.setPaymentMethod(
                parsePaymentMethod(
                        request.getPaymentMethod()
                )
        );


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


        BillingItem.BillingType type =
                parseBillingType(
                        request.getBillingType()
                );


        item.setBilling(
                bill
        );


        item.setBillingType(
                type
        );


        item.setDescription(
                request.getDescription().trim()
        );


        item.setQuantity(
                request.getQuantity()
        );


        item.setUnitPrice(
                request.getUnitPrice()
        );


        BigDecimal quantity =
                BigDecimal.valueOf(
                        request.getQuantity()
                );


        BigDecimal amount =
                request.getUnitPrice()
                        .multiply(
                                quantity
                        );


        item.setAmount(
                amount
        );


        item.setReferenceId(
                request.getReferenceId()
        );


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


        BigDecimal paid =
                Optional.ofNullable(
                        bill.getAmountPaid()
                )
                .orElse(
                        BigDecimal.ZERO
                );


        if (
                paid.compareTo(
                        total
                ) > 0
        ) {

            paid =
                    total;

        }


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
                request.getUnitPrice() == null ||
                request.getUnitPrice()
                        .compareTo(
                                BigDecimal.ZERO
                        ) < 0
        ) {

            throw new IllegalArgumentException(
                    "Billing item unit price cannot be negative."
            );

        }


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
    // GENERATE INVOICE NUMBER
    // =====================================================

    private String generateInvoiceNumber() {

        int year =
                LocalDate.now()
                        .getYear();


        String invoiceNumber;


        do {

            invoiceNumber =
                    String.format(
                            Locale.ROOT,
                            "INV-%d-%05d",
                            year,
                            (int)
                                    (
                                            10000 +
                                            Math.random() *
                                            90000
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

