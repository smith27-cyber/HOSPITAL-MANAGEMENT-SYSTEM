
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


  // =========================
  // APPOINTMENTS
  // =========================

  appointments: Appointment[] = [];


  // =========================
  // SEARCH
  // =========================

  searchTerm = '';


  // =========================
  // FILTERS
  // =========================

  selectedDepartment = '';

  selectedStatus: AppointmentStatus | '' = '';


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private appointmentService: AppointmentService
  ) {}


  // =========================
  // INITIALIZE
  // =========================

  ngOnInit(): void {

    this.loadAppointments();

  }


  // =========================
  // LOAD APPOINTMENTS
  // =========================

  loadAppointments(): void {

    this.appointments =
      this.appointmentService.getAppointments();

  }


  // =========================
  // FILTERED APPOINTMENTS
  // =========================

  get filteredAppointments(): Appointment[] {

    const term =
      this.searchTerm
        .toLowerCase()
        .trim();


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


  // =========================
  // STATISTICS
  // =========================


  get totalAppointments(): number {

    return this.appointments.length;

  }


  get scheduledAppointments(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status === 'Scheduled'
    ).length;

  }


  get confirmedAppointments(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status === 'Confirmed'
    ).length;

  }


  get checkedInAppointments(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status === 'Checked-In'
    ).length;

  }


  get completedAppointments(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status === 'Completed'
    ).length;

  }


  get cancelledAppointments(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status === 'Cancelled'
    ).length;

  }


  get noShowAppointments(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status === 'No Show'
    ).length;

  }


  // =========================
  // CLEAR FILTERS
  // =========================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedDepartment = '';

    this.selectedStatus = '';

  }


  // =========================
  // CONFIRM APPOINTMENT
  // =========================

  confirmAppointment(id: string): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    if (!appointment) {
      return;
    }


    // Only Scheduled appointments
    // can be confirmed.

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


    this.appointmentService.updateStatus(
      id,
      'Confirmed'
    );


    this.loadAppointments();

  }


  // =========================
  // CHECK IN PATIENT
  // =========================

  checkInAppointment(id: string): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    if (!appointment) {
      return;
    }


    // Only Confirmed appointments
    // can be checked in.

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


    this.appointmentService.updateStatus(
      id,
      'Checked-In'
    );


    this.loadAppointments();

  }


  // =========================
// COMPLETE APPOINTMENT
// =========================

completeAppointment(id: string): void {

  const appointment =
    this.appointments.find(
      appointment =>
        appointment.id === id
    );


  if (!appointment) {
    return;
  }


  // Only appointments currently
  // in consultation can be completed.

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


  this.appointmentService.updateStatus(
    id,
    'Completed'
  );


  this.loadAppointments();

}


  // =========================
  // MARK NO SHOW
  // =========================

  markNoShow(id: string): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    if (!appointment) {
      return;
    }


    // No-show applies to
    // Scheduled or Confirmed.

    if (
      appointment.status !== 'Scheduled' &&
      appointment.status !== 'Confirmed'
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        `Mark appointment ${appointment.id} as No Show?`
      );


    if (!confirmed) {
      return;
    }


    this.appointmentService.updateStatus(
      id,
      'No Show'
    );


    this.loadAppointments();

  }


  // =========================
  // CANCEL APPOINTMENT
  // =========================

  cancelAppointment(id: string): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    if (!appointment) {
      return;
    }


    // Don't cancel an already
    // cancelled appointment.

    if (
      appointment.status ===
      'Cancelled'
    ) {
      return;
    }


    // Don't cancel completed
    // appointments.

    if (
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


    this.appointmentService
      .cancelAppointment(id);


    this.loadAppointments();

  }


}
