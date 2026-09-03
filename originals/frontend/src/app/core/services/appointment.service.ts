// =====================================================
// APPOINTMENT SERVICE
// File:
// src/app/core/services/appointment.service.ts
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  tap
} from 'rxjs';

import {
  Appointment,
  AppointmentStatus
} from '../../shared/models/appointment.model';


@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  // =====================================================
  // API URL
  // =====================================================

  private readonly apiUrl =
    'http://localhost:8081/api/appointments';


  // =====================================================
  // APPOINTMENTS STATE
  // =====================================================

  private readonly appointmentsSubject =
    new BehaviorSubject<Appointment[]>([]);


  // =====================================================
  // PUBLIC APPOINTMENTS STREAM
  // =====================================================

  readonly appointments$ =
    this.appointmentsSubject.asObservable();


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {

    // Automatically load appointments when the
    // service is first created.

    this.loadInitialAppointments();

  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  private loadInitialAppointments(): void {

    this.http
      .get<Appointment[]>(
        this.apiUrl
      )
      .subscribe({

        next: (
          appointments: Appointment[]
        ) => {

          const safeAppointments =
            Array.isArray(appointments)
              ? appointments
              : [];


          this.setAppointments(
            safeAppointments
          );


          console.log(
            'Initial appointments loaded:',
            safeAppointments
          );

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load initial appointments:',
            error
          );

          this.setAppointments([]);

        }

      });

  }


  // =====================================================
  // GET ALL APPOINTMENTS
  // =====================================================

  getAppointments(): Observable<Appointment[]> {

    return this.http
      .get<Appointment[]>(
        this.apiUrl
      )
      .pipe(

        tap(
          (
            appointments: Appointment[]
          ) => {

            const safeAppointments =
              Array.isArray(appointments)
                ? appointments
                : [];


            this.setAppointments(
              safeAppointments
            );

          }
        )

      );

  }


  // =====================================================
  // GET CURRENT SNAPSHOT
  // =====================================================

  getAppointmentsSnapshot(): Appointment[] {

    return [
      ...this.appointmentsSubject.value
    ];

  }


  // =====================================================
  // GET APPOINTMENT BY ID
  // =====================================================

  getAppointmentById(
    id: string
  ): Observable<Appointment> {

    return this.http
      .get<Appointment>(
        `${this.apiUrl}/${encodeURIComponent(id)}`
      )
      .pipe(

        tap(
          (
            appointment: Appointment
          ) => {

            this.addOrReplaceAppointment(
              appointment
            );

          }
        )

      );

  }


  // =====================================================
  // ADD APPOINTMENT
  // =====================================================

  addAppointment(
    appointment: Appointment
  ): Observable<Appointment> {

    return this.http
      .post<Appointment>(
        this.apiUrl,
        appointment
      )
      .pipe(

        tap(
          (
            newAppointment: Appointment
          ) => {

            console.log(
              'Appointment successfully created:',
              newAppointment
            );


            this.addOrReplaceAppointment(
              newAppointment
            );

          }
        )

      );

  }


  // =====================================================
  // UPDATE APPOINTMENT
  // =====================================================

  updateAppointment(
    appointment: Appointment
  ): Observable<Appointment> {

    return this.http
      .put<Appointment>(
        `${this.apiUrl}/${encodeURIComponent(appointment.id)}`,
        appointment
      )
      .pipe(

        tap(
          (
            updatedAppointment: Appointment
          ) => {

            this.addOrReplaceAppointment(
              updatedAppointment
            );

          }
        )

      );

  }


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  updateStatus(
    id: string,
    status: AppointmentStatus
  ): Observable<Appointment> {

    return this.http
      .patch<Appointment>(
        `${this.apiUrl}/${encodeURIComponent(id)}/status`,
        null,
        {
          params: {
            status
          }
        }
      )
      .pipe(

        tap(
          (
            updatedAppointment: Appointment
          ) => {

            this.addOrReplaceAppointment(
              updatedAppointment
            );

          }
        )

      );

  }


  // =====================================================
  // CONFIRM
  // =====================================================

  confirmAppointment(
    id: string
  ): Observable<Appointment> {

    return this.updateStatus(
      id,
      'Confirmed'
    );

  }


  // =====================================================
  // CHECK IN
  // =====================================================

  checkInAppointment(
    id: string
  ): Observable<Appointment> {

    return this.updateStatus(
      id,
      'Checked-In'
    );

  }


  // =====================================================
  // START CONSULTATION
  // =====================================================

  startConsultation(
    id: string
  ): Observable<Appointment> {

    return this.updateStatus(
      id,
      'In Consultation'
    );

  }


  // =====================================================
  // COMPLETE
  // =====================================================

  completeAppointment(
    id: string
  ): Observable<Appointment> {

    return this.updateStatus(
      id,
      'Completed'
    );

  }


  // =====================================================
  // NO SHOW
  // =====================================================

  markNoShow(
    id: string
  ): Observable<Appointment> {

    return this.updateStatus(
      id,
      'No Show'
    );

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancelAppointment(
    id: string
  ): Observable<Appointment> {

    return this.http
      .patch<Appointment>(
        `${this.apiUrl}/${encodeURIComponent(id)}/cancel`,
        null
      )
      .pipe(

        tap(
          (
            updatedAppointment: Appointment
          ) => {

            this.addOrReplaceAppointment(
              updatedAppointment
            );

          }
        )

      );

  }


  // =====================================================
  // DELETE
  // =====================================================

  deleteAppointment(
    id: string
  ): Observable<void> {

    return this.http
      .delete<void>(
        `${this.apiUrl}/${encodeURIComponent(id)}`
      )
      .pipe(

        tap(
          () => {

            const updated =
              this.appointmentsSubject.value
                .filter(
                  (
                    appointment: Appointment
                  ) =>
                    appointment.id !== id
                );


            this.setAppointments(
              updated
            );

          }
        )

      );

  }


  // =====================================================
  // SET APPOINTMENTS
  // =====================================================

  private setAppointments(
    appointments: Appointment[]
  ): void {

    this.appointmentsSubject.next([
      ...appointments
    ]);

  }


  // =====================================================
  // ADD OR REPLACE APPOINTMENT
  // =====================================================

  private addOrReplaceAppointment(
    appointment: Appointment
  ): void {

    if (
      !appointment ||
      !appointment.id
    ) {

      return;

    }


    const currentAppointments =
      this.appointmentsSubject.value;


    const index =
      currentAppointments.findIndex(
        (
          existingAppointment: Appointment
        ) =>
          existingAppointment.id ===
          appointment.id
      );


    let updatedAppointments:
      Appointment[];


    // ===================================================
    // NEW APPOINTMENT
    // ===================================================

    if (index === -1) {

      updatedAppointments = [

        appointment,

        ...currentAppointments

      ];

    }

    // ===================================================
    // EXISTING APPOINTMENT
    // ===================================================

    else {

      updatedAppointments = [
        ...currentAppointments
      ];


      updatedAppointments[index] =
        appointment;

    }


    this.setAppointments(
      updatedAppointments
    );

  }

}
