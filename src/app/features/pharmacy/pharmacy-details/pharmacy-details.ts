import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Medicine,
  MedicineStatus
} from '../../../shared/models/medicine.model';

import { PharmacyService } from '../../../core/services/pharmacy.service';


@Component({
  selector: 'app-pharmacy-details',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './pharmacy-details.html',

  styleUrl: './pharmacy-details.css'
})
export class PharmacyDetails implements OnInit {


  // =====================================================
  // MEDICINE
  // =====================================================

  medicine: Medicine | null = null;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private pharmacyService: PharmacyService,
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

      alert(
        'Medicine ID was not provided.'
      );

      this.router.navigate([
        '/pharmacy'
      ]);

      return;

    }


    this.medicine =
      this.pharmacyService.getMedicineById(id)
      ?? null;


    if (!this.medicine) {

      alert(
        'Medicine could not be found.'
      );

      this.router.navigate([
        '/pharmacy'
      ]);

    }

  }


  // =====================================================
  // GET CURRENT STATUS
  // =====================================================

  getMedicineStatus(): MedicineStatus | '' {

    if (!this.medicine) {
      return '';
    }

    return this.pharmacyService.calculateStatus(
      this.medicine
    );

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(): string {

    switch (
      this.getMedicineStatus()
    ) {

      case 'Available':
        return 'available';

      case 'Low Stock':
        return 'low-stock';

      case 'Out of Stock':
        return 'out-of-stock';

      case 'Expired':
        return 'expired';

      default:
        return '';

    }

  }


  // =====================================================
  // EXPIRY CHECK
  // =====================================================

  isExpired(): boolean {

    return (
      this.getMedicineStatus() ===
      'Expired'
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
    ).format(amount);

  }


 // =====================================================
// EDIT MEDICINE
// =====================================================

editMedicine(): void {

  if (!this.medicine) {
    return;
  }

  this.router.navigate([
    '/pharmacy',
    this.medicine.id,
    'edit'
  ]);

}


  // =====================================================
  // DELETE MEDICINE
  // =====================================================

  deleteMedicine(): void {

    if (!this.medicine) {
      return;
    }


    const confirmed =
      confirm(
        `Are you sure you want to delete ${this.medicine.name}?`
      );


    if (!confirmed) {
      return;
    }


    const deleted =
      this.pharmacyService.deleteMedicine(
        this.medicine.id
      );


    if (!deleted) {

      alert(
        'Unable to delete medicine.'
      );

      return;

    }


    alert(
      'Medicine deleted successfully.'
    );


    this.router.navigate([
      '/pharmacy'
    ]);

  }


  // =====================================================
  // BACK
  // =====================================================

  backToPharmacy(): void {

    this.router.navigate([
      '/pharmacy'
    ]);

  }

}
