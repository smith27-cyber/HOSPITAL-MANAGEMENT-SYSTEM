import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { Appointment } from '../../../shared/models/appointment.model';

@Component({
  selector: 'app-appointment-edit',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './appointment-edit.html',
  styleUrl: './appointment-edit.css'
})
export class AppointmentEdit implements OnInit {

  appointment?: Appointment;

  patients: any[] = [];

  doctors = [
    {
      id: 'DOC001',
      name: 'Dr. John Smith',
      department: 'General Medicine'
    },
    {
      id: 'DOC002',
      name: 'Dr. Sarah Williams',
      department: 'Cardiology'
    },
    {
      id: 'DOC003',
      name: 'Dr. Michael Brown',
      department: 'Dental'
    }
  ];

  departments = [
    'General Medicine',
    'Cardiology',
    'Dental',
    'Orthopedics'
  ];

  appointmentStatuses: Appointment['status'][] = [
    'Scheduled',
    'Confirmed',
    'Completed',
    'Cancelled',
    'No Show'
  ];

  appointmentTypes: Appointment['type'][] = [
    'Consultation',
    'Follow-up',
    'Emergency',
    'Check-up'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private patientService: PatientService
  ) {}

  // =========================
  // INITIALIZE
  // =========================

  ngOnInit(): void {

    // Load patients
    this.patients =
      this.patientService.getPatients();

    // Get appointment ID
    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.router.navigate([
        '/appointments'
      ]);

      return;
    }

    // Find appointment
    const existingAppointment =
      this.appointmentService
        .getAppointmentById(id);

    if (!existingAppointment) {

      this.router.navigate([
        '/appointments'
      ]);

      return;
    }

    // Create editable copy
    this.appointment = {
      ...existingAppointment
    };
  }


  // =========================
  // PATIENT CHANGE
  // =========================

  onPatientChange(): void {

    if (!this.appointment) {
      return;
    }

    const patient =
      this.patients.find(
        p =>
          p.id === this.appointment!.patientId
      );

    if (!patient) {

      this.appointment.patientName = '';

      return;
    }

    this.appointment.patientName =
      `${patient.firstName} ${patient.lastName}`;
  }


  // =========================
  // DOCTOR CHANGE
  // =========================

  onDoctorChange(): void {

    if (!this.appointment) {
      return;
    }

    const doctor =
      this.doctors.find(
        d =>
          d.id === this.appointment!.doctorId
      );

    if (!doctor) {

      this.appointment.doctorName = '';

      return;
    }

    this.appointment.doctorName =
      doctor.name;

    this.appointment.department =
      doctor.department;
  }


  // =========================
  // SAVE
  // =========================

  saveAppointment(): void {

    if (!this.appointment) {
      return;
    }

    /*
     * Clean text values
     */

    this.appointment.patientId =
      this.appointment.patientId?.trim();

    this.appointment.doctorId =
      this.appointment.doctorId?.trim();

    this.appointment.department =
      this.appointment.department?.trim();

    this.appointment.appointmentDate =
      this.appointment.appointmentDate?.trim();

    this.appointment.appointmentTime =
      this.appointment.appointmentTime?.trim();

    this.appointment.reason =
      this.appointment.reason?.trim();

    this.appointment.notes =
      this.appointment.notes?.trim();


    /*
     * Validate fields
     */

    const missingFields: string[] = [];


    if (!this.appointment.patientId) {

      missingFields.push(
        'Patient'
      );

    }


    if (!this.appointment.doctorId) {

      missingFields.push(
        'Doctor'
      );

    }


    if (!this.appointment.department) {

      missingFields.push(
        'Department'
      );

    }


    if (!this.appointment.appointmentDate) {

      missingFields.push(
        'Appointment Date'
      );

    }


    if (!this.appointment.appointmentTime) {

      missingFields.push(
        'Appointment Time'
      );

    }


    if (!this.appointment.type) {

      missingFields.push(
        'Appointment Type'
      );

    }


    if (!this.appointment.reason) {

      missingFields.push(
        'Reason for Visit'
      );

    }


    if (!this.appointment.status) {

      missingFields.push(
        'Appointment Status'
      );

    }


    if (missingFields.length > 0) {

      console.log(
        'Missing fields:',
        missingFields
      );

      alert(
        'Please complete the following required fields:\n\n' +
        missingFields.join('\n')
      );

      return;
    }


    /*
     * Update appointment
     */

    this.appointmentService.updateAppointment(
      {
        ...this.appointment
      }
    );


    alert(
      'Appointment updated successfully.'
    );


    this.router.navigate([
      '/appointments'
    ]);

  }


  // =========================
  // CANCEL
  // =========================

  cancel(): void {

    this.router.navigate([
      '/appointments'
    ]);

  }

}
