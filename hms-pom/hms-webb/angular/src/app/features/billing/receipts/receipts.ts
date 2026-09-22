import {
  ChangeDetectionStrategy,
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
  ActivatedRoute
} from '@angular/router';

import {
  ReceiptResponse,
  ReceiptService
} from '../../../core/services/receipt.service';


@Component({
  selector: 'app-receipts',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './receipts.html',

  styleUrl: './receipts.css',

  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class ReceiptsComponent
  implements OnInit {


  // =====================================================
  // STATE
  // =====================================================

  receipts:
    ReceiptResponse[] = [];

  filteredReceipts:
    ReceiptResponse[] = [];

  selectedReceipt:
    ReceiptResponse | null = null;

  loading =
    false;

  errorMessage =
    '';

  searchTerm =
    '';

  paymentMethodFilter =
    'ALL';

  startDate =
    '';

  endDate =
    '';


  // =====================================================
  // QUERY PARAMETERS
  // =====================================================

  private requestedReceiptNumber:
    string | null = null;

  private shouldPrintRequestedReceipt =
    false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private readonly receiptService:
      ReceiptService,

    private readonly route:
      ActivatedRoute,

    private readonly cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.readQueryParameters();

    this.loadReceipts();

  }


  // =====================================================
  // READ QUERY PARAMETERS
  // =====================================================

  private readQueryParameters(): void {

    this.route.queryParamMap.subscribe(
      params => {

        this.requestedReceiptNumber =
          params.get(
            'receiptNumber'
          );

        this.shouldPrintRequestedReceipt =
          params.get(
            'print'
          ) === 'true';

      }
    );

  }


  // =====================================================
  // LOAD RECEIPTS
  // =====================================================

  loadReceipts(): void {

    this.loading =
      true;

    this.errorMessage =
      '';

    this.cdr.markForCheck();


    this.receiptService
      .getAllReceipts()
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next:
          (
            receipts:
              ReceiptResponse[]
          ) => {

            this.receipts =
              Array.isArray(
                receipts
              )
                ? receipts
                : [];


            this.applyFilters();


            this.loading =
              false;


            this.handleRequestedReceipt();


            this.cdr.markForCheck();

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
              'Failed to load receipts:',
              error
            );


            this.loading =
              false;


            this.errorMessage =
              'Failed to load receipts. Please try again.';


            this.cdr.markForCheck();

          }

      });

  }


  // =====================================================
  // HANDLE REQUESTED RECEIPT
  // =====================================================

  private handleRequestedReceipt(): void {

    if (
      !this.requestedReceiptNumber
    ) {

      return;

    }


    const receipt =
      this.receipts.find(
        item =>
          item.receiptNumber ===
          this.requestedReceiptNumber
      );


    if (
      !receipt
    ) {

      this.errorMessage =
        `Receipt ${this.requestedReceiptNumber} could not be found.`;

      this.cdr.markForCheck();

      return;

    }


    this.selectedReceipt =
      receipt;


    this.cdr.markForCheck();


    // ---------------------------------------------------
    // Automatically print requested receipt
    // ---------------------------------------------------

    if (
      this.shouldPrintRequestedReceipt
    ) {

      setTimeout(() => {

        this.printReceipt(
          receipt
        );

      }, 300);

    }

  }


  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredReceipts =
      this.receipts.filter(
        (
          receipt:
            ReceiptResponse
        ) => {

          const matchesSearch =
            !search ||

            (
              receipt.receiptNumber ||
              ''
            )
              .toLowerCase()
              .includes(
                search
              ) ||

            (
              receipt.invoiceNumber ||
              ''
            )
              .toLowerCase()
              .includes(
                search
              ) ||

            (
              receipt.patientName ||
              ''
            )
              .toLowerCase()
              .includes(
                search
              ) ||

            (
              receipt.patientId ||
              ''
            )
              .toLowerCase()
              .includes(
                search
              ) ||

            (
              receipt.receivedBy ||
              ''
            )
              .toLowerCase()
              .includes(
                search
              );


          const matchesMethod =
            this.paymentMethodFilter ===
              'ALL' ||

            receipt.paymentMethod ===
              this.paymentMethodFilter;


          const receiptDate =
            receipt.paymentDate
              ? receipt.paymentDate.substring(
                  0,
                  10
                )
              : '';


          const matchesStartDate =
            !this.startDate ||
            receiptDate >=
              this.startDate;


          const matchesEndDate =
            !this.endDate ||
            receiptDate <=
              this.endDate;


          return (
            matchesSearch &&
            matchesMethod &&
            matchesStartDate &&
            matchesEndDate
          );

        }
      );


    this.cdr.markForCheck();

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm =
      '';

    this.paymentMethodFilter =
      'ALL';

    this.startDate =
      '';

    this.endDate =
      '';


    this.applyFilters();

  }


  // =====================================================
  // VIEW RECEIPT
  // =====================================================

  viewReceipt(
    receipt:
      ReceiptResponse
  ): void {

    this.selectedReceipt =
      receipt;


    this.cdr.markForCheck();

  }


  // =====================================================
  // CLOSE RECEIPT
  // =====================================================

  closeReceipt(): void {

    this.selectedReceipt =
      null;


    this.cdr.markForCheck();

  }


  // =====================================================
  // PRINT RECEIPT
  // =====================================================

  printReceipt(
    receipt:
      ReceiptResponse
  ): void {

    this.selectedReceipt =
      receipt;


    this.cdr.detectChanges();


    setTimeout(() => {

      window.print();

    }, 100);

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
      amount || 0
    );

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    value?:
      string
  ):
    string {

    if (
      !value
    ) {

      return '—';

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;

    }


    return new Intl.DateTimeFormat(
      'en-UG',
      {
        dateStyle:
          'medium',

        timeStyle:
          'short'
      }
    ).format(
      date
    );

  }


  // =====================================================
  // TOTAL PAYMENTS
  // =====================================================

  get totalPayments():
    number {

    return this.filteredReceipts
      .reduce(
        (
          total:
            number,

          receipt:
            ReceiptResponse
        ) => {

          return total +
            Number(
              receipt.amount ||
              0
            );

        },
        0
      );

  }


  // =====================================================
  // RECEIPT COUNT
  // =====================================================

  get receiptCount():
    number {

    return this.filteredReceipts.length;

  }


  // =====================================================
  // PAYMENT METHODS
  // =====================================================

  get paymentMethods():
    string[] {

    return Array.from(
      new Set(
        this.receipts
          .map(
            receipt =>
              receipt.paymentMethod
          )
          .filter(
            Boolean
          )
      )
    );

  }

}