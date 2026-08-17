import { Injectable } from '@angular/core';

import { Consultation } from '../../shared/models/consultation.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {

  private readonly STORAGE_KEY =
    'hms_consultations';

  private consultations: Consultation[] = [];


  constructor() {

    this.loadConsultations();

  }


  // =====================================================
  // LOAD FROM LOCAL STORAGE
  // =====================================================

  private loadConsultations(): void {

    const storedConsultations =
      localStorage.getItem(
        this.STORAGE_KEY
      );


    if (!storedConsultations) {

      this.consultations = [];

      return;

    }


    try {

      this.consultations =
        JSON.parse(
          storedConsultations
        ) as Consultation[];

    } catch (error) {

      console.error(
        'Failed to load consultations from localStorage:',
        error
      );

      this.consultations = [];

    }

  }


  // =====================================================
  // SAVE TO LOCAL STORAGE
  // =====================================================

  private saveConsultations(): void {

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(
        this.consultations
      )
    );

  }


  // =====================================================
  // GET ALL CONSULTATIONS
  // =====================================================

  getConsultations(): Consultation[] {

    return [
      ...this.consultations
    ];

  }


  // =====================================================
  // GET CONSULTATION BY ID
  // =====================================================

  getConsultationById(
    id: string
  ): Consultation | undefined {

    return this.consultations.find(
      consultation =>
        consultation.id === id
    );

  }


  // =====================================================
  // GET BY PATIENT
  // =====================================================

  getConsultationsByPatient(
    patientId: string
  ): Consultation[] {

    return this.consultations.filter(
      consultation =>
        consultation.patientId === patientId
    );

  }


  // =====================================================
  // GET BY DOCTOR
  // =====================================================

  getConsultationsByDoctor(
    doctorId: string
  ): Consultation[] {

    return this.consultations.filter(
      consultation =>
        consultation.doctorId === doctorId
    );

  }


  // =====================================================
  // GET BY APPOINTMENT
  // =====================================================

  getConsultationByAppointment(
    appointmentId: string
  ): Consultation | undefined {

    return this.consultations.find(
      consultation =>
        consultation.appointmentId ===
        appointmentId
    );

  }


  // =====================================================
  // ADD CONSULTATION
  // =====================================================

  addConsultation(
    consultationData: Omit<
      Consultation,
      'id' | 'createdAt' | 'status'
    >
  ): Consultation {

    const consultation: Consultation = {

      id:
        this.generateConsultationId(),

      patientId:
        consultationData.patientId,

      doctorId:
        consultationData.doctorId,

      appointmentId:
        consultationData.appointmentId,

      consultationDate:
        consultationData.consultationDate,

      consultationTime:
        consultationData.consultationTime,

      chiefComplaint:
        consultationData.chiefComplaint,

      symptoms:
        consultationData.symptoms,

      diagnosis:
        consultationData.diagnosis,

      clinicalNotes:
        consultationData.clinicalNotes,

      treatmentPlan:
        consultationData.treatmentPlan,

      followUpDate:
        consultationData.followUpDate,

      status: 'Open',

      createdAt:
        new Date().toISOString()

    };


    this.consultations.push(
      consultation
    );


    this.saveConsultations();


    return consultation;

  }


  // =====================================================
  // UPDATE CONSULTATION
  // =====================================================

  updateConsultation(
    updatedConsultation: Consultation
  ): void {

    const index =
      this.consultations.findIndex(
        consultation =>
          consultation.id ===
          updatedConsultation.id
      );


    if (index === -1) {

      return;

    }


    this.consultations[index] =
      updatedConsultation;


    this.saveConsultations();

  }


  // =====================================================
  // UPDATE CONSULTATION STATUS
  // =====================================================

  updateStatus(
    id: string,
    status: Consultation['status']
  ): void {

    const consultation =
      this.consultations.find(
        consultation =>
          consultation.id === id
      );


    if (!consultation) {

      return;

    }


    consultation.status =
      status;


    this.saveConsultations();

  }


  // =====================================================
  // COMPLETE CONSULTATION
  // =====================================================

  completeConsultation(
    id: string
  ): void {

    this.updateStatus(
      id,
      'Completed'
    );

  }


  // =====================================================
  // CANCEL CONSULTATION
  // =====================================================

  cancelConsultation(
    id: string
  ): void {

    this.updateStatus(
      id,
      'Cancelled'
    );

  }


  // =====================================================
  // REOPEN CONSULTATION
  // =====================================================

  reopenConsultation(
    id: string
  ): void {

    this.updateStatus(
      id,
      'Open'
    );

  }


  // =====================================================
  // DELETE CONSULTATION
  // =====================================================

  deleteConsultation(
    id: string
  ): void {

    this.consultations =
      this.consultations.filter(
        consultation =>
          consultation.id !== id
      );


    this.saveConsultations();

  }


  // =====================================================
  // GENERATE CONSULTATION ID
  // =====================================================

  private generateConsultationId(): string {

    const year =
      new Date().getFullYear();


    const numbers =
      this.consultations.map(
        consultation => {

          const match =
            consultation.id.match(
              /CONS-\d+-(\d+)/
            );


          return match
            ? Number(match[1])
            : 0;

        }
      );


    const nextNumber =
      numbers.length > 0
        ? Math.max(...numbers) + 1
        : 1;


    return `CONS-${year}-${String(
      nextNumber
    ).padStart(4, '0')}`;

  }

}
