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

  appointments: Appointment[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQueue();
  }


  // =========================
  // LOAD WAITING QUEUE
  // =========================

  loadQueue(): void {

    this.appointments =
      this.appointmentService
        .getAppointments()
        .filter(
          appointment =>
            appointment.status === 'Checked-In'
        );

  }


  // =========================
  // QUEUE COUNT
  // =========================

  get queueCount(): number {

    return this.appointments.length;

  }


  // =========================
  // START CONSULTATION
  // =========================

  startConsultation(id: string): void {

    const appointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );

    if (!appointment) {
      return;
    }


    const confirmed =
      window.confirm(
        `Start consultation for ${appointment.patientName}?`
      );

    if (!confirmed) {
      return;
    }


    // Change status
    this.appointmentService.updateStatus(
      id,
      'In Consultation'
    );


    // Remove patient from waiting queue
    this.loadQueue();


    // Open consultation screen
    this.router.navigate([
      '/appointments',
      id,
      'consultation'
    ]);

  }


  // =========================
  // REFRESH QUEUE
  // =========================

  refreshQueue(): void {

    this.loadQueue();

  }

}
