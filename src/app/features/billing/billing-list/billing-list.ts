import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Bill,
  BillingStatus,
  BillingType,
  BillItem
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
  // BILLING TYPE FILTER
  // =====================================================

  selectedBillingType:
    BillingType | 'All' = 'All';


  // =====================================================
  // STATISTICS
  // =====================================================

  totalBills = 0;

  totalAmount = 0;

  totalPaid = 0;

  totalBalance = 0;

  pendingBills = 0;

  pharmacyBills = 0;


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
  // BILLING TYPES
  // =====================================================

  billingTypes: BillingType[] = [

    'Consultation',

    'Laboratory',

    'Pharmacy',

    'Admission',

    'Procedure',

    'Other'

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
        (
          total,
          bill
        ) =>
          total +
          bill.amount,
        0
      );


    this.totalPaid =
      this.bills.reduce(
        (
          total,
          bill
        ) =>
          total +
          bill.amountPaid,
        0
      );


    this.totalBalance =
      this.bills.reduce(
        (
          total,
          bill
        ) =>
          total +
          bill.balance,
        0
      );


    this.pendingBills =
      this.bills.filter(
        bill =>
          bill.status ===
          'Pending'
      ).length;


    /*
     * Count invoices that contain at least one
     * Pharmacy billing item.
     */

    this.pharmacyBills =
      this.bills.filter(
        bill =>
          this.billContainsType(
            bill,
            'Pharmacy'
          )
      ).length;

  }


  // =====================================================
  // APPLY FILTERS
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

            (
              bill.patientNumber ??
              ''
            )
              .toLowerCase()
              .includes(search) ||

            (
              bill.doctorName ??
              ''
            )
              .toLowerCase()
              .includes(search) ||

            (
              bill.departmentName ??
              ''
            )
              .toLowerCase()
              .includes(search) ||

            bill.billingType
              .toLowerCase()
              .includes(search) ||

            bill.description
              .toLowerCase()
              .includes(search) ||

            this.billItemsMatchSearch(
              bill,
              search
            );


          // ---------------------------------------------
          // STATUS
          // ---------------------------------------------

          const matchesStatus =
            this.selectedStatus ===
              'All' ||

            bill.status ===
              this.selectedStatus;


          // ---------------------------------------------
          // BILLING TYPE
          // ---------------------------------------------

          const matchesBillingType =
            this.selectedBillingType ===
              'All' ||

            this.billContainsType(
              bill,
              this.selectedBillingType
            );


          return (
            matchesSearch &&
            matchesStatus &&
            matchesBillingType
          );

        }
      );

  }


  // =====================================================
  // CHECK BILL TYPE
  // =====================================================

  billContainsType(
    bill: Bill,
    billingType: BillingType
  ): boolean {

    /*
     * Check the new item-based structure first.
     */

    const items =
      bill.items ?? [];


    const itemMatches =
      items.some(
        item =>
          item.billingType ===
          billingType
      );


    if (
      itemMatches
    ) {

      return true;

    }


    /*
     * Fall back to the legacy billingType field.
     * This keeps old invoices working.
     */

    return (
      bill.billingType ===
      billingType
    );

  }


  // =====================================================
  // SEARCH BILL ITEMS
  // =====================================================

  private billItemsMatchSearch(
    bill: Bill,
    search: string
  ): boolean {

    if (!search) {

      return false;

    }


    const items:
      BillItem[] =
      bill.items ?? [];


    return items.some(
      item => {

        return (

          item.billingType
            .toLowerCase()
            .includes(search) ||

          item.description
            .toLowerCase()
            .includes(search) ||

          item.referenceId
            ?.toLowerCase()
            .includes(search) ||

          String(
            item.amount
          )
            .includes(search)

        );

      }
    );

  }


  // =====================================================
  // GET BILL ITEMS
  // =====================================================

  getBillItems(
    bill: Bill
  ): BillItem[] {

    return bill.items ?? [];

  }


  // =====================================================
  // GET ITEM COUNT
  // =====================================================

  getItemCount(
    bill: Bill
  ): number {

    return (
      bill.items?.length ?? 0
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

    this.selectedStatus =
      'All';

    this.selectedBillingType =
      'All';


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
  // BILLING TYPE CLASS
  // =====================================================

  getBillingTypeClass(
    type: BillingType
  ): string {

    switch (type) {

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
  // FORMAT DATE
  // =====================================================

  formatDate(
    date: string
  ): string {

    if (!date) {

      return '—';

    }


    const parsedDate =
      new Date(date);


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

}
