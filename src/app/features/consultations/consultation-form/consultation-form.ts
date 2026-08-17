
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConsultationService } from '../../../core/services/consultation.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentService } from '../../../core/services/appointment.service';

import { Consultation } from '../../../shared/models/consultation.model';
import { Patient } from '../../../shared/models/patient.model';
import { Doctor } from '../../../shared/models/doctor.model';
import { Appointment } from '../../../shared/models/appointment.model';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './consultation-form.html',
  styleUrl: './consultation-form.css'
})
export class ConsultationForm implements OnInit {

  // =====================================================
  // MODE
  // =====================================================

  isEditMode = false;

  consultationId: string | null = null;

  appointmentId: string | null = null;


  // =====================================================
  // DATA
  // =====================================================

  patients: Patient[] = [];

  doctors: Doctor[] = [];

  appointment?: Appointment;


  // =====================================================
  // FORM
  // =====================================================

  consultation = {

    patientId: '',

    doctorId: '',

    appointmentId: '',

    consultationDate: '',

    consultationTime: '',

    chiefComplaint: '',

    symptoms: '',

    diagnosis: '',

    clinicalNotes: '',

    treatmentPlan: '',

    followUpDate: '',

    status:
      'Open' as
        'Open' |
        'Completed' |
        'Cancelled'

  };


  constructor(
    private router: Router,

    private route: ActivatedRoute,

    private consultationService:
      ConsultationService,

    private patientService:
      PatientService,

    private doctorService:
      DoctorService,

    private appointmentService:
      AppointmentService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

ngOnInit(): void {

  this.loadPatients();
  this.loadDoctors();
  this.setDefaultDateTime();


  // ===================================================
  // CHECK QUERY PARAMETER
  // ===================================================

  const appointmentId =
    this.route.snapshot.queryParamMap.get(
      'appointmentId'
    );


  // ===================================================
  // START CONSULTATION FROM APPOINTMENT QUEUE
  // ===================================================

  if (appointmentId) {

    this.appointmentId =
      appointmentId;

    this.loadAppointment(
      appointmentId
    );

    return;
  }


  // ===================================================
  // EDIT EXISTING CONSULTATION
  // ===================================================

  const consultationId =
    this.route.snapshot.paramMap.get('id');


  if (!consultationId) {

    return;

  }


  this.isEditMode = true;

  this.consultationId =
    consultationId;

  this.loadConsultation(
    consultationId
  );

}
  // =====================================================
  // LOAD PATIENTS
  // =====================================================

  private loadPatients(): void {

    this.patients =
      this.patientService.getPatients();

  }


  // =====================================================
  // LOAD DOCTORS
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
  // DEFAULT DATE / TIME
  // =====================================================

  private setDefaultDateTime(): void {

    const now =
      new Date();


    const year =
      now.getFullYear();


    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, '0');


    const day =
      String(
        now.getDate()
      ).padStart(2, '0');


    this.consultation.consultationDate =
      `${year}-${month}-${day}`;


    this.consultation.consultationTime =
      now.toTimeString().slice(0, 5);

  }


  // =====================================================
  // LOAD APPOINTMENT
  // =====================================================

  private loadAppointment(
    id: string
  ): void {

    const appointment =
      this.appointmentService
        .getAppointmentById(id);


    if (!appointment) {

      alert(
        'Appointment not found.'
      );

      this.router.navigate([
        '/appointments'
      ]);

      return;

    }


    this.appointment =
      appointment;


    /*
     * Make sure appointment is
     * actually in consultation.
     */

    if (
      appointment.status !==
      'In Consultation'
    ) {

      alert(
        'This appointment is not currently in consultation.'
      );

      this.router.navigate([
        '/appointments',
        appointment.id
      ]);

      return;

    }


    // ===================================================
    // PRE-FILL CONSULTATION
    // ===================================================

    this.consultation = {

      patientId:
        appointment.patientId,

      doctorId:
        appointment.doctorId,

      appointmentId:
        appointment.id,

      consultationDate:
        appointment.appointmentDate,

      consultationTime:
        appointment.appointmentTime,

      chiefComplaint:
        appointment.reason || '',

      symptoms: '',

      diagnosis:
        appointment.diagnosis || '',

      clinicalNotes:
        appointment.consultationNotes || '',

      treatmentPlan:
        appointment.treatmentPlan || '',

      followUpDate: '',

      status: 'Open'

    };

  }


  // =====================================================
  // LOAD EXISTING CONSULTATION
  // =====================================================

