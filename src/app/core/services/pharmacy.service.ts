import { Injectable } from '@angular/core';

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

import {
  BillingService
} from './billing.service';


@Injectable({
  providedIn: 'root'
})
export class PharmacyService {


  // =====================================================
  // STORAGE KEY
  // =====================================================

  private readonly storageKey =
    'hms_pharmacy_prescriptions';


  // =====================================================
  // DATA
  // =====================================================

  private prescriptions:
    PharmacyPrescription[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private inventoryService: InventoryService,
    private billingService: BillingService
  ) {

    this.loadPrescriptions();

  }


  // =====================================================
  // PRESCRIPTION METHODS
  // =====================================================

  getPrescriptions():
    PharmacyPrescription[] {

    return [
      ...this.prescriptions
    ];

  }


  getPrescriptionById(
    id: string
  ): PharmacyPrescription | undefined {

    return this.prescriptions.find(
      prescription =>
        prescription.id === id
    );

  }


  getPrescriptionsByPatient(
    patientId: string
  ): PharmacyPrescription[] {

    return this.prescriptions.filter(
      prescription =>
        prescription.patientId ===
        patientId
    );

  }


  getPrescriptionsByStatus(
    status: PharmacyPrescriptionStatus
  ): PharmacyPrescription[] {

    return this.prescriptions.filter(
      prescription =>
        prescription.status ===
        status
    );

  }


  getWaitingPrescriptions():
    PharmacyPrescription[] {

    return this.getPrescriptionsByStatus(
      'Waiting'
    );

  }


  getPreparingPrescriptions():
    PharmacyPrescription[] {

    return this.getPrescriptionsByStatus(
      'Preparing'
    );

  }


  getAwaitingPayment():
    PharmacyPrescription[] {

    return this.getPrescriptionsByStatus(
      'Awaiting Payment'
    );

  }


  getPaidPrescriptions():
    PharmacyPrescription[] {

    return this.getPrescriptionsByStatus(
      'Paid'
    );

  }


  getReadyForPickup():
    PharmacyPrescription[] {

    return this.getPrescriptionsByStatus(
      'Ready for Pickup'
    );

  }


  getDispensedPrescriptions():
    PharmacyPrescription[] {

    return this.getPrescriptionsByStatus(
      'Dispensed'
    );

  }


  // =====================================================
  // MEDICINE METHODS
  // =====================================================

  getMedicines(): Medicine[] {

    return this.inventoryService
      .getItems()
      .filter(
        item =>
          item.category === 'Medicine'
      )
      .map(
        item =>
          this.mapInventoryToMedicine(
            item
          )
      );

  }


  getMedicineById(
    id: string
  ): Medicine | undefined {

    const item =
      this.inventoryService.getItemById(
        id
      );


    if (
      !item ||
      item.category !== 'Medicine'
    ) {

      return undefined;

    }


    return this.mapInventoryToMedicine(
      item
    );

  }


  getAvailableMedicines():
    Medicine[] {

    return this.getMedicines().filter(
      medicine =>
        medicine.quantity > 0 &&
        medicine.status !== 'Expired'
    );

  }


  getLowStockMedicines():
    Medicine[] {

    return this.getMedicines().filter(
      medicine =>
        medicine.status === 'Low Stock'
    );

  }


  getExpiredMedicines():
    Medicine[] {

    return this.getMedicines().filter(
      medicine =>
        medicine.status === 'Expired'
    );

  }


  // =====================================================
  // MAP INVENTORY ITEM TO MEDICINE
  // =====================================================

  private mapInventoryToMedicine(
    item: InventoryItem
  ): Medicine {

    return {

      id:
        item.id,

      name:
        item.itemName,

      genericName:
        item.itemName,

      category:
        item.category,

      form:
        this.getMedicineForm(
          item
        ),

      strength:
        'Not specified',

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
        this.calculateStatusFromInventory(
          item
        ),

      description:
        item.description,

      createdAt:
        item.createdAt,

      updatedAt:
        item.updatedAt

    };

  }


  // =====================================================
  // GET MEDICINE FORM
  // =====================================================

