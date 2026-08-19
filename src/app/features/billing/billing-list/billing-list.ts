import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Bill,
  BillingStatus
} from '../../../shared/models/billing.model';

import {
  BillingService
} from '../../../core/services/billing.service';


@Component({
  selector: 'app-billing-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './billing-list.html',

  styleUrl: './billing-list.css'
})
export class BillingList implements OnInit {


  // =====================================================
  // BILLS
  // =====================================================

  bills: Bill[] = [];

  filteredBills: Bill[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // STATUS FILTER
  // =====================================================

  selectedStatus:
    BillingStatus | 'All' = 'All';


  // =====================================================
  // STATISTICS
  // =====================================================

  totalBills = 0;

  totalAmount = 0;

  totalPaid = 0;

  totalBalance = 0;


  // =====================================================
  // STATUSES
  // =====================================================

  statuses: BillingStatus[] = [

    'Pending',

    'Partially Paid',

    'Paid',

    'Cancelled'

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private billingService: BillingService,
    private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadBills();

  }


  // =====================================================
  // LOAD BILLS
  // =====================================================

  loadBills(): void {

    this.bills =
      this.billingService.getBills();

    this.updateStatistics();

    this.applyFilters();

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalBills =
      this.bills.length;


    this.totalAmount =
      this.bills.reduce(
        (total, bill) =>
          total + bill.amount,
        0
      );


    this.totalPaid =
      this.bills.reduce(
        (total, bill) =>
          total + bill.amountPaid,
        0
      );


    this.totalBalance =
      this.bills.reduce(
        (total, bill) =>
          total + bill.balance,
        0
      );

  }


  // =====================================================
  // FILTER
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredBills =
      this.bills.filter(
        bill => {


          // ---------------------------------------------
          // SEARCH
          // ---------------------------------------------

          const matchesSearch =
            !search ||

            bill.patientName
              .toLowerCase()
              .includes(search) ||

            bill.id
              .toLowerCase()
              .includes(search) ||

            bill.invoiceNumber
              .toLowerCase()
              .includes(search) ||

            (bill.patientNumber ?? '')
              .toLowerCase()
              .includes(search) ||

            (bill.doctorName ?? '')
              .toLowerCase()
              .includes(search) ||

            (bill.departmentName ?? '')
              .toLowerCase()
              .includes(search) ||

            bill.billingType
              .toLowerCase()
              .includes(search) ||

            bill.description
              .toLowerCase()
              .includes(search);


          // ---------------------------------------------
          // STATUS
          // ---------------------------------------------

          const matchesStatus =
            this.selectedStatus === 'All' ||

            bill.status ===
              this.selectedStatus;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

  }


  // =====================================================
  // REGISTER BILL
  // =====================================================

  registerBill(): void {

    this.router.navigate([
      '/billing/register'
    ]);

  }


  // =====================================================
  // VIEW BILL
  // =====================================================

  viewBill(
    bill: Bill
  ): void {

    this.router.navigate([
      '/billing',
      bill.id
    ]);

  }


  // =====================================================
  // EDIT BILL
  // =====================================================

  editBill(
    bill: Bill
  ): void {

    this.router.navigate([
      '/billing',
      bill.id,
      'edit'
    ]);

  }


  // =====================================================
  // DELETE BILL
  // =====================================================

  deleteBill(
    bill: Bill
  ): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete invoice ${bill.invoiceNumber} for ${bill.patientName}?`
      );


    if (!confirmed) {

      return;

    }


    const deleted =
      this.billingService.deleteBill(
        bill.id
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


    this.loadBills();

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = 'All';

    this.applyFilters();

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: BillingStatus
  ): string {

    switch (status) {

      case 'Pending':
        return 'pending';

      case 'Partially Paid':
        return 'partially-paid';

      case 'Paid':
        return 'paid';

      case 'Cancelled':
        return 'cancelled';

      default:
        return '';

    }

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
    ).format(amount);

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date: string
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

}
