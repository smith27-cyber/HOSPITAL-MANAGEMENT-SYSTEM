import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../shared/models/doctor.model';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './doctor-form.html',
  styleUrl: './doctor-form.css'
})
export class DoctorForm implements OnInit {

  isEditMode = false;

  doctorId: string | null = null;

  doctor = {
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    nationalId: '',
    specialization: '',
    department: '',
    licenseNumber: '',
    consultationFee: null as number | null,
    status: 'Active' as 'Active' | 'Inactive'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {

    this.doctorId =
      this.route.snapshot.paramMap.get('id');

    if (!this.doctorId) {
      return;
    }

    this.isEditMode = true;

    const existingDoctor =
      this.doctorService.getDoctorById(this.doctorId);

    if (!existingDoctor) {

      this.router.navigate(['/doctors']);

      return;
    }

    this.doctor = {

      firstName: existingDoctor.firstName,
      lastName: existingDoctor.lastName,
      gender: existingDoctor.gender,
      dateOfBirth: existingDoctor.dateOfBirth,
      phone: existingDoctor.phone,
      email: existingDoctor.email,
      nationalId: existingDoctor.nationalId || '',
      specialization: existingDoctor.specialization,
      department: existingDoctor.department,
      licenseNumber: existingDoctor.licenseNumber,
      consultationFee: existingDoctor.consultationFee ?? null,
      status: existingDoctor.status

    };
  }

  saveDoctor(): void {

    // =====================================================
    // EDIT DOCTOR
    // =====================================================

    if (this.isEditMode && this.doctorId) {

      const existingDoctor =
        this.doctorService.getDoctorById(this.doctorId);

      if (!existingDoctor) {
        return;
      }

      const updatedDoctor: Doctor = {

        id: existingDoctor.id,

        firstName: this.doctor.firstName,

        lastName: this.doctor.lastName,

        gender:
          this.doctor.gender as
          'Male' | 'Female' | 'Other',

        dateOfBirth: this.doctor.dateOfBirth,

        phone: this.doctor.phone,

        email: this.doctor.email,

        nationalId:
          this.doctor.nationalId || undefined,

        specialization:
          this.doctor.specialization,

        department:
          this.doctor.department,

        licenseNumber:
          this.doctor.licenseNumber,

        consultationFee:
          this.doctor.consultationFee ?? undefined,

        status:
          this.doctor.status,

        createdAt:
          existingDoctor.createdAt

      };

      this.doctorService.updateDoctor(updatedDoctor);

      alert('Doctor updated successfully');

      this.router.navigate([
        '/doctors',
        this.doctorId
      ]);

      return;
    }

    // =====================================================
    // NEW DOCTOR
    // =====================================================

    const newDoctor =
      this.doctorService.addDoctor({

        firstName: this.doctor.firstName,

        lastName: this.doctor.lastName,

        gender:
          this.doctor.gender as
          'Male' | 'Female' | 'Other',

        dateOfBirth:
          this.doctor.dateOfBirth,

        phone:
          this.doctor.phone,

        email:
          this.doctor.email,

        nationalId:
          this.doctor.nationalId || undefined,

        specialization:
          this.doctor.specialization,

        department:
          this.doctor.department,

        licenseNumber:
          this.doctor.licenseNumber,

        consultationFee:
          this.doctor.consultationFee ?? undefined

      });

    alert(
      `Dr. ${newDoctor.firstName} ${newDoctor.lastName} registered successfully`
    );

    this.router.navigate(['/doctors']);
  }

  cancel(): void {

    if (this.isEditMode && this.doctorId) {

      this.router.navigate([
        '/doctors',
        this.doctorId
      ]);

      return;
    }

    this.router.navigate(['/doctors']);
  }

}
