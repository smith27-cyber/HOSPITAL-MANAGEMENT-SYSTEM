import { Injectable } from '@angular/core';

import {
  Consultation
} from '../../shared/models/consultation.model';

import {
  PharmacyPrescriptionItem
} from '../../shared/models/pharmacy.model';

import {
  PharmacyService
} from './pharmacy.service';

import {
  BillingService
} from './billing.service';

import {
  PatientService
} from './patient.service';

import {
  DoctorService
} from './doctor.service';


@Injectable({
  providedIn: 'root'
})
export class ConsultationService {


  // =====================================================
  // STORAGE
  // =====================================================

  private readonly STORAGE_KEY =
    'hms_consultations';


  // =====================================================
  // CONSULTATION FEE
  // =====================================================

  private readonly CONSULTATION_FEE =
    30000;


  // =====================================================
  // DATA
  // =====================================================

  private consultations:
    Consultation[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private pharmacyService: PharmacyService,

    private billingService: BillingService,

    private patientService: PatientService,

    private doctorService: DoctorService
  ) {

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


    if (
      !storedConsultations
    ) {

      this.consultations = [];

      return;

    }


    try {

      this.consultations =
        JSON.parse(
          storedConsultations
        ) as Consultation[];

    }

    catch (
      error
    ) {

      console.error(
        'Failed to load consultations from localStorage:',
        error
      );


      this.consultations =
        [];

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

  getConsultations():
    Consultation[] {

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
        consultation.patientId ===
        patientId
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
        consultation.doctorId ===
        doctorId
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
      'id' |
      'createdAt' |
      'status'
    >
  ): Consultation {

    const consultation:
      Consultation = {

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

      status:
        'Open',

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


    if (
      index === -1
    ) {

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
    status:
      Consultation['status']
  ): void {

    const consultation =
      this.getConsultationById(
        id
      );


    if (
      !consultation
    ) {

      return;

    }


    consultation.status =
      status;


    if (
      status === 'Completed'
    ) {

      this.addConsultationCharge(
        consultation
      );

    }


    consultation.updatedAt =
      new Date().toISOString();


    this.saveConsultations();

  }


  // =====================================================
  // COMPLETE CONSULTATION
  // =====================================================

  completeConsultation(
    id: string,
    pharmacyData?: {
      patientName: string;
      patientNumber?: string;
      doctorName?: string;
      items: PharmacyPrescriptionItem[];
      notes?: string;
    }
  ): boolean {

    const consultation =
      this.getConsultationById(
        id
      );


    if (
      !consultation
    ) {

      return false;

    }


    // ===================================================
    // PREVENT DOUBLE COMPLETION
    // ===================================================

    if (
      consultation.status ===
      'Completed'
    ) {

      /*
       * The consultation may already have been completed
       * while the pharmacy prescription was created later.
       *
       * Do not charge the consultation twice.
       */

      if (
        pharmacyData &&
        pharmacyData.items &&
        pharmacyData.items.length > 0
      ) {

        const existingPrescription =
          this.pharmacyService
            .getPrescriptionsByPatient(
              consultation.patientId
            )
            .find(
              prescription =>
                prescription.consultationId ===
                consultation.id
            );


        if (
          !existingPrescription
        ) {

          const prescription =
            this.createPharmacyPrescription(
              consultation,
              pharmacyData
            );


          return !!prescription;

        }

      }


      return true;

    }


    // ===================================================
    // COMPLETE CONSULTATION
    // ===================================================

    consultation.status =
      'Completed';


    consultation.updatedAt =
      new Date().toISOString();


    this.saveConsultations();


    // ===================================================
    // ADD CONSULTATION TO BILLING
    // ===================================================

    this.addConsultationCharge(
      consultation
    );


    // ===================================================
    // SEND MEDICINES TO PHARMACY
    // ===================================================

    if (
      pharmacyData &&
      pharmacyData.items &&
      pharmacyData.items.length > 0
    ) {

      const prescription =
        this.createPharmacyPrescription(
          consultation,
          pharmacyData
        );


      if (
        !prescription
      ) {

        console.error(
          'Consultation completed but pharmacy prescription could not be created.'
        );


        return false;

      }

    }


    return true;

  }


  // =====================================================
  // CREATE PHARMACY PRESCRIPTION
  // =====================================================

  private createPharmacyPrescription(
    consultation: Consultation,
    pharmacyData: {
      patientName: string;
      patientNumber?: string;
      doctorName?: string;
      items: PharmacyPrescriptionItem[];
      notes?: string;
    }
  ) {

    return this.pharmacyService.createPrescription({

      patientId:
        consultation.patientId,

      patientName:
        pharmacyData.patientName,

      patientNumber:
        pharmacyData.patientNumber,

      consultationId:
        consultation.id,

      doctorId:
        consultation.doctorId,

      doctorName:
        pharmacyData.doctorName,

      items:
        pharmacyData.items,

      notes:
        pharmacyData.notes

    });

  }


  // =====================================================
  // ADD CONSULTATION CHARGE
  // =====================================================

  private addConsultationCharge(
    consultation: Consultation
  ): void {

    // ===================================================
    // CHECK FOR DUPLICATE BILLING
    // ===================================================

    const patientBills =
      this.billingService.getBillsByPatient(
        consultation.patientId
      );


    const alreadyBilled =
      patientBills.some(
        bill => {

          const items =
            bill.items ?? [];


          return items.some(
            item =>
              item.billingType ===
                'Consultation' &&

              item.referenceId ===
                consultation.id
          );

        }
      );


    if (
      alreadyBilled
    ) {

      return;

    }


    // ===================================================
    // GET PATIENT
    // ===================================================

    const patient =
      this.patientService.getPatientById(
        consultation.patientId
      );


    if (
      !patient
    ) {

      console.error(
        'Unable to bill consultation: patient not found.',
        consultation.patientId
      );

      return;

    }


    // ===================================================
    // GET DOCTOR
    // ===================================================

    const doctor =
      this.doctorService.getDoctorById(
        consultation.doctorId
      );


    // ===================================================
    // PATIENT NAME
    // ===================================================

    const patientName =
      `${patient.firstName} ${patient.lastName}`;


    // ===================================================
    // DOCTOR NAME
    // ===================================================

    const doctorName =
      doctor
        ? `Dr. ${doctor.firstName} ${doctor.lastName}`
        : undefined;


    // ===================================================
    // ADD TO SHARED BILL
    // ===================================================

    const bill =
      this.billingService.addServiceCharge(

        consultation.patientId,

        patientName,

        'Consultation',

        `Medical consultation - ${consultation.chiefComplaint}`,

        this.CONSULTATION_FEE,

        consultation.id,

        {

          doctorId:
            consultation.doctorId,

          doctorName:
            doctorName,

          notes:
            consultation.clinicalNotes

        }

      );


    if (
      !bill
    ) {

      console.error(
        'Unable to add consultation charge to billing.',
        consultation.id
      );

      return;

    }


    console.log(
      'Consultation charge added successfully:',
      {

        consultationId:
          consultation.id,

        invoiceNumber:
          bill.invoiceNumber,

        billId:
          bill.id,

        amount:
          this.CONSULTATION_FEE

      }
    );

  }


  // =====================================================
  // GET CONSULTATION FEE
  // =====================================================

  getConsultationFee():
    number {

    return this.CONSULTATION_FEE;

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

  private generateConsultationId():
    string {

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
            ? Number(
                match[1]
              )
            : 0;

        }
      );


    const nextNumber =
      numbers.length > 0

        ? Math.max(
            ...numbers
          ) + 1

        : 1;


    return `CONS-${year}-${String(
      nextNumber
    ).padStart(
      4,
      '0'
    )}`;

  }

}
