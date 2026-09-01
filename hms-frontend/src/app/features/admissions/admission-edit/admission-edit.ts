import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
  // OPTIONS
  // =====================================================

  admissionTypes: AdmissionType[] = [

    'Emergency',
    'Routine',
    'Referral',
    'Surgical',
    'Maternity',
    'Other'

  ];


  wards: WardType[] = [

    'General',
    'Private',
    'Pediatric',
    'Maternity',
    'Surgical',
    'ICU',
    'Emergency',
    'Other'

  ];


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


    const existingAdmission =
      this.admissionService.getAdmissionById(id);


    if (!existingAdmission) {

      alert(
        'Admission could not be found.'
      );

      this.router.navigate([
        '/admissions'
      ]);

      return;

    }


    this.admission = {
      ...existingAdmission
    };

  }


  // =====================================================
  // SAVE
  // =====================================================

  saveAdmission(): void {

    if (!this.admission) {

      return;

    }


    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (
      !this.admission.patientName.trim()
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
      !this.admission.reason.trim()
    ) {

      alert(
        'Please enter the reason for admission.'
      );

      return;

    }


    // ---------------------------------------------
    // UPDATE
    // ---------------------------------------------

    const updated =
      this.admissionService.updateAdmission(
        {
          ...this.admission,

          patientName:
            this.admission.patientName.trim(),

          reason:
            this.admission.reason.trim(),

          updatedAt:
            new Date().toISOString()
        }
      );


    if (!updated) {

      alert(
        'Unable to update admission.'
      );

      return;

    }


    alert(
      'Admission updated successfully.'
    );


    this.router.navigate([
      '/admissions',
      this.admission.id
    ]);

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

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

}
