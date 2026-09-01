
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../shared/models/patient.model';

@Component({
  selector: 'app-patient-list',

  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl: './patient-list.html',
  styleUrl: './patient-list.css'
})
export class PatientList implements OnInit {

  // =========================
  // PATIENTS
  // =========================

  patients: Patient[] = [];


  // =========================
  // SEARCH
  // =========================

  searchTerm = '';


  // =========================
  // FILTERS
  // =========================

  selectedDepartment = '';

  selectedStatus: Patient['status'] | '' = '';


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private patientService: PatientService
  ) {}


  // =========================
  // INITIALIZE
  // =========================

  ngOnInit(): void {

    this.loadPatients();

  }


  // =========================
  // LOAD PATIENTS
  // =========================

  loadPatients(): void {

    this.patients =
      this.patientService.getPatients();

  }


  // =========================
  // FILTERED PATIENTS
  // =========================

  get filteredPatients(): Patient[] {

    const term =
      this.searchTerm
        .toLowerCase()
        .trim();


    return this.patients.filter(
      patient => {

        const fullName =
          `${patient.firstName} ${patient.lastName}`
            .toLowerCase();


        const phone =
          patient.phone?.toLowerCase() || '';


        const patientId =
          patient.id?.toLowerCase() || '';


        const matchesSearch =
          !term ||
          fullName.includes(term) ||
          patientId.includes(term) ||
          phone.includes(term);


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


  // =========================
  // STATISTICS
  // =========================

  get totalPatients(): number {

    return this.patients.length;

  }


  get activePatients(): number {

    return this.patients.filter(
      patient =>
        patient.status === 'Active'
    ).length;

  }


  get inactivePatients(): number {

    return this.patients.filter(
      patient =>
        patient.status === 'Inactive'
    ).length;

  }


  get malePatients(): number {

    return this.patients.filter(
      patient =>
        patient.gender === 'Male'
    ).length;

  }


  get femalePatients(): number {

    return this.patients.filter(
      patient =>
        patient.gender === 'Female'
    ).length;

  }


  // =========================
  // CALCULATE AGE
  // =========================

  calculateAge(
    dateOfBirth: string
  ): number {

    const birthDate =
      new Date(dateOfBirth);

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


    return age;

  }


  // =========================
  // CLEAR FILTERS
  // =========================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedDepartment = '';

    this.selectedStatus = '';

  }


  // =========================
  // DEACTIVATE PATIENT
  // =========================

  deactivatePatient(
    id: string
  ): void {

    const patient =
      this.patients.find(
        patient =>
          patient.id === id
      );


    if (!patient) {
      return;
    }


    if (
      patient.status ===
      'Inactive'
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
      .deactivatePatient(id);


    this.loadPatients();

  }


  // =========================
  // DELETE PATIENT
  // =========================

  deletePatient(
    id: string
  ): void {

    const patient =
      this.patients.find(
        patient =>
          patient.id === id
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
      .deletePatient(id);


    this.loadPatients();

  }


  // =========================
  // REFRESH
  // =========================

  refreshPatients(): void {

    this.loadPatients();

  }

}

