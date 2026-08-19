import { Injectable } from '@angular/core';

import {
  Bill,
  BillingStatus,
  PaymentMethod
} from '../../shared/models/billing.model';


@Injectable({
  providedIn: 'root'
})
export class BillingService {


  // =====================================================
  // STORAGE KEY
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
  // ADD BILL
  // =====================================================

  addBill(
    bill: Bill
  ): void {

    const newBill: Bill = {

      ...bill,

      balance:
        Math.max(
          0,
          bill.amount -
          bill.amountPaid
        )

    };


    this.bills.push(
      newBill
    );


    this.saveBills();

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


    if (index === -1) {

      return false;

    }


    const amountPaid =
      Math.max(
        0,
        updatedBill.amountPaid
      );


    const balance =
      Math.max(
        0,
        updatedBill.amount -
        amountPaid
      );


    this.bills[index] = {

      ...updatedBill,

      amountPaid,

      balance,

      updatedAt:
        new Date().toISOString()

    };


    this.saveBills();


    return true;

  }


  // =====================================================
  // DELETE BILL
  // =====================================================

  deleteBill(
    id: string
  ): boolean {

    const originalLength =
      this.bills.length;


    this.bills =
      this.bills.filter(
        bill =>
          bill.id !== id
      );


    if (
      this.bills.length ===
      originalLength
    ) {

      return false;

    }


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
      this.getBillById(id);


    if (!bill) {

      return false;

    }


    bill.status =
      status;


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
      this.getBillById(id);


    if (!bill) {

      return false;

    }


    if (amount <= 0) {

      return false;

    }


    const newAmountPaid =
      Math.min(
        bill.amount,
        bill.amountPaid + amount
      );


    bill.amountPaid =
      newAmountPaid;


    bill.balance =
      Math.max(
        0,
        bill.amount -
        bill.amountPaid
      );


    bill.paymentMethod =
      paymentMethod;


    if (
      bill.amountPaid >=
      bill.amount
    ) {

      bill.status =
        'Paid';

    }

    else if (
      bill.amountPaid > 0
    ) {

      bill.status =
        'Partially Paid';

    }

    else {

      bill.status =
        'Pending';

    }


    bill.updatedAt =
      new Date().toISOString();


    this.saveBills();


    return true;

  }


  // =====================================================
  // GET BILLS BY PATIENT
  // =====================================================

  getBillsByPatient(
    patientId: string
  ): Bill[] {

    return this.bills.filter(
      bill =>
        bill.patientId ===
        patientId
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
  // GET TOTAL AMOUNT
  // =====================================================

  getTotalAmount(): number {

    return this.bills.reduce(
      (total, bill) =>
        total + bill.amount,
      0
    );

  }


  // =====================================================
  // GET TOTAL PAID
  // =====================================================

  getTotalPaid(): number {

    return this.bills.reduce(
      (total, bill) =>
        total + bill.amountPaid,
      0
    );

  }


  // =====================================================
  // GET TOTAL BALANCE
  // =====================================================

  getTotalBalance(): number {

    return this.bills.reduce(
      (total, bill) =>
        total + bill.balance,
      0
    );

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
        JSON.parse(stored);


      if (
        Array.isArray(parsed)
      ) {

        this.bills =
          parsed.map(
            (bill: Bill) => ({

              ...bill,

              amountPaid:
                bill.amountPaid ?? 0,

              balance:
                bill.balance ??
                Math.max(
                  0,
                  bill.amount -
                  (bill.amountPaid ?? 0)
                )

            })
          );

      }

      else {

        this.bills = [];

      }

    }

    catch (error) {

      console.error(
        'Failed to load billing records:',
        error
      );

      this.bills = [];

    }

  }

}
