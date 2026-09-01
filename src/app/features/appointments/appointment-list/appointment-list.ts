import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment.service';

import {
  Appointment,
  AppointmentStatus
} from '../../../shared/models/appointment.model';


@Component({
  selector: 'app-appointment-list',

  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl: './appointment-list.html',

  styleUrl: './appointment-list.css'
})
export class AppointmentList implements OnInit {


  // =====================================================
  // APPOINTMENTS
  // =====================================================

  appointments: Appointment[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // FILTERS
  // =====================================================

  selectedDepartment = '';

  selectedStatus:
    AppointmentStatus | '' = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private appointmentService: AppointmentService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadAppointments();

  }


  // =====================================================
  // LOAD APPOINTMENTS
  // =====================================================

  loadAppointments(): void {

    this.appointments =
      this.appointmentService
        .getAppointments();

  }


  // =====================================================
  // FILTERED APPOINTMENTS
  // =====================================================

  get filteredAppointments(): Appointment[] {

    const term =
      this.searchTerm
        .trim()
        .toLowerCase();


    return this.appointments.filter(
      appointment => {

        const matchesSearch =
          !term ||

          appointment.id
            .toLowerCase()
            .includes(term) ||

          appointment.patientName
            .toLowerCase()
            .includes(term) ||

          appointment.patientId
            .toLowerCase()
            .includes(term) ||

          appointment.doctorName
            .toLowerCase()
            .includes(term) ||

          appointment.department
            .toLowerCase()
            .includes(term) ||

          appointment.type
            .toLowerCase()
            .includes(term);


        const matchesDepartment =
          !this.selectedDepartment ||

          appointment.department ===
          this.selectedDepartment;


        const matchesStatus =
          !this.selectedStatus ||

          appointment.status ===
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

  get totalAppointments(): number {

    return this.appointments.length;

  }


  get scheduledAppointments(): number {

    return this.countByStatus(
      'Scheduled'
    );

  }


  get confirmedAppointments(): number {

    return this.countByStatus(
      'Confirmed'
    );

  }


  get checkedInAppointments(): number {

    return this.countByStatus(
      'Checked-In'
    );

  }


  get inConsultationAppointments(): number {

    return this.countByStatus(
      'In Consultation'
    );

  }


  get completedAppointments(): number {

    return this.countByStatus(
      'Completed'
    );

  }


  get cancelledAppointments(): number {

    return this.countByStatus(
      'Cancelled'
    );

  }


  get noShowAppointments(): number {

    return this.countByStatus(
      'No Show'
    );

  }


  private countByStatus(
    status: AppointmentStatus
  ): number {

    return this.appointments.filter(
      appointment =>
        appointment.status === status
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
  // CONFIRM APPOINTMENT
  // =====================================================

  confirmAppointment(
    id: string
  ): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    if (!appointment) {

      return;

    }


    if (
      appointment.status !==
      'Scheduled'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Confirm appointment ${appointment.id} for ${appointment.patientName}?`
      );


    if (!confirmed) {

      return;

    }


    const success =
      this.appointmentService
        .confirmAppointment(id);


    if (!success) {

      alert(
        'Unable to confirm this appointment.'
      );

      return;

    }


    this.loadAppointments();

  }


  // =====================================================
  // CHECK IN
  // =====================================================

  checkInAppointment(
    id: string
  ): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    if (!appointment) {

      return;

    }


    if (
      appointment.status !==
      'Confirmed'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Check in ${appointment.patientName} for appointment ${appointment.id}?`
      );


    if (!confirmed) {

      return;

    }


    const success =
      this.appointmentService
        .checkInAppointment(id);


    if (!success) {

      alert(
        'Unable to check in this patient.'
      );

      return;

    }


    this.loadAppointments();

  }


  // =====================================================
  // START CONSULTATION
  // =====================================================

  startConsultation(
    id: string
  ): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    if (!appointment) {

      return;

    }


    if (
      appointment.status !==
      'Checked-In'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Start consultation for ${appointment.patientName}?`
      );


    if (!confirmed) {

      return;

    }


    const success =
      this.appointmentService
        .startConsultation(id);


    if (!success) {

      alert(
        'Unable to start consultation.'
      );

      return;

    }


    this.loadAppointments();

  }


  // =====================================================
  // COMPLETE APPOINTMENT
  // =====================================================

  completeAppointment(
    id: string
  ): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    if (!appointment) {

      return;

    }


    if (
      appointment.status !==
      'In Consultation'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Mark appointment ${appointment.id} for ${appointment.patientName} as completed?`
      );


    if (!confirmed) {

      return;

    }


    const success =
      this.appointmentService
        .completeAppointment(id);


    if (!success) {

      alert(
        'Unable to complete this appointment.'
      );

      return;

    }


    this.loadAppointments();

  }


  // =====================================================
  // MARK NO SHOW
  // =====================================================

  markNoShow(
    id: string
  ): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    if (!appointment) {

      return;

    }


    if (
      appointment.status !== 'Scheduled' &&
      appointment.status !== 'Confirmed'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Mark appointment ${appointment.id} for ${appointment.patientName} as No Show?`
      );


    if (!confirmed) {

      return;

    }


    const success =
      this.appointmentService
        .markNoShow(id);


    if (!success) {

      alert(
        'Unable to mark appointment as No Show.'
      );

      return;

    }


    this.loadAppointments();

  }


  // =====================================================
  // CANCEL APPOINTMENT
  // =====================================================

  cancelAppointment(
    id: string
  ): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    if (!appointment) {

      return;

    }


    if (
      appointment.status ===
      'Cancelled' ||
      appointment.status ===
      'Completed'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to cancel appointment ${appointment.id}?`
      );


    if (!confirmed) {

      return;

    }


    const success =
      this.appointmentService
        .cancelAppointment(id);


    if (!success) {

      alert(
        'Unable to cancel this appointment.'
      );

      return;

    }


    this.loadAppointments();

  }
// =========================
// DELETE APPOINTMENT
// =========================

deleteAppointment(id: string): void {

  const appointment =
    this.appointments.find(
      appointment =>
        appointment.id === id
    );

  if (!appointment) {
    return;
  }


  // Only cancelled appointments
  // can be permanently deleted.

  if (
    appointment.status !== 'Cancelled'
  ) {
    return;
  }


  const confirmed =
    window.confirm(
      `Are you sure you want to permanently delete appointment ${appointment.id} for ${appointment.patientName}? This action cannot be undone.`
    );


  if (!confirmed) {
    return;
  }


  this.appointmentService
    .deleteAppointment(id);


  this.loadAppointments();

}
}
