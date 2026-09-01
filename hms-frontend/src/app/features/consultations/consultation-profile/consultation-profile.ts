
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  catchError,
  forkJoin,
  of
} from 'rxjs';

import {
  ConsultationService
} from '../../../core/services/consultation.service';

import {
  PatientService
} from '../../../core/services/patient.service';

import {
  DoctorService
} from '../../../core/services/doctor.service';

import {
  LaboratoryService
} from '../../../core/services/laboratory.service';

import {
  Consultation
} from '../../../shared/models/consultation.model';

import {
  Patient
} from '../../../shared/models/patient.model';

import {
  Doctor
} from '../../../shared/models/doctor.model';

import {
  LaboratoryRequest
} from '../../../shared/models/laboratory.model';


@Component({
  selector:
    'app-consultation-profile',

  standalone:
    true,

  imports: [
    DatePipe
  ],

  templateUrl:
    './consultation-profile.html',

  styleUrl:
    './consultation-profile.css'
})
export class ConsultationProfile
  implements OnInit {


  // =====================================================
  // CONSULTATION
  // =====================================================

  consultation?:
    Consultation;


  // =====================================================
  // PATIENT
  // =====================================================

  patient?:
    Patient;


  // =====================================================
  // DOCTOR
  // =====================================================

  doctor?:
    Doctor;


  // =====================================================
  // LABORATORY REQUESTS
  // =====================================================

  laboratoryRequests:
    LaboratoryRequest[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  isLoading =
    false;


  // =====================================================
  // PROCESSING
  // =====================================================

  isProcessing =
    false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage =
    '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly consultationService:
      ConsultationService,

    private readonly patientService:
      PatientService,

    private readonly doctorService:
      DoctorService,

    private readonly laboratoryService:
      LaboratoryService,

    private readonly cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const routeId =
      this.route.snapshot
        .paramMap
        .get('id');


    // ---------------------------------------------------
    // VALIDATE ID
    // ---------------------------------------------------

    if (
      !routeId ||
      !routeId.trim()
    ) {

      this.router.navigate([
        '/consultations'
      ]);

      return;
    }


    this.loadConsultation(
      routeId.trim()
    );

  }


  // =====================================================
  // LOAD CONSULTATION
  // =====================================================

  private loadConsultation(
    id: string
  ): void {

    // ---------------------------------------------------
    // INITIAL STATE
    // ---------------------------------------------------

    this.isLoading =
      true;

    this.errorMessage =
      '';

    this.consultation =
      undefined;

    this.patient =
      undefined;

    this.doctor =
      undefined;

    this.laboratoryRequests =
      [];


    this.cdr.detectChanges();


    // ===================================================
    // LOAD MAIN CONSULTATION
    // ===================================================

    this.consultationService
      .getConsultationById(id)
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (
          consultation:
            Consultation
        ) => {

          console.log(
            'Consultation loaded successfully:',
            consultation
          );


          if (!consultation) {

            this.handleLoadError(
              'Consultation was not found.'
            );

            return;
          }


          // =============================================
          // IMPORTANT
          //
          // Show the main profile immediately.
          //
          // Do NOT wait for patient, doctor or laboratory
          // requests before releasing the profile.
          // =============================================

          this.consultation =
            consultation;

          this.isLoading =
            false;

          this.cdr.detectChanges();


          // =============================================
          // LOAD RELATED INFORMATION
          // =============================================

          this.loadPatient(
            consultation.patientId
          );

          this.loadDoctor(
            consultation.doctorId
          );

          this.loadLaboratoryRequests(
            consultation.id
          );


          console.log(
            'Main consultation profile rendered:',
            consultation.id
          );

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (
          error:
            unknown
        ) => {

          console.error(
            'Failed to load consultation:',
            error
          );


          this.handleLoadError(
            this.getErrorMessage(
              error,
              'Unable to load consultation. Please try again.'
            )
          );

        }

      });

  }


  // =====================================================
  // LOAD PATIENT
  // =====================================================

  private loadPatient(
    patientId: string
  ): void {

    if (
      !patientId
    ) {

      this.patient =
        undefined;

      return;
    }


    console.log(
      'Loading patient:',
      patientId
    );


    this.patientService
      .getPatientById(
        patientId
      )
      .pipe(
        catchError(
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to load patient:',
              error
            );

            return of(
              undefined
            );

          }
        )
      )
      .subscribe({

        next: (
          patient:
            Patient | undefined
        ) => {

          this.patient =
            patient;


          console.log(
            'Patient loaded:',
            patient
          );


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD DOCTOR
  // =====================================================

  private loadDoctor(
    doctorId: string
  ): void {

    if (
      !doctorId
    ) {

      this.doctor =
        undefined;

      return;
    }


    console.log(
      'Loading doctor:',
      doctorId
    );


    this.doctorService
      .getDoctorById(
        doctorId
      )
      .pipe(
        catchError(
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to load doctor:',
              error
            );

            return of(
              undefined
            );

          }
        )
      )
      .subscribe({

        next: (
          doctor:
            Doctor | undefined
        ) => {

          this.doctor =
            doctor;


          console.log(
            'Doctor loaded:',
            doctor
          );


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD LABORATORY REQUESTS
  // =====================================================

  private loadLaboratoryRequests(
    consultationId: string
  ): void {

    if (
      !consultationId
    ) {

      this.laboratoryRequests =
        [];

      return;
    }


    console.log(
      'Loading laboratory requests:',
      consultationId
    );


    this.laboratoryService
      .getRequestsByConsultation(
        consultationId
      )
      .pipe(
        catchError(
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to load laboratory requests:',
              error
            );

            return of(
              [] as LaboratoryRequest[]
            );

          }
        )
      )
      .subscribe({

        next: (
          requests:
            LaboratoryRequest[]
        ) => {

          this.laboratoryRequests =
            Array.isArray(requests)
              ? [
                  ...requests
                ]
              : [];


          console.log(
            'Laboratory requests loaded:',
            this.laboratoryRequests
          );


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // HANDLE LOAD ERROR
  // =====================================================

  private handleLoadError(
    message: string
  ): void {

    this.consultation =
      undefined;

    this.patient =
      undefined;

    this.doctor =
      undefined;

    this.laboratoryRequests =
      [];

    this.errorMessage =
      message;

    this.isLoading =
      false;

    this.cdr.detectChanges();

  }


  // =====================================================
  // PATIENT NAME
  // =====================================================

  get patientName(): string {

    if (
      !this.patient
    ) {

      return (
        this.consultation?.patientId ||
        'Loading patient...'
      );

    }


    return (
      `${this.patient.firstName} ` +
      `${this.patient.lastName}`
    );

  }


  // =====================================================
  // PATIENT ID
  // =====================================================

  get patientId(): string {

    return (
      this.consultation?.patientId ||
      '—'
    );

  }


  // =====================================================
  // DOCTOR NAME
  // =====================================================

  get doctorName(): string {

    if (
      !this.doctor
    ) {

      return (
        this.consultation?.doctorId ||
        'Loading doctor...'
      );

    }


    return (
      `Dr. ${this.doctor.firstName} ` +
      `${this.doctor.lastName}`
    );

  }


  // =====================================================
  // DOCTOR ID
  // =====================================================

  get doctorId(): string {

    return (
      this.consultation?.doctorId ||
      '—'
    );

  }


  // =====================================================
  // WORKFLOW STATUS
  // =====================================================

  get isOpen(): boolean {

    return (
      this.consultation?.status ===
      'Open'
    );

  }


  get isPendingResults(): boolean {

    return (
      this.consultation?.status ===
      'Pending Results'
    );

  }


  get isReadyForReview(): boolean {

    return (
      this.consultation?.status ===
      'Ready For Review'
    );

  }


  get isCompleted(): boolean {

    return (
      this.consultation?.status ===
      'Completed'
    );

  }


  get isCancelled(): boolean {

    return (
      this.consultation?.status ===
      'Cancelled'
    );

  }


  // =====================================================
  // HAS LABORATORY REQUESTS
  // =====================================================

  get hasLaboratoryRequests(): boolean {

    return (
      this.laboratoryRequests.length >
      0
    );

  }


  // =====================================================
  // PENDING LABORATORY
  // =====================================================

  get pendingLaboratoryRequests():
    LaboratoryRequest[] {

    return this.laboratoryRequests.filter(
      (
        request:
          LaboratoryRequest
      ) =>
        request.status ===
        'Pending'
    );

  }


  // =====================================================
  // IN-PROGRESS LABORATORY
  // =====================================================

  get inProgressLaboratoryRequests():
    LaboratoryRequest[] {

    return this.laboratoryRequests.filter(
      (
        request:
          LaboratoryRequest
      ) =>
        request.status ===
        'In Progress'
    );

  }


  // =====================================================
  // COMPLETED LABORATORY
  // =====================================================

  get completedLaboratoryRequests():
    LaboratoryRequest[] {

    return this.laboratoryRequests.filter(
      (
        request:
          LaboratoryRequest
      ) =>
        request.status ===
        'Completed'
    );

  }


  // =====================================================
  // CANCELLED LABORATORY
  // =====================================================

  get cancelledLaboratoryRequests():
    LaboratoryRequest[] {

    return this.laboratoryRequests.filter(
      (
        request:
          LaboratoryRequest
      ) =>
        request.status ===
        'Cancelled'
    );

  }


  // =====================================================
  // HAS COMPLETED RESULTS
  // =====================================================

  get hasCompletedLaboratoryResults():
    boolean {

    return this.laboratoryRequests.some(
      (
        request:
          LaboratoryRequest
      ) =>
        request.status ===
          'Completed' &&
        !!request.result
    );

  }


  // =====================================================
  // LABORATORY TOTAL
  // =====================================================

  get laboratoryTotal(): number {

    return this.laboratoryRequests.reduce(
      (
        total:
          number,

        request:
          LaboratoryRequest
      ) =>
        total +
        Number(
          request.price || 0
        ),

      0
    );

  }


  // =====================================================
  // COMPLETED LABORATORY TOTAL
  // =====================================================

  get completedLaboratoryTotal(): number {

    return this.completedLaboratoryRequests.reduce(
      (
        total:
          number,

        request:
          LaboratoryRequest
      ) =>
        total +
        Number(
          request.price || 0
        ),

      0
    );

  }


  // =====================================================
  // CAN COMPLETE
  // =====================================================

  get canCompleteConsultation(): boolean {

    if (
      !this.consultation ||
      this.isProcessing
    ) {

      return false;
    }


    if (
      this.consultation.status !==
      'Open'
    ) {

      return false;
    }


    const hasDiagnosis =
      !!this.consultation
        .diagnosis
        ?.trim();


    const hasTreatmentPlan =
      !!this.consultation
        .treatmentPlan
        ?.trim();


    if (
      !hasDiagnosis ||
      !hasTreatmentPlan
    ) {

      return false;
    }


    if (
      this.consultation
        .hasLaboratoryRequests
    ) {

      if (
        !this.consultation
          .hasLaboratoryResults
      ) {

        return false;
      }


      if (
        !this.consultation
          .laboratoryResultsReviewed
      ) {

        return false;
      }

    }


    return true;

  }


// =====================================================
// FORMAT CURRENCY
// =====================================================

formatCurrency(
  amount: number
): string {

  return new Intl.NumberFormat(
    'en-UG',
    {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }
  ).format(
    Number(
      amount || 0
    )
  );

}


  // =====================================================
  // EDIT CONSULTATION
  // =====================================================

  editConsultation(): void {

    if (
      !this.consultation ||
      this.isProcessing
    ) {

      return;
    }


    if (
      this.consultation.status ===
      'Completed'
    ) {

      alert(
        'Completed consultations cannot be edited.'
      );

      return;
    }


    if (
      this.consultation.status ===
      'Cancelled'
    ) {

      alert(
        'Cancelled consultations cannot be edited.'
      );

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

    if (
      !this.consultation ||
      this.isProcessing
    ) {

      return;
    }


    // ---------------------------------------------------
    // ONLY OPEN
    // ---------------------------------------------------

    if (
      this.consultation.status !==
      'Open'
    ) {

      alert(
        'Only Open consultations can be completed.'
      );

      return;
    }


    // ---------------------------------------------------
    // DIAGNOSIS
    // ---------------------------------------------------

    if (
      !this.consultation.diagnosis ||
      !this.consultation
        .diagnosis
        .trim()
    ) {

      alert(
        'Final diagnosis is required before completing the consultation.'
      );

      return;
    }


    // ---------------------------------------------------
    // TREATMENT PLAN
    // ---------------------------------------------------

    if (
      !this.consultation.treatmentPlan ||
      !this.consultation
        .treatmentPlan
        .trim()
    ) {

      alert(
        'Treatment plan is required before completing the consultation.'
      );

      return;
    }


    // ---------------------------------------------------
    // LABORATORY
    // ---------------------------------------------------

    if (
      this.consultation
        .hasLaboratoryRequests
    ) {

      if (
        !this.consultation
          .hasLaboratoryResults
      ) {

        alert(
          'Laboratory results must be available before completing the consultation.'
        );

        return;
      }


      if (
        !this.consultation
          .laboratoryResultsReviewed
      ) {

        alert(
          'Laboratory results must be reviewed before completing the consultation.'
        );

        return;
      }

    }


    // ---------------------------------------------------
    // CONFIRM
    // ---------------------------------------------------

    const confirmed =
      window.confirm(
        'Complete this consultation? This will finalize the clinical record.'
      );


    if (
      !confirmed
    ) {

      return;
    }


    this.isProcessing =
      true;


    this.consultationService
      .completeConsultation(
        this.consultation.id
      )
      .subscribe({

        next: (
          updatedConsultation:
            Consultation
        ) => {

          this.consultation =
            updatedConsultation;

          this.isProcessing =
            false;

          this.cdr.detectChanges();


          alert(
            'Consultation completed successfully.'
          );

        },


        error: (
          error:
            unknown
        ) => {

          console.error(
            'Failed to complete consultation:',
            error
          );


          this.isProcessing =
            false;

          this.cdr.detectChanges();


          alert(
            this.getErrorMessage(
              error,
              'Unable to complete consultation.'
            )
          );

        }

      });

  }


  // =====================================================
  // REVIEW LABORATORY RESULTS
  // =====================================================

  reviewLaboratoryResults(): void {

    if (
      !this.consultation ||
      this.isProcessing
    ) {

      return;
    }


    if (
      this.consultation.status !==
      'Ready For Review'
    ) {

      alert(
        'Laboratory results are not currently ready for review.'
      );

      return;
    }


    if (
      !this.consultation
        .hasLaboratoryResults
    ) {

      alert(
        'Laboratory results are not available yet.'
      );

      return;
    }


    if (
      this.consultation
        .laboratoryResultsReviewed
    ) {

      alert(
        'Laboratory results have already been reviewed.'
      );

      return;
    }


    const confirmed =
      window.confirm(
        'Mark the laboratory results as reviewed?'
      );


    if (
      !confirmed
    ) {

      return;
    }


    this.isProcessing =
      true;


    this.consultationService
      .reviewLaboratoryResults(
        this.consultation.id
      )
      .subscribe({

        next: (
          updatedConsultation:
            Consultation
        ) => {

          this.consultation =
            updatedConsultation;

          this.isProcessing =
            false;

          this.cdr.detectChanges();


          alert(
            'Laboratory results reviewed successfully.'
          );

        },


        error: (
          error:
            unknown
        ) => {

          console.error(
            'Failed to review laboratory results:',
            error
          );


          this.isProcessing =
            false;

          this.cdr.detectChanges();


          alert(
            this.getErrorMessage(
              error,
              'Unable to review laboratory results.'
            )
          );

        }

      });

  }


  // =====================================================
  // CANCEL CONSULTATION
  // =====================================================

  cancelConsultation(): void {

    if (
      !this.consultation ||
      this.isProcessing
    ) {

      return;
    }


    if (
      this.consultation.status ===
      'Completed'
    ) {

      alert(
        'A completed consultation cannot be cancelled.'
      );

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


    if (
      !confirmed
    ) {

      return;
    }


    this.isProcessing =
      true;


    this.consultationService
      .cancelConsultation(
        this.consultation.id
      )
      .subscribe({

        next: (
          updatedConsultation:
            Consultation
        ) => {

          this.consultation =
            updatedConsultation;

          this.isProcessing =
            false;

          this.cdr.detectChanges();


          alert(
            'Consultation cancelled successfully.'
          );

        },


        error: (
          error:
            unknown
        ) => {

          console.error(
            'Failed to cancel consultation:',
            error
          );


          this.isProcessing =
            false;

          this.cdr.detectChanges();


          alert(
            this.getErrorMessage(
              error,
              'Unable to cancel consultation.'
            )
          );

        }

      });

  }


  // =====================================================
  // REOPEN CONSULTATION
  // =====================================================

  reopenConsultation(): void {

    if (
      !this.consultation ||
      this.isProcessing
    ) {

      return;
    }


    if (
      this.consultation.status !==
      'Cancelled'
    ) {

      return;
    }


    const confirmed =
      window.confirm(
        'Reopen this consultation?'
      );


    if (
      !confirmed
    ) {

      return;
    }


    this.isProcessing =
      true;


    this.consultationService
      .reopenConsultation(
        this.consultation.id
      )
      .subscribe({

        next: (
          updatedConsultation:
            Consultation
        ) => {

          this.consultation =
            updatedConsultation;

          this.isProcessing =
            false;

          this.cdr.detectChanges();


          alert(
            'Consultation reopened successfully.'
          );

        },


        error: (
          error:
            unknown
        ) => {

          console.error(
            'Failed to reopen consultation:',
            error
          );


          this.isProcessing =
            false;

          this.cdr.detectChanges();


          alert(
            this.getErrorMessage(
              error,
              'Unable to reopen consultation.'
            )
          );

        }

      });

  }


  // =====================================================
  // DELETE CONSULTATION
  // =====================================================

  deleteConsultation(): void {

    if (
      !this.consultation ||
      this.isProcessing
    ) {

      return;
    }


    const id =
      this.consultation.id;


    const confirmed =
      window.confirm(
        `Delete consultation ${id}? This action cannot be undone.`
      );


    if (
      !confirmed
    ) {

      return;
    }


    this.isProcessing =
      true;


    this.consultationService
      .deleteConsultation(
        id
      )
      .subscribe({

        next: () => {

          this.isProcessing =
            false;


          this.router.navigate([
            '/consultations'
          ]);

        },


        error: (
          error:
            unknown
        ) => {

          console.error(
            'Failed to delete consultation:',
            error
          );


          this.isProcessing =
            false;

          this.cdr.detectChanges();


          alert(
            this.getErrorMessage(
              error,
              'Unable to delete consultation.'
            )
          );

        }

      });

  }


  // =====================================================
  // VIEW LABORATORY REQUEST
  // =====================================================

  viewLaboratoryRequest(
    request:
      LaboratoryRequest
  ): void {

    if (
      !request ||
      request.id === undefined ||
      request.id === null ||
      this.isProcessing
    ) {

      return;
    }


    this.router.navigate([
      '/laboratory/requests',
      request.id
    ]);

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refresh(): void {

    if (
      !this.consultation ||
      this.isProcessing
    ) {

      return;
    }


    this.loadConsultation(
      this.consultation.id
    );

  }


  // =====================================================
  // BACK
  // =====================================================

  backToConsultations(): void {

    if (
      this.isProcessing
    ) {

      return;
    }


    this.router.navigate([
      '/consultations'
    ]);

  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error:
      unknown,

    fallback:
      string
  ): string {

    if (
      typeof error !==
      'object' ||
      error === null
    ) {

      return fallback;
    }


    const response =
      error as {

        message?: string;

        error?: unknown;

      };


    if (
      typeof response.message ===
      'string' &&
      response.message.trim()
    ) {

      return response.message.trim();

    }


    if (
      typeof response.error ===
      'string' &&
      response.error.trim()
    ) {

      return response.error.trim();

    }


    if (
      typeof response.error ===
      'object' &&
      response.error !== null
    ) {

      const body =
        response.error as {

          message?: string;

          error?: string;

        };


      if (
        typeof body.message ===
        'string' &&
        body.message.trim()
      ) {

        return body.message.trim();

      }


      if (
        typeof body.error ===
        'string' &&
        body.error.trim()
      ) {

        return body.error.trim();

      }

    }


    return fallback;

  }

}
