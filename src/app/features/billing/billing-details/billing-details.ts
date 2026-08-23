import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Bill,
  BillItem,
  BillingStatus,
  BillingType,
  PaymentMethod
} from '../../../shared/models/billing.model';

import {
  BillingService
} from '../../../core/services/billing.service';


@Component({
  selector: 'app-billing-details',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './billing-details.html',

  styleUrl: './billing-details.css'
})
export class BillingDetails implements OnInit {

  // =====================================================
  // BILL
  // =====================================================

  bill: Bill | undefined;


  // =====================================================
  // PAYMENT
  // =====================================================

  paymentAmount = 0;

  selectedPaymentMethod:
    PaymentMethod = 'Cash';

  isProcessingPayment = false;


  // =====================================================
  // PAYMENT METHODS
  // =====================================================

  paymentMethods:
    PaymentMethod[] = [

      'Cash',

      'Mobile Money',

      'Card',

      'Bank Transfer',

      'Insurance',

      'Other'

    ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private billingService:
      BillingService,

    private route:
      ActivatedRoute,

    private router:
      Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get(
        'id'
      );


    if (!id) {

      this.backToBilling();

      return;

    }


    this.loadBill(id);

  }


  // =====================================================
  // LOAD BILL
  // =====================================================

  private loadBill(
    id: string
  ): void {

    this.bill =
      this.billingService.getBillById(
        id
      );


    if (!this.bill) {

      alert(
        'Billing record not found.'
      );

      this.backToBilling();

      return;

    }


    /*
     * Start payment amount with the current
     * outstanding balance.
     */

    this.paymentAmount =
      this.bill.balance;

  }


  // =====================================================
  // GET BILL ITEMS
  // =====================================================

  getBillItems():
    BillItem[] {

    if (!this.bill) {

      return [];

    }


    return this.bill.items ?? [];

  }


  // =====================================================
  // GET ITEM COUNT
  // =====================================================

  getItemCount():
    number {

    return this.getBillItems()
      .length;

  }


  // =====================================================
  // GET ITEMS BY TYPE
  // =====================================================

  getItemsByType(
    billingType: BillingType
  ): BillItem[] {

    return this.getBillItems()
      .filter(
        item =>
          item.billingType ===
          billingType
      );

  }


  // =====================================================
  // CHECK BILLING TYPE
  // =====================================================

  hasBillingType(
    billingType: BillingType
  ): boolean {

    /*
     * Check item-based billing first.
     */

    const itemMatch =
      this.getBillItems().some(
        item =>
          item.billingType ===
          billingType
      );


    if (itemMatch) {

      return true;

    }


    /*
     * Fall back to the legacy bill type so
     * older invoices still work.
     */

    return (
      this.bill?.billingType ===
      billingType
    );

  }


  // =====================================================
  // GET BILLING TYPES
  // =====================================================

  getBillingTypes():
    BillingType[] {

    const types:
      BillingType[] = [

        'Consultation',

        'Laboratory',

        'Pharmacy',

        'Admission',

        'Procedure',

        'Other'

      ];


    return types.filter(
      type =>
        this.hasBillingType(
          type
        )
    );

  }


  // =====================================================
  // CALCULATE TYPE TOTAL
  // =====================================================

  getTypeTotal(
    billingType: BillingType
  ): number {

    return this.getItemsByType(
      billingType
    ).reduce(
      (
        total,
        item
      ) =>
        total +
        item.amount,
      0
    );

  }


  // =====================================================
  // EDIT BILL
  // =====================================================

  editBill(): void {

    if (!this.bill) {

      return;

    }


    this.router.navigate([
      '/billing',
      this.bill.id,
      'edit'
    ]);

  }


  // =====================================================
  // BACK TO BILLING
  // =====================================================

  backToBilling(): void {

    this.router.navigate([
      '/billing'
    ]);

  }


  // =====================================================
  // DELETE BILL
  // =====================================================

  deleteBill(): void {

    if (!this.bill) {

      return;

    }


    if (
      this.bill.status ===
      'Paid'
    ) {

      alert(
        'A fully paid invoice cannot be deleted.'
      );

      return;

    }


    const confirmed =
      confirm(
        `Are you sure you want to delete invoice ${this.bill.invoiceNumber}?`
      );


    if (!confirmed) {

      return;

    }


    const deleted =
      this.billingService.deleteBill(
        this.bill.id
      );


    if (!deleted) {

      alert(
        'Unable to delete billing record.'
      );

      return;

    }


    alert(
      'Billing record deleted successfully.'
    );


    this.backToBilling();

  }


  // =====================================================
  // CAN RECORD PAYMENT
  // =====================================================

  canRecordPayment():
    boolean {

    if (!this.bill) {

      return false;

    }


    return (
      this.bill.status !== 'Paid' &&
      this.bill.status !== 'Cancelled' &&
      this.bill.balance > 0
    );

  }


