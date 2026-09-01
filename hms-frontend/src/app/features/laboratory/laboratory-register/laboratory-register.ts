

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

  /*
   * LaboratoryTest.id is a PostgreSQL numeric ID.
   *
   * null means that we are registering a new test.
   */
  editingId: number | null = null;


  // =====================================================
  // CATEGORIES
  // =====================================================

  categories: LaboratoryCategory[] = [

    'Hematology',
    'Chemistry',
    'Biochemistry',
    'Microbiology',
    'Parasitology',
    'Serology',
    'Urinalysis',
    'Immunology',
    'Blood Bank',
    'Pathology',
    'Molecular',
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
    'Serum',
    'Plasma',
    'Saliva',
    'Tissue',
    'Other'

  ];


  // =====================================================
  // LABORATORY TEST
  // =====================================================

  /*
   * ID is 0 for a new test.
   *
   * PostgreSQL/Spring Boot should generate the real ID
   * when the test is saved.
   */
  test: LaboratoryTest = {

    id: 0,

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


    if (!id) {

      return;

    }


    /*
     * Route parameters are strings.
     *
     * LaboratoryTest IDs are numbers.
     */
    const numericId =
      Number(id);


    if (
      !Number.isInteger(numericId) ||
      numericId <= 0
    ) {

      alert(
        'Invalid laboratory test ID.'
      );

      this.router.navigate([
        '/laboratory'
      ]);

      return;

    }


    this.isEditMode = true;

    this.editingId = numericId;

    this.loadTest(numericId);

  }


  // =====================================================
  // LOAD TEST FOR EDITING
  // =====================================================

  private loadTest(id: number): void {

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


          /*
           * Make a copy so the form does not directly
           * modify the object returned by the service.
           */
          this.test = {

            ...existingTest,

            id: Number(
              existingTest.id
            )

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
    // NORMALIZE PRICE
    // ===================================================

    this.test.price =
      Number(
        this.test.price || 0
      );


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
      !Number.isFinite(
        this.test.price
      ) ||
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


      // -------------------------------------------------
      // MAKE SURE EDITING ID EXISTS
      // -------------------------------------------------

      if (
        this.editingId === null
      ) {

        alert(
          'The laboratory test ID is missing.'
        );

        return;

      }


      // -------------------------------------------------
      // BUILD UPDATED TEST
      // -------------------------------------------------

      const updatedTest:
        LaboratoryTest = {

        ...this.test,

        id:
          this.editingId,

        updatedAt:
          new Date().toISOString()

      };


      // -------------------------------------------------
      // UPDATE
      // -------------------------------------------------

      const updated =
        this.laboratoryService
          .updateTest(
            updatedTest
          );


      // -------------------------------------------------
      // CHECK RESULT
      // -------------------------------------------------

      if (!updated) {

        alert(
          'Unable to update laboratory test.'
        );

        return;

      }


      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

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

    /*
     * IMPORTANT:
     *
     * Do NOT generate a string such as:
     *
     * LAB-1234567
     *
     * LaboratoryTest.id is a number because the backend
     * uses a PostgreSQL Long ID.
     *
     * Keep the frontend ID at 0 for a new record.
     * Spring Boot/PostgreSQL should generate the real ID.
     */

    const newTest:
      LaboratoryTest = {

      ...this.test,

      id: 0,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        undefined

    };


    // ===================================================
    // SAVE NEW TEST
    // ===================================================

    this.laboratoryService
      .addTest({
        ...newTest
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

}

