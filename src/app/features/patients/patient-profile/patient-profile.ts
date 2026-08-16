
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../shared/models/patient.model';



@Component({
  selector: 'app-patient-profile',
  imports: [RouterLink,DatePipe],
  templateUrl: './patient-profile.html',
  styleUrl: './patient-profile.css'
})
export class PatientProfile implements OnInit {

  patient?: Patient;

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.patient =
        this.patientService.getPatientById(id);
    }

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

  deactivatePatient(): void {

  if (!this.patient) {
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to deactivate ${this.patient.firstName} ${this.patient.lastName}?`
  );

  if (!confirmed) {
    return;
  }

  this.patientService.deactivatePatient(
    this.patient.id
  );

  this.patient =
    this.patientService.getPatientById(
      this.patient.id
    );

  alert('Patient has been deactivated.');

}

}
