// =====================================================
// ADMISSION REGISTER COMPONENT
// File:
// src/app/features/admissions/admission-register/admission-register.ts
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
  AdmissionType,
  WardType
} from '../../../shared/models/admission.model';

import {
  Patient
} from '../../../shared/models/patient.model';

import {
  AdmissionService
} from '../../../core/services/admission.service';

import {
  PatientService
} from '../../../core/services/patient.service';


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
export class AdmissionRegister implements OnInit {


  // =====================================================
  // PATIENTS
  // =====================================================

  patients: Patient[] = [];

  loadingPatients = true;

  patientLoadError = false;


  // =====================================================
  // SELECTED PATIENT
  // =====================================================

  selectedPatientId = '';


  // =====================================================
  // ADMISSION TYPES
  // =====================================================

  admissionTypes: AdmissionType[] = [

    'EMERGENCY',
    'ROUTINE',
    'REFERRAL',
    'SURGICAL',
    'MATERNITY',
    'OTHER'

  ];


  // =====================================================
  // WARDS
  // =====================================================

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


  // =====================================================
  // SAVING
  // =====================================================

  saving = false;


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

    ward: 'GENERAL',

    bedNumber: '',

    admissionType: 'ROUTINE',

    admissionDate: '',

    expectedDischargeDate: '',

    dischargeDate: '',

    reason: '',

    diagnosis: '',

    notes: '',

    status: 'ADMITTED',

    createdAt: ''

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly admissionService: AdmissionService,
    private readonly patientService: PatientService,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadPatients();

  }


  // =====================================================
  // LOAD REGISTERED PATIENTS
  // =====================================================

  loadPatients(): void {

    this.loadingPatients = true;

    this.patientLoadError = false;


    // ---------------------------------------------------
    // Immediately update the view
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();


    this.patientService
      .getPatients()
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (patients: Patient[]) => {

          console.log(
            'AdmissionRegister: patients received:',
            patients
          );


          // ---------------------------------------------
          // Only active registered patients
          // ---------------------------------------------

          this.patients =
            patients
              .filter(
                patient =>
                  patient.status === 'Active'
              )
              .sort(
                (a, b) =>
                  this.getPatientDisplayName(a)
                    .localeCompare(
                      this.getPatientDisplayName(b)
                    )
              );


          console.log(
            'AdmissionRegister: active patients:',
            this.patients
          );


          // ---------------------------------------------
          // Update loading state
          // ---------------------------------------------

          this.loadingPatients = false;

          this.patientLoadError = false;


          // ---------------------------------------------
          // Force immediate UI refresh
          // ---------------------------------------------

          this.changeDetectorRef.detectChanges();

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          console.error(
            'AdmissionRegister: failed to load patients:',
            error
          );


          this.patients = [];

          this.loadingPatients = false;

          this.patientLoadError = true;


          // ---------------------------------------------
          // Force error state into the UI
          // ---------------------------------------------

          this.changeDetectorRef.detectChanges();


          alert(
            'Unable to load registered patients. ' +
            'Please make sure the Patients API is available.'
          );

        }

      });

  }


  // =====================================================
  // RETRY
  // =====================================================

  retryLoadPatients(): void {

    this.loadPatients();

  }


  // =====================================================
  // PATIENT SELECTED
  // =====================================================

  onPatientSelected(): void {

    if (!this.selectedPatientId) {

      this.clearSelectedPatient();

      this.changeDetectorRef.detectChanges();

      return;

    }


    const selectedPatient =
      this.patients.find(
        patient =>
          patient.id ===
          this.selectedPatientId
      );


    if (!selectedPatient) {

      this.clearSelectedPatient();

      this.changeDetectorRef.detectChanges();

      return;

    }


    // ---------------------------------------------
    // Populate admission from registered patient
    // ---------------------------------------------

    this.admission.patientId =
      selectedPatient.id;

    this.admission.patientName =
      this.getPatientDisplayName(
        selectedPatient
      );

    this.admission.patientNumber =
      this.getPatientNumber(
        selectedPatient
      );


    // ---------------------------------------------
    // Force selected patient details into view
    // ---------------------------------------------

    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // CLEAR SELECTED PATIENT
  // =====================================================

  private clearSelectedPatient(): void {

    this.admission.patientId = '';

    this.admission.patientName = '';

    this.admission.patientNumber = '';

  }


  // =====================================================
  // PATIENT DISPLAY NAME
  // =====================================================

  getPatientDisplayName(
    patient: Patient
  ): string {

    return [
      patient.firstName,
      patient.lastName
    ]
      .filter(
        value =>
          !!value?.trim()
      )
      .join(' ')
      .trim();

  }


  // =====================================================
  // PATIENT NUMBER
  // =====================================================
  //
  // The current Patient model has no dedicated
  // patientNumber property.
  //
  // Until that field is added to the Patient module,
  // we use the registered patient ID.
  // =====================================================

  getPatientNumber(
    patient: Patient
  ): string {

    return patient.id;

  }


  // =====================================================
  // GET SELECTED PATIENT
  // =====================================================

  getSelectedPatient(): Patient | undefined {

    if (!this.selectedPatientId) {

      return undefined;

    }


    return this.patients.find(
      patient =>
        patient.id ===
        this.selectedPatientId
    );

  }


  // =====================================================
  // FORMAT PATIENT OPTION
  // =====================================================

  formatPatientOption(
    patient: Patient
  ): string {

    const name =
      this.getPatientDisplayName(
        patient
      );

    return `${name} — ${patient.id}`;

  }


  // =====================================================
  // SAVE ADMISSION
  // =====================================================

  saveAdmission(): void {

    if (this.saving) {

      return;

    }


    // ===================================================
    // PATIENT VALIDATION
    // ===================================================

    if (!this.selectedPatientId) {

      alert(
        'Please select a registered patient.'
      );

      return;

    }


    const selectedPatient =
      this.getSelectedPatient();


    if (!selectedPatient) {

      alert(
        'The selected patient could not be found.'
      );

      return;

    }


    // ---------------------------------------------------
    // Ensure admission contains the selected patient
    // ---------------------------------------------------

    this.onPatientSelected();


    // ===================================================
    // CLEAN TEXT
    // ===================================================

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
    // =====================================================

    const missingFields: string[] = [];


    if (!this.admission.patientId) {

      missingFields.push(
        'Patient'
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
    // PREPARE REQUEST
    // ===================================================

    const request: Admission = {

      ...this.admission,

      // Backend generates ID

      id: '',

      // Backend generates timestamp

      createdAt: '',

      // New admissions start as ADMITTED

      status: 'ADMITTED',

      // No discharge date at registration

      dischargeDate: undefined

    };


    // ===================================================
    // SAVE
    // ===================================================

    this.saving = true;


    this.changeDetectorRef.detectChanges();


    this.admissionService
      .addAdmission(request)
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (
          createdAdmission: Admission
        ) => {

          this.saving = false;


          this.changeDetectorRef.detectChanges();


          alert(
            'Patient admission registered successfully.\n\n' +
            `Admission ID: ${createdAdmission.id}`
          );


          this.router.navigate([
            '/admissions'
          ]);

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error: Error) => {

          this.saving = false;


          this.changeDetectorRef.detectChanges();


          console.error(
            'Failed to create admission:',
            error
          );


          alert(
            error.message ||
            'Unable to register the admission.'
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


    this.router.navigate([
      '/admissions'
    ]);

  }

}