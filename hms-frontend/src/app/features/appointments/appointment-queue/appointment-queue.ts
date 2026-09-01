
// =====================================================
// APPOINTMENT QUEUE
// File:
// src/app/features/appointments/appointment-queue/appointment-queue.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  Subject,
  finalize,
  takeUntil
} from 'rxjs';

import {
  Appointment,
  AppointmentStatus
} from '../../../shared/models/appointment.model';

import {
  AppointmentService
} from '../../../core/services/appointment.service';


@Component({
  selector: 'app-appointment-queue',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './appointment-queue.html',

  styleUrl: './appointment-queue.css'
})
export class AppointmentQueue
  implements OnInit, OnDestroy {


  // =====================================================
  // APPOINTMENTS
  // =====================================================

  appointments: Appointment[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // DESTROY SUBJECT
  // =====================================================

  private readonly destroy$ =
    new Subject<void>();


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly appointmentService: AppointmentService,

    private readonly changeDetectorRef: ChangeDetectorRef,

    private readonly router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    // -----------------------------------------------------
    // LISTEN TO SHARED APPOINTMENT STATE
    // -----------------------------------------------------

    this.appointmentService
      .appointments$
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({

        next: (
          appointments: Appointment[]
        ) => {

          console.log(
            'Queue appointment stream updated:',
            appointments
          );


          // ------------------------------------------------
          // FILTER THE SHARED APPOINTMENT LIST
          // ------------------------------------------------

          this.appointments =
            this.getQueueAppointments(
              appointments
            );


          // ------------------------------------------------
          // UPDATE VIEW
          // ------------------------------------------------

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Queue stream error:',
            error
          );

        }

      });


    // -----------------------------------------------------
    // LOAD APPOINTMENTS FROM BACKEND
    // -----------------------------------------------------

    this.loadQueue();

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }


  // =====================================================
  // QUEUE COUNT
  // =====================================================

  get queueCount(): number {

    return this.appointments.length;

  }


  // =====================================================
  // LOAD QUEUE
  // =====================================================

  loadQueue(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.appointmentService
      .getAppointments()
      .pipe(

        finalize(
          () => {

            this.isLoading = false;

            this.changeDetectorRef.detectChanges();

          }
        )

      )
      .subscribe({

        next: (
          appointments: Appointment[]
        ) => {

          console.log(
            'Queue appointments loaded:',
            appointments
          );


          this.appointments =
            this.getQueueAppointments(
              appointments
            );


          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load appointment queue:',
            error
          );


          this.appointments = [];


          if (
            typeof error === 'object' &&
            error !== null &&
            'status' in error
          ) {

            const httpError =
              error as {
                status?: number;
              };


            if (
              httpError.status === 0
            ) {

              this.errorMessage =
                'Cannot connect to the HMS backend. Make sure Spring Boot is running on port 8081.';

            } else if (
              httpError.status === 404
            ) {

              this.errorMessage =
                'Appointments API endpoint was not found.';

            } else {

              this.errorMessage =
                'Unable to load appointment queue.';

            }

          } else {

            this.errorMessage =
              'Unable to load appointment queue.';

          }


          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // GET QUEUE APPOINTMENTS
  // =====================================================

  private getQueueAppointments(
    appointments: Appointment[]
  ): Appointment[] {

    if (
      !Array.isArray(
        appointments
      )
    ) {

      return [];

    }


    return appointments.filter(
      (
        appointment: Appointment
      ) => {

        return (

          appointment.status ===
            'Confirmed'

          ||

          appointment.status ===
            'Checked-In'

          ||

          appointment.status ===
            'In Consultation'

        );

      }
    );

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshQueue(): void {

    this.loadQueue();

  }


  // =====================================================
  // CHECK IN
  // =====================================================

  checkIn(
    appointment: Appointment
  ): void {

    const id =
      this.getAppointmentId(
        appointment
      );


    if (!id) {

      return;

    }


    if (
      appointment.status !==
      'Confirmed'
    ) {

      window.alert(
        `This appointment cannot be checked in because its current status is "${appointment.status}".`
      );

      return;

    }


    this.isLoading = true;


    this.appointmentService
      .checkInAppointment(
        id
      )
      .pipe(

        finalize(
          () => {

            this.isLoading = false;

          }
        )

      )
      .subscribe({

        next: (
          updatedAppointment: Appointment
        ) => {

          console.log(
            'Appointment checked in:',
            updatedAppointment
          );


          // ------------------------------------------------
          // DO NOT RELOAD THE QUEUE.
          //
          // AppointmentService already updates
          // appointments$.
          //
          // The subscription above automatically receives
          // the new Checked-In appointment.
          // ------------------------------------------------

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to check in appointment:',
            error
          );


          window.alert(
            'Unable to check in appointment.'
          );

        }

      });

  }


  // =====================================================
  // START CONSULTATION
  // =====================================================

  startConsultation(
    appointmentOrId:
      Appointment | string
  ): void {

    const id =
      this.getAppointmentId(
        appointmentOrId
      );


    if (!id) {

      window.alert(
        'Appointment ID is missing.'
      );

      return;

    }


    const appointment =
      this.appointments.find(
        (
          item: Appointment
        ) =>
          item.id === id
      );


    if (!appointment) {

      return;

    }


    // =====================================================
    // ALREADY IN CONSULTATION
    // =====================================================

    if (
      appointment.status ===
      'In Consultation'
    ) {

      this.openConsultation(
        appointment
      );

      return;

    }


    // =====================================================
    // MUST BE CHECKED-IN
    // =====================================================

    if (
      appointment.status !==
      'Checked-In'
    ) {

      window.alert(
        `This appointment cannot start consultation because its current status is "${appointment.status}".`
      );

      return;

    }


    // =====================================================
    // START CONSULTATION
    // =====================================================

    this.isLoading = true;


    this.appointmentService
      .startConsultation(
        id
      )
      .pipe(

        finalize(
          () => {

            this.isLoading = false;

          }
        )

      )
      .subscribe({

        next: (
          updatedAppointment: Appointment
        ) => {

          console.log(
            'Consultation started:',
            updatedAppointment
          );


          // ------------------------------------------------
          // IMPORTANT
          //
          // DO NOT call loadQueue().
          //
          // AppointmentService has already executed:
          //
          // addOrReplaceAppointment()
          //
          // which updates appointments$.
          //
          // The queue subscription receives the updated
          // appointment automatically.
          // ------------------------------------------------

          this.changeDetectorRef.detectChanges();


          // ------------------------------------------------
          // OPEN CONSULTATION
          //
          // Same behavior as AppointmentList.
          // ------------------------------------------------

          this.router.navigate(
            [
              '/consultations',
              'register'
            ],
            {
              queryParams: {
                appointmentId: id
              }
            }
          );

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to start consultation:',
            error
          );


          window.alert(
            'Unable to start consultation.'
          );

        }

      });

  }


  // =====================================================
  // OPEN CONSULTATION
  // =====================================================

  openConsultation(
    appointment: Appointment
  ): void {

    const id =
      this.getAppointmentId(
        appointment
      );


    if (!id) {

      window.alert(
        'Appointment ID is missing.'
      );

      return;

    }


    this.router.navigate(
      [
        '/consultations',
        'register'
      ],
      {
        queryParams: {
          appointmentId: id
        }
      }
    );

  }


  // =====================================================
  // COMPLETE APPOINTMENT
  // =====================================================

  completeAppointment(
    appointmentOrId:
      Appointment | string
  ): void {

    const id =
      this.getAppointmentId(
        appointmentOrId
      );


    if (!id) {

      return;

    }


    const appointment =
      this.appointments.find(
        (
          item: Appointment
        ) =>
          item.id === id
      );


    if (!appointment) {

      return;

    }


    if (
      appointment.status !==
      'In Consultation'
    ) {

      window.alert(
        `This appointment cannot be completed because its current status is "${appointment.status}".`
      );

      return;

    }


    this.isLoading = true;


    this.appointmentService
      .completeAppointment(
        id
      )
      .pipe(

        finalize(
          () => {

            this.isLoading = false;

          }
        )

      )
      .subscribe({

        next: (
          updatedAppointment: Appointment
        ) => {

          console.log(
            'Appointment completed:',
            updatedAppointment
          );


          // ------------------------------------------------
          // Because Completed is NOT a queue status,
          // appointments$ will automatically cause the
          // appointment to disappear from this queue.
          // ------------------------------------------------

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to complete appointment:',
            error
          );


          window.alert(
            'Unable to complete appointment.'
          );

        }

      });

  }


  // =====================================================
  // MARK NO SHOW
  // =====================================================

  markNoShow(
    appointmentOrId:
      Appointment | string
  ): void {

    const id =
      this.getAppointmentId(
        appointmentOrId
      );


    if (!id) {

      return;

    }


    const appointment =
      this.appointments.find(
        (
          item: Appointment
        ) =>
          item.id === id
      );


    if (!appointment) {

      return;

    }


    if (
      appointment.status !==
        'Scheduled' &&

      appointment.status !==
        'Confirmed'
    ) {

      window.alert(
        `This appointment cannot be marked as No Show because its current status is "${appointment.status}".`
      );

      return;

    }


    this.isLoading = true;


    this.appointmentService
      .markNoShow(
        id
      )
      .pipe(

        finalize(
          () => {

            this.isLoading = false;

          }
        )

      )
      .subscribe({

        next: (
          updatedAppointment: Appointment
        ) => {

          console.log(
            'Appointment marked as No Show:',
            updatedAppointment
          );


          // ------------------------------------------------
          // No Show is not a queue status.
          //
          // The shared stream automatically removes it.
          // ------------------------------------------------

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to mark appointment as No Show:',
            error
          );


          window.alert(
            'Unable to mark appointment as No Show.'
          );

        }

      });

  }


  // =====================================================
  // VIEW APPOINTMENT
  // =====================================================

  viewAppointment(
    appointment: Appointment
  ): void {

    const id =
      this.getAppointmentId(
        appointment
      );


    if (!id) {

      return;

    }


    this.router.navigate(
      [
        '/appointments',
        id
      ]
    );

  }


  // =====================================================
  // GET APPOINTMENT ID
  // =====================================================

  private getAppointmentId(
    appointmentOrId:
      Appointment | string
  ): string {

    if (
      typeof appointmentOrId ===
      'string'
    ) {

      return appointmentOrId;

    }


    return appointmentOrId?.id || '';

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: AppointmentStatus
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
  // TRACK BY
  // =====================================================

  trackByAppointmentId(
    index: number,
    appointment: Appointment
  ): string {

    return appointment.id;

  }

}

