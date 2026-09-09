// =====================================================
// LABORATORY REGISTER COMPONENT
// File:
// src/app/features/laboratory/laboratory-register/laboratory-register.ts
// =====================================================

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import {
  LaboratoryTest,
  LaboratoryCategory,
  SampleType
} from '../../../shared/models/laboratory.model';

import {
  LaboratoryService
} from '../../../core/services/laboratory.service';


@Component({
  selector: 'app-laboratory-register',

  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl: './laboratory-register.html',

  styleUrl: './laboratory-register.css'
})
export class LaboratoryRegister implements OnInit {


  // =====================================================
  // EDIT MODE
  // =====================================================

  isEditMode = false;

  editingId = '';


  // =====================================================
  // CATEGORIES
  // =====================================================

  categories: LaboratoryCategory[] = [

    'Hematology',
    'Biochemistry',
    'Microbiology',
    'Parasitology',
    'Serology',
    'Urinalysis',
    'Immunology',
    'Pathology',
    'Other'

  ];


  // =====================================================
  // SAMPLE TYPES
  // =====================================================

  sampleTypes: SampleType[] = [

    'Blood',
    'Urine',
    'Stool',
    'Sputum',
    'Swab',
    'Saliva',
    'Tissue',
    'Other'

  ];


  // =====================================================
  // LABORATORY TEST
  // =====================================================

  test: LaboratoryTest = {

    id: '',

    testName: '',

    category: 'Hematology',

    sampleType: 'Blood',

    description: '',

    price: 0,

    normalRange: '',

    preparationInstructions: '',

    createdAt: ''

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private laboratoryService: LaboratoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (id) {

      this.isEditMode = true;

      this.editingId = id;

      this.loadTest(id);

    }

  }


  // =====================================================
  // LOAD TEST FOR EDITING
  // =====================================================

  private loadTest(id: string): void {

    this.laboratoryService
      .getTestById(id)
      .subscribe({

        next: (
          existingTest: LaboratoryTest | undefined
        ) => {

          if (!existingTest) {

            alert(
              'Laboratory test could not be found.'
            );

            this.router.navigate([
              '/laboratory'
            ]);

            return;

          }


          this.test = {
            ...existingTest
          };

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load laboratory test:',
            error
          );

          alert(
            'Unable to load laboratory test.'
          );

          this.router.navigate([
            '/laboratory'
          ]);

        }

      });

  }


  // =====================================================
  // SAVE TEST
  // =====================================================

  saveTest(): void {

    // ===================================================
    // CLEAN TEXT
    // ===================================================

    this.test.testName =
      this.test.testName.trim();

    this.test.normalRange =
      this.test.normalRange?.trim();

    this.test.preparationInstructions =
      this.test.preparationInstructions?.trim();

    this.test.description =
      this.test.description?.trim();


    // ===================================================
    // VALIDATION
    // ===================================================

    const missingFields: string[] = [];


    if (!this.test.testName) {

      missingFields.push(
        'Test Name'
      );

    }


    if (!this.test.category) {

      missingFields.push(
        'Category'
      );

    }


    if (!this.test.sampleType) {

      missingFields.push(
        'Sample Type'
      );

    }


    if (
      this.test.price === null ||
      this.test.price === undefined ||
      this.test.price < 0
    ) {

      missingFields.push(
        'Valid Price'
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
    // EDIT EXISTING TEST
    // ===================================================

    if (this.isEditMode) {

      const updatedTest: LaboratoryTest = {

        ...this.test,

        id: this.editingId,

        updatedAt:
          new Date().toISOString()

      };


      const updated =
        this.laboratoryService.updateTest(
          updatedTest
        );


      if (!updated) {

        alert(
          'Unable to update laboratory test.'
        );

        return;

      }


      alert(
        'Laboratory test updated successfully.'
      );


      this.router.navigate([
        '/laboratory'
      ]);

      return;

    }


    // ===================================================
    // REGISTER NEW TEST
    // ===================================================

    this.test.id =
      this.generateTestId();


    this.test.createdAt =
      new Date().toISOString();


    this.laboratoryService.addTest({

      ...this.test

    });


    // ===================================================
    // SUCCESS
    // ===================================================

    alert(
      'Laboratory test registered successfully.'
    );


    // ===================================================
    // RETURN TO LABORATORY
    // ===================================================

    this.router.navigate([
      '/laboratory'
    ]);

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/laboratory'
    ]);

  }


  // =====================================================
  // GENERATE TEST ID
  // =====================================================

  private generateTestId(): string {

    const timestamp =
      Date.now()
        .toString()
        .slice(-7);


    return `LAB-${timestamp}`;

  }

}