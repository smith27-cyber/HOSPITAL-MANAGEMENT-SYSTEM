import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Medicine,
  MedicineStatus
} from '../../../shared/models/medicine.model';

import { PharmacyService } from '../../../core/services/pharmacy.service';


@Component({
  selector: 'app-pharmacy-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './pharmacy-list.html',
  styleUrl: './pharmacy-list.css'
})
export class PharmacyList implements OnInit {


  // =====================================================
  // MEDICINES
  // =====================================================

  medicines: Medicine[] = [];

  filteredMedicines: Medicine[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // FILTERS
  // =====================================================

  selectedCategory = 'All';

  selectedStatus: MedicineStatus | 'All' = 'All';


  // =====================================================
  // STATISTICS
  // =====================================================

  totalMedicines = 0;

  availableMedicines = 0;

  lowStockMedicines = 0;

  outOfStockMedicines = 0;

  expiredMedicines = 0;


  // =====================================================
  // CATEGORIES
  // =====================================================

  categories: string[] = [];


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

    this.loadMedicines();

  }


  // =====================================================
  // LOAD MEDICINES
  // =====================================================

  loadMedicines(): void {

    this.medicines =
      this.pharmacyService.getMedicines();


    this.updateStatistics();

    this.loadCategories();

    this.applyFilters();

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalMedicines =
      this.medicines.length;


    this.availableMedicines =
      this.medicines.filter(
        medicine =>
          this.getMedicineStatus(
            medicine
          ) === 'Available'
      ).length;


    this.lowStockMedicines =
      this.medicines.filter(
        medicine =>
          this.getMedicineStatus(
            medicine
          ) === 'Low Stock'
      ).length;


    this.outOfStockMedicines =
      this.medicines.filter(
        medicine =>
          this.getMedicineStatus(
            medicine
          ) === 'Out of Stock'
      ).length;


    this.expiredMedicines =
      this.medicines.filter(
        medicine =>
          this.getMedicineStatus(
            medicine
          ) === 'Expired'
      ).length;

  }


  // =====================================================
  // CATEGORIES
  // =====================================================

  private loadCategories(): void {

    const categorySet =
      new Set<string>();


    this.medicines.forEach(
      medicine => {

        if (medicine.category) {

          categorySet.add(
            medicine.category
          );

        }

      }
    );


    this.categories =
      Array.from(categorySet)
        .sort();

  }


  // =====================================================
  // FILTER MEDICINES
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredMedicines =
      this.medicines.filter(
        medicine => {

          // ---------------------------------------------
          // SEARCH
          // ---------------------------------------------

          const matchesSearch =
            !search ||

            medicine.name
              .toLowerCase()
              .includes(search) ||

            medicine.genericName
              .toLowerCase()
              .includes(search) ||

            medicine.category
              .toLowerCase()
              .includes(search) ||

            medicine.manufacturer
              .toLowerCase()
              .includes(search) ||

            medicine.batchNumber
              .toLowerCase()
              .includes(search);


          // ---------------------------------------------
          // CATEGORY
          // ---------------------------------------------

          const matchesCategory =
            this.selectedCategory === 'All' ||

            medicine.category ===
              this.selectedCategory;


          // ---------------------------------------------
          // STATUS
          // ---------------------------------------------

          const matchesStatus =
            this.selectedStatus === 'All' ||

            this.getMedicineStatus(
              medicine
            ) === this.selectedStatus;


          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
          );

        }
      );

  }


  // =====================================================
  // MEDICINE STATUS
  // =====================================================

  getMedicineStatus(
    medicine: Medicine
  ): MedicineStatus {

    return this.pharmacyService
      .calculateStatus(
        medicine
      );

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    medicine: Medicine
  ): string {

    const status =
      this.getMedicineStatus(
        medicine
      );


    switch (status) {

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
  // REGISTER MEDICINE
  // =====================================================

  registerMedicine(): void {

    this.router.navigate([
      '/pharmacy/register'
    ]);

  }
//===========================================
// VIEW MEDICINE
//===========================================
  viewMedicine(
  medicine: Medicine
): void {

  this.router.navigate([
    '/pharmacy',
    medicine.id
  ]);

}


  // =====================================================
  // EDIT MEDICINE
  // =====================================================

  editMedicine(
    medicine: Medicine
  ): void {

    this.router.navigate([
      '/pharmacy/edit',
      medicine.id
    ]);

  }


  // =====================================================
  // DELETE MEDICINE
  // =====================================================

  deleteMedicine(
    medicine: Medicine
  ): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete ${medicine.name}?`
      );


    if (!confirmed) {

      return;

    }


    const deleted =
      this.pharmacyService
        .deleteMedicine(
          medicine.id
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


    this.loadMedicines();

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedCategory = 'All';

    this.selectedStatus = 'All';

    this.applyFilters();

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
  // CHECK EXPIRY
  // =====================================================

  isExpired(
    medicine: Medicine
  ): boolean {

    return (
      this.getMedicineStatus(
        medicine
      ) === 'Expired'
    );

  }

}
