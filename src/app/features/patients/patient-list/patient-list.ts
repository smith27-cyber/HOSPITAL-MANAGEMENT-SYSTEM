import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../shared/models/patient.model';

@Component({
  selector: 'app-patient-list',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.css'
})
export class PatientList implements OnInit {

  patients: Patient[] = [];

  searchTerm = '';
  selectedDepartment = '';
selectedStatus = '';

  constructor(
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.patients = this.patientService.getPatients();
  }

  get filteredPatients(): Patient[] {

  const term = this.searchTerm
    .toLowerCase()
    .trim();

  return this.patients.filter(patient => {

    const fullName =
      `${patient.firstName} ${patient.lastName}`.toLowerCase();

    const matchesSearch =
      !term ||
      fullName.includes(term) ||
      patient.id.toLowerCase().includes(term) ||
      patient.phone.includes(term);

    const matchesDepartment =
      !this.selectedDepartment ||
      patient.department === this.selectedDepartment;

    const matchesStatus =
      !this.selectedStatus ||
      patient.status === this.selectedStatus;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus
    );

  });

}

  calculateAge(dateOfBirth: string): number {

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

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
        today.getDate() < birthDate.getDate()
      )
    ) {
      age--;
    }

    return age;
  }

}
