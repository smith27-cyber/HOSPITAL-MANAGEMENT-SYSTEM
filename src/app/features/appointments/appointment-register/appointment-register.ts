import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Appointment,
  AppointmentType
} from '../../../shared/models/appointment.model';

import { Patient } from '../../../shared/models/patient.model';

import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-appointment-register',
  imports: [FormsModule],
  templateUrl: './appointment-register.html',
  styleUrl: './appointment-register.css'
})
export class AppointmentRegister implements OnInit {

  patients: Patient[] = [];


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


  appointmentTypes: AppointmentType[] = [
    'Consultation',
    'Follow-up',
    'Emergency',
    'Check-up'
  ];


  appointment: Appointment = {

    id: '',

    patientId: '',
    patientName: '',

    doctorId: '',
    doctorName: '',

    department: '',

    appointmentDate: '',
    appointmentTime: '',

    type: 'Consultation',

    reason: '',

    status: 'Scheduled',

    notes: '',

    createdAt: new Date()

  };


  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private router: Router
  ) {}


  ngOnInit(): void {

    this.patients =
      this.patientService.getPatients();

  }


  // =========================
  // Patient Selection
  // =========================

  onPatientChange(): void {

    const patient =
      this.patients.find(
        p =>
          p.id ===
          this.appointment.patientId
      );

    if (!patient) {

      this.appointment.patientName = '';

      return;

    }

    this.appointment.patientName =
      `${patient.firstName} ${patient.lastName}`;

  }


  // =========================
  // Doctor Selection
  // =========================

  onDoctorChange(): void {

    const doctor =
      this.doctors.find(
        d =>
          d.id ===
          this.appointment.doctorId
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
  // Save Appointment
  // =========================

  saveAppointment(): void {

    if (
      !this.appointment.patientId ||
      !this.appointment.doctorId ||
      !this.appointment.department ||
      !this.appointment.appointmentDate ||
      !this.appointment.appointmentTime ||
      !this.appointment.reason
    ) {

      alert(
        'Please complete all required fields.'
      );

      return;

    }


    this.appointment.id =
      this.generateAppointmentId();


    this.appointment.createdAt =
      new Date();


    this.appointment.status =
      'Scheduled';


    this.appointmentService.addAppointment(
      this.appointment
    );


    alert(
      'Appointment registered successfully.'
    );


    this.router.navigate([
      '/appointments'
    ]);

  }


  // =========================
  // Cancel
  // =========================

  cancel(): void {

    this.router.navigate([
      '/appointments'
    ]);

  }


  // =========================
  // Generate ID
  // =========================

  private generateAppointmentId(): string {

    const timestamp =
      Date.now()
        .toString()
        .slice(-6);

    return `APT-${timestamp}`;

  }

}
