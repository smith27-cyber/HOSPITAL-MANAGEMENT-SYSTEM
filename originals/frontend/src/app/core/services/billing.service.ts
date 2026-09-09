import { Injectable } from '@angular/core';

import {
  Bill,
  BillItem,
  BillingStatus,
  BillingType,
  PaymentMethod
} from '../../shared/models/billing.model';


@Injectable({
  providedIn: 'root'
})
export class BillingService {

  // =====================================================
  // STORAGE
  // =====================================================

  private readonly storageKey =
    'hms_billing';


  // =====================================================
  // DATA
  // =====================================================

  private bills: Bill[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    this.loadBills();

  }


  // =====================================================
  // GET ALL BILLS
  // =====================================================

  getBills(): Bill[] {

    return [
      ...this.bills
    ];

  }


  // =====================================================
  // GET BILL BY ID
  // =====================================================

  getBillById(
    id: string
  ): Bill | undefined {

    return this.bills.find(
      bill =>
        bill.id === id
    );

  }


  // =====================================================
  // GET BILLS BY PATIENT
  // =====================================================

  getBillsByPatient(
    patientId: string
  ): Bill[] {

    return this.bills.filter(
      bill =>
        bill.patientId === patientId
    );

  }


  // =====================================================
  // GET ACTIVE BILL BY PATIENT
  // =====================================================

  getActiveBillByPatient(
    patientId: string
  ): Bill | undefined {

    return this.bills.find(
      bill =>
        bill.patientId === patientId &&
        bill.status !== 'Paid' &&
        bill.status !== 'Cancelled'
    );

  }


  // =====================================================
  // GET ACTIVE BILL
  // =====================================================

  getActiveBill(
    patientId: string
  ): Bill | undefined {

    return this.getActiveBillByPatient(
      patientId
    );

  }


  // =====================================================
  // ADD BILL
  // =====================================================

  addBill(
    bill: Bill
  ): void {

    const items: BillItem[] =
      Array.isArray(bill.items)
        ? bill.items
        : [];


    const amount =
      items.length > 0

        ? this.calculateItemsTotal(
            items
          )

        : Math.max(
            0,
            bill.amount
          );


    const amountPaid =
      Math.max(
        0,
        Math.min(
          amount,
          bill.amountPaid ?? 0
        )
      );


    const firstItem =
      items.length > 0
        ? items[0]
        : undefined;


    const newBill: Bill = {

      ...bill,

      // -------------------------------------------------
      // Keep legacy fields working
      // -------------------------------------------------

      billingType:
        bill.billingType ??
        firstItem?.billingType ??
        'Other',

      description:
        bill.description ??
        firstItem?.description ??
        'Hospital service',

      // -------------------------------------------------
      // New line-item system
      // -------------------------------------------------

      items,

      amount,

      amountPaid,

      balance:
        Math.max(
          0,
          amount -
          amountPaid
        )

    };


    this.updateLegacyFields(
      newBill
    );


    this.updateStatusFromPayment(
      newBill
    );


    this.bills.push(
      newBill
    );


    this.saveBills();

  }


  // =====================================================
  // ADD ITEM TO BILL
  // =====================================================

  addBillItem(
    billId: string,
    item: BillItem
  ): boolean {

    const bill =
      this.getBillById(
        billId
      );


    if (!bill) {

      return false;

    }


    if (
      bill.status === 'Paid' ||
      bill.status === 'Cancelled'
    ) {

      return false;

    }


    bill.items ??= [];


    const duplicate =
      bill.items.some(
        existingItem =>
          existingItem.id === item.id
      );


    if (duplicate) {

      return true;

    }


    bill.items.push(
      item
    );


    this.recalculateBill(
      bill
    );


    bill.updatedAt =
      new Date().toISOString();


    this.saveBills();


    return true;

  }


  // =====================================================
  // ADD CHARGE TO PATIENT BILL
  // =====================================================

