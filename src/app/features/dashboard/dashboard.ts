import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Patient } from '../../shared/models/patient.model';
import { Doctor } from '../../shared/models/doctor.model';
import { Department } from '../../shared/models/department.model';
import { Appointment } from '../../shared/models/appointment.model';

import { PatientService } from '../../core/services/patient.service';
import { DoctorService } from '../../core/services/doctor.service';
import { DepartmentService } from '../../core/services/department.service';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  patients: Patient[] = [];

  doctors: Doctor[] = [];

  departments: Department[] = [];

  appointments: Appointment[] = [];


  // =====================================================
  // DASHBOARD STATISTICS
  // =====================================================

  totalPatients = 0;

  activeDoctors = 0;

  totalDepartments = 0;
  totalAppointments = 0;

  todaysAppointments = 0;


  // =====================================================
  // TODAY'S APPOINTMENTS
  // =====================================================

  todayAppointments: Appointment[] = [];


  // =====================================================
  // CURRENT DATE
  // =====================================================

  currentDate = new Date();


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadDashboardData();

  }


  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  private loadDashboardData(): void {

    // ---------------------------------------------------
    // PATIENTS
    // ---------------------------------------------------

    this.patients =
      this.patientService.getPatients();

    this.totalPatients =
      this.patients.length;


    // ---------------------------------------------------
    // DOCTORS
    // ---------------------------------------------------

    this.doctors =
      this.doctorService
        .getDoctors();

    this.activeDoctors =
      this.doctors.filter(
        doctor =>
          doctor.status === 'Active'
      ).length;


    // ---------------------------------------------------
    // DEPARTMENTS
    // ---------------------------------------------------

    this.departments =
      this.departmentService
        .getActiveDepartments();

    this.totalDepartments =
      this.departments.length;


    // ---------------------------------------------------
    // APPOINTMENTS
    // ---------------------------------------------------

   this.appointments =
  this.appointmentService.getAppointments();


// ---------------------------------------------------
// TOTAL APPOINTMENTS
// ---------------------------------------------------

this.totalAppointments =
  this.appointments.length;


// ---------------------------------------------------
// TODAY'S APPOINTMENTS
// ---------------------------------------------------

this.todayAppointments =
  this.appointments
    .filter(
      appointment =>
        this.isToday(
          appointment.appointmentDate
        )
    )
    .sort(
      (a, b) =>
        a.appointmentTime.localeCompare(
          b.appointmentTime
        )
    );


this.todaysAppointments =
  this.todayAppointments.length;
  }

  // =====================================================
  // CHECK WHETHER DATE IS TODAY
  // =====================================================

 private isToday(dateValue: string): boolean {

  if (!dateValue) {

    return false;

  }


  // Get today's date as YYYY-MM-DD

  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      today.getDate()
    ).padStart(2, '0');


  const todayString =
    `${year}-${month}-${day}`;


  // Extract YYYY-MM-DD from appointment date

  const appointmentDate =
    dateValue.substring(0, 10);


  return appointmentDate === todayString;

}


  // =====================================================
  // FORMAT CURRENT DATE
  // =====================================================

  get formattedDate(): string {

    return this.currentDate.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }
    );

  }


  // =====================================================
  // GET PATIENT NAME
  // =====================================================

  getPatientName(
    appointment: Appointment
  ): string {

    if (appointment.patientName) {

      return appointment.patientName;

    }


    const patient =
      this.patients.find(
        p =>
          p.id ===
          appointment.patientId
      );


    if (!patient) {

      return 'Unknown Patient';

    }


    return `${patient.firstName} ${patient.lastName}`;

  }


  // =====================================================
  // GET DOCTOR NAME
  // =====================================================

  getDoctorName(
    appointment: Appointment
  ): string {

    if (appointment.doctorName) {

      return appointment.doctorName;

    }


    const doctor =
      this.doctors.find(
        d =>
          d.id ===
          appointment.doctorId
      );


    if (!doctor) {

      return 'Unknown Doctor';

    }


    return `Dr. ${doctor.firstName} ${doctor.lastName}`;

  }


  // =====================================================
  // GET PATIENT ID
  // =====================================================

  getPatientId(
    appointment: Appointment
  ): string {

    return appointment.patientId || 'N/A';

  }


  // =====================================================
  // GET PATIENT INITIALS
  // =====================================================

  getPatientInitials(
    appointment: Appointment
  ): string {

    const name =
      this.getPatientName(
        appointment
      );


    if (
      !name ||
      name === 'Unknown Patient'
    ) {

      return '??';

    }


    const parts =
      name
        .replace('Dr. ', '')
        .trim()
        .split(' ')
        .filter(Boolean);


    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();

    }


    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();

  }


  // =====================================================
  // VIEW ALL APPOINTMENTS
  // =====================================================

  viewAppointments(): void {

    this.router.navigate([
      '/appointments'
    ]);

  }


  // =====================================================
  // REGISTER PATIENT
  // =====================================================

  registerPatient(): void {

    this.router.navigate([
      '/patients/register'
    ]);

  }


  // =====================================================
  // NEW APPOINTMENT
  // =====================================================

  newAppointment(): void {

    this.router.navigate([
      '/appointments/register'
    ]);

  }


  // =====================================================
  // PRESCRIPTION
  // =====================================================

  createPrescription(): void {

    /*
     * Pharmacy/prescription module will be
     * connected here when that module is ready.
     */

    alert(
      'Prescription module is not available yet.'
    );

  }


  // =====================================================
  // INVOICE
  // =====================================================

  createInvoice(): void {

    /*
     * Billing module will be connected here
     * when the billing module is ready.
     */

    alert(
      'Billing module is not available yet.'
    );

  }


  // =====================================================
  // GET STATUS CLASS
  // =====================================================

  getStatusClass(
    status: Appointment['status']
  ): string {

    switch (status) {

      case 'Confirmed':
        return 'confirmed';

      case 'Scheduled':
        return 'pending';

      case 'Checked-In':
        return 'checked-in';

      case 'In Consultation':
        return 'in-consultation';

      case 'Completed':
        return 'completed';

      case 'Cancelled':
        return 'cancelled';

      case 'No Show':
        return 'no-show';

      default:
        return '';

    }

  }

}
