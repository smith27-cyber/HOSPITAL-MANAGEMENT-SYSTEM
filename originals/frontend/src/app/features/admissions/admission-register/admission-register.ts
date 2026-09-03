import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Admission,
  AdmissionType,
  WardType
} from '../../../shared/models/admission.model';

import {
  AdmissionService
} from '../../../core/services/admission.service';


@Component({
  selector: 'app-admission-register',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admission-register.html',

  styleUrl: './admission-register.css'
})
export class AdmissionRegister {


  // =====================================================
  // ADMISSION TYPES
  // =====================================================

  admissionTypes: AdmissionType[] = [

    'Emergency',
    'Routine',
    'Referral',
    'Surgical',
    'Maternity',
    'Other'

  ];


  // =====================================================
  // WARDS
  // =====================================================

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


  // =====================================================
  // ADMISSION
  // =====================================================

  admission: Admission = {

    id: '',

    patientId: '',

    patientName: '',

    patientNumber: '',

    doctorId: '',

    doctorName: '',

    departmentId: '',

    departmentName: '',

    ward: 'General',

    bedNumber: '',

    admissionType: 'Routine',

    admissionDate: '',

    expectedDischargeDate: '',

    dischargeDate: '',

    reason: '',

    diagnosis: '',

    notes: '',

    status: 'Admitted',

    createdAt: ''

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private admissionService: AdmissionService,
    private router: Router
  ) {}


  // =====================================================
  // SAVE ADMISSION
  // =====================================================

  saveAdmission(): void {

    // ---------------------------------------------------
    // CLEAN TEXT
    // ---------------------------------------------------

    this.admission.patientId =
      this.admission.patientId.trim();

    this.admission.patientName =
      this.admission.patientName.trim();

    this.admission.patientNumber =
      this.admission.patientNumber?.trim();

    this.admission.doctorId =
      this.admission.doctorId?.trim();

    this.admission.doctorName =
      this.admission.doctorName?.trim();

    this.admission.departmentId =
      this.admission.departmentId?.trim();

    this.admission.departmentName =
      this.admission.departmentName?.trim();

    this.admission.bedNumber =
      this.admission.bedNumber?.trim();

    this.admission.reason =
      this.admission.reason.trim();

    this.admission.diagnosis =
      this.admission.diagnosis?.trim();

    this.admission.notes =
      this.admission.notes?.trim();


    // ===================================================
    // VALIDATION
    // ===================================================

    const missingFields: string[] = [];


    if (!this.admission.patientId) {

      missingFields.push(
        'Patient ID'
      );

    }


    if (!this.admission.patientName) {

      missingFields.push(
        'Patient Name'
      );

    }


    if (!this.admission.ward) {

      missingFields.push(
        'Ward'
      );

    }


    if (!this.admission.admissionType) {

      missingFields.push(
        'Admission Type'
      );

    }


    if (!this.admission.admissionDate) {

      missingFields.push(
        'Admission Date'
      );

    }


    if (!this.admission.reason) {

      missingFields.push(
        'Reason for Admission'
      );

    }


    // ===================================================
    // SHOW VALIDATION
    // ===================================================

    if (missingFields.length > 0) {

      alert(
        'Please complete the following fields:\n\n' +
        missingFields.join('\n')
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
      isNaN(
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
        isNaN(
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
    // GENERATE ID
    // ===================================================

    this.admission.id =
      this.generateAdmissionId();


    // ===================================================
    // CREATED DATE
    // ===================================================

    this.admission.createdAt =
      new Date().toISOString();


    // ===================================================
    // DEFAULT STATUS
    // ===================================================

    this.admission.status =
      'Admitted';


    // ===================================================
    // SAVE
    // ===================================================

    this.admissionService.addAdmission({

      ...this.admission

    });


    // ===================================================
    // SUCCESS
    // ===================================================

    alert(
      'Patient admission registered successfully.'
    );


    // ===================================================
    // RETURN
    // ===================================================

    this.router.navigate([
      '/admissions'
    ]);

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/admissions'
    ]);

  }


  // =====================================================
  // GENERATE ADMISSION ID
  // =====================================================

  private generateAdmissionId(): string {

    const timestamp =
      Date.now()
        .toString()
        .slice(-7);


    return `ADM-${timestamp}`;

  }

}
