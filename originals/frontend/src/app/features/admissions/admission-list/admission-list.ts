import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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


  // =====================================================
  // STATUSES
  // =====================================================

  statuses: AdmissionStatus[] = [

    'Admitted',

    'Discharged',

    'Transferred',

    'Cancelled'

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private admissionService: AdmissionService,
    private router: Router
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

    this.admissions =
      this.admissionService.getAdmissions();


    this.updateStatistics();

    this.applyFilters();

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
          admission.status ===
          'Admitted'
      ).length;


    this.dischargedAdmissions =
      this.admissions.filter(
        admission =>
          admission.status ===
          'Discharged'
      ).length;


    this.transferredAdmissions =
      this.admissions.filter(
        admission =>
          admission.status ===
          'Transferred'
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

            admission.patientName
              .toLowerCase()
              .includes(search) ||

            admission.id
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

            admission.ward
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


    const deleted =
      this.admissionService.deleteAdmission(
        admission.id
      );


    if (!deleted) {

      alert(
        'Unable to delete admission.'
      );

      return;

    }


    alert(
      'Admission deleted successfully.'
    );


    this.loadAdmissions();

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

      case 'Admitted':
        return 'admitted';

      case 'Discharged':
        return 'discharged';

      case 'Transferred':
        return 'transferred';

      case 'Cancelled':
        return 'cancelled';

      default:
        return '';

    }

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date: string
  ): string {

    if (!date) {

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
      new Date(date)
    );

  }


}
