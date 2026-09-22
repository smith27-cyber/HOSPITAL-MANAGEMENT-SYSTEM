import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  Bill,
  BillItem,
  BillingStatus,
  BillingType
} from '../../../shared/models/billing.model';

import {
  BillingService
} from '../../../core/services/billing.service';

import {
  finalize
} from 'rxjs/operators';


@Component({
  selector: 'app-billing-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './billing-list.html',

  styleUrl:
    './billing-list.css'
})
export class BillingList
  implements OnInit {


  // =====================================================
  // BILLS
  // =====================================================

  bills:
    Bill[] = [];

  filteredBills:
    Bill[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  isLoading =
    true;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage =
    '';


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm =
    '';


  // =====================================================
  // STATUS FILTER
  // =====================================================

  selectedStatus:
    BillingStatus | 'All' =
      'All';


  // =====================================================
  // BILLING TYPE FILTER
  // =====================================================

  selectedBillingType:
    BillingType | 'All' =
      'All';


  // =====================================================
  // STATISTICS
  // =====================================================

  totalBills =
    0;

  totalAmount =
    0;

  totalPaid =
    0;

  totalBalance =
    0;

  pendingBills =
    0;

  pharmacyBills =
    0;


  // =====================================================
  // STATUS OPTIONS
  // =====================================================

  statuses:
    BillingStatus[] = [

      'Pending',

      'Partially Paid',

      'Paid',

      'Cancelled'

    ];


  // =====================================================
  // BILLING TYPE OPTIONS
  // =====================================================

  billingTypes:
    BillingType[] = [

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

    private readonly billingService:
      BillingService,

    private readonly router:
      Router,

    private readonly changeDetectorRef:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.isLoading =
      true;


    this.changeDetectorRef.detectChanges();


    this.loadBills();

  }


  // =====================================================
  // LOAD BILLS
  // =====================================================

  loadBills(): void {

    this.isLoading =
      true;

    this.errorMessage =
      '';


    // ---------------------------------------------------
    // Render loading state immediately
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();


    this.billingService
      .getBills()

      .pipe(

        finalize(() => {

          this.isLoading =
            false;


          this.changeDetectorRef.detectChanges();

        })

      )

      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next:
          (
            bills:
              Bill[]
          ) => {

            console.log(
              'Billing records loaded:',
              bills
            );


            this.bills =
              Array.isArray(
                bills
              )
                ? bills.map(
                    (
                      bill:
                        Bill
                    ) =>
                      this.normalizeBill(
                        bill
                      )
                  )
                : [];


            this.updateStatistics();

            this.applyFilters();


            console.log(
              'Billing list ready:',
              {
                bills:
                  this.bills.length,

                filtered:
                  this.filteredBills.length,

                total:
                  this.totalAmount,

                paid:
                  this.totalPaid,

                balance:
                  this.totalBalance
              }
            );


            this.changeDetectorRef.detectChanges();

          },


        // =================================================
        // ERROR
        // =================================================

        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to load billing records:',
              error
            );


            this.bills =
              [];

            this.filteredBills =
              [];


            this.resetStatistics();


            this.errorMessage =
              this.getErrorMessage(
                error,
                'Unable to load billing records. Please try again.'
              );


            this.changeDetectorRef.detectChanges();

          }

      });

  }


  // =====================================================
  // NORMALIZE BILL
  // =====================================================

  private normalizeBill(
    bill:
      Bill
  ):
    Bill {

    if (!bill) {

      return bill;

    }


    return {

      ...bill,

      amount:
        Number(
          bill.amount || 0
        ),

      amountPaid:
        Number(
          bill.amountPaid || 0
        ),

      balance:
        Number(
          bill.balance || 0
        ),

      status:
        this.normalizeBillingStatus(
          bill.status as string
        ),

      billingType:
        this.normalizeBillingType(
          bill.billingType as string
        ),

      items:
        Array.isArray(
          bill.items
        )

          ? bill.items.map(
              (
                item:
                  BillItem
              ) => ({

                ...item,

                quantity:
                  Number(
                    item.quantity || 0
                  ),

                unitPrice:
                  Number(
                    item.unitPrice || 0
                  ),

                amount:
                  Number(
                    item.amount || 0
                  ),

                billingType:
                  this.normalizeBillingType(
                    item.billingType as string
                  )

              })
            )

          : []

    };

  }


  // =====================================================
  // NORMALIZE BILLING STATUS
  // =====================================================

  private normalizeBillingStatus(
    status:
      string
  ):
    BillingStatus {

    const normalized =
      String(
        status || ''
      )
        .trim()
        .toUpperCase()
        .replace(
          ' ',
          '_'
        );


    switch (
      normalized
    ) {

      case 'PENDING':

        return 'Pending';


      case 'PARTIALLY_PAID':

        return 'Partially Paid';


      case 'PAID':

        return 'Paid';


      case 'CANCELLED':

        return 'Cancelled';


      default:

        return 'Pending';

    }

  }


  // =====================================================
  // NORMALIZE BILLING TYPE
  // =====================================================

  private normalizeBillingType(
    type:
      string
  ):
    BillingType {

    const normalized =
      String(
        type || ''
      )
        .trim()
        .toUpperCase()
        .replace(
          ' ',
          '_'
        );


    switch (
      normalized
    ) {

      case 'CONSULTATION':

        return 'Consultation';


      case 'LAB':

      case 'LABORATORY':

      case 'LABORATORY_TEST':

      case 'LAB_TEST':

        return 'Laboratory';


      case 'PHARMACY':

      case 'MEDICINE':

      case 'MEDICATION':

        return 'Pharmacy';


      case 'ADMISSION':

        return 'Admission';


      case 'PROCEDURE':

        return 'Procedure';


      case 'OTHER':

        return 'Other';


      default:

        return 'Other';

    }

  }


  // =====================================================
  // RESET STATISTICS
  // =====================================================

  private resetStatistics(): void {

    this.totalBills =
      0;

    this.totalAmount =
      0;

    this.totalPaid =
      0;

    this.totalBalance =
      0;

    this.pendingBills =
      0;

    this.pharmacyBills =
      0;

  }


  // =====================================================
  // UPDATE STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalBills =
      this.bills.length;


    this.totalAmount =
      this.bills.reduce(
        (
          total:
            number,

          bill:
            Bill
        ) =>
          total +
          Number(
            bill.amount || 0
          ),

        0
      );


    this.totalPaid =
      this.bills.reduce(
        (
          total:
            number,

          bill:
            Bill
        ) =>
          total +
          Number(
            bill.amountPaid || 0
          ),

        0
      );


    this.totalBalance =
      this.bills.reduce(
        (
          total:
            number,

          bill:
            Bill
        ) =>
          total +
          Number(
            bill.balance || 0
          ),

        0
      );


    this.pendingBills =
      this.bills.filter(
        (
          bill:
            Bill
        ) =>
          bill.status ===
          'Pending'
      ).length;


    this.pharmacyBills =
      this.bills.filter(
        (
          bill:
            Bill
        ) =>
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
        (
          bill:
            Bill
        ) => {

          const patientName =
            String(
              bill.patientName || ''
            )
              .toLowerCase();


          const billId =
            String(
              bill.id || ''
            )
              .toLowerCase();


          const invoiceNumber =
            String(
              bill.invoiceNumber || ''
            )
              .toLowerCase();


          const patientNumber =
            String(
              bill.patientNumber || ''
            )
              .toLowerCase();


          const doctorName =
            String(
              bill.doctorName || ''
            )
              .toLowerCase();


          const departmentName =
            String(
              bill.departmentName || ''
            )
              .toLowerCase();


          const billingType =
            String(
              bill.billingType || ''
            )
              .toLowerCase();


          const description =
            String(
              bill.description || ''
            )
              .toLowerCase();


          const matchesSearch =
            !search ||

            patientName.includes(
              search
            ) ||

            billId.includes(
              search
            ) ||

            invoiceNumber.includes(
              search
            ) ||

            patientNumber.includes(
              search
            ) ||

            doctorName.includes(
              search
            ) ||

            departmentName.includes(
              search
            ) ||

            billingType.includes(
              search
            ) ||

            description.includes(
              search
            ) ||

            this.billItemsMatchSearch(
              bill,
              search
            );


          const matchesStatus =
            this.selectedStatus ===
              'All' ||

            bill.status ===
              this.selectedStatus;


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
    bill:
      Bill,

    billingType:
      BillingType
  ):
    boolean {

    const items =
      bill.items ??
      [];


    const itemMatch =
      items.some(
        (
          item:
            BillItem
        ) =>
          this.normalizeBillingType(
            item.billingType as string
          ) ===
          billingType
      );


    if (
      itemMatch
    ) {

      return true;

    }


    return (
      this.normalizeBillingType(
        bill.billingType as string
      ) ===
      billingType
    );

  }


  // =====================================================
  // SEARCH BILL ITEMS
  // =====================================================

  private billItemsMatchSearch(
    bill:
      Bill,

    search:
      string
  ):
    boolean {

    if (!search) {

      return false;

    }


    const items:
      BillItem[] =
      bill.items ??
      [];


    return items.some(
      (
        item:
          BillItem
      ) => {

        return (

          String(
            item.billingType || ''
          )
            .toLowerCase()
            .includes(
              search
            ) ||

          String(
            item.description || ''
          )
            .toLowerCase()
            .includes(
              search
            ) ||

          String(
            item.referenceId || ''
          )
            .toLowerCase()
            .includes(
              search
            ) ||

          String(
            item.amount ?? ''
          )
            .includes(
              search
            )

        );

      }
    );

  }


  // =====================================================
  // GET BILL ITEMS
  // =====================================================

  getBillItems(
    bill:
      Bill
  ):
    BillItem[] {

    return bill.items ??
      [];

  }


  // =====================================================
  // GET ITEM COUNT
  // =====================================================

  getItemCount(
    bill:
      Bill
  ):
    number {

    return (
      bill.items?.length ??
      0
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
  // VIEW RECEIPTS
  // =====================================================

  viewReceipts(): void {

    this.router.navigate([
      '/billing',
      'receipts'
    ]);

  }


  // =====================================================
  // VIEW BILL
  // =====================================================

  viewBill(
    bill:
      Bill
  ): void {

    if (!bill?.id) {

      return;

    }


    this.router.navigate([
      '/billing',
      bill.id
    ]);

  }


  // =====================================================
  // EDIT BILL
  // =====================================================

  editBill(
    bill:
      Bill
  ): void {

    if (!bill?.id) {

      return;

    }


    if (
      bill.status ===
      'Paid'
    ) {

      alert(
        'A fully paid invoice cannot be edited.'
      );

      return;

    }


    if (
      bill.status ===
      'Cancelled'
    ) {

      alert(
        'A cancelled invoice cannot be edited.'
      );

      return;

    }


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
    bill:
      Bill
  ): void {

    if (
      !bill
    ) {

      return;

    }


    // ---------------------------------------------------
    // PROTECT PAID BILL
    // ---------------------------------------------------

    if (
      bill.status ===
      'Paid'
    ) {

      alert(
        'A fully paid invoice cannot be deleted.'
      );

      return;

    }


    // ---------------------------------------------------
    // PROTECT CANCELLED BILL
    // ---------------------------------------------------

    if (
      bill.status ===
      'Cancelled'
    ) {

      alert(
        'A cancelled invoice cannot be deleted.'
      );

      return;

    }


    // ---------------------------------------------------
    // CONFIRM
    // ---------------------------------------------------

    const confirmed =
      window.confirm(
        `Are you sure you want to delete invoice ${bill.invoiceNumber} for ${bill.patientName}?`
      );


    if (
      !confirmed
    ) {

      return;

    }


    // ---------------------------------------------------
    // START LOADING
    // ---------------------------------------------------

    this.isLoading =
      true;

    this.errorMessage =
      '';


    this.changeDetectorRef.detectChanges();


    // ---------------------------------------------------
    // DELETE THROUGH BACKEND
    // ---------------------------------------------------

    this.billingService
      .deleteBill(
        bill.id
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: () => {

          console.log(
            'Billing record deleted successfully:',
            bill.id
          );


          // ----------------------------------------------
          // Remove deleted bill immediately
          // ----------------------------------------------

          this.bills =
            this.bills.filter(
              (
                currentBill:
                  Bill
              ) =>
                currentBill.id !==
                bill.id
            );


          // ----------------------------------------------
          // Recalculate page
          // ----------------------------------------------

          this.updateStatistics();

          this.applyFilters();


          this.isLoading =
            false;


          this.changeDetectorRef.detectChanges();


          alert(
            `Invoice ${bill.invoiceNumber} deleted successfully.`
          );

        },


        // ===============================================
        // ERROR
        // ===============================================

        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to delete billing record:',
              error
            );


            this.isLoading =
              false;


            this.errorMessage =
              this.getErrorMessage(
                error,
                'Unable to delete billing record.'
              );


            this.changeDetectorRef.detectChanges();


            alert(
              this.errorMessage
            );

          }

      });

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm =
      '';

    this.selectedStatus =
      'All';

    this.selectedBillingType =
      'All';


    this.applyFilters();


    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status:
      BillingStatus
  ):
    string {

    switch (
      this.normalizeBillingStatus(
        status as string
      )
    ) {

      case 'Paid':

        return 'paid';


      case 'Partially Paid':

        return 'partially-paid';


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
    type:
      BillingType
  ):
    string {

    switch (
      this.normalizeBillingType(
        type as string
      )
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
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    amount:
      number
  ):
    string {

    return new Intl.NumberFormat(
      'en-UG',
      {
        style:
          'currency',

        currency:
          'UGX',

        maximumFractionDigits:
          0

      }
    ).format(
      Number(
        amount || 0
      )
    );

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date:
      string
  ):
    string {

    if (
      !date
    ) {

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
        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric'

      }
    ).format(
      parsedDate
    );

  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error:
      unknown,

    fallback:
      string
  ):
    string {

    if (
      typeof error !==
        'object' ||
      error === null
    ) {

      return fallback;

    }


    const response =
      error as {
        error?: unknown;
        message?: string;
      };


    // ---------------------------------------------------
    // Direct message
    // ---------------------------------------------------

    if (
      typeof response.message ===
        'string' &&
      response.message.trim()
    ) {

      return response.message.trim();

    }


    // ---------------------------------------------------
    // String error body
    // ---------------------------------------------------

    if (
      typeof response.error ===
        'string' &&
      response.error.trim()
    ) {

      return response.error.trim();

    }


    // ---------------------------------------------------
    // Object error body
    // ---------------------------------------------------

    if (
      typeof response.error ===
        'object' &&
      response.error !== null
    ) {

      const body =
        response.error as {
          message?: string;
          error?: string;
        };


      if (
        typeof body.message ===
          'string' &&
        body.message.trim()
      ) {

        return body.message.trim();

      }


      if (
        typeof body.error ===
          'string' &&
        body.error.trim()
      ) {

        return body.error.trim();

      }

    }


    return fallback;

  }

}