import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Bill,
  PaymentMethod,
  BillingStatus,
  BillingType
} from '../../../shared/models/billing.model';

import {
  BillingService
} from '../../../core/services/billing.service';


@Component({
  selector: 'app-billing-register',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './billing-register.html',

  styleUrl: './billing-register.css'
})
export class BillingRegister {


  // =====================================================
  // BILL
  // =====================================================

  bill: Bill = {

    id: '',

    patientId: '',

    patientName: '',

    patientNumber: '',

    doctorId: '',

    doctorName: '',

    departmentId: '',

    departmentName: '',

    billingType: 'Other',

    description: '',

    amount: 0,

    amountPaid: 0,

    balance: 0,

    paymentMethod: 'Cash',

    status: 'Pending',

    invoiceNumber: '',

    billingDate:
      new Date().toISOString(),

    dueDate: '',

    notes: '',

    createdAt:
      new Date().toISOString()

  };


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
  // PAYMENT METHODS
  // =====================================================

  paymentMethods: PaymentMethod[] = [

    'Cash',

    'Mobile Money',

    'Card',

    'Bank Transfer',

    'Insurance',

    'Other'

  ];


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
  // SAVE BILL
  // =====================================================

  saveBilling(): void {

    // ---------------------------------------------------
    // PATIENT NAME
    // ---------------------------------------------------

    if (
      !this.bill.patientName.trim()
    ) {

      alert(
        'Please enter the patient name.'
      );

      return;

    }


    // ---------------------------------------------------
    // PATIENT ID
    // ---------------------------------------------------

    if (
      !this.bill.patientId.trim()
    ) {

      alert(
        'Please enter the patient ID.'
      );

      return;

    }


    // ---------------------------------------------------
    // DESCRIPTION
    // ---------------------------------------------------

    if (
      !this.bill.description.trim()
    ) {

      alert(
        'Please enter the billing description.'
      );

      return;

    }


    // ---------------------------------------------------
    // AMOUNT
    // ---------------------------------------------------

    if (
      this.bill.amount <= 0
    ) {

      alert(
        'Please enter a valid billing amount.'
      );

      return;

    }


    // ---------------------------------------------------
    // AMOUNT PAID
    // ---------------------------------------------------

    if (
      this.bill.amountPaid < 0
    ) {

      alert(
        'Amount paid cannot be negative.'
      );

      return;

    }


    // ---------------------------------------------------
    // AMOUNT PAID CANNOT EXCEED AMOUNT
    // ---------------------------------------------------

    if (
      this.bill.amountPaid >
      this.bill.amount
    ) {

      alert(
        'Amount paid cannot exceed the total amount.'
      );

      return;

    }


    // ---------------------------------------------------
    // GENERATE IDs
    // ---------------------------------------------------

    this.bill.id =
      this.generateId();

    this.bill.invoiceNumber =
      this.generateInvoiceNumber();


    // ---------------------------------------------------
    // CALCULATE BALANCE
    // ---------------------------------------------------

    this.bill.balance =
      Math.max(
        0,
        this.bill.amount -
        this.bill.amountPaid
      );


    // ---------------------------------------------------
    // DETERMINE STATUS
    // ---------------------------------------------------

    if (
      this.bill.amountPaid >=
      this.bill.amount
    ) {

      this.bill.status =
        'Paid';

    }

    else if (
      this.bill.amountPaid > 0
    ) {

      this.bill.status =
        'Partially Paid';

    }

    else {

      this.bill.status =
        'Pending';

    }


    // ---------------------------------------------------
    // DATES
    // ---------------------------------------------------

    this.bill.createdAt =
      new Date().toISOString();


    if (!this.bill.billingDate) {

      this.bill.billingDate =
        new Date().toISOString();

    }


    // ---------------------------------------------------
    // SAVE
    // ---------------------------------------------------

    this.billingService.addBill(
      this.bill
    );


    // ---------------------------------------------------
    // SUCCESS
    // ---------------------------------------------------

    alert(
      'Billing record created successfully.'
    );


    // ---------------------------------------------------
    // RETURN TO BILLING
    // ---------------------------------------------------

    this.router.navigate([
      '/billing'
    ]);

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/billing'
    ]);

  }


  // =====================================================
  // GENERATE BILL ID
  // =====================================================

  private generateId(): string {

    return (
      'BILL-' +
      Date.now().toString()
    );

  }


  // =====================================================
  // GENERATE INVOICE NUMBER
  // =====================================================

  private generateInvoiceNumber(): string {

    return (
      'INV-' +
      new Date()
        .getFullYear()
        .toString() +
      '-' +
      Date.now()
        .toString()
        .slice(-6)
    );

  }

}
