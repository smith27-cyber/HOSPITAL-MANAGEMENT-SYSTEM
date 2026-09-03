
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  PharmacyPrescription,
  PharmacyPrescriptionItem,
  PharmacyPrescriptionStatus
} from '../../shared/models/pharmacy.model';

import {
  Medicine,
  MedicineForm,
  MedicineStatus
} from '../../shared/models/medicine.model';

import {
  InventoryItem
} from '../../shared/models/inventory.model';

import {
  InventoryService
} from './inventory.service';


@Injectable({
  providedIn: 'root'
})
export class PharmacyService {

  // =====================================================
  // BACKEND API
  // =====================================================

  private readonly API_URL =
    'http://localhost:8081/api/pharmacy/prescriptions';


  // =====================================================
  // INVENTORY CACHE
  // =====================================================

  private inventoryItems:
    InventoryItem[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient,
    private inventoryService: InventoryService
  ) {

    this.loadInventory();

  }


  // =====================================================
  // LOAD INVENTORY
  // =====================================================

  private loadInventory(): void {

    this.inventoryService
      .getItems()
      .subscribe({

        next: (items: InventoryItem[]) => {

          this.inventoryItems = [
            ...items
          ];

        },

        error: (error: unknown) => {

          console.error(
            'Failed to load pharmacy inventory:',
            error
          );

          this.inventoryItems = [];

        }

      });

  }


  // =====================================================
  // REFRESH INVENTORY
  // =====================================================

  refreshInventory(): void {

    this.loadInventory();

  }


  // =====================================================
  // PRESCRIPTIONS
  // =====================================================

  getPrescriptions():
    Observable<PharmacyPrescription[]> {

    return this.http.get<PharmacyPrescription[]>(
      this.API_URL
    );

  }


  // =====================================================
  // GET PRESCRIPTION BY ID
  // =====================================================

  getPrescriptionById(
    id: number
  ):
    Observable<PharmacyPrescription> {

    return this.http.get<PharmacyPrescription>(
      `${this.API_URL}/${id}`
    );

  }


  // =====================================================
  // GET PRESCRIPTIONS BY PATIENT
  // =====================================================

  getPrescriptionsByPatient(
    patientId: string
  ):
    Observable<PharmacyPrescription[]> {

    return this.http.get<PharmacyPrescription[]>(
      `${this.API_URL}/patient/${patientId}`
    );

  }


  // =====================================================
  // GET PRESCRIPTIONS BY CONSULTATION
  // =====================================================

  getPrescriptionsByConsultation(
    consultationId: string
  ):
    Observable<PharmacyPrescription[]> {

    return this.http.get<PharmacyPrescription[]>(
      `${this.API_URL}/consultation/${consultationId}`
    );

  }


  // =====================================================
  // GET PRESCRIPTIONS BY STATUS
  // =====================================================

  getPrescriptionsByStatus(
    status: PharmacyPrescriptionStatus
  ):
    Observable<PharmacyPrescription[]> {

    return this.http.get<PharmacyPrescription[]>(
      `${this.API_URL}/status/${encodeURIComponent(status)}`
    );

  }


  // =====================================================
  // WAITING
  // =====================================================

  getWaitingPrescriptions():
    Observable<PharmacyPrescription[]> {

    return this.getPrescriptionsByStatus(
      'Waiting'
    );

  }


  // =====================================================
  // PREPARING
  // =====================================================

  getPreparingPrescriptions():
    Observable<PharmacyPrescription[]> {

    return this.getPrescriptionsByStatus(
      'Preparing'
    );

  }


  // =====================================================
  // AWAITING PAYMENT
  // =====================================================

  getAwaitingPayment():
    Observable<PharmacyPrescription[]> {

    return this.getPrescriptionsByStatus(
      'Awaiting Payment'
    );

  }


  // =====================================================
  // PAID
  // =====================================================

  getPaidPrescriptions():
    Observable<PharmacyPrescription[]> {

    return this.getPrescriptionsByStatus(
      'Paid'
    );

  }


  // =====================================================
  // READY FOR PICKUP
  // =====================================================

  getReadyForPickup():
    Observable<PharmacyPrescription[]> {

    return this.getPrescriptionsByStatus(
      'Ready for Pickup'
    );

  }


  // =====================================================
  // DISPENSED
  // =====================================================

  getDispensedPrescriptions():
    Observable<PharmacyPrescription[]> {

    return this.getPrescriptionsByStatus(
      'Dispensed'
    );

  }


  // =====================================================
  // CREATE PRESCRIPTION
  // =====================================================

  createPrescription(
    data: {
      patientId: string;
      patientName: string;
      patientNumber?: string;
      consultationId?: string;
      doctorId?: string;
      doctorName?: string;
      items: PharmacyPrescriptionItem[];
      notes?: string;
    }
  ):
    Observable<PharmacyPrescription> {

    return this.http.post<PharmacyPrescription>(
      this.API_URL,
      data
    );

  }


