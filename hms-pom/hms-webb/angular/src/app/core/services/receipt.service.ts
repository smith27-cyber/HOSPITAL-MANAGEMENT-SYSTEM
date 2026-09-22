// =====================================================
// RECEIPT SERVICE
// File:
// src/app/core/services/receipt.service.ts
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';


// =====================================================
// RECEIPT RESPONSE
// =====================================================

export interface ReceiptResponse {

  id: number;

  receiptNumber: string;

  billingId: number;

  invoiceNumber: string;

  tenantId: number;

  tenantCode: string;

  tenantName: string;

  patientId: string;

  patientName: string;

  patientNumber?: string | null;

  amount: number;

  invoiceAmount: number;

  amountPaidAfterPayment: number;

  balanceAfterPayment: number;

  paymentMethod: string;

  paymentDate: string;

  receivedBy?: string | null;

  notes?: string | null;
}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  private readonly apiUrl =
    'http://localhost:8081/api/receipts';


  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // GET ALL RECEIPTS
  // ===================================================

  getAllReceipts(): Observable<ReceiptResponse[]> {

    return this.http.get<ReceiptResponse[]>(
      this.apiUrl
    );
  }


  // ===================================================
  // GET RECEIPT BY ID
  // ===================================================

  getReceiptById(
    id: number
  ): Observable<ReceiptResponse> {

    return this.http.get<ReceiptResponse>(
      `${this.apiUrl}/${id}`
    );
  }


  // ===================================================
  // GET RECEIPTS BY BILLING
  // ===================================================

  getReceiptsByBillingId(
    billingId: number
  ): Observable<ReceiptResponse[]> {

    return this.http.get<ReceiptResponse[]>(
      `${this.apiUrl}/billing/${billingId}`
    );
  }


  // ===================================================
  // GET RECEIPT BY NUMBER
  // ===================================================

  getReceiptByNumber(
    receiptNumber: string
  ): Observable<ReceiptResponse> {

    return this.http.get<ReceiptResponse>(
      `${this.apiUrl}/number/${encodeURIComponent(receiptNumber)}`
    );
  }


  // ===================================================
  // GET RECEIPTS BY DATE RANGE
  // ===================================================

  getReceiptsBetween(
    startDate: string,
    endDate: string
  ): Observable<ReceiptResponse[]> {

    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<ReceiptResponse[]>(
      `${this.apiUrl}/date-range`,
      { params }
    );
  }
}