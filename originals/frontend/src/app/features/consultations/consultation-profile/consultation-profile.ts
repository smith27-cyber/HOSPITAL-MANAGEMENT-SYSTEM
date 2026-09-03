
// =====================================================
// CONSULTATION PROFILE
// File:
// src/app/features/consultations/consultation-profile/consultation-profile.ts
// =====================================================

import {
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

  consultation?: Consultation;


  // =====================================================
  // PATIENT
  // =====================================================

  patient?: Patient;


  // =====================================================
  // DOCTOR
  // =====================================================

  doctor?: Doctor;


  // =====================================================
  // LABORATORY REQUESTS
  // =====================================================

  laboratoryRequests:
    LaboratoryRequest[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = false;


  // =====================================================
  // ACTION LOADING
  // =====================================================

  isProcessing = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


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
      LaboratoryService

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const routeId =
      this.route.snapshot
        .paramMap
        .get('id');


    // ===================================================
    // NO ID
    // ===================================================

    if (!routeId) {

      this.router.navigate([
        '/consultations'
      ]);

      return;

    }


    // ===================================================
    // CLEAN ROUTE ID
    // ===================================================

    const id =
      routeId.trim();


    console.log(
      'Consultation profile route ID:',
      id
    );


    this.loadConsultation(
      id
    );

  }


  // =====================================================
  // LOAD CONSULTATION
  // =====================================================

  private loadConsultation(
    id: string
  ): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.consultation =
      undefined;

    this.patient =
      undefined;

    this.doctor =
      undefined;

    this.laboratoryRequests = [];


    // ===================================================
    // DETERMINE ID TYPE
    // ===================================================
    //
    // APT-... = appointment ID
    // Anything else = consultation ID
    //
    // This prevents:
    //
    // GET /api/consultations/APT-897300
    //
    // and instead uses:
    //
    // GET /api/consultations/appointment/APT-897300
    //
    // ===================================================

    const request$ =
      id.toUpperCase().startsWith('APT-')

        ? this.consultationService
            .getConsultationByAppointment(id)

        : this.consultationService
            .getConsultationById(id);


    // ===================================================
    // LOAD CONSULTATION
    // ===================================================

    request$.subscribe({

      next: (
        consultation:
          Consultation | undefined
      ) => {

        if (!consultation) {

          this.handleLoadError(
            'Consultation was not found.'
          );

          return;

        }


        console.log(
          'Consultation loaded successfully:',
          consultation
        );


        this.consultation =
          consultation;


        // ===============================================
        // LOAD PATIENT
        // ===============================================

        this.loadPatient(
          consultation.patientId
        );


        // ===============================================
        // LOAD DOCTOR
        // ===============================================

        this.loadDoctor(
          consultation.doctorId
        );


        // ===============================================
        // LOAD LABORATORY REQUESTS
        // ===============================================

        this.loadLaboratoryRequests(
          consultation.id
        );


        this.isLoading = false;

      },


      error: (
        error: unknown
      ) => {

        console.error(
          'Failed to load consultation:',
          error
        );


        this.isLoading = false;


        this.handleLoadError(
          'Unable to load consultation. Please try again.'
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

    if (!patientId) {

      this.patient =
        undefined;

      return;

    }


    this.patientService
      .getPatientById(patientId)
      .subscribe({

        next: (
          patient:
            Patient | undefined
        ) => {

          this.patient =
            patient;

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load patient:',
            error
          );


          this.patient =
            undefined;

        }

      });

  }


  // =====================================================
  // LOAD DOCTOR
  // =====================================================

  private loadDoctor(
    doctorId: string
  ): void {

    if (!doctorId) {

      this.doctor =
        undefined;

      return;

    }


    this.doctorService
      .getDoctorById(doctorId)
      .subscribe({

        next: (
          doctor:
            Doctor | undefined
        ) => {

          this.doctor =
            doctor;

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load doctor:',
            error
          );


          this.doctor =
            undefined;

        }

      });

  }


  // =====================================================
  // LOAD LABORATORY REQUESTS
  // =====================================================

  private loadLaboratoryRequests(
    consultationId: string
  ): void {

    if (!consultationId) {

      this.laboratoryRequests = [];

      return;

    }


    this.laboratoryService
      .getRequestsByConsultation(
        consultationId
      )
      .subscribe({

        next: (
          requests:
            LaboratoryRequest[]
        ) => {

          this.laboratoryRequests =
            Array.isArray(requests)
              ? [...requests]
              : [];

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load laboratory requests:',
            error
          );


          this.laboratoryRequests = [];

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

    this.laboratoryRequests = [];

    this.errorMessage =
      message;

    this.isLoading = false;

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
  // PATIENT ID
  // =====================================================

  get patientId(): string {

    return this.consultation?.patientId || '—';

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
  // DOCTOR ID
  // =====================================================

  get doctorId(): string {

    return this.consultation?.doctorId || '—';

  }


  // =====================================================
  // COMPLETED LABORATORY REQUESTS
  // =====================================================

  get completedLaboratoryRequests():
    LaboratoryRequest[] {

    return this.laboratoryRequests.filter(
      request =>
        request.status === 'Completed'
    );

  }


  // =====================================================
  // PENDING LABORATORY REQUESTS
  // =====================================================

  get pendingLaboratoryRequests():
    LaboratoryRequest[] {

    return this.laboratoryRequests.filter(
      request =>
        request.status === 'Pending'
    );

  }


  // =====================================================
  // IN-PROGRESS LABORATORY REQUESTS
  // =====================================================

  get inProgressLaboratoryRequests():
    LaboratoryRequest[] {

    return this.laboratoryRequests.filter(
      request =>
        request.status === 'In Progress'
    );

  }


  // =====================================================
  // CANCELLED LABORATORY REQUESTS
  // =====================================================

  get cancelledLaboratoryRequests():
    LaboratoryRequest[] {

    return this.laboratoryRequests.filter(
      request =>
        request.status === 'Cancelled'
    );

  }


  // =====================================================
  // HAS LABORATORY REQUESTS
  // =====================================================

  get hasLaboratoryRequests(): boolean {

    return this.laboratoryRequests.length > 0;

  }


  // =====================================================
  // HAS COMPLETED RESULTS
  // =====================================================

  get hasCompletedLaboratoryResults(): boolean {

    return this.laboratoryRequests.some(
      request =>
        request.status === 'Completed' &&
        !!request.result
    );

  }


  // =====================================================
  // LABORATORY TOTAL
  // =====================================================

  get laboratoryTotal(): number {

    return this.laboratoryRequests.reduce(
      (
        total: number,
        request: LaboratoryRequest
      ) =>
        total +
        Number(request.price || 0),
      0
    );

  }


  // =====================================================
  // COMPLETED LABORATORY TOTAL
  // =====================================================

  get completedLaboratoryTotal(): number {

    return this.completedLaboratoryRequests.reduce(
      (
        total: number,
        request: LaboratoryRequest
      ) =>
        total +
        Number(request.price || 0),
      0
    );

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
      Number(amount || 0)
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


    if (
      this.consultation.status ===
      'Completed'
    ) {

      return;

    }


    if (
      this.consultation.status ===
      'Cancelled'
    ) {

      alert(
        'A cancelled consultation cannot be completed.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        'Mark this consultation as completed?'
      );


    if (!confirmed) {

      return;

    }


    this.isProcessing = true;


    this.consultationService
      .updateStatus(
        this.consultation.id,
        'Completed'
      )
      .subscribe({

        next: (
          updatedConsultation:
            Consultation
        ) => {

          this.consultation =
            updatedConsultation;


          this.loadLaboratoryRequests(
            updatedConsultation.id
          );


          this.isProcessing = false;


          alert(
            'Consultation completed successfully.'
          );

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to complete consultation:',
            error
          );


          this.isProcessing = false;


          alert(
            'Unable to complete consultation.'
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
      'Cancelled'
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


    const confirmed =
      window.confirm(
        'Cancel this consultation?'
      );


    if (!confirmed) {

      return;

    }


    this.isProcessing = true;


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


          this.isProcessing = false;


          alert(
            'Consultation cancelled successfully.'
          );

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to cancel consultation:',
            error
          );


          this.isProcessing = false;


          alert(
            'Unable to cancel consultation.'
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


    if (!confirmed) {

      return;

    }


    this.isProcessing = true;


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


          this.isProcessing = false;


          alert(
            'Consultation reopened successfully.'
          );

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to reopen consultation:',
            error
          );


          this.isProcessing = false;


          alert(
            'Unable to reopen consultation.'
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


    const consultationId =
      this.consultation.id;


    const confirmed =
      window.confirm(
        `Delete consultation ${consultationId}? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    this.isProcessing = true;


    this.consultationService
      .deleteConsultation(
        consultationId
      )
      .subscribe({

        next: () => {

          this.router.navigate([
            '/consultations'
          ]);

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to delete consultation:',
            error
          );


          this.isProcessing = false;


          alert(
            'Unable to delete consultation.'
          );

        }

      });

  }


  // =====================================================
  // VIEW LABORATORY REQUEST
  // =====================================================

  viewLaboratoryRequest(
    request: LaboratoryRequest
  ): void {

    if (
      !request ||
      !request.id ||
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

    if (this.isProcessing) {

      return;

    }


    this.router.navigate([
      '/consultations'
    ]);

  }

}