  private loadConsultation(
    id: string
  ): void {

    const existingConsultation =
      this.consultationService
        .getConsultationById(id);


    if (!existingConsultation) {

      this.router.navigate([
        '/consultations'
      ]);

      return;

    }


    this.consultation = {

      patientId:
        existingConsultation.patientId,

      doctorId:
        existingConsultation.doctorId,

      appointmentId:
        existingConsultation.appointmentId || '',

      consultationDate:
        existingConsultation.consultationDate,

      consultationTime:
        existingConsultation.consultationTime,

      chiefComplaint:
        existingConsultation.chiefComplaint,

      symptoms:
        existingConsultation.symptoms || '',

      diagnosis:
        existingConsultation.diagnosis || '',

      clinicalNotes:
        existingConsultation.clinicalNotes || '',

      treatmentPlan:
        existingConsultation.treatmentPlan || '',

      followUpDate:
        existingConsultation.followUpDate || '',

      status:
        existingConsultation.status

    };

  }


  // =====================================================
  // PATIENT NAME
  // =====================================================

  getPatientName(
    patientId: string
  ): string {

    const patient =
      this.patients.find(
        item =>
          item.id === patientId
      );


    if (!patient) {

      return patientId;

    }


    return `${patient.firstName} ${patient.lastName}`;

  }


  // =====================================================
  // DOCTOR NAME
  // =====================================================

  getDoctorName(
    doctorId: string
  ): string {

    const doctor =
      this.doctors.find(
        item =>
          item.id === doctorId
      );


    if (!doctor) {

      return doctorId;

    }


    return `Dr. ${doctor.firstName} ${doctor.lastName}`;

  }


  // =====================================================
  // SAVE CONSULTATION
  // =====================================================

  saveConsultation(): void {

    // ===================================================
    // VALIDATION
    // ===================================================

    if (
      !this.consultation.patientId ||
      !this.consultation.doctorId ||
      !this.consultation.consultationDate ||
      !this.consultation.consultationTime ||
      !this.consultation.chiefComplaint.trim()
    ) {

      alert(
        'Please complete all required consultation fields.'
      );

      return;

    }


    // ===================================================
    // EDIT EXISTING CONSULTATION
    // ===================================================

    if (
      this.isEditMode &&
      this.consultationId
    ) {

      const existingConsultation =
        this.consultationService
          .getConsultationById(
            this.consultationId
          );


      if (!existingConsultation) {

        return;

      }


      const updatedConsultation:
        Consultation = {

        id:
          existingConsultation.id,

        patientId:
          this.consultation.patientId,

        doctorId:
          this.consultation.doctorId,

        appointmentId:
          this.consultation.appointmentId ||
          undefined,

        consultationDate:
          this.consultation.consultationDate,

        consultationTime:
          this.consultation.consultationTime,

        chiefComplaint:
          this.consultation.chiefComplaint,

        symptoms:
          this.consultation.symptoms ||
          undefined,

        diagnosis:
          this.consultation.diagnosis ||
          undefined,

        clinicalNotes:
          this.consultation.clinicalNotes ||
          undefined,

        treatmentPlan:
          this.consultation.treatmentPlan ||
          undefined,

        followUpDate:
          this.consultation.followUpDate ||
          undefined,

        status:
          this.consultation.status,

        createdAt:
          existingConsultation.createdAt

      };


      this.consultationService
        .updateConsultation(
          updatedConsultation
        );


      alert(
        'Consultation updated successfully.'
      );


      this.router.navigate([
        '/consultations',
        this.consultationId
      ]);

      return;

    }


    // ===================================================
    // NEW CONSULTATION
    // ===================================================

    const newConsultation =
      this.consultationService
        .addConsultation({

          patientId:
            this.consultation.patientId,

          doctorId:
            this.consultation.doctorId,

          appointmentId:
            this.consultation.appointmentId ||
            undefined,

          consultationDate:
            this.consultation.consultationDate,

          consultationTime:
            this.consultation.consultationTime,

          chiefComplaint:
            this.consultation.chiefComplaint,

          symptoms:
            this.consultation.symptoms ||
            undefined,

          diagnosis:
            this.consultation.diagnosis ||
            undefined,

          clinicalNotes:
            this.consultation.clinicalNotes ||
            undefined,

          treatmentPlan:
            this.consultation.treatmentPlan ||
            undefined,

          followUpDate:
            this.consultation.followUpDate ||
            undefined

        });


    /*
     * If this consultation came from
     * an appointment, complete the
     * appointment as well.
     */

    if (this.appointmentId) {

      this.appointmentService.updateStatus(
        this.appointmentId,
        'Completed'
      );

    }


    alert(
      `Consultation ${newConsultation.id} created successfully.`
    );


    // ===================================================
    // REDIRECT
    // ===================================================

    this.router.navigate([
      '/consultations',
      newConsultation.id
    ]);

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    /*
     * If started from an appointment,
     * return to appointment details.
     */

    if (this.appointmentId) {

      this.router.navigate([
        '/appointments',
        this.appointmentId
      ]);

      return;

    }


    /*
     * If editing a consultation,
     * return to consultation profile.
     */

    if (
      this.isEditMode &&
      this.consultationId
    ) {

      this.router.navigate([
        '/consultations',
        this.consultationId
      ]);

      return;

    }


    this.router.navigate([
      '/consultations'
    ]);

  }

}

