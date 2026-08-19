import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  selector: 'app-appointment-register',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './appointment-register.html',
  styleUrl: './appointment-register.css'
})
export class AppointmentRegister implements OnInit {

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
  // APPOINTMENT
  // =====================================================

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


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadPatients();

    this.loadDoctors();

    this.loadDepartments();

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
  // PATIENT SELECTION
  // =====================================================

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


  // =====================================================
  // DOCTOR SELECTION
  // =====================================================

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


    // Save doctor's full name

    this.appointment.doctorName =
      `Dr. ${doctor.firstName} ${doctor.lastName}`;


    // Automatically use doctor's department

    this.appointment.department =
      doctor.department;

  }


  // =====================================================
  // SAVE APPOINTMENT
  // =====================================================

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


    // -----------------------------------------------------
    // MAKE SURE DOCTOR STILL EXISTS
    // -----------------------------------------------------

    const doctor =
      this.doctors.find(
        d =>
          d.id ===
          this.appointment.doctorId
      );


    if (!doctor) {

      alert(
        'Please select a valid active doctor.'
      );

      return;

    }


    // -----------------------------------------------------
    // MAKE SURE DEPARTMENT STILL EXISTS
    // -----------------------------------------------------

    const department =
      this.departments.find(
        d =>
          d.name ===
          this.appointment.department
      );


    if (!department) {

      alert(
        'Please select a valid active department.'
      );

      return;

    }


    // -----------------------------------------------------
    // GENERATE APPOINTMENT ID
    // -----------------------------------------------------

    this.appointment.id =
      this.generateAppointmentId();


    this.appointment.createdAt =
      new Date();


    this.appointment.status =
      'Scheduled';


    // -----------------------------------------------------
    // SAVE
    // -----------------------------------------------------

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


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/appointments'
    ]);

  }


  // =====================================================
  // GENERATE APPOINTMENT ID
  // =====================================================

  private generateAppointmentId(): string {

    const timestamp =
      Date.now()
        .toString()
        .slice(-6);


    return `APT-${timestamp}`;

  }

}
