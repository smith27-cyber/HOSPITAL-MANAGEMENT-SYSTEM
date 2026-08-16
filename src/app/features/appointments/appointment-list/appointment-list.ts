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

  appointments: Appointment[] = [];

  searchTerm = '';

  selectedDepartment = '';

  selectedStatus: AppointmentStatus | '' = '';

  constructor(
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }


  // =========================
  // Load Appointments
  // =========================

  loadAppointments(): void {

    this.appointments =
      this.appointmentService.getAppointments();

  }


  // =========================
  // Filtered Appointments
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
  // Statistics
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


  // =========================
  // Clear Filters
  // =========================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedDepartment = '';

    this.selectedStatus = '';

  }


  // =========================
  // Cancel Appointment
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


    if (appointment.status === 'Cancelled') {
      return;
    }


    const confirmed = window.confirm(
      `Are you sure you want to cancel appointment ${appointment.id}?`
    );

    if (!confirmed) {
      return;
    }


    this.appointmentService.cancelAppointment(id);

    this.loadAppointments();

  }

}
