import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ConsultationService } from '../../../core/services/consultation.service';
import { Consultation } from '../../../shared/models/consultation.model';

import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './consultation-list.html',
  styleUrl: './consultation-list.css'
})
export class ConsultationList implements OnInit {

  consultations: Consultation[] = [];

  searchTerm = '';

  selectedStatus:
    Consultation['status'] | '' = '';


  constructor(
    private consultationService: ConsultationService,
    private patientService: PatientService,
    private doctorService: DoctorService
  ) {}


  ngOnInit(): void {

    this.loadConsultations();

  }


  // =====================================================
  // LOAD CONSULTATIONS
  // =====================================================

  loadConsultations(): void {

    this.consultations =
      this.consultationService
        .getConsultations();

  }


  // =====================================================
  // GET PATIENT NAME
  // =====================================================

  getPatientName(
    patientId: string
  ): string {

    const patient =
      this.patientService
        .getPatientById(patientId);

    if (!patient) {
      return patientId;
    }

    return `${patient.firstName} ${patient.lastName}`;

  }


  // =====================================================
  // GET DOCTOR NAME
  // =====================================================

  getDoctorName(
    doctorId: string
  ): string {

    const doctor =
      this.doctorService
        .getDoctorById(doctorId);

    if (!doctor) {
      return doctorId;
    }

    return `Dr. ${doctor.firstName} ${doctor.lastName}`;

  }


  // =====================================================
  // FILTERED CONSULTATIONS
  // =====================================================

  get filteredConsultations():
    Consultation[] {

    const term =
      this.searchTerm
        .toLowerCase()
        .trim();


    return this.consultations.filter(
      consultation => {

        const patientName =
          this.getPatientName(
            consultation.patientId
          ).toLowerCase();

        const doctorName =
          this.getDoctorName(
            consultation.doctorId
          ).toLowerCase();


        const matchesSearch =
          !term ||

          consultation.id
            .toLowerCase()
            .includes(term) ||

          consultation.patientId
            .toLowerCase()
            .includes(term) ||

          consultation.doctorId
            .toLowerCase()
            .includes(term) ||

          patientName.includes(term) ||

          doctorName.includes(term) ||

          consultation.chiefComplaint
            .toLowerCase()
            .includes(term) ||

          (consultation.diagnosis || '')
            .toLowerCase()
            .includes(term);


        const matchesStatus =
          !this.selectedStatus ||

          consultation.status ===
            this.selectedStatus;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  get totalConsultations(): number {

    return this.consultations.length;

  }


  get openConsultations(): number {

    return this.consultations.filter(
      consultation =>
        consultation.status === 'Open'
    ).length;

  }


  get completedConsultations(): number {

    return this.consultations.filter(
      consultation =>
        consultation.status === 'Completed'
    ).length;

  }


  get cancelledConsultations(): number {

    return this.consultations.filter(
      consultation =>
        consultation.status === 'Cancelled'
    ).length;

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = '';

  }


  // =====================================================
  // COMPLETE CONSULTATION
  // =====================================================

  completeConsultation(
    id: string
  ): void {

    const consultation =
      this.consultationService
        .getConsultationById(id);


    if (!consultation) {
      return;
    }


    if (consultation.status !== 'Open') {
      return;
    }


    const confirmed =
      window.confirm(
        `Complete consultation ${consultation.id}?`
      );


    if (!confirmed) {
      return;
    }


    this.consultationService
      .completeConsultation(id);


    this.loadConsultations();

  }


  // =====================================================
  // CANCEL CONSULTATION
  // =====================================================

  cancelConsultation(
    id: string
  ): void {

    const consultation =
      this.consultationService
        .getConsultationById(id);


    if (!consultation) {
      return;
    }


    if (consultation.status !== 'Open') {
      return;
    }


    const confirmed =
      window.confirm(
        `Cancel consultation ${consultation.id}?`
      );


    if (!confirmed) {
      return;
    }


    this.consultationService
      .cancelConsultation(id);


    this.loadConsultations();

  }


  // =====================================================
  // DELETE CONSULTATION
  // =====================================================

  deleteConsultation(
    id: string
  ): void {

    const consultation =
      this.consultationService
        .getConsultationById(id);


    if (!consultation) {
      return;
    }


    const confirmed =
      window.confirm(
        `Delete consultation ${consultation.id}? This action cannot be undone.`
      );


    if (!confirmed) {
      return;
    }


    this.consultationService
      .deleteConsultation(id);


    this.loadConsultations();

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshConsultations(): void {

    this.loadConsultations();

  }

}