  // =====================================================
  // START PREPARING
  // =====================================================

  startPreparing(
    id: number
  ):
    Observable<PharmacyPrescription> {

    return this.http.patch<PharmacyPrescription>(
      `${this.API_URL}/${id}/prepare`,
      {}
    );

  }


  // =====================================================
  // SEND TO BILLING
  // =====================================================

  sendToBilling(
    id: number
  ):
    Observable<PharmacyPrescription> {

    return this.http.patch<PharmacyPrescription>(
      `${this.API_URL}/${id}/billing`,
      {}
    );

  }


  // =====================================================
  // CHECK PAYMENT
  // =====================================================

  checkPayment(
    id: number
  ):
    Observable<PharmacyPrescription> {

    return this.http.patch<PharmacyPrescription>(
      `${this.API_URL}/${id}/payment`,
      {}
    );

  }


  // =====================================================
  // DISPENSE
  // =====================================================

  dispense(
    id: number,
    dispensedBy: string = 'Pharmacist'
  ):
    Observable<PharmacyPrescription> {

    return this.http.patch<PharmacyPrescription>(
      `${this.API_URL}/${id}/dispense`,
      {
        dispensedBy
      }
    );

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancelPrescription(
    id: number
  ):
    Observable<PharmacyPrescription> {

    return this.http.patch<PharmacyPrescription>(
      `${this.API_URL}/${id}/cancel`,
      {}
    );

  }


  // =====================================================
  // DELETE
  // =====================================================

  deletePrescription(
    id: number
  ):
    Observable<void> {

    return this.http.delete<void>(
      `${this.API_URL}/${id}`
    );

  }


  // =====================================================
  // MEDICINE METHODS
  // =====================================================

  getMedicines(): Medicine[] {

    return this.inventoryItems
      .filter(
        (item: InventoryItem) =>
          item.category === 'Medicine'
      )
      .map(
        (item: InventoryItem) =>
          this.mapInventoryToMedicine(item)
      );

  }


  // =====================================================
  // GET MEDICINE BY ID
  // =====================================================

  getMedicineById(
    id: string
  ): Medicine | undefined {

    const item =
      this.inventoryItems.find(
        (inventoryItem: InventoryItem) =>
          inventoryItem.id === id
      );

    if (!item ||
        item.category !== 'Medicine') {

      return undefined;

    }

    return this.mapInventoryToMedicine(
      item
    );

  }


  // =====================================================
  // AVAILABLE MEDICINES
  // =====================================================

  getAvailableMedicines():
    Medicine[] {

    return this.getMedicines().filter(
      (medicine: Medicine) =>
        medicine.quantity > 0 &&
        medicine.status !== 'Expired'
    );

  }


  // =====================================================
  // LOW STOCK MEDICINES
  // =====================================================

  getLowStockMedicines():
    Medicine[] {

    return this.getMedicines().filter(
      (medicine: Medicine) =>
        medicine.status === 'Low Stock'
    );

  }


  // =====================================================
  // EXPIRED MEDICINES
  // =====================================================

  getExpiredMedicines():
    Medicine[] {

    return this.getMedicines().filter(
      (medicine: Medicine) =>
        medicine.status === 'Expired'
    );

  }


  // =====================================================
  // MAP INVENTORY TO MEDICINE
  // =====================================================

  private mapInventoryToMedicine(
    item: InventoryItem
  ): Medicine {

    return {

      id: item.id,

      name: item.itemName,

      genericName: item.itemName,

      category: item.category,

      form: this.getMedicineForm(item),

      strength: 'Not specified',

      manufacturer:
        item.supplier ||
        'Not specified',

      batchNumber:
        item.batchNumber ||
        '',

      quantity:
        item.quantity,

      reorderLevel:
        item.minimumStock,

      unitPrice:
        item.unitPrice,

      expiryDate:
        item.expiryDate ||
        '',

      status:
        this.calculateStatusFromInventory(item),

      description:
        item.description,

      createdAt:
        item.createdAt,

      updatedAt:
        item.updatedAt

    };

  }


  // =====================================================
  // MEDICINE FORM
  // =====================================================

  private getMedicineForm(
    item: InventoryItem
  ): MedicineForm {

    switch (item.unit) {

      case 'Tablet':
        return 'Tablet';

      case 'Capsule':
        return 'Capsule';

      case 'Bottle':
        return 'Syrup';

      case 'Vial':
        return 'Injection';

      case 'Piece':
        return 'Other';

      default:
        return 'Other';

    }

  }


  // =====================================================
  // CALCULATE MEDICINE STATUS
  // =====================================================

  private calculateStatusFromInventory(
    item: InventoryItem
  ): MedicineStatus {

    if (item.expiryDate) {

      const expiry =
        new Date(item.expiryDate);

      const today =
        new Date();

      expiry.setHours(
        0,
        0,
        0,
        0
      );

      today.setHours(
        0,
        0,
        0,
        0
      );

      if (expiry < today) {

        return 'Expired';

      }

    }


    if (item.quantity <= 0) {

      return 'Out of Stock';

    }


    if (
      item.quantity <=
      item.minimumStock
    ) {

      return 'Low Stock';

    }


    return 'Available';

  }


  // =====================================================
  // CALCULATE MEDICINE STATUS
  // =====================================================

  calculateStatus(
    medicine: Medicine
  ): MedicineStatus {

    if (medicine.expiryDate) {

      const expiry =
        new Date(medicine.expiryDate);

      const today =
        new Date();

      expiry.setHours(
        0,
        0,
        0,
        0
      );

      today.setHours(
        0,
        0,
        0,
        0
      );

      if (expiry < today) {

        return 'Expired';

      }

    }


    if (medicine.quantity <= 0) {

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
  // STOCK IN
  // =====================================================

  stockIn(
    medicineId: string,
    quantity: number,
    reason?: string,
    reference?: string,
    performedBy?: string
  ): boolean {

    if (
      !medicineId ||
      quantity <= 0
    ) {

      return false;

    }


    const item =
      this.inventoryItems.find(
        (inventoryItem: InventoryItem) =>
          inventoryItem.id === medicineId
      );


    if (!item) {

      return false;

    }


    const newQuantity =
      Number(item.quantity || 0) +
      Number(quantity);


    this.inventoryService
      .stockIn(
        medicineId,
        newQuantity,
        reason,
        reference,
        performedBy
      )
      .subscribe({

        next: (updatedItem: InventoryItem) => {

          this.updateInventoryCache(
            updatedItem
          );

        },

        error: (error: unknown) => {

          console.error(
            'Failed to stock in medicine:',
            error
          );

        }

      });


    return true;

  }


  // =====================================================
  // UPDATE STOCK
  // =====================================================

  updateStock(
    medicineId: string,
    newQuantity: number
  ): boolean {

    if (
      newQuantity < 0
    ) {

      return false;

    }


    const medicine =
      this.getMedicineById(
        medicineId
      );


    if (!medicine) {

      return false;

    }


    this.inventoryService
      .adjustStock(
        medicineId,
        newQuantity,
        'Pharmacy stock adjustment',
        medicine.batchNumber,
        'Pharmacy'
      )
      .subscribe({

        next: (updatedItem: InventoryItem) => {

          this.updateInventoryCache(
            updatedItem
          );

        },

        error: (error: unknown) => {

          console.error(
            'Failed to adjust pharmacy stock:',
            error
          );

        }

      });


    return true;

  }


  // =====================================================
  // STOCK OUT
  // =====================================================

  stockOut(
    medicineId: string,
    quantity: number,
    reason?: string,
    reference?: string,
    performedBy?: string
  ): boolean {

    if (
      !medicineId ||
      quantity <= 0
    ) {

      return false;

    }


    const medicine =
      this.getMedicineById(
        medicineId
      );


    if (!medicine) {

      return false;

    }


    if (
      quantity >
      medicine.quantity
    ) {

      return false;

    }


    this.inventoryService
      .stockOut(
        medicineId,
        quantity,
        reason,
        reference,
        performedBy
      )
      .subscribe({

        next: (updatedItem: InventoryItem) => {

          this.updateInventoryCache(
            updatedItem
          );

        },

        error: (error: unknown) => {

          console.error(
            'Failed to stock out medicine:',
            error
          );

        }

      });


    return true;

  }


  // =====================================================
  // DISPENSE MEDICINE
  // =====================================================

  dispenseMedicine(
    medicineId: string,
    quantity: number,
    reason = 'Pharmacy dispensing',
    reference?: string,
    performedBy = 'Pharmacist'
  ): boolean {

    if (
      quantity <= 0
    ) {

      return false;

    }


    const medicine =
      this.getMedicineById(
        medicineId
      );


    if (!medicine) {

      return false;

    }


    if (
      medicine.status ===
      'Expired'
    ) {

      return false;

    }


    if (
      quantity >
      medicine.quantity
    ) {

      return false;

    }


    return this.stockOut(
      medicineId,
      quantity,
      reason,
      reference,
      performedBy
    );

  }


  // =====================================================
  // UPDATE INVENTORY CACHE
  // =====================================================

  private updateInventoryCache(
    updatedItem: InventoryItem
  ): void {

    const index =
      this.inventoryItems.findIndex(
        (item: InventoryItem) =>
          item.id === updatedItem.id
      );


    if (index >= 0) {

      this.inventoryItems[index] =
        updatedItem;

    } else {

      this.inventoryItems.push(
        updatedItem
      );

    }

  }

}

