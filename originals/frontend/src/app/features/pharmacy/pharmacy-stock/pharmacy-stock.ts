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
  selector: 'app-pharmacy-stock',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './pharmacy-stock.html',

  styleUrl: './pharmacy-stock.css'
})
export class PharmacyStock implements OnInit {


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
  // STATUS FILTER
  // =====================================================

  selectedStatus: MedicineStatus | 'All' = 'All';


  // =====================================================
  // STOCK ACTION
  // =====================================================

  selectedMedicine: Medicine | null = null;

  stockAction: 'restock' | 'dispense' = 'restock';

  stockQuantity = 0;


  // =====================================================
  // STATISTICS
  // =====================================================

  totalMedicines = 0;

  totalStock = 0;

  lowStockMedicines = 0;

  outOfStockMedicines = 0;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

 constructor(
  private pharmacyService: PharmacyService,
  public router: Router
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

    this.applyFilters();

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalMedicines =
      this.medicines.length;


    this.totalStock =
      this.medicines.reduce(
        (total, medicine) =>
          total + medicine.quantity,
        0
      );


    this.lowStockMedicines =
      this.medicines.filter(
        medicine =>
          this.getMedicineStatus(medicine) ===
          'Low Stock'
      ).length;


    this.outOfStockMedicines =
      this.medicines.filter(
        medicine =>
          this.getMedicineStatus(medicine) ===
          'Out of Stock'
      ).length;

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

          const matchesSearch =
            !search ||

            medicine.name
              .toLowerCase()
              .includes(search) ||

            medicine.genericName
              .toLowerCase()
              .includes(search) ||

            medicine.batchNumber
              .toLowerCase()
              .includes(search);


          const matchesStatus =
            this.selectedStatus === 'All' ||

            this.getMedicineStatus(
              medicine
            ) === this.selectedStatus;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

  }


  // =====================================================
  // GET MEDICINE STATUS
  // =====================================================

  getMedicineStatus(
    medicine: Medicine
  ): MedicineStatus {

    return this.pharmacyService.calculateStatus(
      medicine
    );

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    medicine: Medicine
  ): string {

    switch (
      this.getMedicineStatus(medicine)
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
  // OPEN RESTOCK
  // =====================================================

  openRestock(
    medicine: Medicine
  ): void {

    this.selectedMedicine =
      medicine;

    this.stockAction =
      'restock';

    this.stockQuantity = 0;

  }


  // =====================================================
  // OPEN DISPENSE
  // =====================================================

  openDispense(
    medicine: Medicine
  ): void {

    this.selectedMedicine =
      medicine;

    this.stockAction =
      'dispense';

    this.stockQuantity = 0;

  }


  // =====================================================
  // CLOSE STOCK ACTION
  // =====================================================

  closeStockAction(): void {

    this.selectedMedicine = null;

    this.stockQuantity = 0;

  }


  // =====================================================
  // PROCESS STOCK ACTION
  // =====================================================

  processStockAction(): void {

    if (!this.selectedMedicine) {

      return;

    }


    if (
      !Number.isInteger(
        this.stockQuantity
      ) ||
      this.stockQuantity <= 0
    ) {

      alert(
        'Please enter a valid quantity greater than zero.'
      );

      return;

    }


    const medicine =
      this.selectedMedicine;


    // ===================================================
    // RESTOCK
    // ===================================================

    if (
      this.stockAction === 'restock'
    ) {

      const newQuantity =
        medicine.quantity +
        this.stockQuantity;


      const updated =
        this.pharmacyService.updateStock(
          medicine.id,
          newQuantity
        );


      if (!updated) {

        alert(
          'Unable to update medicine stock.'
        );

        return;

      }


      alert(
        `${medicine.name} stock updated successfully.`
      );

    }


    // ===================================================
    // DISPENSE
    // ===================================================

    else {

      if (
        this.stockQuantity >
        medicine.quantity
      ) {

        alert(
          `Cannot dispense ${this.stockQuantity} units. ` +
          `Only ${medicine.quantity} units are available.`
        );

        return;

      }


      const dispensed =
        this.pharmacyService.dispenseMedicine(
          medicine.id,
          this.stockQuantity
        );


      if (!dispensed) {

        alert(
          'Unable to dispense medicine.'
        );

        return;

      }


      alert(
        `${this.stockQuantity} units of ${medicine.name} dispensed successfully.`
      );

    }


    // ===================================================
    // REFRESH
    // ===================================================

    this.closeStockAction();

    this.loadMedicines();

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = 'All';

    this.applyFilters();

  }


  // =====================================================
  // VIEW DETAILS
  // =====================================================

  viewDetails(
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
      '/pharmacy',
      medicine.id,
      'edit'
    ]);

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
  // RESET STATUS
  // =====================================================

  resetStatus(): void {

    this.selectedMedicine = null;

    this.stockQuantity = 0;

  }

}
