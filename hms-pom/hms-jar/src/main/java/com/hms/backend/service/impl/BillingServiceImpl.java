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
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class BillingServiceImpl implements BillingService {

    private final BillingRepository billingRepository;
    private final BillingItemRepository billingItemRepository;

    public BillingServiceImpl(
            BillingRepository billingRepository,
            BillingItemRepository billingItemRepository
    ) {
        this.billingRepository = billingRepository;
        this.billingItemRepository = billingItemRepository;
    }

    // =========================================================
    // GET ALL BILLS
    // =========================================================

    @Override
    public List<Billing> getAllBills() {
        return billingRepository.findAll();
    }

    // =========================================================
    // GET BILL BY ID
    // =========================================================

    @Override
    public Optional<Billing> getBillById(Long id) {

        if (id == null) {
            return Optional.empty();
        }

        return billingRepository.findById(id);
    }

    // =========================================================
    // GET BILLS BY PATIENT
    // =========================================================

    @Override
    public List<Billing> getBillsByPatient(String patientId) {

        if (isBlank(patientId)) {
            return new ArrayList<>();
        }

        return billingRepository.findByPatientIdOrderByBillingDateDesc(
                patientId.trim()
        );
    }

    // =========================================================
    // GET ACTIVE BILL BY PATIENT
    // =========================================================

    @Override
    public Optional<Billing> getActiveBillByPatient(String patientId) {

        if (isBlank(patientId)) {
            return Optional.empty();
        }

        return billingRepository
                .findFirstByPatientIdAndStatusNotAndStatusNotOrderByBillingDateDesc(
                        patientId.trim(),
                        Billing.BillingStatus.PAID,
                        Billing.BillingStatus.CANCELLED
                );
    }

    // =========================================================
    // GET BILL BY CONSULTATION
    // =========================================================

    @Override
    public Optional<Billing> getBillByConsultation(
            String consultationId
    ) {

        if (isBlank(consultationId)) {
            return Optional.empty();
        }

        return billingRepository
                .findFirstByConsultationIdAndStatusNotAndStatusNotOrderByBillingDateDesc(
                        consultationId.trim(),
                        Billing.BillingStatus.PAID,
                        Billing.BillingStatus.CANCELLED
                );
    }

    // =========================================================
    // GET BILLS BY STATUS
    // =========================================================

    @Override
    public List<Billing> getBillsByStatus(
            Billing.BillingStatus status
    ) {

        if (status == null) {
            return new ArrayList<>();
        }

        return billingRepository.findByStatusOrderByBillingDateDesc(
                status
        );
    }

    // =========================================================
    // CREATE BILL
    // =========================================================

    @Override
    public Billing createBill(BillingRequest request) {

        validateBillingRequest(request);

        Billing bill = new Billing();

        bill.setPatientId(
                request.getPatientId().trim()
        );

        bill.setPatientName(
                request.getPatientName().trim()
        );

        bill.setPatientNumber(
                clean(request.getPatientNumber())
        );

        bill.setDoctorId(
                clean(request.getDoctorId())
        );

        bill.setDoctorName(
                clean(request.getDoctorName())
        );

        bill.setDepartmentId(
                clean(request.getDepartmentId())
        );

        bill.setDepartmentName(
                clean(request.getDepartmentName())
        );

        /*
         * IMPORTANT:
         *
         * Billing does NOT contain a description field.
         * Descriptions belong to BillingItem.
         *
         * Therefore there is NO bill.setDescription(...)
         * here.
         */

        /*
         * Current BillingRequest uses LocalDateTime for dueDate.
         *
         * Therefore we assign it directly.
         */
        if (request.getDueDate() != null) {

            bill.setDueDate(
                    request.getDueDate()
            );
        }

        bill.setNotes(
                clean(request.getNotes())
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

        bill.setBillingDate(
                LocalDateTime.now()
        );

        bill.setInvoiceNumber(
                generateInvoiceNumber()
        );

        Billing savedBill =
                billingRepository.save(bill);

        /*
         * Add requested billing items.
         */
        if (
                request.getItems() != null &&
                !request.getItems().isEmpty()
        ) {

            for (
                    BillingItemRequest itemRequest
                    : request.getItems()
            ) {

                if (itemRequest == null) {
                    continue;
                }

                addItemToBill(
                        savedBill,
                        itemRequest
                );
            }
        }

        recalculateBill(savedBill);

        return billingRepository.save(savedBill);
    }

    // =========================================================
    // ADD CHARGE TO PATIENT BILL
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
            String departmentName
    ) {

        if (isBlank(patientId)) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );
        }

        if (item == null) {

            throw new IllegalArgumentException(
                    "Billing item is required."
            );
        }

        if (isBlank(patientName)) {

            throw new IllegalArgumentException(
                    "Patient name is required."
            );
        }

        String cleanPatientId =
                patientId.trim();

        Billing bill =
                getActiveBillByPatient(
                        cleanPatientId
                ).orElseGet(() ->
                        createEmptyBill(
                                cleanPatientId,
                                patientName,
                                patientNumber,
                                doctorId,
                                doctorName,
                                departmentId,
                                departmentName
                        )
                );

        ensureBillCanReceiveCharges(
                bill
        );

        updateBillInformation(
                bill,
                patientName,
                patientNumber,
                doctorId,
                doctorName,
                departmentId,
                departmentName
        );

        BillingItem.BillingType billingType =
                parseBillingType(
                        item.getBillingType()
                );

        String referenceId =
                clean(item.getReferenceId());

        /*
         * Prevent duplicate charges.
         */
        if (!isBlank(referenceId)) {

            boolean exists =
                    billingItemRepository
                            .existsByBillingAndReferenceIdAndBillingType(
                                    bill,
                                    referenceId,
                                    billingType
                            );

            if (exists) {

                recalculateBill(bill);

                return billingRepository.save(bill);
            }
        }

        addItemToBill(
                bill,
                item
        );

        recalculateBill(bill);

        return billingRepository.save(bill);
    }

    // =========================================================
    // UPDATE BILL
    // =========================================================

    @Override
    public Billing updateBill(
            Long id,
            BillingRequest request
    ) {

        validateBillingRequest(request);

        Billing bill =
                billingRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Billing record not found."
                                )
                        );

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.PAID
        ) {

            throw new IllegalStateException(
                    "A paid invoice cannot be modified."
            );
        }

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "A cancelled invoice cannot be modified."
            );
        }

        bill.setPatientId(
                request.getPatientId().trim()
        );

        bill.setPatientName(
                request.getPatientName().trim()
        );

        bill.setPatientNumber(
                clean(request.getPatientNumber())
        );

        bill.setDoctorId(
                clean(request.getDoctorId())
        );

        bill.setDoctorName(
                clean(request.getDoctorName())
        );

        bill.setDepartmentId(
                clean(request.getDepartmentId())
        );

        bill.setDepartmentName(
                clean(request.getDepartmentName())
        );

        /*
         * No setDescription() here.
         *
         * Description belongs to BillingItem.
         */

        if (request.getDueDate() != null) {

            bill.setDueDate(
                    request.getDueDate()
            );

        } else {

            bill.setDueDate(null);
        }

        bill.setNotes(
                clean(request.getNotes())
        );

        /*
         * Replace items only when the request actually
         * contains an item list.
         */
        if (request.getItems() != null) {

            bill.getItems().clear();

            for (
                    BillingItemRequest itemRequest
                    : request.getItems()
            ) {

                if (itemRequest == null) {
                    continue;
                }

                addItemToBill(
                        bill,
                        itemRequest
                );
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

        Billing bill =
                billingRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Billing record not found."
                                )
                        );

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.PAID
        ) {

            throw new IllegalStateException(
                    "A paid invoice cannot be deleted."
            );
        }

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "A cancelled invoice cannot be deleted."
            );
        }

        billingRepository.delete(bill);
    }

    // =========================================================
    // RECORD PAYMENT
    // =========================================================

    @Override
    public Billing recordPayment(
            Long id,
            PaymentRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Payment request is required."
            );
        }

        Billing bill =
                billingRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Billing record not found."
                                )
                        );

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "A cancelled invoice cannot receive payment."
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

        if (payment == null) {

            throw new IllegalArgumentException(
                    "Payment amount is required."
            );
        }

        if (
                payment.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero."
            );
        }

        BigDecimal balance =
                safe(bill.getBalance());

        if (
                balance.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new IllegalStateException(
                    "There is no outstanding balance."
            );
        }

        /*
         * Do not allow overpayment.
         */
        if (
                payment.compareTo(balance) > 0
        ) {

            payment = balance;
        }

        BigDecimal currentPaid =
                safe(bill.getAmountPaid());

        BigDecimal newPaid =
                currentPaid.add(payment);

        BigDecimal amount =
                safe(bill.getAmount());

        if (
                newPaid.compareTo(amount) > 0
        ) {

            newPaid = amount;
        }

        bill.setAmountPaid(
                newPaid
        );

        bill.setBalance(
                amount
                        .subtract(newPaid)
                        .max(BigDecimal.ZERO)
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

        return billingRepository.save(bill);
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @Override
    public Billing updateStatus(
            Long id,
            Billing.BillingStatus status
    ) {

        if (status == null) {

            throw new IllegalArgumentException(
                    "Billing status is required."
            );
        }

        Billing bill =
                billingRepository.findById(id)
                        .orElseThrow(() ->
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

        bill.setStatus(status);

        bill.setUpdatedAt(
                LocalDateTime.now()
        );

        return billingRepository.save(bill);
    }

    // =========================================================
    // BILL COUNT
    // =========================================================

    @Override
    public long countBills() {

        return billingRepository.count();
    }

    // =========================================================
    // TOTAL BILLING AMOUNT
    // =========================================================

    @Override
    public BigDecimal getTotalAmount() {

        return billingRepository
                .findAll()
                .stream()
                .map(
                        bill ->
                                safe(
                                        bill.getAmount()
                                )
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    // =========================================================
    // TOTAL PAID
    // =========================================================

    @Override
    public BigDecimal getTotalPaid() {

        return billingRepository
                .findAll()
                .stream()
                .map(
                        bill ->
                                safe(
                                        bill.getAmountPaid()
                                )
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    // =========================================================
    // TOTAL BALANCE
    // =========================================================

    @Override
    public BigDecimal getTotalBalance() {

        return billingRepository
                .findAll()
                .stream()
                .map(
                        bill ->
                                safe(
                                        bill.getBalance()
                                )
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    // =========================================================
    // CONSULTATION INVOICE
    // =========================================================

    @Override
    public Billing syncConsultationInvoice(
            String consultationId
    ) {

        if (isBlank(consultationId)) {

            throw new IllegalArgumentException(
                    "Consultation ID is required."
            );
        }

        String cleanConsultationId =
                consultationId.trim();

        Optional<Billing> existing =
                getBillByConsultation(
                        cleanConsultationId
                );

        if (existing.isPresent()) {

            return existing.get();
        }

        /*
         * At this point the billing service expects the
         * consultation workflow to have created the
         * consultation-linked invoice.
         *
         * We intentionally do not create an invoice with
         * incomplete patient information here.
         */
        throw new IllegalStateException(
                "No active invoice exists for consultation "
                        + cleanConsultationId
                        + "."
        );
    }

    // =========================================================
    // CREATE EMPTY BILL
    // =========================================================

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
                patientName.trim()
        );

        bill.setPatientNumber(
                clean(patientNumber)
        );

        bill.setDoctorId(
                clean(doctorId)
        );

        bill.setDoctorName(
                clean(doctorName)
        );

        bill.setDepartmentId(
                clean(departmentId)
        );

        bill.setDepartmentName(
                clean(departmentName)
        );

        bill.setInvoiceNumber(
                generateInvoiceNumber()
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

        return billingRepository.save(bill);
    }

    // =========================================================
    // ADD ITEM TO BILL
    // =========================================================

    private void addItemToBill(
            Billing bill,
            BillingItemRequest request
    ) {

        if (request == null) {
            return;
        }

        if (
                isBlank(
                        request.getDescription()
                )
        ) {

            throw new IllegalArgumentException(
                    "Billing item description is required."
            );
        }

        if (
                request.getUnitPrice() == null
        ) {

            throw new IllegalArgumentException(
                    "Billing item unit price is required."
            );
        }

        BigDecimal unitPrice =
                request.getUnitPrice();

        if (
                unitPrice.compareTo(
                        BigDecimal.ZERO
                ) < 0
        ) {

            throw new IllegalArgumentException(
                    "Billing item unit price cannot be negative."
            );
        }

        Integer quantity =
                request.getQuantity();

        if (
                quantity == null ||
                quantity <= 0
        ) {

            quantity = 1;
        }

        BillingItem.BillingType billingType =
                parseBillingType(
                        request.getBillingType()
                );

        BigDecimal amount =
                unitPrice.multiply(
                        BigDecimal.valueOf(
                                quantity
                        )
                );

        BillingItem item =
                new BillingItem();

        item.setBilling(
                bill
        );

        item.setBillingType(
                billingType
        );

        item.setDescription(
                request.getDescription().trim()
        );

        item.setQuantity(
                quantity
        );

        item.setUnitPrice(
                unitPrice
        );

        item.setAmount(
                amount
        );

        item.setReferenceId(
                clean(
                        request.getReferenceId()
                )
        );

        if (bill.getItems() == null) {

            bill.setItems(
                    new ArrayList<>()
            );
        }

        bill.getItems().add(item);
    }

    // =========================================================
    // RECALCULATE BILL
    // =========================================================

    private void recalculateBill(
            Billing bill
    ) {

        if (bill == null) {
            return;
        }

        BigDecimal total =
                BigDecimal.ZERO;

        if (bill.getItems() != null) {

            for (
                    BillingItem item
                    : bill.getItems()
            ) {

                if (item == null) {
                    continue;
                }

                BigDecimal unitPrice =
                        safe(
                                item.getUnitPrice()
                        );

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
                                        quantity
                                )
                        );

                item.setAmount(
                        itemAmount
                );

                item.setBilling(
                        bill
                );

                total =
                        total.add(
                                itemAmount
                        );
            }
        }

        bill.setAmount(
                total
        );

        BigDecimal amountPaid =
                safe(
                        bill.getAmountPaid()
                );

        if (
                amountPaid.compareTo(total) > 0
        ) {

            amountPaid = total;

            bill.setAmountPaid(
                    amountPaid
            );
        }

        BigDecimal balance =
                total.subtract(
                        amountPaid
                ).max(
                        BigDecimal.ZERO
                );

        bill.setBalance(
                balance
        );

        updatePaymentStatus(
                bill
        );
    }

    // =========================================================
    // UPDATE PAYMENT STATUS
    // =========================================================

    private void updatePaymentStatus(
            Billing bill
    ) {

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED
        ) {
            return;
        }

        BigDecimal amount =
                safe(
                        bill.getAmount()
                );

        BigDecimal paid =
                safe(
                        bill.getAmountPaid()
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
                paid.compareTo(amount) >= 0
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
            String departmentName
    ) {

        if (!isBlank(patientName)) {

            bill.setPatientName(
                    patientName.trim()
            );
        }

        if (!isBlank(patientNumber)) {

            bill.setPatientNumber(
                    patientNumber.trim()
            );
        }

        if (!isBlank(doctorId)) {

            bill.setDoctorId(
                    doctorId.trim()
            );
        }

        if (!isBlank(doctorName)) {

            bill.setDoctorName(
                    doctorName.trim()
            );
        }

        if (!isBlank(departmentId)) {

            bill.setDepartmentId(
                    departmentId.trim()
            );
        }

        if (!isBlank(departmentName)) {

            bill.setDepartmentName(
                    departmentName.trim()
            );
        }
    }

    // =========================================================
    // CHECK WHETHER BILL CAN RECEIVE CHARGES
    // =========================================================

    private void ensureBillCanReceiveCharges(
            Billing bill
    ) {

        if (bill == null) {

            throw new IllegalArgumentException(
                    "Billing record is required."
            );
        }

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.PAID
        ) {

            throw new IllegalStateException(
                    "The invoice is already paid and cannot receive new charges."
            );
        }

        if (
                bill.getStatus() ==
                        Billing.BillingStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "The invoice is cancelled and cannot receive new charges."
            );
        }
    }

    // =========================================================
    // VALIDATE BILL REQUEST
    // =========================================================

    private void validateBillingRequest(
            BillingRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Billing request is required."
            );
        }

        if (
                isBlank(
                        request.getPatientId()
                )
        ) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );
        }

        if (
                isBlank(
                        request.getPatientName()
                )
        ) {

            throw new IllegalArgumentException(
                    "Patient name is required."
            );
        }
    }

    // =========================================================
    // PARSE BILLING TYPE
    // =========================================================

    private BillingItem.BillingType parseBillingType(
            String value
    ) {

        if (isBlank(value)) {

            return BillingItem.BillingType.OTHER;
        }

        String normalized =
                value.trim()
                        .toUpperCase()
                        .replace(
                                "-",
                                "_"
                        )
                        .replace(
                                " ",
                                "_"
                        );

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
            String value
    ) {

        if (isBlank(value)) {

            return Billing.PaymentMethod.OTHER;
        }

        String normalized =
                value.trim()
                        .toUpperCase()
                        .replace(
                                "-",
                                "_"
                        )
                        .replace(
                                " ",
                                "_"
                        );

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

        } while (
                billingRepository.existsByInvoiceNumber(
                        invoiceNumber
                )
        );

        return invoiceNumber;
    }

    // =========================================================
    // SAFE BIG DECIMAL
    // =========================================================

    private BigDecimal safe(
            BigDecimal value
    ) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }

    // =========================================================
    // CLEAN STRING
    // =========================================================

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

    // =========================================================
    // BLANK CHECK
    // =========================================================

    private boolean isBlank(
            String value
    ) {

        return value == null ||
                value.trim().isEmpty();
    }
}