  // =====================================================
  // RECORD PAYMENT
  // =====================================================

  recordPayment(): void {

    if (
      !this.bill
    ) {

      return;

    }


    if (
      !this.canRecordPayment()
    ) {

      return;

    }


    // ===================================================
    // VALIDATE AMOUNT
    // ===================================================

    if (
      !Number.isFinite(
        this.paymentAmount
      ) ||
      this.paymentAmount <= 0
    ) {

      alert(
        'Please enter a valid payment amount.'
      );

      return;

    }


    if (
      this.paymentAmount >
      this.bill.balance
    ) {

      alert(
        `Payment cannot exceed the outstanding balance of ${this.formatCurrency(
          this.bill.balance
        )}.`
      );

      return;

    }


    // ===================================================
    // START PROCESSING
    // ===================================================

    this.isProcessingPayment =
      true;


    try {

      const success =
        this.billingService.recordPayment(

          this.bill.id,

          this.paymentAmount,

          this.selectedPaymentMethod

        );


      if (!success) {

        alert(
          'Unable to record payment.'
        );

        return;

      }


      // =================================================
      // RELOAD BILL
      // =================================================

      this.bill =
        this.billingService.getBillById(
          this.bill.id
        );


      if (!this.bill) {

        alert(
          'The billing record could not be reloaded.'
        );

        this.backToBilling();

        return;

      }


      // =================================================
      // RESET PAYMENT FORM
      // =================================================

      this.paymentAmount =
        this.bill.balance;


      // =================================================
      // SUCCESS MESSAGE
      // =================================================

      if (
        this.bill.status ===
        'Paid'
      ) {

        alert(
          'Payment recorded successfully. The invoice is now fully paid.'
        );

      }

      else {

        alert(
          'Payment recorded successfully.'
        );

      }

    }

    finally {

      this.isProcessingPayment =
        false;

    }

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: BillingStatus
  ): string {

    switch (
      status
    ) {

      case 'Paid':

        return 'paid';


      case 'Partially Paid':

        return 'partial';


      case 'Pending':

        return 'pending';


      case 'Cancelled':

        return 'cancelled';


      default:

        return '';

    }

  }


  // =====================================================
  // BILLING TYPE CLASS
  // =====================================================

  getBillingTypeClass(
    type: BillingType
  ): string {

    switch (
      type
    ) {

      case 'Consultation':

        return 'consultation';


      case 'Laboratory':

        return 'laboratory';


      case 'Pharmacy':

        return 'pharmacy';


      case 'Admission':

        return 'admission';


      case 'Procedure':

        return 'procedure';


      case 'Other':

        return 'other';


      default:

        return '';

    }

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?: string
  ): string {

    if (!date) {

      return '—';

    }


    const parsedDate =
      new Date(
        date
      );


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—';

    }


    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',

        month: 'short',

        year: 'numeric'
      }
    ).format(
      parsedDate
    );

  }


  // =====================================================
  // FORMAT DATE AND TIME
  // =====================================================

  formatDateTime(
    date?: string
  ): string {

    if (!date) {

      return '—';

    }


    const parsedDate =
      new Date(
        date
      );


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—';

    }


    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',

        month: 'short',

        year: 'numeric',

        hour: '2-digit',

        minute: '2-digit'
      }
    ).format(
      parsedDate
    );

  }


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    amount: number
  ): string {

    return new Intl.NumberFormat(
      'en-UG',
      {
        style: 'currency',

        currency: 'UGX',

        maximumFractionDigits: 0
      }
    ).format(
      amount || 0
    );

  }


  // =====================================================
  // PAYMENT PROGRESS
  // =====================================================

  getPaymentPercentage():
    number {

    if (
      !this.bill ||
      this.bill.amount <= 0
    ) {

      return 0;

    }


    return Math.min(
      100,

      Math.round(
        (
          this.bill.amountPaid /
          this.bill.amount
        ) * 100
      )

    );

  }


  // =====================================================
  // HAS BALANCE
  // =====================================================

  hasBalance():
    boolean {

    return !!this.bill &&
      this.bill.balance > 0;

  }


  // =====================================================
  // IS PAID
  // =====================================================

  isPaid():
    boolean {

    return !!this.bill &&
      this.bill.status ===
      'Paid';

  }


  // =====================================================
  // IS PHARMACY BILL
  // =====================================================

  isPharmacyBill():
    boolean {

    return this.hasBillingType(
      'Pharmacy'
    );

  }


  // =====================================================
  // GET LEGACY DESCRIPTION
  // =====================================================

  getLegacyDescription():
    string {

    if (!this.bill) {

      return '—';

    }


    return (
      this.bill.description ||
      '—'
    );

  }

}
