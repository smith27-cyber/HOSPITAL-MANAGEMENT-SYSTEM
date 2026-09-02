import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  LaboratoryRequest,
  LaboratoryTest
} from '../../../../shared/models/laboratory.model';

import {
  LaboratoryService
} from '../../../../core/services/laboratory.service';


@Component({
  selector: 'app-laboratory-request-form',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './laboratory-request-form.html',

  styleUrl: './laboratory-request-form.css'
})
export class LaboratoryRequestForm implements OnInit {


  // =====================================================
  // EDIT MODE
  // =====================================================

  isEditMode = false;

  editingId: number | null = null;


  // =====================================================
  // LABORATORY TESTS
  // =====================================================

  tests: LaboratoryTest[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = false;

  isSaving = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // REQUEST
  // =====================================================

  request: LaboratoryRequest = {

    patientId: '',

    patientName: '',

    doctorId: '',

    doctorName: '',

    testId: 0,

    testName: '',

    category: 'Hematology',

    sampleType: 'Blood',

    status: 'Pending',

    result: '',

    notes: '',

    price: 0,

    requestedAt: ''

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private laboratoryService:
      LaboratoryService,

    private route:
      ActivatedRoute,

    private router:
      Router,

    private cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadTests();


    const id =
      this.route.snapshot
        .paramMap
        .get('id');


    // ===================================================
    // CREATE MODE
    // ===================================================

    if (!id) {

      /*
       * Make sure the initial form is rendered
       * immediately.
       */
      this.cdr.detectChanges();

      return;

    }


    // ===================================================
    // CONVERT ID
    // ===================================================

    const numericId =
      Number(id);


    // ===================================================
    // VALIDATE ID
    // ===================================================

    if (
      !Number.isInteger(numericId) ||
      numericId <= 0
    ) {

      alert(
        'Invalid laboratory request ID.'
      );

      this.router.navigate([
        '/laboratory/requests'
      ]);

      return;

    }


    // ===================================================
    // EDIT MODE
    // ===================================================

    this.isEditMode = true;

    this.editingId = numericId;


    /*
     * Immediately notify Angular that edit mode
     * has changed.
     */
    this.cdr.detectChanges();


    // ===================================================
    // LOAD REQUEST
    // ===================================================

    this.loadRequest(
      numericId
    );

  }


  // =====================================================
  // LOAD LABORATORY TESTS
  // =====================================================

  private loadTests(): void {

    this.isLoading = true;

    this.errorMessage = '';


    /*
     * Update the UI immediately so the loading
     * state is reflected before the HTTP request.
     */
    this.cdr.detectChanges();


    this.laboratoryService
      .getTests()
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next:
          (tests: LaboratoryTest[]) => {

            /*
             * Normalize the response.
             */
            this.tests =
              Array.isArray(tests)
                ? [...tests]
                : [];


            /*
             * Tests have now been received.
             */
            this.isLoading = false;


            /*
             * IMPORTANT:
             *
             * Force Angular to immediately render
             * the received laboratory tests.
             */
            this.cdr.detectChanges();


            console.log(
              'Laboratory tests loaded:',
              this.tests
            );

          },


        // =================================================
        // ERROR
        // =================================================

        error:
          (error: unknown) => {

            console.error(
              'Failed to load laboratory tests:',
              error
            );


            this.tests = [];

            this.isLoading = false;


            this.errorMessage =
              'Unable to load laboratory tests.';


            /*
             * Force error state to render immediately.
             */
            this.cdr.detectChanges();


            alert(
              'Unable to load laboratory tests.'
            );

          }

      });

  }


  // =====================================================
  // LOAD EXISTING REQUEST
  // =====================================================

  private loadRequest(
    id: number
  ): void {

    this.isLoading = true;

    this.errorMessage = '';


    /*
     * Immediately update loading state.
     */
    this.cdr.detectChanges();


    this.laboratoryService
      .getRequestById(id)
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next:
          (
            existing:
              LaboratoryRequest | undefined
          ) => {

            // =============================================
            // REQUEST NOT FOUND
            // =============================================

            if (!existing) {

              this.isLoading = false;

              this.cdr.detectChanges();


              alert(
                'Laboratory request could not be found.'
              );


              this.router.navigate([
                '/laboratory/requests'
              ]);


              return;

            }


            // =============================================
            // LOAD REQUEST DATA
            // =============================================

            this.request = {

              ...existing,

              id:
                Number(existing.id),

              patientId:
                String(
                  existing.patientId ?? ''
                ),

              patientName:
                String(
                  existing.patientName ?? ''
                ),

              doctorId:
                String(
                  existing.doctorId ?? ''
                ),

              doctorName:
                String(
                  existing.doctorName ?? ''
                ),

              testId:
                Number(
                  existing.testId || 0
                ),

              testName:
                String(
                  existing.testName ?? ''
                ),

              category:
                existing.category ||
                'Hematology',

              sampleType:
                existing.sampleType ||
                'Blood',

              status:
                existing.status ||
                'Pending',

              result:
                String(
                  existing.result ?? ''
                ),

              notes:
                String(
                  existing.notes ?? ''
                ),

              price:
                Number(
                  existing.price || 0
                ),

              requestedAt:
                existing.requestedAt || ''

            };


            // =============================================
            // FINISH LOADING
            // =============================================

            this.isLoading = false;


            /*
             * IMPORTANT:
             *
             * Force Angular to render the loaded
             * laboratory request immediately.
             */
            this.cdr.detectChanges();


            console.log(
              'Laboratory request loaded:',
              this.request
            );


            // =============================================
            // SYNCHRONIZE SELECTED TEST
            // =============================================

            if (
              this.tests.length > 0 &&
              this.request.testId > 0
            ) {

              this.testSelected();

              /*
               * Render the synchronized test values.
               */
              this.cdr.detectChanges();

            }

          },


        // =================================================
        // ERROR
        // =================================================

        error:
          (error: unknown) => {

            console.error(
              'Failed to load laboratory request:',
              error
            );


            this.isLoading = false;


            this.errorMessage =
              'Unable to load laboratory request.';


            /*
             * Force Angular to display the error state.
             */
            this.cdr.detectChanges();


            alert(
              'Unable to load laboratory request.'
            );


            this.router.navigate([
              '/laboratory/requests'
            ]);

          }

      });

  }


  // =====================================================
  // TEST SELECTED
  // =====================================================

  testSelected(): void {

    const testId =
      Number(
        this.request.testId
      );


    // ===================================================
    // INVALID TEST
    // ===================================================

    if (
      !Number.isInteger(testId) ||
      testId <= 0
    ) {

      this.request.testId = 0;

      this.request.testName = '';

      this.request.category =
        'Hematology';

      this.request.sampleType =
        'Blood';

      this.request.price = 0;


      this.cdr.detectChanges();

      return;

    }


    // ===================================================
    // FIND SELECTED TEST
    // ===================================================

    const selected =
      this.tests.find(
        (
          test: LaboratoryTest
        ) =>
          Number(test.id) ===
          testId
      );


    // ===================================================
    // TEST NOT YET AVAILABLE
    // ===================================================

    if (!selected) {

      return;

    }


    // ===================================================
    // COPY SELECTED TEST INFORMATION
    // ===================================================

    this.request.testId =
      Number(selected.id);

    this.request.testName =
      selected.testName;

    this.request.category =
      selected.category;

    this.request.sampleType =
      selected.sampleType;

    this.request.price =
      Number(
        selected.price || 0
      );


    /*
     * Force the dropdown and dependent fields
     * to update immediately.
     */
    this.cdr.detectChanges();

  }


  // =====================================================
  // SAVE REQUEST
  // =====================================================

  saveRequest(): void {

    // ===================================================
    // PREVENT DOUBLE SAVE
    // ===================================================

    if (this.isSaving) {

      return;

    }


    // ===================================================
    // CLEAN TEXT
    // ===================================================

    this.request.patientId =
      String(
        this.request.patientId ?? ''
      ).trim();


    this.request.patientName =
      String(
        this.request.patientName ?? ''
      ).trim();


    this.request.doctorId =
      this.request.doctorId
        ? String(
            this.request.doctorId
          ).trim()
        : '';


    this.request.doctorName =
      this.request.doctorName
        ? String(
            this.request.doctorName
          ).trim()
        : '';


    this.request.result =
      this.request.result
        ? String(
            this.request.result
          ).trim()
        : '';


    this.request.notes =
      this.request.notes
        ? String(
            this.request.notes
          ).trim()
        : '';


    // ===================================================
    // NORMALIZE NUMERIC VALUES
    // ===================================================

    this.request.testId =
      Number(
        this.request.testId || 0
      );


    this.request.price =
      Number(
        this.request.price || 0
      );


    // ===================================================
    // VALIDATION
    // ===================================================

    const missingFields: string[] = [];


    if (
      !this.request.patientId
    ) {

      missingFields.push(
        'Patient ID'
      );

    }


    if (
      !this.request.patientName
    ) {

      missingFields.push(
        'Patient Name'
      );

    }


    if (
      !Number.isInteger(
        this.request.testId
      ) ||
      this.request.testId <= 0
    ) {

      missingFields.push(
        'Laboratory Test'
      );

    }


    if (
      !this.request.testName
    ) {

      missingFields.push(
        'Laboratory Test Name'
      );

    }


    if (
      !this.request.category
    ) {

      missingFields.push(
        'Laboratory Category'
      );

    }


    if (
      !this.request.sampleType
    ) {

      missingFields.push(
        'Sample Type'
      );

    }


    if (
      !Number.isFinite(
        this.request.price
      ) ||
      this.request.price < 0
    ) {

      missingFields.push(
        'Valid Price'
      );

    }


    // ===================================================
    // DISPLAY VALIDATION ERRORS
    // ===================================================

    if (
      missingFields.length > 0
    ) {

      alert(
        'Please complete the following fields:\n\n' +
        missingFields.join('\n')
      );


      this.cdr.detectChanges();

      return;

    }


    // ===================================================
    // EDIT EXISTING REQUEST
    // ===================================================

    if (this.isEditMode) {

      // ===============================================
      // VALIDATE EDITING ID
      // ===============================================

      if (
        this.editingId === null ||
        !Number.isInteger(
          this.editingId
        ) ||
        this.editingId <= 0
      ) {

        alert(
          'Invalid laboratory request ID.'
        );

        return;

      }


      // ===============================================
      // BUILD UPDATED REQUEST
      // ===============================================

      const updatedRequest:
        LaboratoryRequest = {

        ...this.request,

        id:
          this.editingId,

        testId:
          Number(
            this.request.testId
          ),

        price:
          Number(
            this.request.price
          )

      };


      // ===============================================
      // START SAVING
      // ===============================================

      this.isSaving = true;

      this.cdr.detectChanges();


      // ===============================================
      // UPDATE REQUEST
      // ===============================================

      this.laboratoryService
        .updateRequest(
          updatedRequest
        )
        .subscribe({

          // =============================================
          // SUCCESS
          // =============================================

          next:
            (
              savedRequest:
                LaboratoryRequest
            ) => {

              console.log(
                'Laboratory request updated:',
                savedRequest
              );


              this.isSaving = false;

              this.cdr.detectChanges();


              alert(
                'Laboratory request updated successfully.'
              );


              this.router.navigate([
                '/laboratory/requests'
              ]);

            },


          // =============================================
          // ERROR
          // =============================================

          error:
            (error: unknown) => {

              console.error(
                'Failed to update laboratory request:',
                error
              );


              this.isSaving = false;


              this.cdr.detectChanges();


              alert(
                'Unable to update laboratory request.'
              );

            }

        });


      return;

    }


    // ===================================================
    // CREATE NEW REQUEST
    // ===================================================
    //
    // IMPORTANT:
    //
    // DO NOT SEND AN ID.
    //
    // PostgreSQL generates the numeric ID.
    //
    // ===================================================

    const newRequest = {

      patientId:
        this.request.patientId,

      patientName:
        this.request.patientName,

      doctorId:
        this.request.doctorId ||
        undefined,

      doctorName:
        this.request.doctorName ||
        undefined,

      testId:
        Number(
          this.request.testId
        ),

      testName:
        this.request.testName,

      category:
        this.request.category,

      sampleType:
        this.request.sampleType,

      status:
        'Pending' as const,

      result:
        this.request.result ||
        undefined,

      notes:
        this.request.notes ||
        undefined,

      price:
        Number(
          this.request.price
        ),

      requestedAt:
        new Date().toISOString()

    };


    // ===================================================
    // START SAVING
    // ===================================================

    this.isSaving = true;

    this.cdr.detectChanges();


    // ===================================================
    // SAVE TO SPRING BOOT
    // ===================================================

    this.laboratoryService
      .addRequest(
        newRequest
      )
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next:
          (
            createdRequest:
              LaboratoryRequest
            ) => {

            console.log(
              'Laboratory request created:',
              createdRequest
            );


            this.isSaving = false;

            this.cdr.detectChanges();


            alert(
              'Laboratory request created successfully.'
            );


            this.router.navigate([
              '/laboratory/requests'
            ]);

          },


        // =================================================
        // ERROR
        // =================================================

        error:
          (error: unknown) => {

            console.error(
              'Failed to create laboratory request:',
              error
            );


            this.isSaving = false;

            this.cdr.detectChanges();


            alert(
              'Unable to create laboratory request.'
            );

          }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/laboratory/requests'
    ]);

  }

}