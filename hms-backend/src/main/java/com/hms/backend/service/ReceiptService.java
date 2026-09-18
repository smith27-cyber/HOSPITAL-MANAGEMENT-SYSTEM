package com.hms.backend.service;

import com.hms.backend.dto.ReceiptResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface ReceiptService {

    List<ReceiptResponse> getAllReceipts();

    ReceiptResponse getReceiptById(Long id);

    List<ReceiptResponse> getReceiptsByBillingId(Long billingId);

    ReceiptResponse getReceiptByNumber(String receiptNumber);

    List<ReceiptResponse> getReceiptsBetween(
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}