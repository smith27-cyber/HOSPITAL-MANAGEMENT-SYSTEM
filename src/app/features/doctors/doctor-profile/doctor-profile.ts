import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../shared/models/doctor.model';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-profile.html',
  styleUrl: './doctor-profile.css'
})
export class DoctorProfile implements OnInit {

  doctor: Doctor | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.router.navigate(['/doctors']);

      return;
    }

    this.loadDoctor(id);

  }


  // =====================================================
  // LOAD DOCTOR
  // =====================================================

  loadDoctor(id: string): void {

    this.doctor =
      this.doctorService.getDoctorById(id);

    if (!this.doctor) {

      this.router.navigate(['/doctors']);

    }

  }


  // =====================================================
  // AGE
  // =====================================================

  calculateAge(dateOfBirth: string): number {

    if (!dateOfBirth) {
      return 0;
    }

    const birthDate =
      new Date(dateOfBirth);

    const today =
      new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const month =
      today.getMonth() -
      birthDate.getMonth();

    if (
      month < 0 ||
      (
        month === 0 &&
        today.getDate() < birthDate.getDate()
      )
    ) {

      age--;

    }

    return age;

  }


  // =====================================================
  // EDIT
  // =====================================================

  editDoctor(): void {

    if (!this.doctor) {
      return;
    }

    this.router.navigate([
      '/doctors',
      this.doctor.id,
      'edit'
    ]);

  }


  // =====================================================
  // DEACTIVATE
  // =====================================================

  deactivateDoctor(): void {

    if (!this.doctor) {
      return;
    }

    if (this.doctor.status === 'Inactive') {
      return;
    }

    const confirmed =
      window.confirm(
        `Deactivate Dr. ${this.doctor.firstName} ${this.doctor.lastName}?`
      );

    if (!confirmed) {
      return;
    }

    this.doctorService.deactivateDoctor(
      this.doctor.id
    );

    this.loadDoctor(this.doctor.id);

  }


  // =====================================================
  // ACTIVATE
  // =====================================================

  activateDoctor(): void {

    if (!this.doctor) {
      return;
    }

    this.doctorService.activateDoctor(
      this.doctor.id
    );

    this.loadDoctor(this.doctor.id);

  }


  // =====================================================
  // BACK
  // =====================================================

  backToDoctors(): void {

    this.router.navigate(['/doctors']);

  }


  // =====================================================
  // PRINT
  // =====================================================

  printProfile(): void {

    window.print();

  }

}
