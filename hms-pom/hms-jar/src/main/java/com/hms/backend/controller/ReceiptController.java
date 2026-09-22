package com.hms.backend.controller;

import com.hms.backend.dto.ReceiptResponse;
import com.hms.backend.service.ReceiptService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * =====================================================
 * RECEIPT CONTROLLER
 * =====================================================
 *
 * Receipts are generated from successful billing payments.
 *
 * All tenant isolation is enforced by ReceiptService through
 * TenantContext. No tenant ID is accepted from the client.
 */
@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(
            ReceiptService receiptService) {

        this.receiptService = receiptService;
    }

    // =====================================================
    // GET ALL RECEIPTS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<ReceiptResponse>> getAllReceipts() {

        return ResponseEntity.ok(
                receiptService.getAllReceipts()
        );
    }

    // =====================================================
    // GET RECEIPT BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ReceiptResponse> getReceiptById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                receiptService.getReceiptById(id)
        );
    }

    // =====================================================
    // GET RECEIPTS BY BILLING ID
    // =====================================================

    @GetMapping("/billing/{billingId}")
    public ResponseEntity<List<ReceiptResponse>> getReceiptsByBillingId(
            @PathVariable Long billingId) {

        return ResponseEntity.ok(
                receiptService.getReceiptsByBillingId(
                        billingId
                )
        );
    }

    // =====================================================
    // GET RECEIPT BY RECEIPT NUMBER
    // =====================================================

    @GetMapping("/number/{receiptNumber}")
    public ResponseEntity<ReceiptResponse> getReceiptByNumber(
            @PathVariable String receiptNumber) {

        return ResponseEntity.ok(
                receiptService.getReceiptByNumber(
                        receiptNumber
                )
        );
    }

    // =====================================================
    // GET RECEIPTS BETWEEN DATES
    // =====================================================

    @GetMapping("/date-range")
    public ResponseEntity<List<ReceiptResponse>> getReceiptsBetween(
            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                receiptService.getReceiptsBetween(
                        startDate,
                        endDate
                )
        );
    }
}