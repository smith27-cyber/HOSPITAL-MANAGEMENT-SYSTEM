
// =====================================================
// CONSULTATION SERVICE
// File:
// src/app/core/services/consultation.service.ts
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import {
  tap
} from 'rxjs/operators';

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


@Injectable({
  providedIn: 'root'
})
export class ConsultationService {

  // =====================================================
  // API URL
  // =====================================================

  private readonly apiUrl =
    'http://localhost:8081/api/consultations';


  // =====================================================
  // CONSULTATION FEE
  // =====================================================

  private readonly CONSULTATION_FEE =
    30000;


  // =====================================================
  // CONSULTATIONS STATE
  // =====================================================

  private readonly consultationsSubject =
    new BehaviorSubject<Consultation[]>([]);


  // =====================================================
  // PUBLIC CONSULTATIONS STREAM
  // =====================================================

  readonly consultations$ =
    this.consultationsSubject.asObservable();


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly http: HttpClient,
    private readonly pharmacyService: PharmacyService,
    private readonly billingService: BillingService
  ) {

    // Automatically load consultations when the
    // service is first created.

    this.loadInitialConsultations();

  }


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  private loadInitialConsultations(): void {

    this.http
      .get<Consultation[]>(
        this.apiUrl
      )
      .subscribe({

        next: (
          consultations: Consultation[]
        ) => {

          const safeConsultations =
            Array.isArray(consultations)
              ? consultations
              : [];


          this.setConsultations(
            safeConsultations
          );


          console.log(
            'Initial consultations loaded:',
            safeConsultations
          );

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load initial consultations:',
            error
          );


          this.setConsultations([]);

        }

      });

  }


  // =====================================================
  // GET ALL CONSULTATIONS
  // =====================================================

  getConsultations():
    Observable<Consultation[]> {

    return this.http
      .get<Consultation[]>(
        this.apiUrl
      )
      .pipe(

        tap(
          (
            consultations: Consultation[]
          ) => {

            const safeConsultations =
              Array.isArray(consultations)
                ? consultations
                : [];


            this.setConsultations(
              safeConsultations
            );

          }
        )

      );

  }


  // =====================================================
  // GET CURRENT SNAPSHOT
  // =====================================================

  getConsultationsSnapshot():
    Consultation[] {

    return [
      ...this.consultationsSubject.value
    ];

  }


  // =====================================================
  // GET CONSULTATION BY ID
  // =====================================================

  getConsultationById(
    id: string
  ):
    Observable<Consultation> {

    return this.http
      .get<Consultation>(
        `${this.apiUrl}/${encodeURIComponent(id)}`
      )
      .pipe(

        tap(
          (
            consultation: Consultation
          ) => {

            this.addOrReplaceConsultation(
              consultation
            );

          }
        )

      );

  }


  // =====================================================
  // GET CONSULTATION BY ID SNAPSHOT
  // =====================================================

  getConsultationByIdSnapshot(
    id: string
  ):
    Consultation | undefined {

    return this.consultationsSubject.value.find(
      (
        consultation: Consultation
      ) =>
        consultation.id === id
    );

  }


  // =====================================================
  // GET CONSULTATIONS BY PATIENT
  // =====================================================

  getConsultationsByPatient(
    patientId: string
  ):
    Observable<Consultation[]> {

    return this.http
      .get<Consultation[]>(
        `${this.apiUrl}/patient/${encodeURIComponent(patientId)}`
      )
      .pipe(

        tap(
          (
            consultations: Consultation[]
          ) => {

            this.mergeConsultations(
              consultations
            );

          }
        )

      );

  }


  // =====================================================
  // GET CONSULTATIONS BY DOCTOR
  // =====================================================

  getConsultationsByDoctor(
    doctorId: string
  ):
    Observable<Consultation[]> {

    return this.http
      .get<Consultation[]>(
        `${this.apiUrl}/doctor/${encodeURIComponent(doctorId)}`
      )
      .pipe(

        tap(
          (
            consultations: Consultation[]
          ) => {

            this.mergeConsultations(
              consultations
            );

          }
        )

      );

  }


  // =====================================================
  // GET CONSULTATION BY APPOINTMENT
  // =====================================================

  getConsultationByAppointment(
    appointmentId: string
  ):
    Observable<Consultation> {

    return this.http
      .get<Consultation>(
        `${this.apiUrl}/appointment/${encodeURIComponent(appointmentId)}`
      )
      .pipe(

        tap(
          (
            consultation: Consultation
          ) => {

            this.addOrReplaceConsultation(
              consultation
            );

          }
        )

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
  ):
    Observable<Consultation> {

    const consultation = {

      ...consultationData,

      status: 'Open'

    };


    return this.http
      .post<Consultation>(
        this.apiUrl,
        consultation
      )
      .pipe(

        tap(
          (
            newConsultation: Consultation
          ) => {

            console.log(
              'Consultation successfully created:',
              newConsultation
            );


            this.addOrReplaceConsultation(
              newConsultation
            );

          }
        )

      );

  }


  // =====================================================
  // UPDATE CONSULTATION
  // =====================================================

  updateConsultation(
    consultation: Consultation
  ):
    Observable<Consultation> {

    return this.http
      .put<Consultation>(
        `${this.apiUrl}/${encodeURIComponent(consultation.id)}`,
        consultation
      )
      .pipe(

        tap(
          (
            updatedConsultation: Consultation
          ) => {

            this.addOrReplaceConsultation(
              updatedConsultation
            );

          }
        )

      );

  }


  // =====================================================
  // UPDATE CONSULTATION STATUS
  // =====================================================

  updateStatus(
    id: string,
    status: Consultation['status']
  ):
    Observable<Consultation> {

    return this.http
      .patch<Consultation>(
        `${this.apiUrl}/${encodeURIComponent(id)}/status`,
        null,
        {
          params: {
            status
          }
        }
      )
      .pipe(

        tap(
          (
            updatedConsultation: Consultation
          ) => {

            this.addOrReplaceConsultation(
              updatedConsultation
            );

          }
        )

      );

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
  ):
    Observable<boolean> {

    return new Observable<boolean>(
      subscriber => {

        this.http
          .patch<Consultation>(
            `${this.apiUrl}/${encodeURIComponent(id)}/complete`,
            null
          )
          .subscribe({

            next: (
              completedConsultation: Consultation
            ) => {

              // =========================================
              // UPDATE LIVE STATE
              // =========================================

              this.addOrReplaceConsultation(
                completedConsultation
              );


              // =========================================
              // ADD CONSULTATION BILL
              // =========================================

              this.addConsultationCharge(
                completedConsultation
              );


              // =========================================
              // CREATE PHARMACY PRESCRIPTION
              // =========================================

              if (
                pharmacyData &&
                pharmacyData.items &&
                pharmacyData.items.length > 0
              ) {

                const prescription =
                  this.createPharmacyPrescription(
                    completedConsultation,
                    pharmacyData
                  );


                if (!prescription) {

                  console.error(
                    'Consultation completed but pharmacy prescription could not be created.'
                  );


                  subscriber.next(
                    false
                  );

                  subscriber.complete();

                  return;

                }

              }


              // =========================================
              // SUCCESS
              // =========================================

              subscriber.next(
                true
              );

              subscriber.complete();

            },

            error: (
              error: unknown
            ) => {

              console.error(
                'Failed to complete consultation:',
                error
              );


              subscriber.error(
                error
              );

            }

          });

      }
    );

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

    return this.pharmacyService
      .createPrescription({

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
  ):
    void {

    const patientBills =
      this.billingService
        .getBillsByPatient(
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


    if (alreadyBilled) {

      return;

    }


    const patientName =
      consultation.patientName;


    if (!patientName) {

      console.warn(
        'Consultation completed but patient name was not provided:',
        consultation.patientId
      );

      return;

    }


    const bill =
      this.billingService
        .addServiceCharge(

          consultation.patientId,

          patientName,

          'Consultation',

          `Medical consultation - ${consultation.chiefComplaint}`,

          this.CONSULTATION_FEE,

          consultation.id,

          {

            doctorId:
              consultation.doctorId,

            notes:
              consultation.clinicalNotes

          }

        );


    if (!bill) {

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
  ):
    Observable<Consultation> {

    return this.updateStatus(
      id,
      'Cancelled'
    );

  }


  // =====================================================
  // REOPEN CONSULTATION
  // =====================================================

  reopenConsultation(
    id: string
  ):
    Observable<Consultation> {

    return this.updateStatus(
      id,
      'Open'
    );

  }


  // =====================================================
  // DELETE CONSULTATION
  // =====================================================

  deleteConsultation(
    id: string
  ):
    Observable<void> {

    return this.http
      .delete<void>(
        `${this.apiUrl}/${encodeURIComponent(id)}`
      )
      .pipe(

        tap(() => {

          this.removeConsultation(
            id
          );

        })

      );

  }


  // =====================================================
  // SET CONSULTATIONS
  // =====================================================

  private setConsultations(
    consultations: Consultation[]
  ):
    void {

    this.consultationsSubject.next([
      ...consultations
    ]);

  }


  // =====================================================
  // ADD OR REPLACE CONSULTATION
  // =====================================================

  private addOrReplaceConsultation(
    consultation: Consultation
  ):
    void {

    if (
      !consultation ||
      !consultation.id
    ) {

      return;

    }


    const currentConsultations =
      this.consultationsSubject.value;


    const index =
      currentConsultations.findIndex(
        (
          existingConsultation: Consultation
        ) =>
          existingConsultation.id ===
          consultation.id
      );


    let updatedConsultations:
      Consultation[];


    // ===================================================
    // NEW CONSULTATION
    // ===================================================

    if (index === -1) {

      updatedConsultations = [

        consultation,

        ...currentConsultations

      ];

    }

    // ===================================================
    // EXISTING CONSULTATION
    // ===================================================

    else {

      updatedConsultations = [
        ...currentConsultations
      ];


      updatedConsultations[index] =
        consultation;

    }


    this.setConsultations(
      updatedConsultations
    );

  }


  // =====================================================
  // MERGE CONSULTATIONS
  // =====================================================

  private mergeConsultations(
    consultations: Consultation[]
  ):
    void {

    if (
      !Array.isArray(
        consultations
      )
    ) {

      return;

    }


    consultations.forEach(
      (
        consultation: Consultation
      ) => {

        this.addOrReplaceConsultation(
          consultation
        );

      }
    );

  }


  // =====================================================
  // REMOVE CONSULTATION
  // =====================================================

  private removeConsultation(
    id: string
  ):
    void {

    const updatedConsultations =
      this.consultationsSubject.value
        .filter(
          (
            consultation: Consultation
          ) =>
            consultation.id !== id
        );


    this.setConsultations(
      updatedConsultations
    );

  }

}

