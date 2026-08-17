import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ConsultationService } from '../../../core/services/consultation.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';

import { Consultation } from '../../../shared/models/consultation.model';
import { Patient } from '../../../shared/models/patient.model';
import { Doctor } from '../../../shared/models/doctor.model';

@Component({
  selector: 'app-consultation-profile',
  standalone: true,
  imports: [
    DatePipe
  ],
  templateUrl: './consultation-profile.html',
  styleUrl: './consultation-profile.css'
})
export class ConsultationProfile implements OnInit {

  // =====================================================
  // CONSULTATION
  // =====================================================

  consultation:
    Consultation | undefined;


  // =====================================================
  // PATIENT
  // =====================================================

  patient:
    Patient | undefined;


  // =====================================================
  // DOCTOR
  // =====================================================

  doctor:
    Doctor | undefined;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,

    private router: Router,

    private consultationService:
      ConsultationService,

    private patientService:
      PatientService,

    private doctorService:
      DoctorService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    // ---------------------------------------------------
    // No consultation ID
    // ---------------------------------------------------

    if (!id) {

      this.router.navigate([
        '/consultations'
      ]);

      return;

    }


    this.loadConsultation(id);

  }


  // =====================================================
  // LOAD CONSULTATION
  // =====================================================

  private loadConsultation(
    id: string
  ): void {

    // ---------------------------------------------------
    // Get consultation
    // ---------------------------------------------------

    const consultation =
      this.consultationService
        .getConsultationById(id);


    // ---------------------------------------------------
    // Consultation not found
    // ---------------------------------------------------

    if (!consultation) {

      this.consultation =
        undefined;

      this.patient =
        undefined;

      this.doctor =
        undefined;

      return;

    }


    this.consultation =
      consultation;


    // ---------------------------------------------------
    // Load patient
    // ---------------------------------------------------

    this.patient =
      this.patientService
        .getPatientById(
          consultation.patientId
        );


    // ---------------------------------------------------
    // Load doctor
    // ---------------------------------------------------

    this.doctor =
      this.doctorService
        .getDoctorById(
          consultation.doctorId
        );


    // ---------------------------------------------------
    // Debugging
    // ---------------------------------------------------
    // You can remove these later.
    // They help confirm that the correct IDs
    // are being passed through the system.

    console.log(
      'Consultation:',
      consultation
    );

    console.log(
      'Patient ID:',
      consultation.patientId
    );

    console.log(
      'Patient:',
      this.patient
    );

    console.log(
      'Doctor ID:',
      consultation.doctorId
    );

    console.log(
      'Doctor:',
      this.doctor
    );

  }


  // =====================================================
  // PATIENT NAME
  // =====================================================

  get patientName(): string {

    if (!this.patient) {

      return 'Unknown Patient';

    }


    return `${this.patient.firstName} ${this.patient.lastName}`;

  }


  // =====================================================
  // DOCTOR NAME
  // =====================================================

  get doctorName(): string {

    if (!this.doctor) {

      return 'Unknown Doctor';

    }


    return `Dr. ${this.doctor.firstName} ${this.doctor.lastName}`;

  }


  // =====================================================
  // EDIT CONSULTATION
  // =====================================================

  editConsultation(): void {

    if (!this.consultation) {

      return;

    }


    this.router.navigate([
      '/consultations',
      this.consultation.id,
      'edit'
    ]);

  }


  // =====================================================
  // COMPLETE CONSULTATION
  // =====================================================

  completeConsultation(): void {

    if (!this.consultation) {

      return;

    }


    if (
      this.consultation.status ===
      'Completed'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        'Mark this consultation as completed?'
      );


    if (!confirmed) {

      return;

    }


    this.consultationService
      .updateStatus(
        this.consultation.id,
        'Completed'
      );


    this.loadConsultation(
      this.consultation.id
    );

  }


  // =====================================================
  // CANCEL CONSULTATION
  // =====================================================

  cancelConsultation(): void {

    if (!this.consultation) {

      return;

    }


    if (
      this.consultation.status ===
      'Cancelled'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        'Cancel this consultation?'
      );


    if (!confirmed) {

      return;

    }


    this.consultationService
      .updateStatus(
        this.consultation.id,
        'Cancelled'
      );


    this.loadConsultation(
      this.consultation.id
    );

  }


  // =====================================================
  // DELETE CONSULTATION
  // =====================================================

  deleteConsultation(): void {

    if (!this.consultation) {

      return;

    }


    const confirmed =
      window.confirm(
        `Delete consultation ${this.consultation.id}? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    this.consultationService
      .deleteConsultation(
        this.consultation.id
      );


    this.router.navigate([
      '/consultations'
    ]);

  }


  // =====================================================
  // BACK
  // =====================================================

  backToConsultations(): void {

    this.router.navigate([
      '/consultations'
    ]);

  }

}
