
import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpErrorResponse,
  HttpParams
} from '@angular/common/http';


import {
  Observable,
  of,
  throwError
} from 'rxjs';

import {
  catchError,
  map,
  switchMap
} from 'rxjs/operators';



import {
  Bill,
  BillItem,
  BillingStatus,
  BillingType,
  PaymentMethod
} from '../../shared/models/billing.model';


// =====================================================
// BACKEND BILLING DTO
// =====================================================
//
// The Spring Boot backend uses:
// - Long billing IDs
// - BIG DECIMAL amounts
// - uppercase enum values
//
// The Angular application uses:
// - string IDs
// - number amounts
// - title-case enum values
//
// This service converts between the two formats.
//

interface BackendBillingItem {

  id?: number;

  billingType:
    string;

  description:
    string;

  quantity:
    number;

  unitPrice:
    number | string;

  amount:
    number | string;

  referenceId?:
    string;

}


interface BackendBilling {

  id:
    number;

  patientId:
    string;

  patientName:
    string;

  patientNumber?:
    string;

  doctorId?:
    string;

  doctorName?:
    string;

  departmentId?:
    string;

  departmentName?:
    string;

  description?:
    string;

  amount:
    number | string;

  amountPaid:
    number | string;

  balance:
    number | string;

  paymentMethod?:
    string;

  status:
    string;

  invoiceNumber:
    string;

  billingDate:
    string;

  dueDate?:
    string;

  notes?:
    string;

  createdAt:
    string;

  updatedAt?:
    string;

  items?:
    BackendBillingItem[];

}


// =====================================================
// CREATE / UPDATE REQUEST
// =====================================================

interface BillingRequestPayload {

  patientId:
    string;

  patientName:
    string;

  patientNumber?:
    string;

  doctorId?:
    string;

  doctorName?:
    string;

  departmentId?:
    string;

  departmentName?:
    string;

  description?:
    string;

  dueDate?:
    string;

  notes?:
    string;

  items:
    BillingItemRequestPayload[];

}


interface BillingItemRequestPayload {

  billingType:
    string;

  description:
    string;

  quantity:
    number;

  unitPrice:
    number;

  referenceId?:
    string;

}


// =====================================================
// PAYMENT PAYLOAD
// =====================================================

interface PaymentRequestPayload {

  amount:
    number;

  paymentMethod:
    string;

}


@Injectable({
  providedIn: 'root'
})
export class BillingService {


  // =====================================================
  // API
  // =====================================================