  private getMedicineForm(
    item: InventoryItem
  ): MedicineForm {

    switch (
      item.unit
    ) {

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
  // CALCULATE STATUS FROM INVENTORY
  // =====================================================

  private calculateStatusFromInventory(
    item: InventoryItem
  ): MedicineStatus {

    // ---------------------------------------------------
    // EXPIRY
    // ---------------------------------------------------

    if (
      item.expiryDate
    ) {

      const expiry =
        new Date(
          item.expiryDate
        );


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


      if (
        expiry < today
      ) {

        return 'Expired';

      }

    }


    // ---------------------------------------------------
    // OUT OF STOCK
    // ---------------------------------------------------

    if (
      item.quantity <= 0
    ) {

      return 'Out of Stock';

    }


    // ---------------------------------------------------
    // LOW STOCK
    // ---------------------------------------------------

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

    if (
      medicine.expiryDate
    ) {

      const expiry =
        new Date(
          medicine.expiryDate
        );


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


      if (
        expiry < today
      ) {

        return 'Expired';

      }

    }


    if (
      medicine.quantity <= 0
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
  // STOCK IN
  // =====================================================

  stockIn(
    medicineId: string,
    quantity: number,
    reason?: string,
    reference?: string,
    performedBy?: string
  ): boolean {

    return this.inventoryService.stockIn(
      medicineId,
      quantity,
      reason,
      reference,
      performedBy
    );

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


    return this.inventoryService.adjustStock(
      medicineId,
      newQuantity,
      'Pharmacy stock adjustment',
      medicine.batchNumber,
      'Pharmacy'
    );

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

    return this.inventoryService.stockOut(
      medicineId,
      quantity,
      reason,
      reference,
      performedBy
    );

  }


  // =====================================================
  // DISPENSE MEDICINE
  // =====================================================

  dispenseMedicine(
    medicineId: string,
    quantity: number,
    reason =
      'Pharmacy dispensing',
    reference?: string,
    performedBy =
      'Pharmacist'
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


    return this.inventoryService.stockOut(
      medicineId,
      quantity,
      reason,
      reference,
      performedBy
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
  ): PharmacyPrescription | null {

    if (
      !data.patientId ||
      !data.patientName ||
      !data.items ||
      data.items.length === 0
    ) {

      return null;

    }


    // ---------------------------------------------------
    // VERIFY MEDICINES
    // ---------------------------------------------------

    for (
      const item of data.items
    ) {

      const medicine =
        this.getMedicineById(
          item.medicineId
        );


      if (!medicine) {

        return null;

      }


      if (
        medicine.status ===
        'Expired'
      ) {

        return null;

      }


      if (
        medicine.quantity <
        item.quantity
      ) {

        return null;

      }

    }


    // ---------------------------------------------------
    // CALCULATE SUBTOTAL
    // ---------------------------------------------------

    const subtotal =
      data.items.reduce(
        (
          total,
          item
        ) =>
          total +
          item.totalPrice,
        0
      );


    // ---------------------------------------------------
    // CREATE PRESCRIPTION
    // ---------------------------------------------------

    const now =
      new Date().toISOString();


    const prescription:
      PharmacyPrescription = {

      id:
        this.generatePrescriptionId(),

      prescriptionNumber:
        this.generatePrescriptionNumber(),

      patientId:
        data.patientId,

      patientName:
        data.patientName,

      patientNumber:
        data.patientNumber,

      consultationId:
        data.consultationId,

      doctorId:
        data.doctorId,

      doctorName:
        data.doctorName,

      items:
        data.items,

      subtotal,

      amountPaid:
        0,

      balance:
        subtotal,

      status:
        'Waiting',

      prescriptionDate:
        now,

      notes:
        data.notes,

      createdAt:
        now

    };


    this.prescriptions.push(
      prescription
    );


    this.savePrescriptions();


    return prescription;

  }


  // =====================================================
  // START PREPARING
  // =====================================================

  startPreparing(
    id: string
  ): boolean {

    const prescription =
      this.getPrescriptionById(
        id
      );


    if (
      !prescription ||
      prescription.status !==
      'Waiting'
    ) {

      return false;

    }


    prescription.status =
      'Preparing';


    prescription.preparedAt =
      new Date().toISOString();


    prescription.updatedAt =
      new Date().toISOString();


    this.savePrescriptions();


    return true;

  }


  // =====================================================
  // SEND TO BILLING
  // =====================================================

  sendToBilling(
    id: string
  ): boolean {

    const prescription =
      this.getPrescriptionById(
        id
      );


    if (
      !prescription ||
      prescription.status !==
      'Preparing'
    ) {

      return false;

    }


    // ===================================================
    // CREATE / UPDATE SHARED PATIENT BILL
    // ===================================================

    let billingRecord:
      ReturnType<
        BillingService['addChargeToPatientBill']
      >;


    for (
      const item of prescription.items
    ) {

      const billItem = {

        id:
          `PHARMACY-${prescription.id}-${item.medicineId}`,

        billingType:
          'Pharmacy' as const,

        description:
          `${item.medicineName} x ${item.quantity} ${item.unit}`,

        quantity:
          item.quantity,

        unitPrice:
          item.unitPrice,

        amount:
          item.totalPrice,

        referenceId:
          prescription.prescriptionNumber

      };


      billingRecord =
        this.billingService
          .addChargeToPatientBill(
            prescription.patientId,
            prescription.patientName,
            billItem,
            {
              patientNumber:
                prescription.patientNumber,

              doctorId:
                prescription.doctorId,

              doctorName:
                prescription.doctorName,

              notes:
                prescription.notes
            }
          );


      if (
        !billingRecord
      ) {

        return false;

      }

    }


    // ===================================================
    // SAVE BILLING REFERENCE
    // ===================================================

    if (
      billingRecord
    ) {

      prescription.billingId =
        billingRecord.id;


      prescription.billingStatus =
        billingRecord.status;

      /*
       * The prescription amount reflects
       * only the pharmacy charges.
       *
       * The bill may contain consultation
       * and laboratory charges as well.
       */

      prescription.amountPaid =
        this.getPharmacyAmountPaid(
          billingRecord,
          prescription
        );


      prescription.balance =
        Math.max(
          0,
          prescription.subtotal -
          prescription.amountPaid
        );

    }


    // ===================================================
    // MOVE TO PAYMENT
    // ===================================================

    prescription.status =
      'Awaiting Payment';


    prescription.updatedAt =
      new Date().toISOString();


    this.savePrescriptions();


    return true;

  }


  // =====================================================
  // CHECK PAYMENT
  // =====================================================

  checkPayment(
    id: string
  ): boolean {

    const prescription =
      this.getPrescriptionById(
        id
      );


    if (
      !prescription ||
      !prescription.billingId
    ) {

      return false;

    }


    const bill =
      this.billingService.getBillById(
        prescription.billingId
      );


    if (!bill) {

      return false;

    }


    // ===================================================
    // GET PHARMACY ITEMS ONLY
    // ===================================================

    const pharmacyAmountPaid =
      this.getPharmacyAmountPaid(
        bill,
        prescription
      );


    prescription.billingStatus =
      bill.status;


    prescription.amountPaid =
      pharmacyAmountPaid;


    prescription.balance =
      Math.max(
        0,
        prescription.subtotal -
        pharmacyAmountPaid
      );


    // ===================================================
    // PHARMACY RELEASE RULE
    // ===================================================
    //
    // Because Pharmacy is part of the combined patient
    // invoice, the medicine is released only when the
    // complete bill has been paid.
    //
    // ===================================================

    if (
      bill.status ===
      'Paid'
    ) {

      prescription.status =
        'Ready for Pickup';


      prescription.paymentDate =
        new Date().toISOString();

    }


    prescription.updatedAt =
      new Date().toISOString();


    this.savePrescriptions();


    return (
      prescription.status ===
      'Ready for Pickup'
    );

  }


  // =====================================================
  // CALCULATE PHARMACY PAYMENT SHARE
  // =====================================================

  private getPharmacyAmountPaid(
    bill: ReturnType<
      BillingService['getBillById']
    >,
    prescription:
      PharmacyPrescription
  ): number {

    if (!bill) {

      return 0;

    }


    const pharmacyItems =
      (bill.items ?? []).filter(
        item => {

          return (
            item.billingType ===
            'Pharmacy' &&

            item.referenceId ===
            prescription.prescriptionNumber
          );

        }
      );


    const pharmacyTotal =
      pharmacyItems.reduce(
        (
          total,
          item
        ) =>
          total +
          item.amount,
        0
      );


    if (
      pharmacyTotal <= 0
    ) {

      return 0;

    }


    // ---------------------------------------------------
    // If the entire invoice is paid, the pharmacy charge
    // is fully paid as well.
    // ---------------------------------------------------

    if (
      bill.status === 'Paid'
    ) {

      return pharmacyTotal;

    }


    // ---------------------------------------------------
    // For a partially paid combined bill we cannot
    // reliably allocate a payment to Pharmacy without
    // an allocation table.
    //
    // Therefore do not mark Pharmacy as paid yet.
    // ---------------------------------------------------

    return 0;

  }


  // =====================================================
  // DISPENSE PRESCRIPTION
  // =====================================================

  dispense(
    id: string,
    dispensedBy =
      'Pharmacist'
  ): boolean {

    const prescription =
      this.getPrescriptionById(
        id
      );


    if (
      !prescription ||
      prescription.status !==
      'Ready for Pickup'
    ) {

      return false;

    }


    // ---------------------------------------------------
    // VERIFY STOCK FIRST
    // ---------------------------------------------------

    for (
      const item of prescription.items
    ) {

      const medicine =
        this.getMedicineById(
          item.medicineId
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
        medicine.quantity <
        item.quantity
      ) {

        return false;

      }

    }


    // ---------------------------------------------------
    // DISPENSE MEDICINES
    // ---------------------------------------------------

    for (
      const item of prescription.items
    ) {

      const success =
        this.dispenseMedicine(
          item.medicineId,
          item.quantity,
          'Prescription dispensing',
          prescription.prescriptionNumber,
          dispensedBy
        );


      if (!success) {

        return false;

      }

    }


    // ---------------------------------------------------
    // COMPLETE PRESCRIPTION
    // ---------------------------------------------------

    prescription.status =
      'Dispensed';


    prescription.dispensedAt =
      new Date().toISOString();


    prescription.dispensedBy =
      dispensedBy;


    prescription.updatedAt =
      new Date().toISOString();


    this.savePrescriptions();


    return true;

  }


  // =====================================================
  // CANCEL PRESCRIPTION
  // =====================================================

  cancelPrescription(
    id: string
  ): boolean {

    const prescription =
      this.getPrescriptionById(
        id
      );


    if (
      !prescription ||
      prescription.status ===
      'Dispensed'
    ) {

      return false;

    }


    prescription.status =
      'Cancelled';


    prescription.updatedAt =
      new Date().toISOString();


    this.savePrescriptions();


    return true;

  }


  // =====================================================
  // DASHBOARD COUNTS
  // =====================================================

  getWaitingCount(): number {

    return this.getWaitingPrescriptions()
      .length;

  }


  getPreparingCount(): number {

    return this.getPreparingPrescriptions()
      .length;

  }


  getAwaitingPaymentCount(): number {

    return this.getAwaitingPayment()
      .length;

  }


  getReadyForPickupCount(): number {

    return this.getReadyForPickup()
      .length;

  }


  getDispensedCount(): number {

    return this.getDispensedPrescriptions()
      .length;

  }


  // =====================================================
  // GENERATE PRESCRIPTION ID
  // =====================================================

  private generatePrescriptionId():
    string {

    return (
      'RX-' +
      Date.now().toString()
    );

  }


  // =====================================================
  // GENERATE PRESCRIPTION NUMBER
  // =====================================================

  private generatePrescriptionNumber():
    string {

    return (
      'RX-' +
      new Date().getFullYear() +
      '-' +
      Math.floor(
        10000 +
        Math.random() * 90000
      )
    );

  }


  // =====================================================
  // SAVE PRESCRIPTIONS
  // =====================================================

  private savePrescriptions(): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(
        this.prescriptions
      )
    );

  }


  // =====================================================
  // LOAD PRESCRIPTIONS
  // =====================================================

  private loadPrescriptions(): void {

    const stored =
      localStorage.getItem(
        this.storageKey
      );


    if (!stored) {

      this.prescriptions = [];

      return;

    }


    try {

      const parsed =
        JSON.parse(
          stored
        );


      this.prescriptions =
        Array.isArray(parsed)
          ? parsed
          : [];

    }

    catch (error) {

      console.error(
        'Failed to load pharmacy prescriptions:',
        error
      );


      this.prescriptions = [];

    }

  }

}
