import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  PharmacyPrescription as PharmacyPrescriptionModel,
  PharmacyPrescriptionStatus
} from '../../../shared/models/pharmacy.model';

import {
  PharmacyService
} from '../../../core/services/pharmacy.service';


@Component({
  selector: 'app-pharmacy-prescription',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './pharmacy-prescription.html',

  styleUrl: './pharmacy-prescription.css'
})
export class PharmacyPrescription implements OnInit {


  // =====================================================
  // PRESCRIPTION
  // =====================================================

  prescription:
    PharmacyPrescriptionModel | undefined;


  // =====================================================
  // PRESCRIPTION ID
  // =====================================================

  prescriptionId:
    string | null = null;


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = true;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pharmacyService: PharmacyService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.prescriptionId =
      this.route.snapshot.paramMap.get(
        'id'
      );


    if (!this.prescriptionId) {

      this.isLoading = false;

      return;

    }


    this.loadPrescription(
      this.prescriptionId
    );

  }


  // =====================================================
  // LOAD PRESCRIPTION
  // =====================================================

  private loadPrescription(
    id: string
  ): void {

    this.isLoading = true;


    this.pharmacyService
  .getPrescriptionById(Number(id))
  .subscribe({
    next: (prescription) => {
      this.prescription = prescription;
    },
    error: (error) => {
      console.error(
        'Failed to load prescription:',
        error
      );
    }
  });


    this.isLoading = false;

  }


  // =====================================================
  // GO BACK
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/pharmacy/queue'
    ]);

  }


  // =====================================================
  // GET STATUS CLASS
  // =====================================================

  getStatusClass(
    status: PharmacyPrescriptionStatus
  ): string {

    switch (status) {

      case 'Waiting':
        return 'status-waiting';

      case 'Preparing':
        return 'status-preparing';

      case 'Awaiting Payment':
        return 'status-payment';

      case 'Paid':
        return 'status-paid';

      case 'Ready for Pickup':
        return 'status-ready';

      case 'Dispensed':
        return 'status-dispensed';

      case 'Cancelled':
        return 'status-cancelled';

      default:
        return '';

    }

  }


  // =====================================================
  // START PREPARING
  // =====================================================

  startPreparing(): void {

    if (!this.prescription) {

      return;

    }


    if (
      this.prescription.status !==
      'Waiting'
    ) {

      return;

    }


    const success =
      this.pharmacyService.startPreparing(
        this.prescription.id
      );


    if (!success) {

      alert(
        'Unable to start preparing this prescription.'
      );

      return;

    }


    this.refreshPrescription();

  }


  // =====================================================
  // SEND TO BILLING
  // =====================================================

  sendToBilling(): void {

    if (!this.prescription) {

      return;

    }


    if (
      this.prescription.status !==
      'Preparing'
    ) {

      return;

    }


    const confirmed =
      confirm(
        'Send this prescription to Billing for payment?'
      );


    if (!confirmed) {

      return;

    }


    const success =
      this.pharmacyService.sendToBilling(
        this.prescription.id
      );


    if (!success) {

      alert(
        'Unable to send this prescription to Billing.'
      );

      return;

    }


    alert(
      'Prescription sent to Billing successfully.'
    );


    this.refreshPrescription();

  }


  // =====================================================
  // CHECK PAYMENT
  // =====================================================

  checkPayment(): void {

    if (!this.prescription) {

      return;

    }


    if (
      this.prescription.status !==
      'Awaiting Payment'
    ) {

      return;

    }


    const paid =
      this.pharmacyService.checkPayment(
        this.prescription.id
      );


    if (paid) {

      alert(
        'Payment confirmed. Prescription is ready for pickup.'
      );

    } else {

      alert(
        'Payment has not yet been completed.'
      );

    }


    this.refreshPrescription();

  }


  // =====================================================
  // DISPENSE
  // =====================================================

  dispense(): void {

    if (!this.prescription) {

      return;

    }


    if (
      this.prescription.status !==
      'Ready for Pickup'
    ) {

      return;

    }


    if (
      this.prescription.balance > 0
    ) {

      alert(
        'This prescription still has an outstanding balance.'
      );

      return;

    }


    const confirmed =
      confirm(
        'Confirm that the patient has collected the prescribed medicines?'
      );


    if (!confirmed) {

      return;

    }


    const success =
      this.pharmacyService.dispense(
        this.prescription.id,
        'Pharmacist'
      );


    if (!success) {

      alert(
        'Unable to dispense the prescription. Please verify payment and medicine stock.'
      );

      return;

    }


    alert(
      'Prescription dispensed successfully.'
    );


    this.refreshPrescription();

  }


  // =====================================================
  // REFRESH
  // =====================================================

  private refreshPrescription(): void {

    if (!this.prescriptionId) {

      return;

    }


    this.loadPrescription(
      this.prescriptionId
    );

  }


  // =====================================================
  // PAYMENT PERCENTAGE
  // =====================================================

  getPaymentPercentage(): number {

    if (!this.prescription) {

      return 0;

    }


    if (
      this.prescription.subtotal <= 0
    ) {

      return 0;

    }


    const percentage =
      (
        this.prescription.amountPaid /
        this.prescription.subtotal
      ) * 100;


    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          percentage
        )
      )
    );

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?: string
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


    return parsedDate.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  }


  // =====================================================
  // FORMAT DATE TIME
  // =====================================================

  formatDateTime(
    date?: string
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


    return parsedDate.toLocaleString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

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

}
