// =====================================================
// ADMISSION EDIT COMPONENT
// File:
// src/app/features/admissions/admission-edit/admission-edit.ts
// =====================================================

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
  Admission,
  AdmissionStatus,
  AdmissionType,
  WardType
} from '../../../shared/models/admission.model';

import {
  AdmissionService
} from '../../../core/services/admission.service';


@Component({
  selector: 'app-admission-edit',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admission-edit.html',

  styleUrl: './admission-edit.css'
})
export class AdmissionEdit implements OnInit {


  // =====================================================
  // ADMISSION
  // =====================================================

  admission: Admission | null = null;


  // =====================================================
  // LOADING
  // =====================================================

  loading = true;


  // =====================================================
  // SAVING
  // =====================================================

  saving = false;


  // =====================================================
  // OPTIONS
  // =====================================================

  admissionTypes: AdmissionType[] = [

    'EMERGENCY',
    'ROUTINE',
    'REFERRAL',
    'SURGICAL',
    'MATERNITY',
    'OTHER'

  ];


  wards: WardType[] = [

    'GENERAL',
    'PRIVATE',
    'PEDIATRIC',
    'MATERNITY',
    'SURGICAL',
    'ICU',
    'EMERGENCY',
    'OTHER'

  ];


  statuses: AdmissionStatus[] = [

    'ADMITTED',
    'DISCHARGED',
    'TRANSFERRED',
    'CANCELLED'

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly admissionService: AdmissionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {

      alert(
        'Admission ID was not provided.'
      );

      this.router.navigate([
        '/admissions'
      ]);

      return;

    }


    this.loadAdmission(id);

  }


  // =====================================================
  // LOAD ADMISSION
  // =====================================================

