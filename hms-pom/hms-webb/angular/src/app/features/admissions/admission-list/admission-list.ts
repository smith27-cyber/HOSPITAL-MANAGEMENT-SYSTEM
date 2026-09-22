// =====================================================
// ADMISSION LIST COMPONENT
// File:
// src/app/features/admissions/admission-list/admission-list.ts
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
  selector: 'app-admission-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admission-list.html',

  styleUrl: './admission-list.css'
})
export class AdmissionList implements OnInit {


  // =====================================================
  // ADMISSIONS
  // =====================================================

  admissions: Admission[] = [];

  filteredAdmissions: Admission[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  loading = true;


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // STATUS FILTER
  // =====================================================

  selectedStatus:
    AdmissionStatus | 'All' = 'All';


  // =====================================================
  // STATISTICS
  // =====================================================

  totalAdmissions = 0;

  activeAdmissions = 0;

  dischargedAdmissions = 0;

  transferredAdmissions = 0;

  cancelledAdmissions = 0;


  // =====================================================
  // STATUSES
  // =====================================================

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
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadAdmissions();

  }


  // =====================================================
  // LOAD ADMISSIONS
  // =====================================================

  loadAdmissions(): void {

    // ---------------------------------------------------
    // Start loading
    // ---------------------------------------------------

    this.loading = true;


    // ---------------------------------------------------
    // Clear stale data while loading
    // ---------------------------------------------------

    this.admissions = [];

    this.filteredAdmissions = [];

    this.totalAdmissions = 0;

    this.activeAdmissions = 0;

    this.dischargedAdmissions = 0;

    this.transferredAdmissions = 0;

    this.cancelledAdmissions = 0;


    // ---------------------------------------------------
    // Force loading state into the UI
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();


    this.admissionService
      .getAdmissions()
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (
          admissions: Admission[]
        ) => {

          console.log(
            'AdmissionList: admissions received:',
            admissions
          );


          // ---------------------------------------------
          // Store backend data
          // ---------------------------------------------

          this.admissions =
            admissions ?? [];


          // ---------------------------------------------
          // Calculate statistics
          // ---------------------------------------------

          this.updateStatistics();


          // ---------------------------------------------
          // Apply current filters
          // ---------------------------------------------

          this.applyFilters();


          // ---------------------------------------------
          // Stop loading
          // ---------------------------------------------

          this.loading = false;


          // ---------------------------------------------
          // Immediately render the result
          // ---------------------------------------------

          this.changeDetectorRef.detectChanges();


          console.log(
            'AdmissionList: rendered admissions:',
            this.filteredAdmissions
          );

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (
          error: Error
        ) => {

          console.error(
            'Failed to load admissions:',
            error
          );


          this.admissions = [];

          this.filteredAdmissions = [];

          this.loading = false;


          this.updateStatistics();


          // ---------------------------------------------
          // Render the error/empty state
          // ---------------------------------------------

          this.changeDetectorRef.detectChanges();


          alert(
            error.message ||
            'Unable to load admissions.'
          );

        }

      });

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalAdmissions =
      this.admissions.length;


    this.activeAdmissions =
      this.admissions.filter(
        admission =>
          admission.status === 'ADMITTED'
      ).length;


    this.dischargedAdmissions =
      this.admissions.filter(
        admission =>
          admission.status === 'DISCHARGED'
      ).length;


    this.transferredAdmissions =
      this.admissions.filter(
        admission =>
          admission.status === 'TRANSFERRED'
      ).length;


    this.cancelledAdmissions =
      this.admissions.filter(
        admission =>
          admission.status === 'CANCELLED'
      ).length;

  }


  // =====================================================
  // FILTER
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredAdmissions =
      this.admissions.filter(
        admission => {

          // ---------------------------------------------
          // SEARCH
          // ---------------------------------------------

          const matchesSearch =
            !search ||

            (admission.patientName ?? '')
              .toLowerCase()
              .includes(search) ||

            (admission.id ?? '')
              .toLowerCase()
              .includes(search) ||

            (admission.patientNumber ?? '')
              .toLowerCase()
              .includes(search) ||

            (admission.doctorName ?? '')
              .toLowerCase()
              .includes(search) ||

            (admission.departmentName ?? '')
              .toLowerCase()
              .includes(search) ||

            (admission.ward ?? '')
              .toLowerCase()
              .includes(search) ||

            (admission.bedNumber ?? '')
              .toLowerCase()
              .includes(search);


          // ---------------------------------------------
          // STATUS
          // ---------------------------------------------

          const matchesStatus =
            this.selectedStatus === 'All' ||

            admission.status ===
              this.selectedStatus;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );


    // ---------------------------------------------------
    // Explicitly refresh after filtering
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // REGISTER
  // =====================================================

  registerAdmission(): void {

    this.router.navigate([
      '/admissions/register'
    ]);

  }


  // =====================================================
  // VIEW
  // =====================================================

  viewAdmission(
    admission: Admission
  ): void {

    this.router.navigate([
      '/admissions',
      admission.id
    ]);

  }


  // =====================================================
  // EDIT
  // =====================================================

  editAdmission(
    admission: Admission
  ): void {

    this.router.navigate([
      '/admissions',
      admission.id,
      'edit'
    ]);

  }


  // =====================================================
  // DELETE
  // =====================================================

  deleteAdmission(
    admission: Admission
  ): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete the admission for ${admission.patientName}?`
      );


    if (!confirmed) {

      return;

    }


    this.admissionService
      .deleteAdmission(admission.id)
      .subscribe({

        next: () => {

          alert(
            'Admission deleted successfully.'
          );


          this.loadAdmissions();

        },

        error: (
          error: Error
        ) => {

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
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = 'All';

    this.applyFilters();

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: AdmissionStatus
  ): string {

    switch (status) {

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

}