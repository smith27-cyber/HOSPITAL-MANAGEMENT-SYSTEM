import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-form',
  imports: [FormsModule],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.css'
})
export class PatientForm {

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

  constructor(private router: Router) {}

  savePatient(): void {

    console.log('Patient data:', this.patient);

    alert('Patient registered successfully');

    this.router.navigate(['/patients']);
  }

  cancel(): void {
    this.router.navigate(['/patients']);
  }

}
