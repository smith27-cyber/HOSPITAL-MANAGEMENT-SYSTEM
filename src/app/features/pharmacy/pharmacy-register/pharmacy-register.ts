import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Medicine,
  MedicineForm
} from '../../../shared/models/medicine.model';

import { PharmacyService } from '../../../core/services/pharmacy.service';


@Component({
  selector: 'app-pharmacy-register',

  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl: './pharmacy-register.html',

  styleUrl: './pharmacy-register.css'
})
export class PharmacyRegister {


  // =====================================================
  // MEDICINE FORMS
  // =====================================================

  medicineForms: MedicineForm[] = [

    'Tablet',
    'Capsule',
    'Syrup',
    'Injection',
    'Cream',
    'Ointment',
    'Drops',
    'Inhaler',
    'Other'

  ];


  // =====================================================
  // CATEGORIES
  // =====================================================

  categories: string[] = [

    'Analgesics',
    'Antibiotics',
    'Antimalarials',
    'Antihypertensives',
    'Antidiabetics',
    'Antihistamines',
    'Antacids',
    'Antiseptics',
    'Vitamins & Supplements',
    'Respiratory',
    'Cardiovascular',
    'Gastrointestinal',
    'Dermatological',
    'Other'

  ];


  // =====================================================
  // MEDICINE
  // =====================================================

  medicine: Medicine = {

    id: '',

    name: '',

    genericName: '',

    category: '',

    form: 'Tablet',

    strength: '',

    manufacturer: '',

    batchNumber: '',

    quantity: 0,

    reorderLevel: 10,

    unitPrice: 0,

    expiryDate: '',

    status: 'Available',

    description: '',

    createdAt: ''

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private pharmacyService: PharmacyService,
    private router: Router
  ) {}


  // =====================================================
  // SAVE MEDICINE
  // =====================================================

  saveMedicine(): void {

    // ===================================================
    // CLEAN TEXT VALUES
    // ===================================================

    this.medicine.name =
      this.medicine.name.trim();

    this.medicine.genericName =
      this.medicine.genericName.trim();

    this.medicine.category =
      this.medicine.category.trim();

    this.medicine.strength =
      this.medicine.strength.trim();

    this.medicine.manufacturer =
      this.medicine.manufacturer.trim();

    this.medicine.batchNumber =
      this.medicine.batchNumber.trim();

    this.medicine.description =
      this.medicine.description?.trim();


    // ===================================================
    // VALIDATION
    // ===================================================

    const missingFields: string[] = [];


    if (!this.medicine.name) {

      missingFields.push(
        'Medicine Name'
      );

    }


    if (!this.medicine.genericName) {

      missingFields.push(
        'Generic Name'
      );

    }


    if (!this.medicine.category) {

      missingFields.push(
        'Category'
      );

    }


    if (!this.medicine.form) {

      missingFields.push(
        'Dosage Form'
      );

    }


    if (!this.medicine.strength) {

      missingFields.push(
        'Strength'
      );

    }


    if (!this.medicine.manufacturer) {

      missingFields.push(
        'Manufacturer'
      );

    }


    if (!this.medicine.batchNumber) {

      missingFields.push(
        'Batch Number'
      );

    }


    if (!this.medicine.expiryDate) {

      missingFields.push(
        'Expiry Date'
      );

    }


    if (this.medicine.quantity < 0) {

      missingFields.push(
        'Valid Quantity'
      );

    }


    if (this.medicine.reorderLevel < 0) {

      missingFields.push(
        'Valid Reorder Level'
      );

    }


    if (this.medicine.unitPrice < 0) {

      missingFields.push(
        'Valid Unit Price'
      );

    }


    // ===================================================
    // SHOW VALIDATION ERRORS
    // ===================================================

    if (missingFields.length > 0) {

      alert(
        'Please complete the following fields:\n\n' +
        missingFields.join('\n')
      );

      return;

    }


    // ===================================================
    // VALIDATE EXPIRY DATE
    // ===================================================

    const expiryDate =
      new Date(
        this.medicine.expiryDate
      );


    if (
      isNaN(
        expiryDate.getTime()
      )
    ) {

      alert(
        'Please enter a valid expiry date.'
      );

      return;

    }


    // ===================================================
    // PREVENT EXPIRED MEDICINE
    // ===================================================

    const today =
      new Date();


    today.setHours(
      0,
      0,
      0,
      0
    );


    expiryDate.setHours(
      0,
      0,
      0,
      0
    );


    if (
      expiryDate < today
    ) {

      alert(
        'The medicine expiry date cannot be in the past.'
      );

      return;

    }


    // ===================================================
    // CHECK DUPLICATE BATCH NUMBER
    // ===================================================

    const existingMedicine =
      this.pharmacyService
        .getMedicines()
        .find(
          medicine =>
            medicine.batchNumber
              .toLowerCase() ===
            this.medicine.batchNumber
              .toLowerCase()
        );


    if (existingMedicine) {

      alert(
        'A medicine with this batch number already exists.'
      );

      return;

    }


    // ===================================================
    // GENERATE ID
    // ===================================================

    this.medicine.id =
      this.generateMedicineId();


    // ===================================================
    // CREATED DATE
    // =====================================================

    this.medicine.createdAt =
      new Date().toISOString();


    // ===================================================
    // CALCULATE STATUS
    // ===================================================

    this.medicine.status =
      this.pharmacyService
        .calculateStatus(
          this.medicine
        );


    // ===================================================
    // SAVE
    // ===================================================

    this.pharmacyService.addMedicine({

      ...this.medicine

    });


    // ===================================================
    // SUCCESS
    // ===================================================

    alert(
      'Medicine registered successfully.'
    );


    // ===================================================
    // RETURN TO PHARMACY
    // ===================================================

    this.router.navigate([
      '/pharmacy'
    ]);

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/pharmacy'
    ]);

  }


  // =====================================================
  // GENERATE MEDICINE ID
  // =====================================================

  private generateMedicineId(): string {

    const timestamp =
      Date.now()
        .toString()
        .slice(-7);


    return `MED-${timestamp}`;

  }

}
