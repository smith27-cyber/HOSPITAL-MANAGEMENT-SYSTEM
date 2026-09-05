// =====================================================
// ADMISSION DETAILS COMPONENT
// File:
// src/app/features/admissions/admission-details/admission-details.ts
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
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Admission,
  AdmissionStatus
} from '../../../shared/models/admission.model';

import {
  AdmissionService
} from '../../../core/services/admission.service';


@Component({
  selector: 'app-admission-details',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './admission-details.html',

  styleUrl: './admission-details.css'
})
export class AdmissionDetails implements OnInit {


  // =====================================================
  // ADMISSION
  // =====================================================

  admission: Admission | null = null;


  // =====================================================
  // LOADING
  // =====================================================

  loading = true;


  // =====================================================
  // DELETING
  // =====================================================

  deleting = false;


  // =====================================================
  // UPDATING STATUS
  // =====================================================

  updatingStatus = false;


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
    // Show loading state immediately
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();


    this.admissionService
      .getAdmissionById(id)
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (
          admission: Admission
        ) => {

          console.log(
            'AdmissionDetails: admission received:',
            admission
          );


          this.admission =
            admission;


          this.loading = false;


          // ------------------------------------------------
          // Force view update immediately
          // ------------------------------------------------

          this.changeDetectorRef.detectChanges();


          console.log(
            'AdmissionDetails: admission rendered:',
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
  // STATUS CLASS
  // =====================================================

  getStatusClass(): string {

    if (!this.admission) {

      return '';

    }


    switch (
      this.admission.status
    ) {

      case 'ADMITTED':
        return 'admitted';

      case 'DISCHARGED':
        return 'discharged';

      case 'TRANSFERRED':
        return 'transferred';

      case 'CANCELLED':
        return 'cancelled';

      default:
        return '';

    }

  }


  // =====================================================
  // STATUS LABEL
  // =====================================================

  getStatusLabel(): string {

    if (!this.admission) {

      return '';

    }


    switch (
      this.admission.status
    ) {

      case 'ADMITTED':
        return 'Admitted';

      case 'DISCHARGED':
        return 'Discharged';

      case 'TRANSFERRED':
        return 'Transferred';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return this.admission.status;

    }

  }


  // =====================================================
  // EDIT ADMISSION
  // =====================================================

  editAdmission(): void {

    if (
      !this.admission ||
      this.deleting ||
      this.updatingStatus
    ) {

      return;

    }


    this.router.navigate([
      '/admissions',
      this.admission.id,
      'edit'
    ]);

  }


  // =====================================================
  // DELETE ADMISSION
  // =====================================================

  deleteAdmission(): void {

    if (
      !this.admission ||
      this.deleting ||
      this.updatingStatus
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


    this.deleting = true;


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

          this.deleting = false;


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

          this.deleting = false;


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
  // UPDATE STATUS
  // =====================================================

  updateStatus(
    status: AdmissionStatus
  ): void {

    if (
      !this.admission ||
      this.updatingStatus ||
      this.deleting
    ) {

      return;

    }


    if (
      this.admission.status === status
    ) {

      return;

    }


    const confirmed =
      confirm(
        `Change admission status to ${this.getStatusLabelFor(status)}?`
      );


    if (!confirmed) {

      return;

    }


    this.updatingStatus = true;


    this.changeDetectorRef.detectChanges();


    this.admissionService
      .updateAdmissionStatus(
        this.admission.id,
        status
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (
          updatedAdmission: Admission
        ) => {

          this.admission =
            updatedAdmission;


          this.updatingStatus = false;


          this.changeDetectorRef.detectChanges();


          alert(
            `Admission status changed to ${this.getStatusLabel()}.`
          );

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (
          error: Error
        ) => {

          this.updatingStatus = false;


          this.changeDetectorRef.detectChanges();


          console.error(
            'Failed to update admission status:',
            error
          );


          alert(
            error.message ||
            'Unable to update admission status.'
          );

        }

      });

  }


  // =====================================================
  // STATUS LABEL HELPER
  // =====================================================

  private getStatusLabelFor(
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
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?: string
  ): string {

    if (!date) {

      return '—';

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—';

    }


    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(
      parsedDate
    );

  }


  // =====================================================
  // FORMAT DATE AND TIME
  // =====================================================

  formatDateTime(
    date?: string
  ): string {

    if (!date) {

      return '—';

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—';

    }


    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(
      parsedDate
    );

  }


  // =====================================================
  // BACK
  // =====================================================

  backToAdmissions(): void {

    if (
      this.deleting ||
      this.updatingStatus
    ) {

      return;

    }


    this.router.navigate([
      '/admissions'
    ]);

  }

}
