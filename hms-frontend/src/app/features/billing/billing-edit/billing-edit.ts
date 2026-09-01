
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
  BillingType,
  PaymentMethod
} from '../../../shared/models/billing.model';

import {
  BillingService
} from '../../../core/services/billing.service';


@Component({
  selector: 'app-billing-edit',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './billing-edit.html',

  styleUrl:
    './billing-edit.css'
})
export class BillingEdit
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

  isSaving =
    false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage =
    '';


  // =====================================================
  // BILLING TYPES
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
      'Billing edit route ID:',
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

    const id =
      Number(
        routeId
      );


    console.log(
      'Loading billing record for edit:',
      id
    );


    if (
      !Number.isInteger(id) ||
      id <= 0
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


    // ---------------------------------------------------
    // Render loading state
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();


    // ===================================================
    // GET BILL FROM BACKEND
    // ===================================================

    this.billingService
      .getBillById(
        id
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next:
          (
            response:
              Bill
          ) => {

            console.log(
              'Billing record received for edit:',
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
            // NORMALIZE VALUES
            // ---------------------------------------------

            this.bill =
              this.normalizeBill(
                response
              );


            // ---------------------------------------------
            // ENSURE ITEMS
            // ---------------------------------------------

            this.bill.items ??= [];


            // ---------------------------------------------
            // COMPLETED / CANCELLED PROTECTION
            // ---------------------------------------------

            if (
              this.bill.status ===
              'Paid'
            ) {

              this.errorMessage =
                'Paid invoices cannot be edited.';

              this.isLoading =
                false;

              this.changeDetectorRef.detectChanges();

              alert(
                this.errorMessage
              );

              this.router.navigate([
                '/billing',
                this.bill.id
              ]);

              return;

            }


            if (
              this.bill.status ===
              'Cancelled'
            ) {

              this.errorMessage =
                'Cancelled invoices cannot be edited.';

              this.isLoading =
                false;

              this.changeDetectorRef.detectChanges();

              alert(
                this.errorMessage
              );

              this.router.navigate([
                '/billing',
                this.bill.id
              ]);

              return;

            }


            // ---------------------------------------------
            // DONE
            // ---------------------------------------------

            this.isLoading =
              false;


            this.changeDetectorRef.detectChanges();


            console.log(
              'Billing edit form rendered:',
              this.bill
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
              'Failed to load billing record for edit:',
              error
            );


            this.bill =
              undefined;

            this.isLoading =
              false;


            this.errorMessage =
              this.getErrorMessage(
                error,
                'Unable to load billing record.'
              );


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
        this.normalizeStatus(
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
                    item.quantity || 1
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
  // NORMALIZE STATUS
  // =====================================================

  private normalizeStatus(
    status:
      string
  ):
    Bill['status'] {

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

      case 'PAID':

        return 'Paid';


      case 'PARTIALLY_PAID':

        return 'Partially Paid';


      case 'PENDING':

        return 'Pending';


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
  // ADD ITEM
  // =====================================================

  addItem(): void {

    if (
      !this.bill ||
      this.isSaving
    ) {

      return;

    }


    this.bill.items ??= [];


    const item:
      BillItem = {

      id:
        this.generateTemporaryItemId(),

      billingType:
        'Other',

      description:
        '',

      quantity:
        1,

      unitPrice:
        0,

      amount:
        0

    };


    this.bill.items.push(
      item
    );


    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // REMOVE ITEM
  // =====================================================

  removeItem(
    index:
      number
  ): void {

    if (
      !this.bill?.items ||
      this.isSaving
    ) {

      return;

    }


    if (
      index < 0 ||
      index >=
        this.bill.items.length
    ) {

      return;

    }


    this.bill.items.splice(
      index,
      1
    );


    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // UPDATE ITEM
  // =====================================================

  updateItem(
    item:
      BillItem
  ): void {

    item.quantity =
      Math.max(
        1,
        Number(
          item.quantity || 1
        )
      );


    item.unitPrice =
      Math.max(
        0,
        Number(
          item.unitPrice || 0
        )
      );


    item.amount =
      item.quantity *
      item.unitPrice;

  }


  // =====================================================
  // CALCULATED TOTAL
  // =====================================================

  get calculatedTotal():
    number {

    if (
      !this.bill
    ) {

      return 0;

    }


    return (
      this.bill.items ??
      []
    )
      .reduce(
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
  // SAVE BILL
  // =====================================================

  saveBill(): void {

    if (
      !this.bill ||
      this.isSaving
    ) {

      return;

    }


    // ---------------------------------------------------
    // PROTECT STATUS
    // ---------------------------------------------------

    if (
      this.bill.status ===
      'Paid'
    ) {

      alert(
        'Paid invoices cannot be modified.'
      );

      return;

    }


    if (
      this.bill.status ===
      'Cancelled'
    ) {

      alert(
        'Cancelled invoices cannot be modified.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE PATIENT
    // ---------------------------------------------------

    if (
      !this.bill.patientName?.trim()
    ) {

      alert(
        'Please enter the patient name.'
      );

      return;

    }


    if (
      !this.bill.patientId?.trim()
    ) {

      alert(
        'Please enter the patient ID.'
      );

      return;

    }


    // ---------------------------------------------------
    // ENSURE ITEMS
    // ---------------------------------------------------

    this.bill.items ??= [];


    // ---------------------------------------------------
    // VALIDATE ITEMS
    // ---------------------------------------------------

    for (
      const item of this.bill.items
    ) {

      if (
        !item.description?.trim()
      ) {

        alert(
          'Every billing item must have a description.'
        );

        return;

      }


      if (
        !item.billingType
      ) {

        alert(
          'Every billing item must have a billing type.'
        );

        return;

      }


      item.quantity =
        Math.max(
          1,
          Number(
            item.quantity || 1
          )
        );


      item.unitPrice =
        Math.max(
          0,
          Number(
            item.unitPrice || 0
          )
        );


      item.amount =
        item.quantity *
        item.unitPrice;

    }


    // ---------------------------------------------------
    // CALCULATE TOTAL
    // ---------------------------------------------------

    const total =
      this.calculatedTotal;


    if (
      total <= 0
    ) {

      alert(
        'Billing total must be greater than zero.'
      );

      return;

    }


    // ---------------------------------------------------
    // CALCULATE PAYMENT
    // ---------------------------------------------------

    const amountPaid =
      Math.max(
        0,
        Math.min(
          total,
          Number(
            this.bill.amountPaid || 0
          )
        )
      );


    const balance =
      Math.max(
        0,
        total -
        amountPaid
      );


    let status:
      Bill['status'] =
        'Pending';


    if (
      amountPaid >=
      total
    ) {

      status =
        'Paid';

    }

    else if (
      amountPaid > 0
    ) {

      status =
        'Partially Paid';

    }


    // ===================================================
    // BUILD COMPLETE BILL
    // ===================================================

    const updatedBill:
      Bill = {

      ...this.bill,

      amount:
        total,

      amountPaid:
        amountPaid,

      balance:
        balance,

      status:
        status,

      description:
        this.bill.description?.trim() ||

        this.bill.items[0]?.description ||

        'Hospital service',

      items:
        this.bill.items.map(
          (
            item:
              BillItem
          ) => ({

            ...item,

            amount:
              Number(
                item.quantity || 1
              ) *
              Number(
                item.unitPrice || 0
              )

          })
        )

    };


    // ===================================================
    // START SAVE
    // ===================================================

    this.isSaving =
      true;


    this.changeDetectorRef.detectChanges();


    // ===================================================
    // UPDATE THROUGH BACKEND
    // ===================================================

    this.billingService
      .updateBill(
        updatedBill
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next:
          (
            savedBill:
              Bill
          ) => {

            console.log(
              'Billing record updated:',
              savedBill
            );


            this.bill =
              this.normalizeBill(
                savedBill
              );


            this.isSaving =
              false;


            this.changeDetectorRef.detectChanges();


            alert(
              `Invoice ${savedBill.invoiceNumber} updated successfully.`
            );


            this.router.navigate([
              '/billing',
              savedBill.id
            ]);

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
              'Failed to update billing record:',
              error
            );


            this.isSaving =
              false;


            this.errorMessage =
              this.getErrorMessage(
                error,
                'Unable to update billing record.'
              );


            this.changeDetectorRef.detectChanges();


            alert(
              this.errorMessage
            );

          }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    if (
      this.isSaving
    ) {

      return;

    }


    if (
      this.bill
    ) {

      this.router.navigate([
        '/billing',
        this.bill.id
      ]);

      return;

    }


    this.backToBilling();

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
  // TEMPORARY ITEM ID
  // =====================================================

  private generateTemporaryItemId():
    string {

    return (
      `TEMP-${Date.now()}-` +
      `${Math.floor(
        Math.random() * 10000
      )}`
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


    return fallback;

  }

}