  addChargeToPatientBill(
    patientId: string,
    patientName: string,
    item: BillItem,
    options?: {
      patientNumber?: string;
      doctorId?: string;
      doctorName?: string;
      departmentId?: string;
      departmentName?: string;
      notes?: string;
    }
  ): Bill | undefined {

    let bill =
      this.getActiveBillByPatient(
        patientId
      );


    // ===================================================
    // CREATE BILL
    // ===================================================

    if (!bill) {

      bill = {

        id:
          this.generateBillId(),

        patientId:

          patientId,

        patientName:

          patientName,

        patientNumber:

          options?.patientNumber,

        doctorId:

          options?.doctorId,

        doctorName:

          options?.doctorName,

        departmentId:

          options?.departmentId,

        departmentName:

          options?.departmentName,

        // ------------------------------------------------
        // Legacy fields
        // ------------------------------------------------

        billingType:
          item.billingType,

        description:
          item.description,

        // ------------------------------------------------
        // Items
        // ------------------------------------------------

        items: [],

        // ------------------------------------------------
        // Totals
        // ------------------------------------------------

        amount: 0,

        amountPaid: 0,

        balance: 0,

        status:
          'Pending',

        invoiceNumber:
          this.generateInvoiceNumber(),

        billingDate:
          new Date().toISOString(),

        notes:
          options?.notes,

        createdAt:
          new Date().toISOString()

      };


      this.bills.push(
        bill
      );

    }


    // ===================================================
    // ENSURE ITEMS ARRAY
    // ===================================================

    bill.items ??= [];


    // ===================================================
    // UPDATE PATIENT INFORMATION
    // ===================================================

    bill.patientName =
      patientName;


    if (
      options?.patientNumber
    ) {

      bill.patientNumber =
        options.patientNumber;

    }


    if (
      options?.doctorId
    ) {

      bill.doctorId =
        options.doctorId;

    }


    if (
      options?.doctorName
    ) {

      bill.doctorName =
        options.doctorName;

    }


    if (
      options?.departmentId
    ) {

      bill.departmentId =
        options.departmentId;

    }


    if (
      options?.departmentName
    ) {

      bill.departmentName =
        options.departmentName;

    }


    if (
      options?.notes
    ) {

      bill.notes =
        options.notes;

    }


    // ===================================================
    // ADD ITEM
    // ===================================================

    const alreadyExists =
      bill.items.some(
        existingItem =>
          existingItem.id === item.id
      );


    if (!alreadyExists) {

      bill.items.push(
        item
      );

    }


    // ===================================================
    // UPDATE LEGACY FIELDS
    // =====================================================

    this.updateLegacyFields(
      bill
    );


    // ===================================================
    // RECALCULATE
    // ===================================================

    this.recalculateBill(
      bill
    );


    bill.updatedAt =
      new Date().toISOString();


    this.saveBills();


    return bill;

  }


  // =====================================================
  // ADD SERVICE CHARGE
  // =====================================================

