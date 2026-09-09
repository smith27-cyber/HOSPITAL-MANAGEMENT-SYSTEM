import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private admissionService: AdmissionService,
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
        'Admission ID was not provided.'
      );

      this.router.navigate([
        '/admissions'
      ]);

      return;

    }


    this.admission =
      this.admissionService.getAdmissionById(id)
      ?? null;


    if (!this.admission) {

      alert(
        'Admission could not be found.'
      );

      this.router.navigate([
        '/admissions'
      ]);

    }

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
  // EDIT ADMISSION
  // =====================================================

  editAdmission(): void {

    if (!this.admission) {

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

    if (!this.admission) {

      return;

    }


    const confirmed =
      confirm(
        `Are you sure you want to delete the admission for ${this.admission.patientName}?`
      );


    if (!confirmed) {

      return;

    }


    const deleted =
      this.admissionService.deleteAdmission(
        this.admission.id
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


    this.router.navigate([
      '/admissions'
    ]);

  }


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  updateStatus(
    status: AdmissionStatus
  ): void {

    if (!this.admission) {

      return;

    }


    const updated =
      this.admissionService.updateAdmissionStatus(
        this.admission.id,
        status
      );


    if (!updated) {

      alert(
        'Unable to update admission status.'
      );

      return;

    }


    this.admission =
      this.admissionService.getAdmissionById(
        this.admission.id
      )
      ?? null;


    alert(
      `Admission status changed to ${status}.`
    );

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


  // =====================================================
  // FORMAT DATE AND TIME
  // =====================================================

  formatDateTime(
    date?: string
  ): string {

    if (!date) {

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
      new Date(date)
    );

  }


  // =====================================================
  // BACK
  // =====================================================

  backToAdmissions(): void {

    this.router.navigate([
      '/admissions'
    ]);

  }

}
