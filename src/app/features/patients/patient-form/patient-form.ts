import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../shared/models/patient.model';

@Component({
  selector: 'app-patient-form',
  imports: [FormsModule],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.css'
})
export class PatientForm implements OnInit {

  isEditMode = false;

  patientId: string | null = null;

  patient = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bloodGroup: '',
    department: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {

    this.patientId =
      this.route.snapshot.paramMap.get('id');

    if (this.patientId) {

      this.isEditMode = true;

      const existingPatient =
        this.patientService.getPatientById(this.patientId);

      if (existingPatient) {

        this.patient = {
          firstName: existingPatient.firstName,
          lastName: existingPatient.lastName,
          dateOfBirth: existingPatient.dateOfBirth,
          gender: existingPatient.gender,
          phone: existingPatient.phone,
          email: existingPatient.email,
          address: existingPatient.address,
          nationalId: existingPatient.nationalId,
          emergencyContactName:
            existingPatient.emergencyContactName,
          emergencyContactPhone:
            existingPatient.emergencyContactPhone,
          bloodGroup: existingPatient.bloodGroup,
          department: existingPatient.department
        };

      } else {

        this.router.navigate(['/patients']);

      }

    }

  }


  savePatient(): void {

    if (this.isEditMode && this.patientId) {

      const existingPatient =
        this.patientService.getPatientById(this.patientId);

      if (!existingPatient) {
        return;
      }

      const updatedPatient: Patient = {

        id: existingPatient.id,

        firstName: this.patient.firstName,
        lastName: this.patient.lastName,
        dateOfBirth: this.patient.dateOfBirth,
        gender:
          this.patient.gender as
          'Male' | 'Female' | 'Other',

        phone: this.patient.phone,
        email: this.patient.email,
        address: this.patient.address,
        nationalId: this.patient.nationalId,

        emergencyContactName:
          this.patient.emergencyContactName,

        emergencyContactPhone:
          this.patient.emergencyContactPhone,

        bloodGroup: this.patient.bloodGroup,
        department: this.patient.department,

        status: existingPatient.status,

        createdAt: existingPatient.createdAt

      };

      this.patientService.updatePatient(updatedPatient);

      alert('Patient updated successfully');

      this.router.navigate([
        '/patients',
        this.patientId
      ]);

      return;
    }


    // New patient

    const newPatient =
      this.patientService.addPatient({

        firstName: this.patient.firstName,
        lastName: this.patient.lastName,
        dateOfBirth: this.patient.dateOfBirth,

        gender:
          this.patient.gender as
          'Male' | 'Female' | 'Other',

        phone: this.patient.phone,
        email: this.patient.email,
        address: this.patient.address,
        nationalId: this.patient.nationalId,

        emergencyContactName:
          this.patient.emergencyContactName,

        emergencyContactPhone:
          this.patient.emergencyContactPhone,

        bloodGroup: this.patient.bloodGroup,
        department: this.patient.department

      });

    alert(
      `Patient ${newPatient.id} registered successfully`
    );

    this.router.navigate(['/patients']);

  }


  cancel(): void {

    if (this.isEditMode && this.patientId) {

      this.router.navigate([
        '/patients',
        this.patientId
      ]);

    } else {

      this.router.navigate(['/patients']);

    }

  }

}
