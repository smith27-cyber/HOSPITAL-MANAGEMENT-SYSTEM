
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Bill,
  BillingStatus
} from '../../../shared/models/billing.model';

import {
  BillingService
} from '../../../core/services/billing.service';


@Component({
  selector: 'app-billing-details',

  standalone: true,

  imports: [
    CommonModule
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
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private billingService: BillingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {

      this.router.navigate(['/billing']);

      return;

    }


    this.bill =
      this.billingService.getBillById(id);


    if (!this.bill) {

      alert(
        'Billing record not found.'
      );

      this.router.navigate(['/billing']);

    }

  }


  // =====================================================
  // EDIT
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
  // BACK
  // =====================================================

  backToBilling(): void {

    this.router.navigate([
      '/billing'
    ]);

  }


  // =====================================================
  // DELETE
  // =====================================================

  deleteBill(): void {

    if (!this.bill) {
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


    this.router.navigate([
      '/billing'
    ]);

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: BillingStatus
  ): string {

    switch (status) {

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
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?: string
  ): string {

    if (!date) {
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
      new Date(date)
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
      new Date(date)
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

  getPaymentPercentage(): number {

    if (!this.bill || this.bill.amount <= 0) {
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

}

