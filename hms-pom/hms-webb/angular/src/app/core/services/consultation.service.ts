
import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  of
} from 'rxjs';

import {
  catchError,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import {
  Consultation
} from '../../shared/models/consultation.model';

import {
  PharmacyPrescriptionItem
} from '../../shared/models/pharmacy.model';

import {
  Bill
} from '../../shared/models/billing.model';

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
    '/api/consultations';


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
            Array.isArray(
              consultations
            )
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


          this.setConsultations(
            []
          );

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
              Array.isArray(
                consultations
              )
                ? consultations
                : []
            );

          }
        )

      );

  }


  // =====================================================
  // GET CONSULTATIONS SNAPSHOT
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
          consultation.id ===
          id
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
  // Creating a consultation always starts it as OPEN.
  //
  // Saving/registering a consultation does NOT complete it.
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
  // Dedicated backend completion endpoint.
  //
  // Does NOT create:
  //
  // - Laboratory requests
  // - Pharmacy prescriptions
  // - Billing charges
  //
  // Those remain separate workflows.
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
  //       ↓
  // READY FOR REVIEW
  //       ↓
  // DOCTOR REVIEWS
  //       ↓
  // OPEN
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
  //
  // Kept available for the separate Pharmacy workflow.
  //
  // It is NOT automatically called by Save or Complete.
  //
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
  //
  // IMPORTANT:
  //
  // BillingService is now HTTP/Observable based.
  //
  // Therefore this method MUST NOT do:
  //
  // const bills = billingService.getBillsByPatient(...)
  //
  // because the result is Observable<Bill[]>.
  //
  // =====================================================

  private addConsultationCharge(
    consultation:
      Consultation
  ):
    Observable<Bill | undefined> {

    if (
      !consultation ||
      !consultation.patientId
    ) {

      return of(
        undefined
      );

    }


    return this.billingService
      .getBillsByPatient(
        consultation.patientId
      )
      .pipe(

        map(
          (
            patientBills:
              Bill[]
          ) =>
            Array.isArray(
              patientBills
            )
              ? patientBills
              : []
        ),

        switchMap(
          (
            patientBills:
              Bill[]
          ) => {

            // -------------------------------------------
            // CHECK FOR DUPLICATE CONSULTATION CHARGE
            // -------------------------------------------

            const alreadyBilled =
              patientBills.some(
                (
                  bill:
                    Bill
                ) => {

                  const items =
                    bill.items ?? [];


                  return items.some(
                    (
                      item
                    ) =>

                      item.billingType ===
                        'Consultation' &&

                      item.referenceId ===
                        consultation.id

                  );

                }
              );


            if (alreadyBilled) {

              const existingBill =
                patientBills.find(
                  (
                    bill:
                      Bill
                  ) =>

                    (
                      bill.items ?? []
                    ).some(
                      (
                        item
                      ) =>

                        item.billingType ===
                          'Consultation' &&

                        item.referenceId ===
                          consultation.id

                    )
                );


              console.log(
                'Consultation already billed:',
                {
                  consultationId:
                    consultation.id,

                  invoiceNumber:
                    existingBill?.invoiceNumber,

                  billId:
                    existingBill?.id
                }
              );


              return of(
                existingBill
              );

            }


            // -------------------------------------------
            // PATIENT NAME
            // -------------------------------------------

            const patientName =
              consultation.patientName;


            if (
              !patientName ||
              !patientName.trim()
            ) {

              console.warn(
                'Consultation has no patient name:',
                consultation.patientId
              );


              return of(
                undefined
              );

            }


            // -------------------------------------------
            // CREATE CONSULTATION CHARGE
            // -------------------------------------------

            return this.billingService
              .addServiceCharge(

                consultation.patientId,

                patientName,

                'Consultation',

                `Medical consultation - ${consultation.chiefComplaint || 'Consultation'}`,

                this.CONSULTATION_FEE,

                consultation.id,

                {

                  doctorId:
                    consultation.doctorId,

                  notes:
                    consultation.clinicalNotes || undefined

                }

              );

          }

        ),

        tap(
          (
            bill:
              Bill | undefined
          ) => {

            if (!bill) {

              return;

            }


            console.log(
              'Consultation charge available:',
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
        ),

        catchError(
          (
            error: unknown
          ) => {

            console.error(
              'Failed to process consultation billing:',
              error
            );


            // -----------------------------------------
            // Billing failure must not break the
            // consultation stream.
            // -----------------------------------------

            return of(
              undefined
            );

          }
        )

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
      Array.isArray(
        consultations
      )
        ? [
            ...consultations
          ]
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


    if (
      index === -1
    ) {

      this.setConsultations([

        consultation,

        ...current

      ]);

      return;

    }


    const updated =
      [
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

