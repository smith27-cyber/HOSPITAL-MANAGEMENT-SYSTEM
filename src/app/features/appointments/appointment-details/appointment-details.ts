import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment.service';
import {
  Appointment,
  AppointmentStatus
} from '../../../shared/models/appointment.model';

@Component({
  selector: 'app-appointment-details',
  imports: [
    RouterLink
  ],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.css'
})
export class AppointmentDetails implements OnInit {

  appointment?: Appointment;

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.appointment =
        this.appointmentService
          .getAppointmentById(id);

    }

  }


  updateStatus(
    status: AppointmentStatus
  ): void {

    if (!this.appointment) {
      return;
    }

    this.appointmentService.updateStatus(
      this.appointment.id,
      status
    );

    this.appointment =
      this.appointmentService
        .getAppointmentById(
          this.appointment.id
        );

  }


  cancelAppointment(): void {

    if (!this.appointment) {
      return;
    }

    if (
      this.appointment.status ===
      'Cancelled'
    ) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to cancel appointment ${this.appointment.id}?`
    );

    if (!confirmed) {
      return;
    }

    this.appointmentService
      .cancelAppointment(
        this.appointment.id
      );

    this.appointment =
      this.appointmentService
        .getAppointmentById(
          this.appointment.id
        );

  }

}