  addServiceCharge(
    patientId: string,
    patientName: string,
    billingType: BillingType,
    description: string,
    amount: number,
    referenceId?: string,
    options?: {
      patientNumber?: string;
      doctorId?: string;
      doctorName?: string;
      departmentId?: string;
      departmentName?: string;
      notes?: string;
    }
  ): Bill | undefined {

    if (
      amount <= 0
    ) {

      return undefined;

    }


    const item: BillItem = {

      id:
        this.generateBillItemId(),

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
    updatedBill: Bill
  ): boolean {

    const index =
      this.bills.findIndex(
        bill =>
          bill.id ===
          updatedBill.id
      );


    if (
      index === -1
    ) {

      return false;

    }


    const items: BillItem[] =
      Array.isArray(
        updatedBill.items
      )
        ? updatedBill.items
        : [];


    const amount =
      items.length > 0

        ? this.calculateItemsTotal(
            items
          )

        : Math.max(
            0,
            updatedBill.amount
          );


    const amountPaid =
      Math.max(
        0,
        Math.min(
          amount,
          updatedBill.amountPaid
        )
      );


    const bill: Bill = {

      ...updatedBill,

      items,

      amount,

      amountPaid,

      balance:
        Math.max(
          0,
          amount -
          amountPaid
        ),

      updatedAt:
        new Date().toISOString()

    };


    this.updateLegacyFields(
      bill
    );


    this.updateStatusFromPayment(
      bill
    );


    this.bills[index] =
      bill;


    this.saveBills();


    return true;

  }

// =====================================================
// DELETE BILL
// =====================================================

deleteBill(
  id: string
): boolean {

  const index =
    this.bills.findIndex(
      bill =>
        bill.id === id
    );


  // -----------------------------------------------------
  // BILL NOT FOUND
  // -----------------------------------------------------

  if (index === -1) {

    return false;

  }


  // -----------------------------------------------------
  // DELETE BILL
  // -----------------------------------------------------

  this.bills.splice(
    index,
    1
  );


  // -----------------------------------------------------
  // SAVE UPDATED BILL LIST
  // -----------------------------------------------------

  this.saveBills();


  return true;

}


  // =====================================================
  // UPDATE BILL STATUS
  // =====================================================

  updateBillStatus(
    id: string,
    status: BillingStatus
  ): boolean {

    const bill =
      this.getBillById(
        id
      );


    if (!bill) {

      return false;

    }


    bill.status =
      status;


    bill.updatedAt =
      new Date().toISOString();


    this.saveBills();


    return true;

  }


  // =====================================================
  // RECORD PAYMENT
  // =====================================================

  recordPayment(
    id: string,
    amount: number,
    paymentMethod: PaymentMethod
  ): boolean {

    const bill =
      this.getBillById(
        id
      );


    if (!bill) {

      return false;

    }


    if (
      bill.status === 'Cancelled'
    ) {

      return false;

    }


    if (
      amount <= 0
    ) {

      return false;

    }


    if (
      amount > bill.balance
    ) {

      amount =
        bill.balance;

    }


    bill.amountPaid =
      Math.min(
        bill.amount,
        bill.amountPaid +
        amount
      );


    bill.balance =
      Math.max(
        0,
        bill.amount -
        bill.amountPaid
      );


    bill.paymentMethod =
      paymentMethod;


    this.updateStatusFromPayment(
      bill
    );


    bill.updatedAt =
      new Date().toISOString();


    this.saveBills();


    return true;

  }


  // =====================================================
  // GET BILL ITEMS BY TYPE
  // =====================================================

  getBillItemsByType(
    bill: Bill,
    billingType: BillingType
  ): BillItem[] {

    const items =
      bill.items ?? [];


    return items.filter(
      item =>
        item.billingType ===
        billingType
    );

  }


  // =====================================================
  // GET BILLS BY TYPE
  // =====================================================

  getBillsByType(
    billingType: BillingType
  ): Bill[] {

    return this.bills.filter(
      bill => {

        const items =
          bill.items ?? [];


        return items.some(
          item =>
            item.billingType ===
            billingType
        );

      }
    );

  }


  // =====================================================
  // GET PENDING BILLS
  // =====================================================

  getPendingBills(): Bill[] {

    return this.bills.filter(
      bill =>
        bill.status ===
        'Pending'
    );

  }


  // =====================================================
  // GET PARTIALLY PAID BILLS
  // =====================================================

  getPartiallyPaidBills(): Bill[] {

    return this.bills.filter(
      bill =>
        bill.status ===
        'Partially Paid'
    );

  }


  // =====================================================
  // GET PAID BILLS
  // =====================================================

  getPaidBills(): Bill[] {

    return this.bills.filter(
      bill =>
        bill.status ===
        'Paid'
    );

  }


  // =====================================================
  // GET CANCELLED BILLS
  // =====================================================

  getCancelledBills(): Bill[] {

    return this.bills.filter(
      bill =>
        bill.status ===
        'Cancelled'
    );

  }


  // =====================================================
  // TOTAL AMOUNT
  // =====================================================

  getTotalAmount(): number {

    return this.bills.reduce(
      (
        total,
        bill
      ) =>
        total +
        bill.amount,
      0
    );

  }


  // =====================================================
  // TOTAL PAID
  // =====================================================

  getTotalPaid(): number {

    return this.bills.reduce(
      (
        total,
        bill
      ) =>
        total +
        bill.amountPaid,
      0
    );

  }


  // =====================================================
  // TOTAL BALANCE
  // =====================================================

  getTotalBalance(): number {

    return this.bills.reduce(
      (
        total,
        bill
      ) =>
        total +
        bill.balance,
      0
    );

  }


  // =====================================================
  // CALCULATE ITEMS TOTAL
  // =====================================================

  private calculateItemsTotal(
    items: BillItem[]
  ): number {

    return items.reduce(
      (
        total,
        item
      ) =>
        total +
        Math.max(
          0,
          item.amount
        ),
      0
    );

  }


  // =====================================================
  // RECALCULATE BILL
  // =====================================================

  private recalculateBill(
    bill: Bill
  ): void {

    bill.items ??= [];


    bill.amount =
      this.calculateItemsTotal(
        bill.items
      );


    bill.amountPaid =
      Math.min(
        bill.amount,
        Math.max(
          0,
          bill.amountPaid
        )
      );


    bill.balance =
      Math.max(
        0,
        bill.amount -
        bill.amountPaid
      );


    this.updateLegacyFields(
      bill
    );


    this.updateStatusFromPayment(
      bill
    );

  }


  // =====================================================
  // UPDATE LEGACY BILL FIELDS
  // =====================================================

  private updateLegacyFields(
    bill: Bill
  ): void {

    const items =
      bill.items ?? [];


    if (
      items.length === 0
    ) {

      bill.billingType =
        bill.billingType ??
        'Other';

      bill.description =
        bill.description ??
        'Hospital service';

      return;

    }


    // ---------------------------------------------------
    // Keep first item for old Billing screens
    // ---------------------------------------------------

    bill.billingType =
      items[0].billingType;


    // ---------------------------------------------------
    // Combine descriptions
    // ---------------------------------------------------

    bill.description =
      items
        .map(
          item =>
            item.description
        )
        .join(', ');

  }


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  private updateStatusFromPayment(
    bill: Bill
  ): void {

    if (
      bill.status === 'Cancelled'
    ) {

      return;

    }


    if (
      bill.amount <= 0
    ) {

      bill.status =
        'Pending';

      return;

    }


    if (
      bill.amountPaid >=
      bill.amount
    ) {

      bill.status =
        'Paid';

      return;

    }


    if (
      bill.amountPaid > 0
    ) {

      bill.status =
        'Partially Paid';

      return;

    }


    bill.status =
      'Pending';

  }


  // =====================================================
  // GENERATE BILL ID
  // =====================================================

  private generateBillId(): string {

    return `BILL-${Date.now()}`;

  }


  // =====================================================
  // GENERATE BILL ITEM ID
  // =====================================================

  private generateBillItemId(): string {

    return `BI-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;

  }


  // =====================================================
  // GENERATE INVOICE NUMBER
  // =====================================================

  private generateInvoiceNumber(): string {

    const year =
      new Date().getFullYear();


    return `INV-${year}-${Math.floor(
      10000 +
      Math.random() * 90000
    )}`;

  }


  // =====================================================
  // SAVE
  // =====================================================

  private saveBills(): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(
        this.bills
      )
    );

  }


  // =====================================================
  // LOAD
  // =====================================================

  private loadBills(): void {

    const stored =
      localStorage.getItem(
        this.storageKey
      );


    if (!stored) {

      this.bills = [];

      return;

    }


    try {

      const parsed =
        JSON.parse(
          stored
        );


      if (
        !Array.isArray(
          parsed
        )
      ) {

        this.bills = [];

        return;

      }


      this.bills =
        parsed.map(
          (
            storedBill: any
          ) =>
            this.migrateBill(
              storedBill
            )
        );


      this.saveBills();

    }

    catch (error) {

      console.error(
        'Failed to load billing records:',
        error
      );


      this.bills = [];

    }

  }


  // =====================================================
  // MIGRATE OLD BILL
  // =====================================================

  private migrateBill(
    storedBill: any
  ): Bill {

    let items: BillItem[] = [];


    // ---------------------------------------------------
    // NEW FORMAT
    // ---------------------------------------------------

    if (
      Array.isArray(
        storedBill.items
      )
    ) {

      items =
        storedBill.items;

    }

    // ---------------------------------------------------
    // OLD FORMAT
    // ---------------------------------------------------

    else {

      items = [

        {

          id:
            `LEGACY-${storedBill.id}`,

          billingType:
            storedBill.billingType ??
            'Other',

          description:
            storedBill.description ??
            'Billing charge',

          quantity:
            1,

          unitPrice:
            Math.max(
              0,
              storedBill.amount ??
              0
            ),

          amount:
            Math.max(
              0,
              storedBill.amount ??
              0
            )

        }

      ];

    }


    const amount =
      this.calculateItemsTotal(
        items
      );


    const amountPaid =
      Math.max(
        0,
        Math.min(
          amount,
          storedBill.amountPaid ??
          0
        )
      );


    const bill: Bill = {

      ...storedBill,

      items,

      billingType:
        storedBill.billingType ??
        items[0]?.billingType ??
        'Other',

      description:
        storedBill.description ??
        items[0]?.description ??
        'Hospital service',

      amount,

      amountPaid,

      balance:
        Math.max(
          0,
          amount -
          amountPaid
        ),

      status:
        storedBill.status ??
        'Pending'

    };


    this.updateLegacyFields(
      bill
    );


    this.updateStatusFromPayment(
      bill
    );


    return bill;

  }

}
