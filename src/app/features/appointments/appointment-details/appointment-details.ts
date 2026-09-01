import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment.service';
import { ConsultationService } from '../../../core/services/consultation.service';

import {
  Appointment,
  AppointmentStatus
} from '../../../shared/models/appointment.model';

import { Consultation } from '../../../shared/models/consultation.model';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.css'
})
export class AppointmentDetails implements OnInit {

  // =====================================================
  // APPOINTMENT
  // =====================================================

  appointment?: Appointment;


  // =====================================================
  // CONSULTATION
  // =====================================================

  consultation?: Consultation;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,

    private appointmentService:
      AppointmentService,

    private consultationService:
      ConsultationService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {
      return;
    }


    this.loadAppointment(id);

  }


  // =====================================================
  // LOAD APPOINTMENT
  // =====================================================

  private loadAppointment(
    id: string
  ): void {

    this.appointment =
      this.appointmentService
        .getAppointmentById(id);


    if (!this.appointment) {

      return;

    }


    this.loadConsultation();

  }


  // =====================================================
  // LOAD CONSULTATION
  // =====================================================

  private loadConsultation(): void {

    if (!this.appointment) {
      return;
    }


    const consultations =
      this.consultationService
        .getConsultations();


    this.consultation =
      consultations.find(
        consultation =>
          consultation.appointmentId ===
          this.appointment!.id
      );

  }


  // =====================================================
  // UPDATE STATUS
  // =====================================================

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


    this.loadConsultation();

  }


  // =====================================================
  // CANCEL APPOINTMENT
  // =====================================================

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


    const confirmed =
      window.confirm(
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


    this.loadConsultation();

  }

}
