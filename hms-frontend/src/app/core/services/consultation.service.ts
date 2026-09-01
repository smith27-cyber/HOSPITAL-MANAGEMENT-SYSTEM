
import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

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
  // API
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
  // PUBLIC CONSULTATION STREAM
  // =====================================================

  readonly consultations$ =
    this.consultationsSubject.asObservable();


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly http:
      HttpClient,

    private readonly pharmacyService:
      PharmacyService,

    private readonly billingService:
      BillingService
  ) {

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
          consultations:
            Consultation[]
        ) => {

          this.setConsultations(
            Array.isArray(consultations)
              ? consultations
              : []
          );

          console.log(
            'Initial consultations loaded:',
            consultations
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
            consultations:
              Consultation[]
          ) => {

            this.setConsultations(
              Array.isArray(consultations)
                ? consultations
                : []
            );

          }
        )

      );

  }


  // =====================================================
  // GET CONSULTATION SNAPSHOT
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
            consultation:
              Consultation
          ) => {

            if (consultation) {

              this.addOrReplaceConsultation(
                consultation
              );

            }

          }
        )

      );

  }


  // =====================================================
  // GET CONSULTATION SNAPSHOT BY ID
  // =====================================================

  getConsultationByIdSnapshot(
    id: string
  ):
    Consultation | undefined {

    return this.consultationsSubject
      .value
      .find(
        (
          consultation:
            Consultation
        ) =>
          consultation.id === id
      );

  }


  // =====================================================
  // GET BY PATIENT
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
            consultations:
              Consultation[]
          ) => {

            this.mergeConsultations(
              consultations
            );

          }
        )

      );

  }


  // =====================================================
  // GET BY DOCTOR
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
            consultations:
              Consultation[]
          ) => {

            this.mergeConsultations(
              consultations
            );

          }
        )

      );

  }


  // =====================================================
  // GET BY APPOINTMENT
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
            consultation:
              Consultation
          ) => {

            if (consultation) {

              this.addOrReplaceConsultation(
                consultation
              );

            }

          }
        )

      );

  }


  // =====================================================
  // CREATE CONSULTATION
  // =====================================================
  //
  // IMPORTANT:
  //
  // Creating a consultation ALWAYS starts it as OPEN.
  //
  // It does NOT complete the consultation.
  //
  // =====================================================

  addConsultation(
    consultationData:
      Omit<
        Consultation,
        'id' |
        'createdAt' |
        'status'
      >
  ):
    Observable<Consultation> {


    const payload = {

      ...consultationData,

      status:
        'Open' as const

    };


    return this.http
      .post<Consultation>(
        this.apiUrl,
        payload
      )
      .pipe(

        tap(
          (
            newConsultation:
              Consultation
          ) => {

            console.log(
              'Consultation created:',
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
  //
  // SAVE PROGRESS ONLY.
  //
  // This does NOT complete the consultation.
  //
  // =====================================================

  updateConsultation(
    consultation:
      Consultation
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
            updatedConsultation:
              Consultation
          ) => {

            console.log(
              'Consultation updated:',
              updatedConsultation
            );


            this.addOrReplaceConsultation(
              updatedConsultation
            );

          }
        )

      );

  }


  // =====================================================
  // UPDATE STATUS
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
            updatedConsultation:
              Consultation
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
  //
  // IMPORTANT:
  //
  // This returns Observable<Consultation>.
  //
  // It does NOT return boolean.
  //
  // Endpoint:
  //
  // PATCH /api/consultations/{id}/complete
  //
  // =====================================================

  completeConsultation(
    id: string
  ):
    Observable<Consultation> {

    return this.http
      .patch<Consultation>(
        `${this.apiUrl}/${encodeURIComponent(id)}/complete`,
        null
      )
      .pipe(

        tap(
          (
            completedConsultation:
              Consultation
          ) => {

            console.log(
              'Consultation completed:',
              completedConsultation
            );


            this.addOrReplaceConsultation(
              completedConsultation
            );

          }
        )

      );

  }


  // =====================================================
  // REVIEW LABORATORY RESULTS
  // =====================================================
  //
  // Workflow:
  //
  // PENDING RESULTS
  //        ↓
  // READY FOR REVIEW
  //        ↓
  // DOCTOR REVIEWS
  //        ↓
  // OPEN
  //
  // Endpoint:
  //
  // PATCH /api/consultations/{id}/review-laboratory-results
  //
  // =====================================================

  reviewLaboratoryResults(
    id: string
  ):
    Observable<Consultation> {

    return this.http
      .patch<Consultation>(
        `${this.apiUrl}/${encodeURIComponent(id)}/review-laboratory-results`,
        null
      )
      .pipe(

        tap(
          (
            updatedConsultation:
              Consultation
          ) => {

            console.log(
              'Laboratory results reviewed:',
              updatedConsultation
            );


            this.addOrReplaceConsultation(
              updatedConsultation
            );

          }
        )

      );

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
  // CONSULTATION FEE
  // =====================================================

  getConsultationFee():
    number {

    return this.CONSULTATION_FEE;

  }


  // =====================================================
  // PHARMACY PRESCRIPTION
  // =====================================================

  private createPharmacyPrescription(
    consultation:
      Consultation,

    pharmacyData: {
      patientName:
        string;

      patientNumber?:
        string;

      doctorName?:
        string;

      items:
        PharmacyPrescriptionItem[];

      notes?:
        string;
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
  // CONSULTATION BILLING
  // =====================================================

  private addConsultationCharge(
    consultation:
      Consultation
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
        'Consultation has no patient name:',
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
        'Unable to add consultation charge:',
        consultation.id
      );

      return;

    }


    console.log(
      'Consultation charge added:',
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
  // SET CONSULTATIONS
  // =====================================================

  private setConsultations(
    consultations:
      Consultation[]
  ):
    void {

    this.consultationsSubject.next(
      Array.isArray(consultations)
        ? [...consultations]
        : []
    );

  }


  // =====================================================
  // ADD OR REPLACE CONSULTATION
  // =====================================================

  private addOrReplaceConsultation(
    consultation:
      Consultation
  ):
    void {

    if (
      !consultation ||
      !consultation.id
    ) {

      return;

    }


    const current =
      this.consultationsSubject.value;


    const index =
      current.findIndex(
        (
          item:
            Consultation
        ) =>
          item.id ===
          consultation.id
      );


    if (index === -1) {

      this.setConsultations([

        consultation,

        ...current

      ]);

      return;

    }


    const updated = [
      ...current
    ];


    updated[index] =
      consultation;


    this.setConsultations(
      updated
    );

  }


  // =====================================================
  // MERGE CONSULTATIONS
  // =====================================================

  private mergeConsultations(
    consultations:
      Consultation[]
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
        consultation:
          Consultation
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

    const updated =
      this.consultationsSubject
        .value
        .filter(
          (
            consultation:
              Consultation
          ) =>
            consultation.id !==
            id
        );


    this.setConsultations(
      updated
    );

  }

}

