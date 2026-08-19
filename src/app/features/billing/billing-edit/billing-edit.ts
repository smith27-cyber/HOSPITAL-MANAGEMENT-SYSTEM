import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Bill,
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

  templateUrl: './billing-edit.html',

  styleUrl: './billing-edit.css'
})
export class BillingEdit implements OnInit {

  // =====================================================
  // BILL
  // =====================================================

  bill: Bill | undefined;

  // =====================================================
  // OPTIONS
  // =====================================================

  billingTypes: BillingType[] = [
    'Consultation',
    'Laboratory',
    'Pharmacy',
    'Admission',
    'Procedure',
    'Other'
  ];

  paymentMethods: PaymentMethod[] = [
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
    private billingService: BillingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.router.navigate(['/billing']);

      return;

    }

    this.bill =
      this.billingService.getBillById(id);

    if (!this.bill) {

      alert('Billing record not found.');

      this.router.navigate(['/billing']);

    }

  }

  // =====================================================
  // SAVE
  // =====================================================

  saveBill(): void {

    if (!this.bill) {
      return;
    }

    if (!this.bill.patientName.trim()) {

      alert('Please enter the patient name.');

      return;

    }

    if (!this.bill.patientId.trim()) {

      alert('Please enter the patient ID.');

      return;

    }

    if (!this.bill.description.trim()) {

      alert('Please enter the billing description.');

      return;

    }

    if (this.bill.amount <= 0) {

      alert('Please enter a valid amount.');

      return;

    }

    if (this.bill.amountPaid < 0) {

      alert('Amount paid cannot be negative.');

      return;

    }

    if (this.bill.amountPaid > this.bill.amount) {

      alert(
        'Amount paid cannot exceed the total amount.'
      );

      return;

    }

    this.bill.balance =
      Math.max(
        0,
        this.bill.amount -
        this.bill.amountPaid
      );

    if (this.bill.amountPaid >= this.bill.amount) {

      this.bill.status = 'Paid';

    } else if (this.bill.amountPaid > 0) {

      this.bill.status = 'Partially Paid';

    } else {

      this.bill.status = 'Pending';

    }

    const updated =
      this.billingService.updateBill(
        this.bill
      );

    if (!updated) {

      alert(
        'Unable to update billing record.'
      );

      return;

    }

    alert(
      'Billing record updated successfully.'
    );

    this.router.navigate([
      '/billing',
      this.bill.id
    ]);

  }

  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    if (this.bill) {

      this.router.navigate([
        '/billing',
        this.bill.id
      ]);

    } else {

      this.router.navigate([
        '/billing'
      ]);

    }

  }

}