  private loadAdmission(
    id: string
  ): void {

    this.loading = true;

    this.admission = null;


    // ---------------------------------------------------
    // Render loading state immediately
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();


    this.admissionService
      .getAdmissionById(id)
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (
          existingAdmission: Admission
        ) => {

          console.log(
            'AdmissionEdit: admission received:',
            existingAdmission
          );


          this.admission = {
            ...existingAdmission
          };


          this.loading = false;


          this.changeDetectorRef.detectChanges();


          console.log(
            'AdmissionEdit: admission rendered:',
            this.admission
          );

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (
          error: Error
        ) => {

          console.error(
            'Failed to load admission:',
            error
          );


          this.admission = null;

          this.loading = false;


          this.changeDetectorRef.detectChanges();


          alert(
            error.message ||
            'Admission could not be found.'
          );


          this.router.navigate([
            '/admissions'
          ]);

        }

      });

  }


  // =====================================================
  // CHECK WHETHER ADMISSION CAN BE EDITED
  // =====================================================

  canEdit(): boolean {

    if (!this.admission) {

      return false;

    }


    return (
      this.admission.status !== 'DISCHARGED' &&
      this.admission.status !== 'CANCELLED'
    );

  }


  // =====================================================
  // SAVE
  // =====================================================

  saveAdmission(): void {

    if (
      !this.admission ||
      this.saving ||
      !this.canEdit()
    ) {

      return;

    }


    // ===================================================
    // CLEAN TEXT
    // ===================================================

    this.admission.patientId =
      this.admission.patientId
        ?.trim() ?? '';

    this.admission.patientName =
      this.admission.patientName
        ?.trim() ?? '';

    this.admission.patientNumber =
      this.admission.patientNumber
        ?.trim();

    this.admission.doctorId =
      this.admission.doctorId
        ?.trim();

    this.admission.doctorName =
      this.admission.doctorName
        ?.trim();

    this.admission.departmentId =
      this.admission.departmentId
        ?.trim();

    this.admission.departmentName =
      this.admission.departmentName
        ?.trim();

    this.admission.bedNumber =
      this.admission.bedNumber
        ?.trim();

    this.admission.reason =
      this.admission.reason
        ?.trim() ?? '';

    this.admission.diagnosis =
      this.admission.diagnosis
        ?.trim();

    this.admission.notes =
      this.admission.notes
        ?.trim();


    // ===================================================
    // VALIDATION
    // ===================================================

    if (
      !this.admission.patientId
    ) {

      alert(
        'Patient ID is required.'
      );

      return;

    }


    if (
      !this.admission.patientName
    ) {

      alert(
        'Please enter the patient name.'
      );

      return;

    }


    if (
      !this.admission.ward
    ) {

      alert(
        'Please select a ward.'
      );

      return;

    }


    if (
      !this.admission.admissionType
    ) {

      alert(
        'Please select an admission type.'
      );

      return;

    }


    if (
      !this.admission.admissionDate
    ) {

      alert(
        'Please enter the admission date.'
      );

      return;

    }


    if (
      !this.admission.reason
    ) {

      alert(
        'Please enter the reason for admission.'
      );

      return;

    }


    // ===================================================
    // VALIDATE ADMISSION DATE
    // ===================================================

    const admissionDate =
      new Date(
        this.admission.admissionDate
      );


    if (
      Number.isNaN(
        admissionDate.getTime()
      )
    ) {

      alert(
        'Please enter a valid admission date.'
      );

      return;

    }


    // ===================================================
    // VALIDATE EXPECTED DISCHARGE DATE
    // ===================================================

    if (
      this.admission.expectedDischargeDate
    ) {

      const expectedDate =
        new Date(
          this.admission.expectedDischargeDate
        );


      if (
        Number.isNaN(
          expectedDate.getTime()
        )
      ) {

        alert(
          'Please enter a valid expected discharge date.'
        );

        return;

      }


      if (
        expectedDate < admissionDate
      ) {

        alert(
          'Expected discharge date cannot be before the admission date.'
        );

        return;

      }

    }


    // ===================================================
    // PREPARE UPDATE
    // =====================================================

    const updatedAdmission: Admission = {

      ...this.admission,

      updatedAt: undefined

    };


    // ===================================================
    // START SAVING
    // ===================================================

    this.saving = true;


    this.changeDetectorRef.detectChanges();


    // ===================================================
    // UPDATE BACKEND
    // ===================================================

    this.admissionService
      .updateAdmission(
        updatedAdmission
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (
          savedAdmission: Admission
        ) => {

          this.saving = false;


          this.admission = {
            ...savedAdmission
          };


          this.changeDetectorRef.detectChanges();


          alert(
            'Admission updated successfully.'
          );


          this.router.navigate([
            '/admissions',
            savedAdmission.id
          ]);

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (
          error: Error
        ) => {

          this.saving = false;


          this.changeDetectorRef.detectChanges();


          console.error(
            'Failed to update admission:',
            error
          );


          alert(
            error.message ||
            'Unable to update admission.'
          );

        }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    if (this.saving) {

      return;

    }


    if (!this.admission) {

      this.router.navigate([
        '/admissions'
      ]);

      return;

    }


    this.router.navigate([
      '/admissions',
      this.admission.id
    ]);

  }


  // =====================================================
  // DELETE
  // =====================================================

  deleteAdmission(): void {

    if (
      !this.admission ||
      this.saving
    ) {

      return;

    }


    const confirmed =
      confirm(
        `Are you sure you want to delete the admission for ${this.admission.patientName}?`
      );


    if (!confirmed) {

      return;

    }


    this.saving = true;


    this.changeDetectorRef.detectChanges();


    this.admissionService
      .deleteAdmission(
        this.admission.id
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: () => {

          this.saving = false;


          this.changeDetectorRef.detectChanges();


          alert(
            'Admission deleted successfully.'
          );


          this.router.navigate([
            '/admissions'
          ]);

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (
          error: Error
        ) => {

          this.saving = false;


          this.changeDetectorRef.detectChanges();


          console.error(
            'Failed to delete admission:',
            error
          );


          alert(
            error.message ||
            'Unable to delete admission.'
          );

        }

      });

  }


  // =====================================================
  // STATUS LABEL
  // =====================================================

  getStatusLabel(
    status: AdmissionStatus
  ): string {

    switch (status) {

      case 'ADMITTED':
        return 'Admitted';

      case 'DISCHARGED':
        return 'Discharged';

      case 'TRANSFERRED':
        return 'Transferred';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;

    }

  }


  // =====================================================
  // TYPE LABEL
  // =====================================================

  getAdmissionTypeLabel(
    type: AdmissionType
  ): string {

    switch (type) {

      case 'EMERGENCY':
        return 'Emergency';

      case 'ROUTINE':
        return 'Routine';

      case 'REFERRAL':
        return 'Referral';

      case 'SURGICAL':
        return 'Surgical';

      case 'MATERNITY':
        return 'Maternity';

      case 'OTHER':
        return 'Other';

      default:
        return type;

    }

  }


  // =====================================================
  // WARD LABEL
  // =====================================================

  getWardLabel(
    ward: WardType
  ): string {

    switch (ward) {

      case 'GENERAL':
        return 'General';

      case 'PRIVATE':
        return 'Private';

      case 'PEDIATRIC':
        return 'Pediatric';

      case 'MATERNITY':
        return 'Maternity';

      case 'SURGICAL':
        return 'Surgical';

      case 'ICU':
        return 'ICU';

      case 'EMERGENCY':
        return 'Emergency';

      case 'OTHER':
        return 'Other';

      default:
        return ward;

    }

  }

}