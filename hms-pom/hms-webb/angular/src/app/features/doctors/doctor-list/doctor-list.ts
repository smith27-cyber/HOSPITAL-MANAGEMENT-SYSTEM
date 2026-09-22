// =====================================================
// DOCTOR LIST COMPONENT
// File:
// src/app/features/doctors/doctor-list/doctor-list.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../shared/models/doctor.model';


@Component({
  selector: 'app-doctor-list',

  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl: './doctor-list.html',

  styleUrl: './doctor-list.css'
})
export class DoctorList implements OnInit {


  // =====================================================
  // DOCTORS
  // =====================================================

  doctors: Doctor[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // FILTERS
  // =====================================================

  selectedDepartment = '';

  selectedStatus:
    Doctor['status'] | '' = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly doctorService: DoctorService,

    private readonly changeDetectorRef:
      ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadDoctors();

  }


  // =====================================================
  // LOAD DOCTORS
  // =====================================================

  loadDoctors(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.doctorService
      .getDoctors()
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (
          data: Doctor[]
        ) => {

          console.log(
            'Doctors loaded:',
            data
          );


          this.doctors = [
            ...data
          ];


          this.isLoading = false;


          // -----------------------------------------------
          // Force view update after HTTP response
          // -----------------------------------------------

          this.changeDetectorRef.detectChanges();

        },


        // =================================================
        // ERROR
        // =================================================

        error: (
          err: unknown
        ) => {

          console.error(
            'Error loading doctors:',
            err
          );


          this.doctors = [];

          this.isLoading = false;


          this.errorMessage =
            'Unable to load doctors. Please make sure the doctor API is running.';


          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // FILTERED DOCTORS
  // =====================================================

  get filteredDoctors(): Doctor[] {

    const term =
      this.searchTerm
        .toLowerCase()
        .trim();


    return this.doctors.filter(
      (
        doctor: Doctor
      ) => {

        const fullName =
          `${doctor.firstName} ${doctor.lastName}`
            .toLowerCase();


        const phone =
          doctor.phone
            ?.toLowerCase() || '';


        const doctorId =
          doctor.id
            ?.toLowerCase() || '';


        const email =
          doctor.email
            ?.toLowerCase() || '';


        const specialization =
          doctor.specialization
            ?.toLowerCase() || '';


        const matchesSearch =
          !term ||

          fullName.includes(term) ||

          doctorId.includes(term) ||

          phone.includes(term) ||

          email.includes(term) ||

          specialization.includes(term);


        const matchesDepartment =
          !this.selectedDepartment ||

          doctor.department ===
            this.selectedDepartment;


        const matchesStatus =
          !this.selectedStatus ||

          doctor.status ===
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

  get totalDoctors(): number {

    return this.doctors.length;

  }


  // =====================================================
  // ACTIVE DOCTORS
  // =====================================================

  get activeDoctors(): number {

    return this.doctors.filter(
      (
        doctor: Doctor
      ) =>
        doctor.status === 'Active'
    ).length;

  }


  // =====================================================
  // INACTIVE DOCTORS
  // =====================================================

  get inactiveDoctors(): number {

    return this.doctors.filter(
      (
        doctor: Doctor
      ) =>
        doctor.status === 'Inactive'
    ).length;

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
  // DEACTIVATE DOCTOR
  // =====================================================

  deactivateDoctor(
    id: string
  ): void {

    const doctor =
      this.doctors.find(
        (
          currentDoctor: Doctor
        ) =>
          currentDoctor.id === id
      );


    if (!doctor) {

      return;

    }


    if (
      doctor.status === 'Inactive'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Deactivate Dr. ${doctor.firstName} ${doctor.lastName}?`
      );


    if (!confirmed) {

      return;

    }


    // ===================================================
    // SEND REQUEST TO BACKEND
    // ===================================================

    this.doctorService
      .deactivateDoctor(id)
      .subscribe({

        next: (
          updatedDoctor: Doctor
        ) => {

          console.log(
            'Doctor deactivated:',
            updatedDoctor
          );


          // ---------------------------------------------
          // Update local list immediately
          // ---------------------------------------------

          this.doctors =
            this.doctors.map(
              (
                currentDoctor: Doctor
              ) =>
                currentDoctor.id === id
                  ? updatedDoctor
                  : currentDoctor
            );


          this.changeDetectorRef.detectChanges();

        },


        error: (
          err: unknown
        ) => {

          console.error(
            'Failed to deactivate doctor:',
            err
          );


          alert(
            'Failed to deactivate doctor. Please try again.'
          );

        }

      });

  }


  // =====================================================
  // ACTIVATE DOCTOR
  // =====================================================

  activateDoctor(
    id: string
  ): void {

    const doctor =
      this.doctors.find(
        (
          currentDoctor: Doctor
        ) =>
          currentDoctor.id === id
      );


    if (!doctor) {

      return;

    }


    if (
      doctor.status === 'Active'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Activate Dr. ${doctor.firstName} ${doctor.lastName}?`
      );


    if (!confirmed) {

      return;

    }


    this.doctorService
      .activateDoctor(id)
      .subscribe({

        next: (
          updatedDoctor: Doctor
        ) => {

          console.log(
            'Doctor activated:',
            updatedDoctor
          );


          this.doctors =
            this.doctors.map(
              (
                currentDoctor: Doctor
              ) =>
                currentDoctor.id === id
                  ? updatedDoctor
                  : currentDoctor
            );


          this.changeDetectorRef.detectChanges();

        },


        error: (
          err: unknown
        ) => {

          console.error(
            'Failed to activate doctor:',
            err
          );


          alert(
            'Failed to activate doctor. Please try again.'
          );

        }

      });

  }


  // =====================================================
  // DELETE DOCTOR
  // =====================================================

  deleteDoctor(
    id: string
  ): void {

    const doctor =
      this.doctors.find(
        (
          currentDoctor: Doctor
        ) =>
          currentDoctor.id === id
      );


    if (!doctor) {

      return;

    }


    const confirmed =
      window.confirm(
        `Delete Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.id})? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    // ===================================================
    // SEND DELETE REQUEST
    // ===================================================

    this.doctorService
      .deleteDoctor(id)
      .subscribe({

        next: () => {

          console.log(
            'Doctor deleted:',
            id
          );


          // ---------------------------------------------
          // Remove doctor immediately from UI
          // ---------------------------------------------

          this.doctors =
            this.doctors.filter(
              (
                currentDoctor: Doctor
              ) =>
                currentDoctor.id !== id
            );


          this.changeDetectorRef.detectChanges();

        },


        error: (
          err: unknown
        ) => {

          console.error(
            'Failed to delete doctor:',
            err
          );


          alert(
            'Failed to delete doctor. Please try again.'
          );

        }

      });

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshDoctors(): void {

    this.loadDoctors();

  }

}
