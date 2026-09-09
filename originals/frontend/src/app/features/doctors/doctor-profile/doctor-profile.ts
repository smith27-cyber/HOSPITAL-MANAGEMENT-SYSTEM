// =====================================================
// DOCTOR PROFILE COMPONENT
// File:
// src/app/features/doctors/doctor-profile/doctor-profile.ts
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
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  DoctorService
} from '../../../core/services/doctor.service';

import {
  Doctor
} from '../../../shared/models/doctor.model';


@Component({
  selector: 'app-doctor-profile',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './doctor-profile.html',

  styleUrl: './doctor-profile.css'
})
export class DoctorProfile implements OnInit {

  // =====================================================
  // DOCTOR
  // =====================================================

  doctor: Doctor | undefined;


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = true;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly route: ActivatedRoute,

    private readonly router: Router,

    private readonly doctorService: DoctorService,

    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    console.log(
      'Doctor profile ID:',
      id
    );


    if (!id) {

      console.error(
        'No doctor ID found in route.'
      );

      this.isLoading = false;

      this.router.navigate([
        '/doctors'
      ]);

      return;
    }


    this.loadDoctor(id);

  }


  // =====================================================
  // LOAD DOCTOR
  // =====================================================

  loadDoctor(
    id: string
  ): void {

    this.isLoading = true;


    console.log(
      'Loading doctor:',
      id
    );


    this.doctorService
      .getDoctorById(id)
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (
          fetchedDoctor: Doctor
        ) => {

          console.log(
            'Doctor profile loaded:',
            fetchedDoctor
          );


          // ------------------------------------------------
          // NORMALIZE STATUS
          // ------------------------------------------------
          //
          // Your backend currently returned an empty/null
          // status for the doctor.
          //
          // The profile should still display.
          // We temporarily treat an empty status as Active.
          // ------------------------------------------------

          const normalizedDoctor: Doctor = {

            ...fetchedDoctor,

            status:
              fetchedDoctor.status ||
              'Active'

          };


          this.doctor =
            normalizedDoctor;


          this.isLoading = false;


          console.log(
            'Doctor assigned to component:',
            this.doctor
          );


          // ------------------------------------------------
          // FORCE VIEW UPDATE
          // ------------------------------------------------

          this.changeDetectorRef.detectChanges();

        },


        // =================================================
        // ERROR
        // =================================================

        error: (
          error: unknown
        ) => {

          console.error(
            'Error loading doctor profile:',
            error
          );


          this.doctor = undefined;

          this.isLoading = false;


          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // AGE
  // =====================================================

  calculateAge(
    dateOfBirth: string
  ): number {

    if (!dateOfBirth) {

      return 0;

    }


    const birthDate =
      new Date(dateOfBirth);

    const today =
      new Date();


    if (
      Number.isNaN(
        birthDate.getTime()
      )
    ) {

      return 0;

    }


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
        today.getDate() <
        birthDate.getDate()
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


    if (
      this.doctor.status ===
      'Inactive'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Deactivate Dr. ${this.doctor.firstName} ${this.doctor.lastName}?`
      );


    if (!confirmed) {

      return;

    }


    const doctorId =
      this.doctor.id;


    this.doctorService
      .deactivateDoctor(doctorId)
      .subscribe({

        next: (
          updatedDoctor: Doctor
        ) => {

          this.doctor = {
            ...updatedDoctor
          };


          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to deactivate doctor:',
            error
          );


          alert(
            'Failed to deactivate doctor.'
          );

        }

      });

  }


  // =====================================================
  // ACTIVATE
  // =====================================================

  activateDoctor(): void {

    if (!this.doctor) {

      return;

    }


    const doctorId =
      this.doctor.id;


    this.doctorService
      .activateDoctor(doctorId)
      .subscribe({

        next: (
          updatedDoctor: Doctor
        ) => {

          this.doctor = {
            ...updatedDoctor
          };


          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to activate doctor:',
            error
          );


          alert(
            'Failed to activate doctor.'
          );

        }

      });

  }


  // =====================================================
  // BACK
  // =====================================================

  backToDoctors(): void {

    this.router.navigate([
      '/doctors'
    ]);

  }


  // =====================================================
  // PRINT
  // =====================================================

  printProfile(): void {

    window.print();

  }

}
