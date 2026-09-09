// =====================================================
// PATIENT LIST COMPONENT
// File:
// src/app/features/patients/patient-list/patient-list.ts
// =====================================================

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  computed
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient.service';

import {
  Patient
} from '../../../shared/models/patient.model';


@Component({
  selector: 'app-patient-list',

  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl: './patient-list.html',

  styleUrl: './patient-list.css',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientList implements OnInit {


  // =====================================================
  // PATIENT DATA
  // =====================================================

  patients = signal<Patient[]>([]);


  // =====================================================
  // UI STATE
  // =====================================================

  loading = signal(false);

  errorMessage = signal('');


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // FILTERS
  // =====================================================

  selectedDepartment = '';

  selectedStatus: Patient['status'] | '' = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private patientService: PatientService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadPatients();

  }


  // =====================================================
  // LOAD PATIENTS
  // =====================================================

  loadPatients(): void {

    this.loading.set(true);

    this.errorMessage.set('');


    this.patientService
      .getPatients()
      .subscribe({

        next: (patients) => {

          console.log(
            'Patients loaded from backend:',
            patients
          );


          this.patients.set(
            Array.isArray(patients)
              ? [...patients]
              : []
          );


          this.loading.set(false);

        },


        error: (error) => {

          console.error(
            'Failed to load patients:',
            error
          );


          this.patients.set([]);

          this.loading.set(false);


          this.errorMessage.set(
            'Unable to load patients. Please make sure the HMS backend is running.'
          );

        }

      });

  }


  // =====================================================
  // FILTERED PATIENTS
  // =====================================================

  get filteredPatients(): Patient[] {

    const patients =
      this.patients();


    const term =
      this.searchTerm
        .toLowerCase()
        .trim();


    return patients.filter(
      patient => {

        const fullName =
          `${patient.firstName} ${patient.lastName}`
            .toLowerCase();


        const phone =
          patient.phone?.toLowerCase() || '';


        const patientId =
          patient.id?.toLowerCase() || '';


        const nationalId =
          patient.nationalId
            ?.toLowerCase() || '';


        const matchesSearch =
          !term ||
          fullName.includes(term) ||
          patientId.includes(term) ||
          phone.includes(term) ||
          nationalId.includes(term);


        const matchesDepartment =
          !this.selectedDepartment ||
          patient.department ===
            this.selectedDepartment;


        const matchesStatus =
          !this.selectedStatus ||
          patient.status ===
            this.selectedStatus;


        return (
          matchesSearch &&
          matchesDepartment &&
          matchesStatus
        );

      }
    );

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  get totalPatients(): number {

    return this.patients().length;

  }


  get activePatients(): number {

    return this.patients().filter(
      patient =>
        patient.status === 'Active'
    ).length;

  }


  get inactivePatients(): number {

    return this.patients().filter(
      patient =>
        patient.status === 'Inactive'
    ).length;

  }


  get malePatients(): number {

    return this.patients().filter(
      patient =>
        patient.gender === 'Male'
    ).length;

  }


  get femalePatients(): number {

    return this.patients().filter(
      patient =>
        patient.gender === 'Female'
    ).length;

  }


  // =====================================================
  // CALCULATE AGE
  // =====================================================

  calculateAge(
    dateOfBirth: string
  ): number {

    if (!dateOfBirth) {

      return 0;

    }


    const birthDate =
      new Date(dateOfBirth);


    if (
      Number.isNaN(
        birthDate.getTime()
      )
    ) {

      return 0;

    }


    const today =
      new Date();


    let age =
      today.getFullYear() -
      birthDate.getFullYear();


    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();


    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() <
          birthDate.getDate()
      )
    ) {

      age--;

    }


    return Math.max(
      age,
      0
    );

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedDepartment = '';

    this.selectedStatus = '';

  }


  // =====================================================
  // DEACTIVATE PATIENT
  // =====================================================

  deactivatePatient(
    id: string
  ): void {

    const patient =
      this.patients().find(
        item =>
          item.id === id
      );


    if (!patient) {

      return;

    }


    if (
      patient.status === 'Inactive'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Deactivate patient ${patient.firstName} ${patient.lastName}?`
      );


    if (!confirmed) {

      return;

    }


    this.patientService
      .deactivatePatient(id)
      .subscribe({

        next: (updatedPatient) => {

          this.patients.update(
            patients =>
              patients.map(
                item =>
                  item.id === id
                    ? updatedPatient
                    : item
              )
          );

        },


        error: (error) => {

          console.error(
            'Failed to deactivate patient:',
            error
          );


          window.alert(
            'Failed to deactivate patient.'
          );

        }

      });

  }


  // =====================================================
  // DELETE PATIENT
  // =====================================================

  deletePatient(
    id: string
  ): void {

    const patient =
      this.patients().find(
        item =>
          item.id === id
      );


    if (!patient) {

      return;

    }


    const confirmed =
      window.confirm(
        `Delete patient ${patient.firstName} ${patient.lastName} (${patient.id})? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    this.patientService
      .deletePatient(id)
      .subscribe({

        next: () => {

          this.patients.update(
            patients =>
              patients.filter(
                item =>
                  item.id !== id
              )
          );

        },


        error: (error) => {

          console.error(
            'Failed to delete patient:',
            error
          );


          window.alert(
            'Failed to delete patient.'
          );

        }

      });

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshPatients(): void {

    this.loadPatients();

  }

}
