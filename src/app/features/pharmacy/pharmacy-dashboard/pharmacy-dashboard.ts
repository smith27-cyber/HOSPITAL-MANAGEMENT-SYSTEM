import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  PharmacyPrescription
} from '../../../shared/models/pharmacy.model';

import {
  PharmacyService
} from '../../../core/services/pharmacy.service';


@Component({
  selector: 'app-pharmacy-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './pharmacy-dashboard.html',
  styleUrl: './pharmacy-dashboard.css'
})
export class PharmacyDashboard implements OnInit {

  // =====================================================
  // PRESCRIPTIONS
  // =====================================================

  prescriptions: PharmacyPrescription[] = [];


  // =====================================================
  // MEDICINES
  // =====================================================

  totalMedicines = 0;

  lowStockMedicines = 0;

  expiredMedicines = 0;

  outOfStockMedicines = 0;


  // =====================================================
  // PHARMACY COUNTS
  // =====================================================

  waitingCount = 0;

  preparingCount = 0;

  awaitingPaymentCount = 0;

  readyForPickupCount = 0;

  dispensedCount = 0;


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
    this.loadDashboard();
  }


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  loadDashboard(): void {

    this.loadPrescriptions();
    this.loadMedicineStatistics();

  }


  // =====================================================
  // LOAD PRESCRIPTIONS
  // =====================================================

  private loadPrescriptions(): void {

    this.prescriptions =
      this.pharmacyService.getPrescriptions();

    this.waitingCount =
      this.pharmacyService.getWaitingCount();

    this.preparingCount =
      this.pharmacyService.getPreparingCount();

    this.awaitingPaymentCount =
      this.pharmacyService.getAwaitingPaymentCount();

    this.readyForPickupCount =
      this.pharmacyService.getReadyForPickupCount();

    this.dispensedCount =
      this.pharmacyService.getDispensedCount();

  }


  // =====================================================
  // LOAD MEDICINE STATISTICS
  // =====================================================

  private loadMedicineStatistics(): void {

    const medicines =
      this.pharmacyService.getMedicines();

    this.totalMedicines =
      medicines.length;

    this.lowStockMedicines =
      medicines.filter(
        medicine =>
          this.pharmacyService.calculateStatus(
            medicine
          ) === 'Low Stock'
      ).length;

    this.expiredMedicines =
      medicines.filter(
        medicine =>
          this.pharmacyService.calculateStatus(
            medicine
          ) === 'Expired'
      ).length;

    this.outOfStockMedicines =
      medicines.filter(
        medicine =>
          this.pharmacyService.calculateStatus(
            medicine
          ) === 'Out of Stock'
      ).length;

  }


  // =====================================================
  // RECENT PRESCRIPTIONS
  // =====================================================

  get recentPrescriptions(): PharmacyPrescription[] {

    return [
      ...this.prescriptions
    ]
      .sort(
        (a, b) =>
          new Date(b.prescriptionDate).getTime() -
          new Date(a.prescriptionDate).getTime()
      )
      .slice(0, 5);

  }


  // =====================================================
  // OPEN QUEUE
  // =====================================================

  openQueue(): void {

    this.router.navigate([
      '/pharmacy/queue'
    ]);

  }


  // =====================================================
  // OPEN PRESCRIPTION
  // =====================================================

  openPrescription(
    prescription: PharmacyPrescription
  ): void {

    this.router.navigate([
      '/pharmacy/prescriptions',
      prescription.id
    ]);

  }


  // =====================================================
  // OPEN STOCK
  // =====================================================

  openStock(): void {

    this.router.navigate([
      '/pharmacy/stock'
    ]);

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: string
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

    return new Date(date).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  }

}
