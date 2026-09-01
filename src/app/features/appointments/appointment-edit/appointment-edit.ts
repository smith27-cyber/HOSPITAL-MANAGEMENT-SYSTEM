import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Appointment,
  AppointmentType
} from '../../../shared/models/appointment.model';

import { Patient } from '../../../shared/models/patient.model';
import { Doctor } from '../../../shared/models/doctor.model';
import { Department } from '../../../shared/models/department.model';

import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';

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

  // =====================================================
  // APPOINTMENT
  // =====================================================

  appointment: Appointment | null = null;


  // =====================================================
  // PATIENTS
  // =====================================================

  patients: Patient[] = [];


  // =====================================================
  // DOCTORS
  // =====================================================

  doctors: Doctor[] = [];


  // =====================================================
  // DEPARTMENTS
  // =====================================================

  departments: Department[] = [];


  // =====================================================
  // APPOINTMENT TYPES
  // =====================================================

  appointmentTypes: AppointmentType[] = [
    'Consultation',
    'Follow-up',
    'Emergency',
    'Check-up'
  ];


  // =====================================================
  // APPOINTMENT STATUSES
  // =====================================================

  appointmentStatuses: Appointment['status'][] = [
    'Scheduled',
    'Confirmed',
    'Checked-In',
    'In Consultation',
    'Completed',
    'Cancelled',
    'No Show'
  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadPatients();

    this.loadDoctors();

    this.loadDepartments();

    this.loadAppointment();

  }


  // =====================================================
  // LOAD PATIENTS
  // =====================================================

  private loadPatients(): void {

    this.patients =
      this.patientService.getPatients();

  }


  // =====================================================
  // LOAD ACTIVE DOCTORS
  // =====================================================

  private loadDoctors(): void {

    this.doctors =
      this.doctorService
        .getDoctors()
        .filter(
          doctor =>
            doctor.status === 'Active'
        );

  }


  // =====================================================
  // LOAD ACTIVE DEPARTMENTS
  // =====================================================

  private loadDepartments(): void {

    this.departments =
      this.departmentService
        .getActiveDepartments();

  }


  // =====================================================
  // LOAD APPOINTMENT
  // =====================================================

  private loadAppointment(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    // ---------------------------------------------------
    // CHECK ID
    // ---------------------------------------------------

    if (!id) {

      alert(
        'Appointment ID was not provided.'
      );

      this.router.navigate([
        '/appointments'
      ]);

      return;

    }


    // ---------------------------------------------------
    // FIND APPOINTMENT
    // ---------------------------------------------------

    const existingAppointment =
      this.appointmentService.getAppointmentById(id);


    if (!existingAppointment) {

      alert(
        'Appointment not found.'
      );

      this.router.navigate([
        '/appointments'
      ]);

      return;

    }


    // ---------------------------------------------------
    // CREATE COPY
    // ---------------------------------------------------

    this.appointment = {
      ...existingAppointment
    };


    // ---------------------------------------------------
    // SYNCHRONIZE DISPLAY VALUES
    // ---------------------------------------------------

    this.syncPatientName();

    this.syncDoctorName();

  }


  // =====================================================
  // PATIENT CHANGE
  // =====================================================

  onPatientChange(): void {

    if (!this.appointment) {

      return;

    }

    this.syncPatientName();

  }


  // =====================================================
  // SYNCHRONIZE PATIENT NAME
  // =====================================================

  private syncPatientName(): void {

    if (!this.appointment) {

      return;

    }


    const patient =
      this.patients.find(
        p =>
          p.id ===
          this.appointment!.patientId
      );


    if (!patient) {

      this.appointment.patientName = '';

      return;

    }


    this.appointment.patientName =
      `${patient.firstName} ${patient.lastName}`;

  }


  // =====================================================
  // DOCTOR CHANGE
  // =====================================================

  onDoctorChange(): void {

    if (!this.appointment) {

      return;

    }


    const doctor =
      this.doctors.find(
        d =>
          d.id ===
          this.appointment!.doctorId
      );


    if (!doctor) {

      this.appointment.doctorName = '';

      return;

    }


    // ---------------------------------------------------
    // UPDATE DOCTOR NAME
    // ---------------------------------------------------

    this.appointment.doctorName =
      `Dr. ${doctor.firstName} ${doctor.lastName}`;


    // ---------------------------------------------------
    // UPDATE DEPARTMENT
    // ---------------------------------------------------

    this.appointment.department =
      doctor.department;

  }


  // =====================================================
  // SYNCHRONIZE DOCTOR NAME
  // =====================================================

  private syncDoctorName(): void {

    if (!this.appointment) {

      return;

    }


    const doctor =
      this.doctors.find(
        d =>
          d.id ===
          this.appointment!.doctorId
      );


    if (!doctor) {

      return;

    }


    this.appointment.doctorName =
      `Dr. ${doctor.firstName} ${doctor.lastName}`;

  }


  // =====================================================
  // SAVE APPOINTMENT
  // =====================================================

  saveAppointment(): void {

    if (!this.appointment) {

      return;

    }


    // ===================================================
    // CLEAN INPUT VALUES
    // ===================================================

    this.appointment.patientId =
      (this.appointment.patientId || '').trim();

    this.appointment.doctorId =
      (this.appointment.doctorId || '').trim();

    this.appointment.department =
      (this.appointment.department || '').trim();

    this.appointment.appointmentDate =
      (this.appointment.appointmentDate || '').trim();

    this.appointment.appointmentTime =
      (this.appointment.appointmentTime || '').trim();

    this.appointment.reason =
      (this.appointment.reason || '').trim();

    this.appointment.notes =
      (this.appointment.notes || '').trim();


    // ===================================================
    // VALIDATION
    // ===================================================

    const missingFields: string[] = [];


    if (!this.appointment.patientId) {

      missingFields.push('Patient');

    }


    if (!this.appointment.doctorId) {

      missingFields.push('Doctor');

    }


    if (!this.appointment.department) {

      missingFields.push('Department');

    }


    if (!this.appointment.appointmentDate) {

      missingFields.push('Appointment Date');

    }


    if (!this.appointment.appointmentTime) {

      missingFields.push('Appointment Time');

    }


    if (!this.appointment.type) {

      missingFields.push('Appointment Type');

    }


    if (!this.appointment.reason) {

      missingFields.push('Reason for Visit');

    }


    if (!this.appointment.status) {

      missingFields.push('Appointment Status');

    }


    if (missingFields.length > 0) {

      alert(
        'Please complete the following required fields:\n\n' +
        missingFields.join('\n')
      );

      return;

    }


    // ===================================================
    // VERIFY PATIENT
    // ===================================================

    const patient =
      this.patients.find(
        p =>
          p.id ===
          this.appointment!.patientId
      );


    if (!patient) {

      alert(
        'Please select a valid patient.'
      );

      return;

    }


    // ===================================================
    // VERIFY DOCTOR
    // ===================================================

    const doctor =
      this.doctors.find(
        d =>
          d.id ===
          this.appointment!.doctorId
      );


    if (!doctor) {

      alert(
        'Please select a valid active doctor.'
      );

      return;

    }


    // ===================================================
    // VERIFY DEPARTMENT
    // =====================================================

    const department =
      this.departments.find(
        d =>
          d.name ===
          this.appointment!.department
      );


    if (!department) {

      alert(
        'Please select a valid active department.'
      );

      return;

    }


    // ===================================================
    // VERIFY DOCTOR'S DEPARTMENT
    // ===================================================

    if (
      doctor.department !==
      this.appointment.department
    ) {

      alert(
        'The selected department does not match the selected doctor.'
      );

      return;

    }


    // ===================================================
    // SYNCHRONIZE PATIENT
    // ===================================================

    this.appointment.patientName =
      `${patient.firstName} ${patient.lastName}`;


    // ===================================================
    // SYNCHRONIZE DOCTOR
    // ===================================================

    this.appointment.doctorName =
      `Dr. ${doctor.firstName} ${doctor.lastName}`;


    // ===================================================
    // UPDATE APPOINTMENT
    // ===================================================

    const updatedAppointment: Appointment = {
      ...this.appointment
    };


    this.appointmentService.updateAppointment(
      updatedAppointment
    );


    // ===================================================
    // SUCCESS
    // ===================================================

    alert(
      'Appointment updated successfully.'
    );


    // ===================================================
    // RETURN TO APPOINTMENTS
    // ===================================================

    this.router.navigate([
      '/appointments'
    ]);

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/appointments'
    ]);

  }

}
