import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Medicine,
  MedicineForm
} from '../../../shared/models/medicine.model';

import { PharmacyService } from '../../../core/services/pharmacy.service';


@Component({
  selector: 'app-pharmacy-edit',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './pharmacy-edit.html',

  styleUrl: './pharmacy-edit.css'
})
export class PharmacyEdit implements OnInit {


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

  medicine: Medicine | null = null;


  // =====================================================
  // LOADING
  // =====================================================

  loading = true;


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


    const medicine =
      this.pharmacyService
        .getMedicineById(id);


    if (!medicine) {

      alert(
        'Medicine not found.'
      );

      this.router.navigate([
        '/pharmacy'
      ]);

      return;

    }


    /*
     * Create a copy so changes are not
     * immediately applied to the service
     * before the user clicks Save.
     */

    this.medicine = {
      ...medicine
    };


    this.loading = false;

  }


  // =====================================================
  // SAVE CHANGES
  // =====================================================

  saveChanges(): void {

    if (!this.medicine) {

      return;

    }


    // ===================================================
    // CLEAN TEXT
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
    // UPDATE MEDICINE
    // ===================================================

    const updated =
      this.pharmacyService
        .updateMedicine(
          this.medicine
        );


    if (!updated) {

      alert(
        'Unable to update medicine.'
      );

      return;

    }


    // ===================================================
    // SUCCESS
    // ===================================================

    alert(
      'Medicine updated successfully.'
    );


    // ===================================================
    // RETURN TO PHARMACY
    // =====================================================

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

}
