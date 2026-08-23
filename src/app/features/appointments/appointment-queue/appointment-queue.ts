import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment.service';

import { Appointment } from '../../../shared/models/appointment.model';


@Component({
  selector: 'app-appointment-queue',

  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl: './appointment-queue.html',

  styleUrl: './appointment-queue.css' 
})
export class AppointmentQueue implements OnInit {


  // =====================================================
  // APPOINTMENTS IN WAITING QUEUE
  // =====================================================

  appointments: Appointment[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadQueue();

  }


  // =====================================================
  // LOAD WAITING QUEUE
  // =====================================================

  loadQueue(): void {

    this.appointments =
      this.appointmentService
        .getAppointments()
        .filter(
          appointment =>
            appointment.status === 'Checked-In'
        );

  }


  // =====================================================
  // QUEUE COUNT
  // =====================================================

  get queueCount(): number {

    return this.appointments.length;

  }


  // =====================================================
  // START CONSULTATION
  // =====================================================

  startConsultation(id: string): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    // Appointment not found

    if (!appointment) {

      return;

    }


    // ===================================================
    // MAKE SURE APPOINTMENT IS STILL CHECKED IN
    // ===================================================

    if (
      appointment.status !== 'Checked-In'
    ) {

      window.alert(
        'This appointment is no longer in the waiting queue.'
      );

      this.loadQueue();

      return;

    }


    // ===================================================
    // CONFIRM ACTION
    // ===================================================

    const confirmed =
      window.confirm(
        `Start consultation for ${appointment.patientName}?`
      );


    if (!confirmed) {

      return;

    }


    // ===================================================
    // START CONSULTATION
    // ===================================================

    const success =
      this.appointmentService
        .startConsultation(id);


    // ===================================================
    // CHECK RESULT
    // ===================================================

    if (!success) {

      window.alert(
        'Unable to start consultation.'
      );

      this.loadQueue();

      return;

    }


    // ===================================================
    // REMOVE FROM QUEUE
    // =====================================================

    this.loadQueue();


    // ===================================================
    // OPEN CONSULTATION FORM
    // =====================================================

    this.router.navigate(
      ['/consultations/register'],
      {
        queryParams: {
          appointmentId: id
        }
      }
    );

  }


  // =====================================================
  // REFRESH QUEUE
  // =====================================================

  refreshQueue(): void {

    this.loadQueue();

  }


  // =====================================================
  // VIEW APPOINTMENT
  // =====================================================

  viewAppointment(id: string): void {

    this.router.navigate([
      '/appointments',
      id
    ]);

  }


  // =====================================================
  // VIEW PATIENT
  // =====================================================

  viewPatient(patientId: string): void {

    this.router.navigate([
      '/patients',
      patientId
    ]);

  }

}
