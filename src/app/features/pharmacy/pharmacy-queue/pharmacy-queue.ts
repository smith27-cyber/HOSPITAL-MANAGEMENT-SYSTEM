import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';

import {
  PharmacyPrescription,
  PharmacyPrescriptionStatus
} from '../../../shared/models/pharmacy.model';

import {
  PharmacyService
} from '../../../core/services/pharmacy.service';


@Component({
  selector: 'app-pharmacy-queue',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './pharmacy-queue.html',

  styleUrl: './pharmacy-queue.css'
})
export class PharmacyQueue implements OnInit {


  // =====================================================
  // PRESCRIPTIONS
  // =====================================================

  prescriptions:
    PharmacyPrescription[] = [];

  filteredPrescriptions:
    PharmacyPrescription[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // STATUS FILTER
  // =====================================================

  selectedStatus:
    PharmacyPrescriptionStatus | 'All' = 'All';


  // =====================================================
  // STATISTICS
  // =====================================================

  waitingCount = 0;

  preparingCount = 0;

  awaitingPaymentCount = 0;

  readyForPickupCount = 0;

  dispensedCount = 0;

  totalCount = 0;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private pharmacyService: PharmacyService,
    private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadQueue();

  }


  // =====================================================
  // LOAD QUEUE
  // =====================================================

  loadQueue(): void {

    this.prescriptions =
      this.pharmacyService.getPrescriptions();

    this.updateStatistics();

    this.applyFilters();

  }


  // =====================================================
  // UPDATE STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalCount =
      this.prescriptions.length;


    this.waitingCount =
      this.prescriptions.filter(
        prescription =>
          prescription.status === 'Waiting'
      ).length;


    this.preparingCount =
      this.prescriptions.filter(
        prescription =>
          prescription.status === 'Preparing'
      ).length;


    this.awaitingPaymentCount =
      this.prescriptions.filter(
        prescription =>
          prescription.status ===
          'Awaiting Payment'
      ).length;


    this.readyForPickupCount =
      this.prescriptions.filter(
        prescription =>
          prescription.status ===
          'Ready for Pickup'
      ).length;


    this.dispensedCount =
      this.prescriptions.filter(
        prescription =>
          prescription.status === 'Dispensed'
      ).length;

  }


  // =====================================================
  // FILTER QUEUE
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredPrescriptions =
      this.prescriptions.filter(
        prescription => {

          const matchesSearch =
            !search ||

            prescription.patientName
              .toLowerCase()
              .includes(search) ||

            prescription.prescriptionNumber
              .toLowerCase()
              .includes(search) ||

            (
              prescription.patientNumber
                ?.toLowerCase()
                .includes(search) ??
              false
            ) ||

            (
              prescription.doctorName
                ?.toLowerCase()
                .includes(search) ??
              false
            );


          const matchesStatus =
            this.selectedStatus === 'All' ||
            prescription.status ===
              this.selectedStatus;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

  }


  // =====================================================
  // FILTER BY STATUS
  // =====================================================

  filterByStatus(
    status:
      PharmacyPrescriptionStatus | 'All'
  ): void {

    this.selectedStatus =
      status;

    this.applyFilters();

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus =
      'All';

    this.applyFilters();

  }


  // =====================================================
  // VIEW PRESCRIPTION
  // =====================================================

  viewPrescription(
    prescription: PharmacyPrescription
  ): void {

    this.router.navigate([
      '/pharmacy/prescriptions',
      prescription.id
    ]);

  }


  // =====================================================
  // START PREPARING
  // =====================================================

  startPreparing(
    prescription: PharmacyPrescription
  ): void {

    if (
      prescription.status !== 'Waiting'
    ) {

      return;

    }


    const success =
      this.pharmacyService.startPreparing(
        prescription.id
      );


    if (!success) {

      alert(
        'Unable to start preparing this prescription.'
      );

      return;

    }


    this.loadQueue();

  }


  // =====================================================
  // SEND TO BILLING
  // =====================================================

  sendToBilling(
    prescription: PharmacyPrescription
  ): void {

    if (
      prescription.status !== 'Preparing'
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
        prescription.id
      );


    if (!success) {

      alert(
        'Unable to send prescription to Billing.'
      );

      return;

    }


    alert(
      'Prescription sent to Billing.'
    );


    this.loadQueue();

  }


  // =====================================================
  // CHECK PAYMENT
  // =====================================================

  checkPayment(
    prescription: PharmacyPrescription
  ): void {

    if (
      prescription.status !==
      'Awaiting Payment'
    ) {

      return;

    }


    const paid =
      this.pharmacyService.checkPayment(
        prescription.id
      );


    if (paid) {

      alert(
        'Payment confirmed. Prescription is ready for pickup.'
      );

    } else {

      alert(
        'Payment is still pending.'
      );

    }


    this.loadQueue();

  }


  // =====================================================
  // DISPENSE
  // =====================================================

  dispense(
    prescription: PharmacyPrescription
  ): void {

    if (
      prescription.status !==
      'Ready for Pickup'
    ) {

      return;

    }


    const confirmed =
      confirm(
        'Confirm that the patient has collected the medicine?'
      );


    if (!confirmed) {

      return;

    }


    const success =
      this.pharmacyService.dispense(
        prescription.id,
        'Pharmacist'
      );


    if (!success) {

      alert(
        'Unable to dispense this prescription. Check payment and stock.'
      );

      return;

    }


    alert(
      'Prescription dispensed successfully.'
    );


    this.loadQueue();

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
  // FORMAT DATE
  // =====================================================

  formatDate(
    date: string
  ): string {

    if (!date) {

      return '—';

    }


    return new Date(
      date
    ).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
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


  // =====================================================
  // TRACK BY PRESCRIPTION
  // =====================================================

  trackPrescription(
    index: number,
    prescription: PharmacyPrescription
  ): string {

    return prescription.id;

  }

}
