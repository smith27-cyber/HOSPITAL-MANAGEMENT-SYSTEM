import { Component, OnInit } from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment.service';

import { Appointment } from '../../../shared/models/appointment.model';


@Component({
  selector: 'app-appointment-consultation',

  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl: './appointment-consultation.html',

  styleUrl: './appointment-consultation.css'
})
export class AppointmentConsultation
  implements OnInit {


  appointment?: Appointment;


  // =========================
  // CONSULTATION DATA
  // =========================

  diagnosis = '';

  consultationNotes = '';

  treatmentPlan = '';

  prescription = '';


  saving = false;


  constructor(
    private route: ActivatedRoute,

    private router: Router,

    private appointmentService:
      AppointmentService
  ) {}


  // =========================
  // INITIALIZE
  // =========================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap
        .get('id');


    if (!id) {

      this.router.navigate([
        '/appointments'
      ]);

      return;

    }


    const existingAppointment =
      this.appointmentService
        .getAppointmentById(id);


    if (!existingAppointment) {

      this.router.navigate([
        '/appointments'
      ]);

      return;

    }


    this.appointment = {
      ...existingAppointment
    };


    // Load existing consultation

    this.diagnosis =
      existingAppointment.diagnosis ||
      '';

    this.consultationNotes =
      existingAppointment.consultationNotes ||
      '';

    this.treatmentPlan =
      existingAppointment.treatmentPlan ||
      '';

    this.prescription =
      existingAppointment.prescription ||
      '';


    // Only allow active consultation

    if (
      this.appointment.status !==
      'In Consultation'
    ) {

      this.router.navigate([
        '/appointments',
        this.appointment.id
      ]);

    }

  }


  // =========================
  // COMPLETE CONSULTATION
  // =========================

  completeConsultation(): void {

    if (!this.appointment) {
      return;
    }


    const diagnosis =
      this.diagnosis.trim();

    const consultationNotes =
      this.consultationNotes.trim();

    const treatmentPlan =
      this.treatmentPlan.trim();

    const prescription =
      this.prescription.trim();


    // =========================
    // VALIDATION
    // =========================

    const missingFields: string[] = [];


    if (!diagnosis) {

      missingFields.push(
        'Diagnosis'
      );

    }


    if (!consultationNotes) {

      missingFields.push(
        'Consultation Notes'
      );

    }


    if (missingFields.length > 0) {

      alert(
        'Please complete the following fields:\n\n' +
        missingFields.join('\n')
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Complete consultation for ${this.appointment.patientName}?`
      );


    if (!confirmed) {
      return;
    }


    this.saving = true;


    // =========================
    // SAVE CONSULTATION
    // =========================

    const saved =
      this.appointmentService
        .saveConsultation(
          this.appointment.id,
          diagnosis,
          consultationNotes,
          treatmentPlan,
          prescription
        );


    this.saving = false;


    if (!saved) {

      alert(
        'Unable to save consultation.'
      );

      return;

    }


    alert(
      'Consultation completed successfully.'
    );


    // Return to appointment details

    this.router.navigate([
      '/appointments',
      this.appointment.id
    ]);

  }


  // =========================
  // CANCEL
  // =========================

  cancel(): void {

    if (!this.appointment) {

      this.router.navigate([
        '/appointments'
      ]);

      return;

    }


    this.router.navigate([
      '/appointments',
      this.appointment.id
    ]);

  }

}
