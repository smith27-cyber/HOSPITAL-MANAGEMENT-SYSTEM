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
  ActivatedRoute,
  Router
} from '@angular/router';

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

import {
  ReceiptResponse,
  ReceiptService
} from '../../../core/services/receipt.service';


@Component({
  selector: 'app-billing-details',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './billing-details.html',

  styleUrl:
    './billing-details.css'
})
export class BillingDetails
  implements OnInit {


  // =====================================================
  // BILL
  // =====================================================

  bill:
    Bill | undefined;


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
  // PAYMENT
  // =====================================================

  paymentAmount =
    0;

  selectedPaymentMethod:
    PaymentMethod =
      'Cash';

  isProcessingPayment =
    false;


  // =====================================================
  // RECEIPT
  // =====================================================

  latestReceipt:
    ReceiptResponse | null =
      null;

  isLoadingReceipt =
    false;

  receiptMessage =
    '';


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

    private readonly billingService:
      BillingService,

    private readonly receiptService:
      ReceiptService,

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly changeDetectorRef:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const routeId =
      this.route.snapshot
        .paramMap
        .get('id');


    console.log(
      'Billing details route ID:',
      routeId
    );


    if (
      !routeId ||
      !routeId.trim()
    ) {

      this.errorMessage =
        'Billing record ID was not provided.';

      this.isLoading =
        false;

      this.changeDetectorRef.detectChanges();

      this.backToBilling();

      return;

    }


    this.loadBill(
      routeId.trim()
    );

  }


  // =====================================================
  // LOAD BILL
  // =====================================================

  private loadBill(
    routeId:
      string
  ): void {

    const numericId =
      Number(
        routeId
      );


    console.log(
      'Loading billing record:',
      numericId
    );


    if (
      !Number.isInteger(
        numericId
      ) ||
      numericId <= 0
    ) {

      this.errorMessage =
        'Invalid billing record ID.';

      this.isLoading =
        false;

      this.changeDetectorRef.detectChanges();


      alert(
        this.errorMessage
      );


      this.backToBilling();

      return;

    }


    this.isLoading =
      true;

    this.errorMessage =
      '';

    this.bill =
      undefined;

    this.latestReceipt =
      null;


    // ---------------------------------------------------
    // Render loading state first
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();


    // ===================================================
    // API REQUEST
    // ===================================================

    this.billingService
      .getBillById(
        numericId
      )
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next:
          (
            response:
              Bill
          ) => {

            console.log(
              'Billing record received:',
              response
            );


            if (
              !response
            ) {

              this.bill =
                undefined;

              this.errorMessage =
                'Billing record not found.';

              this.isLoading =
                false;


              this.changeDetectorRef.detectChanges();


              alert(
                this.errorMessage
              );


              this.backToBilling();

              return;

            }


            // ---------------------------------------------
            // NORMALIZE API BILL
            // ---------------------------------------------

            this.bill =
              this.normalizeBill(
                response
              );


            console.log(
              'Billing record normalized:',
              this.bill
            );


            // ---------------------------------------------
            // INITIAL PAYMENT AMOUNT
            // ---------------------------------------------

            this.paymentAmount =
              Math.max(
                0,
                Number(
                  this.bill.balance || 0
                )
              );


            // ---------------------------------------------
            // STOP LOADING
            // ---------------------------------------------

            this.isLoading =
              false;


            // ---------------------------------------------
            // FORCE FINAL RENDER
            // ---------------------------------------------

            this.changeDetectorRef.detectChanges();


            console.log(
              'Billing details rendered:',
              {
                id:
                  this.bill.id,

                invoice:
                  this.bill.invoiceNumber,

                patient:
                  this.bill.patientName,

                amount:
                  this.bill.amount,

                paid:
                  this.bill.amountPaid,

                balance:
                  this.bill.balance,

                status:
                  this.bill.status,

                items:
                  this.bill.items
              }
            );

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
              'Failed to load billing record:',
              error
            );


            this.bill =
              undefined;


            this.errorMessage =
              this.getErrorMessage(
                error,
                'Unable to load billing record.'
              );


            this.isLoading =
              false;


            this.changeDetectorRef.detectChanges();


            alert(
              this.errorMessage
            );


            this.backToBilling();

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

    if (
      !bill
    ) {

      return bill;

    }


    const normalizedItems:
      BillItem[] =
      Array.isArray(
        bill.items
      )
        ? bill.items.map(
            (
              item:
                BillItem
            ) => ({

              ...item,

              billingType:
                this.normalizeBillingType(
                  item.billingType as string
                )

            })
          )

        : [];


    return {

      ...bill,

      status:
        this.normalizeBillingStatus(
          bill.status as string
        ),

      billingType:
        this.normalizeBillingType(
          bill.billingType as string
        ),

      items:
        normalizedItems,

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
        )

    };

  }


  // =====================================================
  // NORMALIZE STATUS
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
        .toUpperCase();


    switch (
      normalized
    ) {

      case 'PENDING':

        return 'Pending';


      case 'PARTIALLY_PAID':

        return 'Partially Paid';


      case 'PARTIALLY PAID':

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
        .toUpperCase();


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
  // RELOAD BILL
  // =====================================================

  private reloadBill(): void {

    if (
      !this.bill?.id
    ) {

      return;

    }


    const billId =
      Number(
        this.bill.id
      );


    this.isLoading =
      true;


    this.changeDetectorRef.detectChanges();


    this.billingService
      .getBillById(
        billId
      )
      .subscribe({

        next:
          (
            response:
              Bill
          ) => {

            if (
              !response
            ) {

              this.isLoading =
                false;

              this.errorMessage =
                'Billing record could not be reloaded.';

              this.changeDetectorRef.detectChanges();

              return;

            }


            this.bill =
              this.normalizeBill(
                response
              );


            this.paymentAmount =
              Math.max(
                0,
                Number(
                  this.bill.balance || 0
                )
              );


            this.isLoading =
              false;


            this.changeDetectorRef.detectChanges();

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to reload billing record:',
              error
            );


            this.isLoading =
              false;


            this.errorMessage =
              this.getErrorMessage(
                error,
                'Unable to reload billing record.'
              );


            this.changeDetectorRef.detectChanges();

          }

      });

  }


  // =====================================================
  // GET BILL ITEMS
  // =====================================================

  getBillItems():
    BillItem[] {

    if (
      !this.bill
    ) {

      return [];

    }


    return Array.isArray(
      this.bill.items
    )
      ? this.bill.items
      : [];

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
    billingType:
      BillingType
  ):
    BillItem[] {

    return this.getBillItems()
      .filter(
        (
          item:
            BillItem
        ) =>
          this.normalizeBillingType(
            item.billingType as string
          ) ===
          billingType
      );

  }


  // =====================================================
  // CHECK BILLING TYPE
  // =====================================================

  hasBillingType(
    billingType:
      BillingType
  ):
    boolean {

    const itemMatch =
      this.getBillItems()
        .some(
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
        this.bill?.billingType as string
      ) ===
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
      (
        type:
          BillingType
      ) =>
        this.hasBillingType(
          type
        )
    );

  }


  // =====================================================
  // GET BILLING TYPE TOTAL
  // =====================================================

  getTypeTotal(
    billingType:
      BillingType
  ):
    number {

    return this.getItemsByType(
      billingType
    ).reduce(
      (
        total:
          number,

        item:
          BillItem
      ) =>
        total +
        Number(
          item.amount || 0
        ),

      0
    );

  }


  // =====================================================
  // EDIT BILL
  // =====================================================

  editBill(): void {

    if (
      !this.bill
    ) {

      return;

    }


    if (
      this.bill.status ===
      'Paid'
    ) {

      alert(
        'A fully paid invoice cannot be edited.'
      );

      return;

    }


    if (
      this.bill.status ===
      'Cancelled'
    ) {

      alert(
        'A cancelled invoice cannot be edited.'
      );

      return;

    }


    this.router.navigate([
      '/billing',
      this.bill.id,
      'edit'
    ]);

  }


  // =====================================================
  // DELETE BILL
  // =====================================================

  deleteBill(): void {

    if (
      !this.bill
    ) {

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


    if (
      this.bill.status ===
      'Cancelled'
    ) {

      alert(
        'A cancelled invoice cannot be deleted.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete invoice ${this.bill.invoiceNumber}?`
      );


    if (
      !confirmed
    ) {

      return;

    }


    this.isLoading =
      true;


    this.changeDetectorRef.detectChanges();


    this.billingService
      .deleteBill(
        Number(
          this.bill.id
        )
      )
      .subscribe({

        next: () => {

          this.isLoading =
            false;


          this.changeDetectorRef.detectChanges();


          alert(
            'Billing record deleted successfully.'
          );


          this.backToBilling();

        },


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


            this.changeDetectorRef.detectChanges();


            alert(
              this.getErrorMessage(
                error,
                'Unable to delete billing record.'
              )
            );

          }

      });

  }


  // =====================================================
  // CAN RECORD PAYMENT
  // =====================================================

  canRecordPayment():
    boolean {

    if (
      !this.bill
    ) {

      return false;

    }


    return (

      this.bill.status !==
        'Paid' &&

      this.bill.status !==
        'Cancelled' &&

      Number(
        this.bill.balance || 0
      ) > 0

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


    const balance =
      Number(
        this.bill.balance || 0
      );


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
      balance
    ) {

      alert(
        `Payment cannot exceed the outstanding balance of ${this.formatCurrency(
          balance
        )}.`
      );

      return;

    }


    this.isProcessingPayment =
      true;

    this.receiptMessage =
      '';

    this.latestReceipt =
      null;


    this.changeDetectorRef.detectChanges();


    // ===================================================
    // RECORD PAYMENT
    // ===================================================

    this.billingService
      .recordPayment(

        Number(
          this.bill.id
        ),

        this.paymentAmount,

        this.selectedPaymentMethod

      )
      .subscribe({

        // =================================================
        // PAYMENT SUCCESS
        // =================================================

        next:
          (
            updatedBill:
              Bill
          ) => {

            console.log(
              'Payment recorded successfully:',
              updatedBill
            );


            this.bill =
              this.normalizeBill(
                updatedBill
              );


            this.paymentAmount =
              Math.max(
                0,
                Number(
                  this.bill.balance || 0
                )
              );


            this.isProcessingPayment =
              false;


            this.changeDetectorRef.detectChanges();


            // ---------------------------------------------
            // LOAD THE RECEIPT CREATED BY THE PAYMENT
            // ---------------------------------------------

            this.loadLatestReceipt(
              Number(
                this.bill.id
              )
            );

          },


        // =================================================
        // PAYMENT ERROR
        // =================================================

        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to record payment:',
              error
            );


            this.isProcessingPayment =
              false;


            this.changeDetectorRef.detectChanges();


            alert(
              this.getErrorMessage(
                error,
                'Unable to record payment.'
              )
            );

          }

      });

  }


  // =====================================================
  // LOAD LATEST RECEIPT
  // =====================================================

  private loadLatestReceipt(
    billingId:
      number
  ): void {

    this.isLoadingReceipt =
      true;

    this.receiptMessage =
      'Loading receipt...';


    this.changeDetectorRef.detectChanges();


    this.receiptService
      .getReceiptsByBillingId(
        billingId
      )
      .subscribe({

        next:
          (
            receipts:
              ReceiptResponse[]
          ) => {

            this.isLoadingReceipt =
              false;


            if (
              !Array.isArray(
                receipts
              ) ||
              receipts.length ===
                0
            ) {

              this.latestReceipt =
                null;

              this.receiptMessage =
                'Payment was recorded, but the receipt could not be loaded.';

              this.changeDetectorRef.detectChanges();


              alert(
                'Payment recorded successfully, but the receipt could not be loaded.'
              );

              return;

            }


            // ------------------------------------------------
            // Backend returns receipts newest first.
            // ------------------------------------------------

            this.latestReceipt =
              receipts[0];


            this.receiptMessage =
              `Receipt ${this.latestReceipt.receiptNumber} generated successfully.`;


            this.changeDetectorRef.detectChanges();


            console.log(
              'Latest receipt loaded:',
              this.latestReceipt
            );


            alert(
              `Payment recorded successfully.\n\nReceipt: ${this.latestReceipt.receiptNumber}`
            );

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to load payment receipt:',
              error
            );


            this.isLoadingReceipt =
              false;

            this.latestReceipt =
              null;

            this.receiptMessage =
              'Payment was recorded successfully, but the receipt could not be loaded.';


            this.changeDetectorRef.detectChanges();


            alert(
              'Payment recorded successfully, but the receipt could not be loaded.'
            );

          }

      });

  }


  // =====================================================
  // OPEN RECEIPTS PAGE
  // =====================================================

  openReceipts(): void {

    this.router.navigate([
      '/billing',
      'receipts'
    ]);

  }


  // =====================================================
  // OPEN LATEST RECEIPT
  // =====================================================

  openLatestReceipt(): void {

    if (
      !this.latestReceipt
    ) {

      this.openReceipts();

      return;

    }


    this.router.navigate(
      [
        '/billing',
        'receipts'
      ],
      {
        queryParams: {
          receiptNumber:
            this.latestReceipt.receiptNumber
        }
      }
    );

  }


  // =====================================================
  // PRINT LATEST RECEIPT
  // =====================================================

  printLatestReceipt(): void {

    if (
      !this.latestReceipt
    ) {

      alert(
        'No receipt is available to print.'
      );

      return;

    }


    this.router.navigate(
      [
        '/billing',
        'receipts'
      ],
      {
        queryParams: {
          receiptNumber:
            this.latestReceipt.receiptNumber,

          print:
            'true'
        }
      }
    );

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
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?:
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
  // FORMAT DATE TIME
  // =====================================================

  formatDateTime(
    date?:
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
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit'
      }
    ).format(
      parsedDate
    );

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
  // PAYMENT PROGRESS
  // =====================================================

  getPaymentPercentage():
    number {

    if (
      !this.bill ||
      Number(
        this.bill.amount || 0
      ) <= 0
    ) {

      return 0;

    }


    const amount =
      Number(
        this.bill.amount || 0
      );


    const amountPaid =
      Number(
        this.bill.amountPaid || 0
      );


    return Math.min(
      100,

      Math.round(
        (
          amountPaid /
          amount
        ) * 100
      )

    );

  }


  // =====================================================
  // HAS BALANCE
  // =====================================================

  hasBalance():
    boolean {

    return (
      !!this.bill &&
      Number(
        this.bill.balance || 0
      ) > 0
    );

  }


  // =====================================================
  // IS PAID
  // =====================================================

  isPaid():
    boolean {

    return (
      !!this.bill &&
      this.bill.status ===
      'Paid'
    );

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
  // LEGACY DESCRIPTION
  // =====================================================

  getLegacyDescription():
    string {

    if (
      !this.bill
    ) {

      return '—';

    }


    return (
      this.bill.description ||
      '—'
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
      typeof error ===
        'object' &&
      error !== null
    ) {

      const response =
        error as {
          error?: unknown;
          message?: string;
        };


      if (
        typeof response.message ===
          'string' &&
        response.message.trim()
      ) {

        return response.message.trim();

      }


      if (
        typeof response.error ===
          'string' &&
        response.error.trim()
      ) {

        return response.error.trim();

      }


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

    }


    return fallback;

  }


  // =====================================================
  // BACK TO BILLING
  // =====================================================

  backToBilling(): void {

    this.router.navigate([
      '/billing'
    ]);

  }

}