  private readonly apiUrl =
    '/api/billing';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly http:
      HttpClient
  ) {}


  // =====================================================
  // GET ALL BILLS
  // =====================================================

  getBills():
    Observable<Bill[]> {

    return this.http
      .get<BackendBilling[]>(
        this.apiUrl
      )
      .pipe(

        map(
          bills =>
            Array.isArray(bills)
              ? bills.map(
                  bill =>
                    this.mapBackendBill(
                      bill
                    )
                )
              : []
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // GET BILL BY ID
  // =====================================================

  getBillById(
    id: string | number
  ):
    Observable<Bill> {

    return this.http
      .get<BackendBilling>(
        `${this.apiUrl}/${id}`
      )
      .pipe(

        map(
          bill =>
            this.mapBackendBill(
              bill
            )
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // GET BILLS BY PATIENT
  // =====================================================

  getBillsByPatient(
    patientId: string
  ):
    Observable<Bill[]> {

    return this.http
      .get<BackendBilling[]>(
        `${this.apiUrl}/patient/${encodeURIComponent(
          patientId
        )}`
      )
      .pipe(

        map(
          bills =>
            Array.isArray(bills)
              ? bills.map(
                  bill =>
                    this.mapBackendBill(
                      bill
                    )
                )
              : []
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // GET ACTIVE BILL BY PATIENT
  // =====================================================

  getActiveBillByPatient(
    patientId: string
  ):
    Observable<Bill | undefined> {

    return this.http
      .get<BackendBilling>(
        `${this.apiUrl}/patient/${encodeURIComponent(
          patientId
        )}/active`
      )
      .pipe(

        map(
          bill =>
            bill
              ? this.mapBackendBill(
                  bill
                )
              : undefined
        ),

        catchError(
          (
            error:
              HttpErrorResponse
          ) => {

            // 404 means there is no active bill.
            if (
              error.status === 404
            ) {

              return [
                undefined
              ] as never;

            }

            return throwError(
              () =>
                error
            );

          }
        )

      );

  }


  // =====================================================
  // GET ACTIVE BILL
  // =====================================================

  getActiveBill(
    patientId: string
  ):
    Observable<Bill | undefined> {

    return this.getActiveBillByPatient(
      patientId
    );

  }


  // =====================================================
  // GET BILLS BY STATUS
  // =====================================================

  getBillsByStatus(
    status:
      BillingStatus
  ):
    Observable<Bill[]> {

    const backendStatus =
      this.toBackendBillingStatus(
        status
      );


    return this.http
      .get<BackendBilling[]>(
        `${this.apiUrl}/status/${backendStatus}`
      )
      .pipe(

        map(
          bills =>
            Array.isArray(bills)
              ? bills.map(
                  bill =>
                    this.mapBackendBill(
                      bill
                    )
                )
              : []
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // ADD BILL
  // =====================================================

  addBill(
    bill: Bill
  ):
    Observable<Bill> {

    const payload =
      this.toBillingRequest(
        bill
      );


    return this.http
      .post<BackendBilling>(
        this.apiUrl,
        payload
      )
      .pipe(

        map(
          response =>
            this.mapBackendBill(
              response
            )
        ),

        catchError(
          this.handleError
        )

      );

  }

// =====================================================
// ADD BILL ITEM
// =====================================================

addBillItem(
  billId:
    string | number,

  item:
    BillItem
):
  Observable<Bill> {

  return this.getBillById(
    billId
  ).pipe(

    map(
      currentBill => {

        const items =
          [
            ...(currentBill.items ?? [])
          ];


        // ---------------------------------------------
        // PREVENT DUPLICATE SOURCE CHARGES
        // ---------------------------------------------

        const duplicate =
          item.referenceId &&
          items.some(
            existingItem =>
              existingItem.referenceId ===
                item.referenceId &&
              existingItem.billingType ===
                item.billingType
          );


        if (!duplicate) {

          items.push(
            item
          );

        }


        return {
          ...currentBill,
          items
        };

      }
    ),

    // -----------------------------------------------
    // UPDATE BILL THROUGH BACKEND
    // -----------------------------------------------

    // We cannot call updateBill() inside map because
    // that would produce Observable<Observable<Bill>>.
    //
    // Therefore use switchMap.
    //

    switchMap(
      updatedBill =>
        this.updateBill(
          updatedBill
        )
    ),

    catchError(
      this.handleError
    )

  );

}



  // =====================================================
  // ADD CHARGE TO PATIENT BILL
  // =====================================================

  addChargeToPatientBill(
    patientId:
      string,

    patientName:
      string,

    item:
      BillItem,

    options?: {

      patientNumber?:
        string;

      doctorId?:
        string;

      doctorName?:
        string;

      departmentId?:
        string;

      departmentName?:
        string;

      notes?:
        string;

    }
  ):
    Observable<Bill> {

    const params =
      this.buildChargeParams(
        patientName,
        options
      );


    const payload =
      this.toBillingItemRequest(
        item
      );


    return this.http
      .post<BackendBilling>(
        `${this.apiUrl}/patient/${encodeURIComponent(
          patientId
        )}/charge`,
        payload,
        {
          params
        }
      )
      .pipe(

        map(
          response =>
            this.mapBackendBill(
              response
            )
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // ADD SERVICE CHARGE
  // =====================================================

  addServiceCharge(
    patientId:
      string,

    patientName:
      string,

    billingType:
      BillingType,

    description:
      string,

    amount:
      number,

    referenceId?:
      string,

    options?: {

      patientNumber?:
        string;

      doctorId?:
        string;

      doctorName?:
        string;

      departmentId?:
        string;

      departmentName?:
        string;

      notes?:
        string;

    }
  ):
    Observable<Bill> {

    if (
      amount <= 0
    ) {

      return throwError(
        () =>
          new Error(
            'Charge amount must be greater than zero.'
          )
      );

    }


    const item:
      BillItem = {

      id:
        `BI-FRONTEND-${Date.now()}`,

      billingType,

      description,

      quantity:
        1,

      unitPrice:
        amount,

      amount,

      referenceId

    };


    return this.addChargeToPatientBill(
      patientId,
      patientName,
      item,
      options
    );

  }


  // =====================================================
  // UPDATE BILL
  // =====================================================

  updateBill(
    bill:
      Bill
  ):
    Observable<Bill> {

    if (
      !bill.id
    ) {

      return throwError(
        () =>
          new Error(
            'Billing ID is required.'
          )
      );

    }


    const payload =
      this.toBillingRequest(
        bill
      );


    return this.http
      .put<BackendBilling>(
        `${this.apiUrl}/${bill.id}`,
        payload
      )
      .pipe(

        map(
          response =>
            this.mapBackendBill(
              response
            )
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // DELETE BILL
  // =====================================================

  deleteBill(
    id:
      string | number
  ):
    Observable<void> {

    return this.http
      .delete<void>(
        `${this.apiUrl}/${id}`
      )
      .pipe(

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // UPDATE BILL STATUS
  // =====================================================

  updateBillStatus(
    id:
      string | number,

    status:
      BillingStatus
  ):
    Observable<Bill> {

    const backendStatus =
      this.toBackendBillingStatus(
        status
      );


    return this.http
      .patch<BackendBilling>(
        `${this.apiUrl}/${id}/status`,
        null,
        {
          params:
            new HttpParams()
              .set(
                'status',
                backendStatus
              )
        }
      )
      .pipe(

        map(
          response =>
            this.mapBackendBill(
              response
            )
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // RECORD PAYMENT
  // =====================================================

  recordPayment(
    id:
      string | number,

    amount:
      number,

    paymentMethod:
      PaymentMethod
  ):
    Observable<Bill> {

    if (
      amount <= 0
    ) {

      return throwError(
        () =>
          new Error(
            'Payment amount must be greater than zero.'
          )
      );

    }


    const payload:
      PaymentRequestPayload = {

      amount,

      paymentMethod:
        this.toBackendPaymentMethod(
          paymentMethod
        )

    };


    return this.http
      .post<BackendBilling>(
        `${this.apiUrl}/${id}/payment`,
        payload
      )
      .pipe(

        map(
          response =>
            this.mapBackendBill(
              response
            )
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // GET BILL ITEMS BY TYPE
  // =====================================================

  getBillItemsByType(
    bill:
      Bill,

    billingType:
      BillingType
  ):
    BillItem[] {

    return (
      bill.items ?? []
    ).filter(
      item =>
        item.billingType ===
        billingType
    );

  }


  // =====================================================
  // GET BILLS BY TYPE
  // =====================================================
  //
  // This remains a client-side convenience method.
  // It works with a list already loaded from the backend.
  //
  // =====================================================

  getBillsByType(
    bills:
      Bill[],
    billingType:
      BillingType
  ):
    Bill[] {

    return bills.filter(
      bill =>
        (
          bill.items ?? []
        ).some(
          item =>
            item.billingType ===
            billingType
        )
    );

  }


  // =====================================================
  // GET PENDING BILLS
  // =====================================================

  getPendingBills():
    Observable<Bill[]> {

    return this.getBillsByStatus(
      'Pending'
    );

  }


  // =====================================================
  // GET PARTIALLY PAID BILLS
  // =====================================================

  getPartiallyPaidBills():
    Observable<Bill[]> {

    return this.getBillsByStatus(
      'Partially Paid'
    );

  }


  // =====================================================
  // GET PAID BILLS
  // =====================================================

  getPaidBills():
    Observable<Bill[]> {

    return this.getBillsByStatus(
      'Paid'
    );

  }


  // =====================================================
  // GET CANCELLED BILLS
  // =====================================================

  getCancelledBills():
    Observable<Bill[]> {

    return this.getBillsByStatus(
      'Cancelled'
    );

  }


  // =====================================================
  // TOTAL AMOUNT
  // =====================================================

  getTotalAmount():
    Observable<number> {

    return this.http
      .get<number>(
        `${this.apiUrl}/statistics/total`
      )
      .pipe(

        map(
          value =>
            Number(
              value || 0
            )
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // TOTAL PAID
  // =====================================================

  getTotalPaid():
    Observable<number> {

    return this.http
      .get<number>(
        `${this.apiUrl}/statistics/paid`
      )
      .pipe(

        map(
          value =>
            Number(
              value || 0
            )
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // TOTAL BALANCE
  // =====================================================

  getTotalBalance():
    Observable<number> {

    return this.http
      .get<number>(
        `${this.apiUrl}/statistics/balance`
      )
      .pipe(

        map(
          value =>
            Number(
              value || 0
            )
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // COUNT BILLS
  // =====================================================

  getCount():
    Observable<number> {

    return this.http
      .get<number>(
        `${this.apiUrl}/statistics/count`
      )
      .pipe(

        map(
          value =>
            Number(
              value || 0
            )
        ),

        catchError(
          this.handleError
        )

      );

  }


  // =====================================================
  // BUILD CHARGE PARAMS
  // =====================================================

  private buildChargeParams(
    patientName:
      string,

    options?: {

      patientNumber?:
        string;

      doctorId?:
        string;

      doctorName?:
        string;

      departmentId?:
        string;

      departmentName?:
        string;

      notes?:
        string;

    }
  ):
    HttpParams {

    let params =
      new HttpParams()
        .set(
          'patientName',
          patientName
        );


    if (
      options?.patientNumber
    ) {

      params =
        params.set(
          'patientNumber',
          options.patientNumber
        );

    }


    if (
      options?.doctorId
    ) {

      params =
        params.set(
          'doctorId',
          options.doctorId
        );

    }


    if (
      options?.doctorName
    ) {

      params =
        params.set(
          'doctorName',
          options.doctorName
        );

    }


    if (
      options?.departmentId
    ) {

      params =
        params.set(
          'departmentId',
          options.departmentId
        );

    }


    if (
      options?.departmentName
    ) {

      params =
        params.set(
          'departmentName',
          options.departmentName
        );

    }


    return params;

  }


  // =====================================================
  // BILL -> BACKEND REQUEST
  // =====================================================

  private toBillingRequest(
    bill:
      Bill
  ):
    BillingRequestPayload {

    return {

      patientId:
        bill.patientId,

      patientName:
        bill.patientName,

      patientNumber:
        bill.patientNumber,

      doctorId:
        bill.doctorId,

      doctorName:
        bill.doctorName,

      departmentId:
        bill.departmentId,

      departmentName:
        bill.departmentName,

      description:
        bill.description,

      dueDate:
        this.toDateOnly(
          bill.dueDate
        ),

      notes:
        bill.notes,

      items:
        (
          bill.items ?? []
        ).map(
          item =>
            this.toBillingItemRequest(
              item
            )
        )

    };

  }


  // =====================================================
  // BILL ITEM -> BACKEND REQUEST
  // =====================================================

  private toBillingItemRequest(
    item:
      BillItem
  ):
    BillingItemRequestPayload {

    return {

      billingType:
        this.toBackendBillingType(
          item.billingType
        ),

      description:
        item.description,

      quantity:
        Number(
          item.quantity || 1
        ),

      unitPrice:
        Number(
          item.unitPrice || 0
        ),

      referenceId:
        item.referenceId

    };

  }


  // =====================================================
  // BACKEND BILL -> FRONTEND BILL
  // =====================================================

  private mapBackendBill(
    bill:
      BackendBilling
  ):
    Bill {

    const items:
      BillItem[] =

      Array.isArray(
        bill.items
      )

        ? bill.items.map(
            item =>
              this.mapBackendBillItem(
                item
              )
          )

        : [];


    return {

      id:
        String(
          bill.id
        ),

      patientId:
        bill.patientId,

      patientName:
        bill.patientName,

      patientNumber:
        bill.patientNumber,

      doctorId:
        bill.doctorId,

      doctorName:
        bill.doctorName,

      departmentId:
        bill.departmentId,

      departmentName:
        bill.departmentName,

      billingType:
        items.length > 0

          ? items[0].billingType

          : 'Other',

      description:
        bill.description ??
        (
          items.length > 0
            ? items[0].description
            : 'Hospital service'
        ),

      items,

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

      paymentMethod:
        bill.paymentMethod
          ? this.toFrontendPaymentMethod(
              bill.paymentMethod
            )
          : undefined,

      status:
        this.toFrontendBillingStatus(
          bill.status
        ),

      invoiceNumber:
        bill.invoiceNumber,

      billingDate:
        bill.billingDate,

      dueDate:
        bill.dueDate,

      notes:
        bill.notes,

      createdAt:
        bill.createdAt,

      updatedAt:
        bill.updatedAt

    };

  }


  // =====================================================
  // BACKEND ITEM -> FRONTEND ITEM
  // =====================================================

  private mapBackendBillItem(
    item:
      BackendBillingItem
  ):
    BillItem {

    return {

      id:
        item.id !== undefined &&
        item.id !== null

          ? String(
              item.id
            )

          : `BI-${Date.now()}`,

      billingType:
        this.toFrontendBillingType(
          item.billingType
        ),

      description:
        item.description,

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

      referenceId:
        item.referenceId

    };

  }


  // =====================================================
  // FRONTEND -> BACKEND BILLING TYPE
  // =====================================================

  private toBackendBillingType(
    value:
      BillingType
  ):
    string {

    switch (
      value
    ) {

      case 'Consultation':
        return 'CONSULTATION';

      case 'Laboratory':
        return 'LABORATORY';

      case 'Pharmacy':
        return 'PHARMACY';

      case 'Admission':
        return 'ADMISSION';

      case 'Procedure':
        return 'PROCEDURE';

      case 'Other':
      default:
        return 'OTHER';

    }

  }


  // =====================================================
  // BACKEND -> FRONTEND BILLING TYPE
  // =====================================================

  private toFrontendBillingType(
    value:
      string
  ):
    BillingType {

    switch (
      value?.toUpperCase()
    ) {

      case 'CONSULTATION':
        return 'Consultation';

      case 'LABORATORY':
        return 'Laboratory';

      case 'PHARMACY':
        return 'Pharmacy';

      case 'ADMISSION':
        return 'Admission';

      case 'PROCEDURE':
        return 'Procedure';

      case 'OTHER':
      default:
        return 'Other';

    }

  }


  // =====================================================
  // FRONTEND -> BACKEND STATUS
  // =====================================================

  private toBackendBillingStatus(
    value:
      BillingStatus
  ):
    string {

    switch (
      value
    ) {

      case 'Pending':
        return 'PENDING';

      case 'Partially Paid':
        return 'PARTIALLY_PAID';

      case 'Paid':
        return 'PAID';

      case 'Cancelled':
        return 'CANCELLED';

      default:
        return 'PENDING';

    }

  }


  // =====================================================
  // BACKEND -> FRONTEND STATUS
  // =====================================================

  private toFrontendBillingStatus(
    value:
      string
  ):
    BillingStatus {

    switch (
      value?.toUpperCase()
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
  // FRONTEND -> BACKEND PAYMENT METHOD
  // =====================================================

  private toBackendPaymentMethod(
    value:
      PaymentMethod
  ):
    string {

    switch (
      value
    ) {

      case 'Cash':
        return 'CASH';

      case 'Mobile Money':
        return 'MOBILE_MONEY';

      case 'Card':
        return 'CARD';

      case 'Bank Transfer':
        return 'BANK_TRANSFER';

      case 'Insurance':
        return 'INSURANCE';

      case 'Other':
      default:
        return 'OTHER';

    }

  }


  // =====================================================
  // BACKEND -> FRONTEND PAYMENT METHOD
  // =====================================================

  private toFrontendPaymentMethod(
    value:
      string
  ):
    PaymentMethod {

    switch (
      value?.toUpperCase()
    ) {

      case 'CASH':
        return 'Cash';

      case 'MOBILE_MONEY':
        return 'Mobile Money';

      case 'CARD':
        return 'Card';

      case 'BANK_TRANSFER':
        return 'Bank Transfer';

      case 'INSURANCE':
        return 'Insurance';

      case 'OTHER':
      default:
        return 'Other';

    }

  }


  // =====================================================
  // DATE ONLY
  // =====================================================

  private toDateOnly(
    value?:
      string
  ):
    string | undefined {

    if (
      !value
    ) {

      return undefined;

    }


    return value.includes('T')
      ? value.split('T')[0]
      : value;

  }


  // =====================================================
  // ERROR HANDLER
  // =====================================================

  private handleError =
    (
      error:
        HttpErrorResponse
    ) => {

      console.error(
        'Billing API error:',
        error
      );


      let message =
        'Unable to communicate with the billing server.';


      if (
        typeof error.error ===
        'string' &&
        error.error.trim()
      ) {

        message =
          error.error;

      }


      else if (
        error.error &&
        typeof error.error ===
        'object'
      ) {

        const body =
          error.error as {
            message?:
              string;

            error?:
              string;
          };


        if (
          body.message &&
          body.message.trim()
        ) {

          message =
            body.message;

        }

        else if (
          body.error &&
          body.error.trim()
        ) {

          message =
            body.error;

        }

      }


      else if (
        error.message &&
        error.message.trim()
      ) {

        message =
          error.message;

      }


      return throwError(
        () =>
          new Error(
            message
          )
      );

    };

}

