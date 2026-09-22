// =====================================================
// PATIENT PROFILE COMPONENT
// File:
// src/app/features/patients/patient-profile/patient-profile.ts
// =====================================================

import { DatePipe } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { PatientService } from '../../../core/services/patient.service';

import { AppointmentService } from '../../../core/services/appointment.service';

import {
  Patient
} from '../../../shared/models/patient.model';

import {
  Appointment
} from '../../../shared/models/appointment.model';


@Component({
  selector: 'app-patient-profile',

  standalone: true,

  imports: [
    DatePipe
  ],

  templateUrl: './patient-profile.html',

  styleUrl: './patient-profile.css'
})
export class PatientProfile implements OnInit {


  // =====================================================
  // PATIENT
  // =====================================================

  patient?: Patient;


  // =====================================================
  // APPOINTMENTS
  // =====================================================

  appointments: Appointment[] = [];


  // =====================================================
  // UI STATE
  // =====================================================

  loading = true;

  errorMessage = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private patientService: PatientService,

    private appointmentService: AppointmentService,

    private changeDetectorRef: ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    console.log(
      'Patient profile route ID:',
      id
    );


    if (!id) {

      this.loading = false;

      this.errorMessage =
        'No patient ID was provided.';

      return;

    }


    this.loadPatient(id);

  }


  // =====================================================
  // LOAD PATIENT
  // =====================================================

  private loadPatient(
    id: string
  ): void {

    this.loading = true;

    this.errorMessage = '';

    this.patient = undefined;


    this.patientService
      .getPatientById(id)
      .subscribe({

        next: (patient) => {

          console.log(
            'Patient received from backend:',
            patient
          );


          if (!patient) {

            this.patient = undefined;

            this.errorMessage =
              'The patient record could not be found.';

            this.loading = false;

            return;

          }


          this.patient =
            patient;


          // ---------------------------------------------
          // LOAD PATIENT APPOINTMENTS
          // ---------------------------------------------

          this.loadPatientAppointments(
            patient.id
          );


          this.loading = false;


          this.changeDetectorRef.detectChanges();

        },


        error: (error) => {

          console.error(
            'Failed to load patient:',
            error
          );


          this.patient = undefined;

          this.appointments = [];

          this.loading = false;


          if (error?.status === 404) {

            this.errorMessage =
              'The patient record could not be found.';

          } else {

            this.errorMessage =
              'Unable to load patient information. Please make sure the HMS backend is running.';

          }


          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD PATIENT APPOINTMENTS
  // =====================================================

  // =====================================================
// LOAD PATIENT APPOINTMENTS
// =====================================================
private loadPatientAppointments(
  patientId: string
): void {

  this.appointmentService
    .getAppointments()
    .subscribe({

      next: (allAppointments: Appointment[]) => {

        this.appointments =
          allAppointments
            .filter(
              (appointment: Appointment) =>
                appointment.patientId === patientId
            )
            .sort(
              (
                a: Appointment,
                b: Appointment
              ) => {

                const dateA =
                  new Date(
                    `${a.appointmentDate} ${a.appointmentTime}`
                  ).getTime();

                const dateB =
                  new Date(
                    `${b.appointmentDate} ${b.appointmentTime}`
                  ).getTime();

                return dateB - dateA;

              }
            );

        console.log(
          'Patient appointments:',
          this.appointments
        );

        this.changeDetectorRef.detectChanges();

      },

      error: (error) => {

        console.error(
          'Failed to load patient appointments:',
          error
        );

        this.appointments = [];

        this.changeDetectorRef.detectChanges();

      }

    });

}


  // =====================================================
  // APPOINTMENT COUNT
  // =====================================================

  get appointmentCount(): number {

    return this.appointments.length;

  }


  // =====================================================
  // COMPLETED APPOINTMENTS
  // =====================================================

  get completedAppointments(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status === 'Completed'
    ).length;

  }


  // =====================================================
  // UPCOMING APPOINTMENTS
  // =====================================================

  get upcomingAppointments(): number {

    return this.appointments.filter(
      appointment => {

        return (
          appointment.status === 'Scheduled' ||
          appointment.status === 'Confirmed' ||
          appointment.status === 'Checked-In'
        );

      }
    ).length;

  }


  // =====================================================
  // FORMAT APPOINTMENT DATE
  // =====================================================

  formatAppointmentDate(
    date: string
  ): string {

    if (!date) {

      return 'Not available';

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return date;

    }


    return parsedDate.toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getAppointmentStatusClass(
    status: string
  ): string {

    switch (status) {

      case 'Scheduled':
        return 'scheduled';

      case 'Confirmed':
        return 'confirmed';

      case 'Checked-In':
        return 'checked-in';

      case 'In Consultation':
        return 'in-consultation';

      case 'Completed':
        return 'completed';

      case 'Cancelled':
        return 'cancelled';

      case 'No Show':
        return 'no-show';

      default:
        return '';

    }

  }


  // =====================================================
  // VIEW APPOINTMENT
  // =====================================================

  viewAppointment(
    id: string
  ): void {

    this.router.navigate([
      '/appointments',
      id
    ]);

  }


  // =====================================================
  // CREATE APPOINTMENT
  // =====================================================

  createAppointment(): void {

    if (!this.patient) {

      return;

    }


    this.router.navigate(
      [
        '/appointments/register'
      ],
      {
        queryParams: {
          patientId:
            this.patient.id
        }
      }
    );

  }


  // =====================================================
  // FULL NAME
  // =====================================================

  get fullName(): string {

    if (!this.patient) {

      return 'Unknown Patient';

    }


    return [
      this.patient.firstName,
      this.patient.lastName
    ]
      .filter(Boolean)
      .join(' ');

  }


  // =====================================================
  // INITIALS
  // =====================================================

  get initials(): string {

    if (!this.patient) {

      return '?';

    }


    const first =
      this.patient.firstName
        ?.charAt(0)
        .toUpperCase() || '';


    const last =
      this.patient.lastName
        ?.charAt(0)
        .toUpperCase() || '';


    return (
      `${first}${last}` ||
      '?'
    );

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
  // BACK TO PATIENTS
  // =====================================================

  backToPatients(): void {

    this.router.navigate([
      '/patients'
    ]);

  }


  // =====================================================
  // EDIT PATIENT
  // =====================================================

  editPatient(): void {

    if (!this.patient) {

      return;

    }


    this.router.navigate([
      '/patients',
      this.patient.id,
      'edit'
    ]);

  }


  // =====================================================
  // DEACTIVATE PATIENT
  // =====================================================

  deactivatePatient(): void {

    if (!this.patient) {

      return;

    }


    if (
      this.patient.status ===
      'Inactive'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to deactivate ${this.fullName}?`
      );


    if (!confirmed) {

      return;

    }


    this.patientService
      .deactivatePatient(
        this.patient.id
      )
      .subscribe({

        next: (updatedPatient) => {

          this.patient =
            updatedPatient;


          this.changeDetectorRef.detectChanges();

        },


        error: (error) => {

          console.error(
            'Failed to deactivate patient:',
            error
          );


          window.alert(
            'Failed to deactivate patient. Please try again.'
          );

        }

      });

  }


  // =====================================================
  // ACTIVATE PATIENT
  // =====================================================

  activatePatient(): void {

    if (!this.patient) {

      return;

    }


    if (
      this.patient.status ===
      'Active'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Activate ${this.fullName}?`
      );


    if (!confirmed) {

      return;

    }


    this.patientService
      .activatePatient(
        this.patient.id
      )
      .subscribe({

        next: (updatedPatient) => {

          this.patient =
            updatedPatient;


          this.changeDetectorRef.detectChanges();

        },


        error: (error) => {

          console.error(
            'Failed to activate patient:',
            error
          );


          window.alert(
            'Failed to activate patient. Please try again.'
          );

        }

      });

  }


  // =====================================================
  // DELETE PATIENT
  // =====================================================

  deletePatient(): void {

    if (!this.patient) {

      return;

    }


    const confirmed =
      window.confirm(
        `Delete patient ${this.fullName} (${this.patient.id})? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    this.patientService
      .deletePatient(
        this.patient.id
      )
      .subscribe({

        next: () => {

          this.router.navigate([
            '/patients'
          ]);

        },


        error: (error) => {

          console.error(
            'Failed to delete patient:',
            error
          );


          window.alert(
            'Failed to delete patient. Please try again.'
          );

        }

      });

  }


  // =====================================================
  // PRINT RECORD
  // =====================================================

  printRecord(): void {

    window.print();

  }

}
