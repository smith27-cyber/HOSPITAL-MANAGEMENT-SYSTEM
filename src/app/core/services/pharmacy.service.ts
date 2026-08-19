import { Injectable } from '@angular/core';

import {
  Medicine,
  MedicineStatus
} from '../../shared/models/medicine.model';


@Injectable({
  providedIn: 'root'
})
export class PharmacyService {

  private readonly storageKey =
    'hms_medicines';


  private medicines: Medicine[] = [];


  constructor() {

    this.loadMedicines();

  }


  // =====================================================
  // GET ALL MEDICINES
  // =====================================================

  getMedicines(): Medicine[] {

    return [
      ...this.medicines
    ];

  }


  // =====================================================
  // GET MEDICINE BY ID
  // =====================================================

  getMedicineById(
    id: string
  ): Medicine | undefined {

    return this.medicines.find(
      medicine =>
        medicine.id === id
    );

  }


  // =====================================================
  // ADD MEDICINE
  // =====================================================

  addMedicine(
    medicine: Medicine
  ): void {

    this.medicines.push({
      ...medicine
    });

    this.saveMedicines();

  }


  // =====================================================
  // UPDATE MEDICINE
  // =====================================================

  updateMedicine(
    updatedMedicine: Medicine
  ): boolean {

    const index =
      this.medicines.findIndex(
        medicine =>
          medicine.id ===
          updatedMedicine.id
      );


    if (index === -1) {

      return false;

    }


    this.medicines[index] = {
      ...updatedMedicine
    };


    this.medicines[index].status =
      this.calculateStatus(
        this.medicines[index]
      );


    this.medicines[index].updatedAt =
      new Date().toISOString();


    this.saveMedicines();


    return true;

  }


  // =====================================================
  // DELETE MEDICINE
  // =====================================================

  deleteMedicine(
    id: string
  ): boolean {

    const originalLength =
      this.medicines.length;


    this.medicines =
      this.medicines.filter(
        medicine =>
          medicine.id !== id
      );


    if (
      this.medicines.length ===
      originalLength
    ) {

      return false;

    }


    this.saveMedicines();


    return true;

  }


  // =====================================================
  // UPDATE STOCK
  // =====================================================

  updateStock(
    id: string,
    quantity: number
  ): boolean {

    const medicine =
      this.getMedicineById(id);


    if (!medicine) {

      return false;

    }


    if (quantity < 0) {

      return false;

    }


    medicine.quantity =
      quantity;


    medicine.status =
      this.calculateStatus(
        medicine
      );


    medicine.updatedAt =
      new Date().toISOString();


    this.saveMedicines();


    return true;

  }


  // =====================================================
  // DISPENSE MEDICINE
  // =====================================================

  dispenseMedicine(
    id: string,
    quantity: number
  ): boolean {

    const medicine =
      this.getMedicineById(id);


    if (!medicine) {

      return false;

    }


    if (quantity <= 0) {

      return false;

    }


    if (
      medicine.quantity <
      quantity
    ) {

      return false;

    }


    medicine.quantity -=
      quantity;


    medicine.status =
      this.calculateStatus(
        medicine
      );


    medicine.updatedAt =
      new Date().toISOString();


    this.saveMedicines();


    return true;

  }


  // =====================================================
  // LOW STOCK
  // =====================================================

  getLowStockMedicines(): Medicine[] {

    return this.medicines.filter(
      medicine =>
        medicine.quantity <=
        medicine.reorderLevel
    );

  }


  // =====================================================
  // OUT OF STOCK
  // =====================================================

  getOutOfStockMedicines(): Medicine[] {

    return this.medicines.filter(
      medicine =>
        medicine.quantity === 0
    );

  }


  // =====================================================
  // EXPIRED
  // =====================================================

  getExpiredMedicines(): Medicine[] {

    const today =
      new Date();


    return this.medicines.filter(
      medicine => {

        const expiry =
          new Date(
            medicine.expiryDate
          );


        return expiry < today;

      }
    );

  }


  // =====================================================
  // AVAILABLE
  // =====================================================

  getAvailableMedicines(): Medicine[] {

    return this.medicines.filter(
      medicine =>
        medicine.quantity > 0 &&
        this.calculateStatus(
          medicine
        ) !== 'Expired'
    );

  }


  // =====================================================
  // CALCULATE STATUS
  // =====================================================

  calculateStatus(
    medicine: Medicine
  ): MedicineStatus {

    const today =
      new Date();


    const expiry =
      new Date(
        medicine.expiryDate
      );


    if (expiry < today) {

      return 'Expired';

    }


    if (
      medicine.quantity === 0
    ) {

      return 'Out of Stock';

    }


    if (
      medicine.quantity <=
      medicine.reorderLevel
    ) {

      return 'Low Stock';

    }


    return 'Available';

  }


  // =====================================================
  // LOAD
  // =====================================================

  private loadMedicines(): void {

    const stored =
      localStorage.getItem(
        this.storageKey
      );


    if (!stored) {

      this.medicines = [];

      return;

    }


    try {

      const parsed =
        JSON.parse(stored);


      if (
        Array.isArray(parsed)
      ) {

        this.medicines =
          parsed.map(
            medicine => ({
              ...medicine,

              status:
                this.calculateStatus(
                  medicine
                )
            })
          );

      } else {

        this.medicines = [];

      }

    } catch (error) {

      console.error(
        'Failed to load medicines:',
        error
      );

      this.medicines = [];

    }

  }


  // =====================================================
  // SAVE
  // =====================================================

  private saveMedicines(): void {

    localStorage.setItem(
      this.storageKey,

      JSON.stringify(
        this.medicines
      )
    );

  }

}
