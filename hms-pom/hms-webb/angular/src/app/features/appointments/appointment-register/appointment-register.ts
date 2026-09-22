
// =====================================================
// APPOINTMENT REGISTER COMPONENT
// File:
// src/app/features/appointments/appointment-register/appointment-register.ts
// =====================================================

import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

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
  // EDIT MODE
  // =====================================================

  isEditMode = false;

  appointmentId = '';


  // =====================================================
  // PATIENTS
  // =====================================================

  patients: Patient[] = [];

  patientsLoading = false;


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
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadPatients();

    this.loadDoctors();

    this.loadDepartments();

    this.checkEditMode();

  }


  // =====================================================
  // CHECK EDIT MODE
  // =====================================================

  private checkEditMode(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {

      this.isEditMode = false;

      return;

    }


    this.isEditMode = true;

    this.appointmentId = id;

    this.loadAppointment(id);

  }


  // =====================================================
  // LOAD EXISTING APPOINTMENT
  // =====================================================

  private loadAppointment(
    id: string
  ): void {

    this.appointmentService
      .getAppointmentById(id)
      .subscribe({

        next: (appointment: Appointment) => {

          this.appointment = {
            ...appointment
          };


          /*
           * The appointment may load before
           * the patients/doctors have finished loading.
           *
           * We therefore synchronize names here,
           * and also again when patients/doctors arrive.
           */

          this.syncPatientName();

          this.syncDoctorName();


          // Force Angular to update the form immediately.

          this.cdr.detectChanges();

        },

        error: (error: unknown) => {

          console.error(
            'Failed to load appointment:',
            error
          );

          alert(
            'Appointment not found.'
          );

          this.router.navigate([
            '/appointments'
          ]);

        }

      });

  }


  // =====================================================
  // LOAD PATIENTS
  // =====================================================

  private loadPatients(): void {

    this.patientsLoading = true;


    /*
     * Clear the old list before loading.
     */

    this.patients = [];


    this.patientService
      .getPatients()
      .subscribe({

        next: (patients: Patient[]) => {

          console.log(
            'Patients received by appointment register:',
            patients
          );


          // -----------------------------------------------
          // SAFETY CHECK
          // -----------------------------------------------

          if (!Array.isArray(patients)) {

            console.error(
              'Invalid patients response:',
              patients
            );

            this.patients = [];

            this.patientsLoading = false;

            this.cdr.detectChanges();

            return;

          }


          // -----------------------------------------------
          // CREATE A NEW ARRAY REFERENCE
          // -----------------------------------------------

          this.patients = [
            ...patients
          ];


          console.log(
            'Patients available in appointment register:',
            this.patients.length
          );


          // -----------------------------------------------
          // SYNCHRONIZE EDIT MODE PATIENT
          // -----------------------------------------------

          if (
            this.appointment.patientId
          ) {

            this.syncPatientName();

          }


          // -----------------------------------------------
          // STOP LOADING
          // -----------------------------------------------

          this.patientsLoading = false;


          /*
           * IMPORTANT:
           *
           * This forces Angular to immediately refresh
           * the patient <select>.
           *
           * Without this, the data can exist in the
           * component while the select does not visually
           * update until another UI event occurs.
           */

          this.cdr.detectChanges();

        },

        error: (error: unknown) => {

          console.error(
            'Failed to load patients:',
            error
          );

          this.patients = [];

          this.patientsLoading = false;


          // Force the loading state to update immediately.

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD ACTIVE DOCTORS
  // =====================================================

  private loadDoctors(): void {


     this.doctorService
  .getDoctors()
  .subscribe({
    next: (doctors: Doctor[]) => {

      this.doctors =
        doctors.filter(
          (doctor: Doctor) =>
            doctor.status === 'Active'
        );

    },

    error: (error: unknown) => {

      console.error(
        'Failed to load doctors:',
        error
      );

      this.doctors = [];

    }
  });


    /*
     * If editing an appointment, synchronize
     * the doctor after doctors are loaded.
     */

    if (
      this.appointment.doctorId
    ) {

      this.syncDoctorName();

    }


    this.cdr.detectChanges();

  }


  // =====================================================
  // LOAD ACTIVE DEPARTMENTS
  // =====================================================

  private loadDepartments(): void {
this.departmentService
  .getDepartments()
  .subscribe({

    next: (departments) => {

      this.departments =
        departments;

    },

    error: (error) => {

      console.error(
        'Failed to load departments:',
        error
      );

      this.departments = [];

    }

  });
    this.cdr.detectChanges();

  }


  // =====================================================
  // PATIENT SELECTION
  // =====================================================

  onPatientChange(): void {

    this.syncPatientName();

    this.cdr.detectChanges();

  }


  // =====================================================
  // SYNCHRONIZE PATIENT NAME
  // =====================================================

  private syncPatientName(): void {

    if (
      !this.appointment.patientId
    ) {

      this.appointment.patientName = '';

      return;

    }


    const patient =
      this.patients.find(
        p =>
          String(p.id) ===
          String(this.appointment.patientId)
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

    this.syncDoctorName();

    this.cdr.detectChanges();

  }


  // =====================================================
  // SYNCHRONIZE DOCTOR NAME
  // =====================================================

  private syncDoctorName(): void {

    if (
      !this.appointment.doctorId
    ) {

      this.appointment.doctorName = '';

      return;

    }


    const doctor =
      this.doctors.find(
        d =>
          String(d.id) ===
          String(this.appointment.doctorId)
      );


    if (!doctor) {

      this.appointment.doctorName = '';

      return;

    }


    this.appointment.doctorName =
      `Dr. ${doctor.firstName} ${doctor.lastName}`;


    /*
     * Automatically use the doctor's department.
     */

    this.appointment.department =
      doctor.department;

  }


  // =====================================================
  // SAVE / UPDATE APPOINTMENT
  // =====================================================

  saveAppointment(): void {

    // ===================================================
    // CLEAN INPUTS
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
    // REQUIRED FIELD VALIDATION
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


    if (
      missingFields.length > 0
    ) {

      alert(
        'Please complete the following required fields:\n\n' +
        missingFields.join('\n')
      );

      return;

    }


    // ===================================================
    // FIND SELECTED PATIENT
    // ===================================================

    const patient =
      this.patients.find(
        p =>
          String(p.id) ===
          String(this.appointment.patientId)
      );


    if (!patient) {

      alert(
        'Please select a valid patient from the Patients list.'
      );

      return;

    }


    // ===================================================
    // FIND SELECTED DOCTOR
    // ===================================================

    const doctor =
      this.doctors.find(
        d =>
          String(d.id) ===
          String(this.appointment.doctorId)
      );


    if (!doctor) {

      alert(
        'Please select a valid active doctor.'
      );

      return;

    }


    // ===================================================
    // FIND SELECTED DEPARTMENT
    // ===================================================

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


    // ===================================================
    // VERIFY DOCTOR DEPARTMENT
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
    // SYNCHRONIZE PATIENT INFORMATION
    // ===================================================

    this.appointment.patientId =
      patient.id;

    this.appointment.patientName =
      `${patient.firstName} ${patient.lastName}`;


    // ===================================================
    // SYNCHRONIZE DOCTOR INFORMATION
    // ===================================================

    this.appointment.doctorId =
      doctor.id;

    this.appointment.doctorName =
      `Dr. ${doctor.firstName} ${doctor.lastName}`;


    // ===================================================
    // UPDATE EXISTING APPOINTMENT
    // ===================================================

    if (this.isEditMode) {

      this.appointment.id =
        this.appointmentId;


      this.appointmentService
        .updateAppointment(
          this.appointment
        )
        .subscribe({

          next: (
            updatedAppointment: Appointment
          ) => {

            this.appointment =
              updatedAppointment;


            alert(
              'Appointment updated successfully.'
            );


            this.router.navigate([
              '/appointments'
            ]);

          },

          error: (error: unknown) => {

            console.error(
              'Failed to update appointment:',
              error
            );


            alert(
              'Unable to update appointment. Please try again.'
            );

          }

        });


      return;

    }


    // ===================================================
    // CREATE NEW APPOINTMENT
    // ===================================================

    this.appointment.id =
      this.generateAppointmentId();


    this.appointment.createdAt =
      new Date();


    this.appointment.status =
      'Scheduled';


    // ===================================================
    // SEND APPOINTMENT TO SPRING BOOT
    // ===================================================

    this.appointmentService
      .addAppointment(
        this.appointment
      )
      .subscribe({

        next: (
          createdAppointment: Appointment
        ) => {

          this.appointment =
            createdAppointment;


          alert(
            'Appointment registered successfully.'
          );


          this.router.navigate([
            '/appointments'
          ]);

        },

        error: (error: unknown) => {

          console.error(
            'Failed to register appointment:',
            error
          );


          alert(
            'Failed to register appointment. Please make sure the backend is running.'
          );

        }

      });

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

