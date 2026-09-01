
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  Subject,
  takeUntil
} from 'rxjs';

import {
  ConsultationService
} from '../../../core/services/consultation.service';

import {
  Consultation
} from '../../../shared/models/consultation.model';

import {
  PatientService
} from '../../../core/services/patient.service';

import {
  DoctorService
} from '../../../core/services/doctor.service';

import {
  Patient
} from '../../../shared/models/patient.model';

import {
  Doctor
} from '../../../shared/models/doctor.model';


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
export class ConsultationList
  implements OnInit, OnDestroy {


  // =====================================================
  // CONSULTATIONS
  // =====================================================

  consultations: Consultation[] = [];


  // =====================================================
  // PATIENTS
  // =====================================================

  patients: Patient[] = [];


  // =====================================================
  // DOCTORS
  // =====================================================

  doctors: Doctor[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // STATUS FILTER
  // =====================================================

  selectedStatus:
    Consultation['status'] | '' = '';


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // DESTROY SUBJECT
  // =====================================================

  private readonly destroy$ =
    new Subject<void>();


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly consultationService:
      ConsultationService,

    private readonly patientService:
      PatientService,

    private readonly doctorService:
      DoctorService,

    private readonly changeDetectorRef:
      ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    // ---------------------------------------------------
    // LISTEN FOR CONSULTATION STREAM CHANGES
    // ---------------------------------------------------

    this.consultationService
      .consultations$
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({

        next: (
          consultations: Consultation[]
        ) => {

          console.log(
            'Consultation stream updated:',
            consultations
          );

          this.consultations = [
            ...consultations
          ];

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Consultation stream error:',
            error
          );

        }

      });


    // ---------------------------------------------------
    // LOAD PATIENTS
    // ---------------------------------------------------

    this.loadPatients();


    // ---------------------------------------------------
    // LOAD DOCTORS
    // ---------------------------------------------------

    this.loadDoctors();


    // ---------------------------------------------------
    // LOAD CONSULTATIONS
    // ---------------------------------------------------

    this.loadConsultations();

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }


  // =====================================================
  // LOAD PATIENTS
  // =====================================================

  private loadPatients(): void {

    this.patientService
      .getPatients()
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({

        next: (
          patients: Patient[]
        ) => {

          this.patients = [
            ...patients
          ];

          console.log(
            'Consultation patients loaded:',
            this.patients
          );

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load patients:',
            error
          );

          this.patients = [];

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD DOCTORS
  // =====================================================

  private loadDoctors(): void {

    this.doctorService
      .getDoctors()
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({

        next: (
          doctors: Doctor[]
        ) => {

          this.doctors = [
            ...doctors
          ];

          console.log(
            'Consultation doctors loaded:',
            this.doctors
          );

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load doctors:',
            error
          );

          this.doctors = [];

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD CONSULTATIONS
  // =====================================================

  loadConsultations(): void {

    if (this.isLoading) {

      return;

    }

    this.isLoading = true;

    this.errorMessage = '';

    this.changeDetectorRef.detectChanges();


    this.consultationService
      .getConsultations()
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({

        next: (
          consultations: Consultation[]
        ) => {

          this.consultations = [
            ...consultations
          ];

          console.log(
            'Consultations loaded:',
            this.consultations
          );

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load consultations:',
            error
          );

          this.consultations = [];

          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load consultations. Please try again.'
            );

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // GET PATIENT NAME
  // =====================================================

  getPatientName(
    patientId: string
  ): string {

    const patient =
      this.patients.find(
        (
          currentPatient: Patient
        ) =>
          String(currentPatient.id) ===
          String(patientId)
      );


    if (!patient) {

      return (
        patientId ||
        'Unknown Patient'
      );

    }


    return (
      `${patient.firstName} ` +
      `${patient.lastName}`
    );

  }


  // =====================================================
  // GET DOCTOR NAME
  // =====================================================

  getDoctorName(
    doctorId: string
  ): string {

    const doctor =
      this.doctors.find(
        (
          item: Doctor
        ) =>
          String(item.id) ===
          String(doctorId)
      );


    if (!doctor) {

      return (
        doctorId ||
        'Unknown Doctor'
      );

    }


    return (
      `Dr. ${doctor.firstName} ` +
      `${doctor.lastName}`
    );

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
      (
        consultation: Consultation
      ) => {

        const patientName =
          this.getPatientName(
            consultation.patientId
          )
            .toLowerCase();


        const doctorName =
          this.getDoctorName(
            consultation.doctorId
          )
            .toLowerCase();


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

          (
            consultation.chiefComplaint ||
            ''
          )
            .toLowerCase()
            .includes(term) ||

          (
            consultation.diagnosis ||
            ''
          )
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


  // =====================================================
  // OPEN CONSULTATIONS
  // =====================================================

  get openConsultations(): number {

    return this.consultations.filter(
      (
        consultation: Consultation
      ) =>
        consultation.status ===
        'Open'
    ).length;

  }


  // =====================================================
  // PENDING RESULTS
  // =====================================================

  get pendingResultsConsultations(): number {

    return this.consultations.filter(
      (
        consultation: Consultation
      ) =>
        consultation.status ===
        'Pending Results'
    ).length;

  }


  // =====================================================
  // READY FOR REVIEW
  // =====================================================

  get readyForReviewConsultations(): number {

    return this.consultations.filter(
      (
        consultation: Consultation
      ) =>
        consultation.status ===
        'Ready For Review'
    ).length;

  }


  // =====================================================
  // COMPLETED CONSULTATIONS
  // =====================================================

  get completedConsultations(): number {

    return this.consultations.filter(
      (
        consultation: Consultation
      ) =>
        consultation.status ===
        'Completed'
    ).length;

  }


  // =====================================================
  // CANCELLED CONSULTATIONS
  // =====================================================

  get cancelledConsultations(): number {

    return this.consultations.filter(
      (
        consultation: Consultation
      ) =>
        consultation.status ===
        'Cancelled'
    ).length;

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = '';

    this.changeDetectorRef.detectChanges();

  }


  
// =====================================================
// COMPLETE CONSULTATION
// =====================================================

completeConsultation(
  id: string
): void {

  const consultation =
    this.consultationService
      .getConsultationByIdSnapshot(
        id
      );


  // ---------------------------------------------------
  // CONSULTATION NOT FOUND
  // ---------------------------------------------------

  if (!consultation) {

    alert(
      'Consultation could not be found.'
    );

    return;

  }


  // ---------------------------------------------------
  // ONLY OPEN CAN BE COMPLETED
  // ---------------------------------------------------

  if (
    consultation.status !==
    'Open'
  ) {

    alert(
      'Only Open consultations can be completed.'
    );

    return;

  }


  // ---------------------------------------------------
  // FINAL DIAGNOSIS
  // ---------------------------------------------------

  if (
    !consultation.diagnosis ||
    !consultation.diagnosis.trim()
  ) {

    alert(
      'Final diagnosis is required before completing the consultation.'
    );

    return;

  }


  // ---------------------------------------------------
  // FINAL TREATMENT PLAN
  // ---------------------------------------------------

  if (
    !consultation.treatmentPlan ||
    !consultation.treatmentPlan.trim()
  ) {

    alert(
      'Treatment plan is required before completing the consultation.'
    );

    return;

  }


  // ---------------------------------------------------
  // LABORATORY WORKFLOW
  // ---------------------------------------------------
  //
  // If laboratory tests were requested, the doctor must
  // wait for all results and review them before completion.
  //
  // ---------------------------------------------------

  if (
    consultation.hasLaboratoryRequests
  ) {

    if (
      !consultation.hasLaboratoryResults
    ) {

      alert(
        'Laboratory results must be available before completing the consultation.'
      );

      return;

    }


    if (
      !consultation.laboratoryResultsReviewed
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
      `Complete consultation ${consultation.id}?`
    );


  if (!confirmed) {

    return;

  }


  this.isLoading =
    true;

  this.changeDetectorRef.detectChanges();


  // ---------------------------------------------------
  // COMPLETE
  // ---------------------------------------------------

  this.consultationService
    .completeConsultation(
      id
    )
    .pipe(
      takeUntil(
        this.destroy$
      )
    )
    .subscribe({

      // ===============================================
      // SUCCESS
      // ===============================================

      next: (
        updatedConsultation:
          Consultation
      ) => {

        console.log(
          'Consultation completed successfully:',
          updatedConsultation
        );


        this.isLoading =
          false;

        this.changeDetectorRef.detectChanges();


        alert(
          `Consultation ${updatedConsultation.id} completed successfully.`
        );


        this.loadConsultations();

      },


      // ===============================================
      // ERROR
      // ===============================================

      error: (
        error: unknown
      ) => {

        console.error(
          'Failed to complete consultation:',
          error
        );


        this.isLoading =
          false;

        this.changeDetectorRef.detectChanges();


        alert(
          this.getErrorMessage(
            error,
            'Unable to complete consultation.'
          )
        );


        this.loadConsultations();

      }

    });

}



  // =====================================================
  // CANCEL CONSULTATION
  // =====================================================

  cancelConsultation(
    id: string
  ): void {

    const consultation =
      this.consultationService
        .getConsultationByIdSnapshot(
          id
        );


    if (!consultation) {

      alert(
        'Consultation could not be found.'
      );

      return;

    }


    if (
      consultation.status !==
      'Open'
    ) {

      alert(
        'Only Open consultations can be cancelled.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Cancel consultation ${consultation.id}?`
      );


    if (!confirmed) {

      return;

    }


    this.isLoading = true;

    this.changeDetectorRef.detectChanges();


    this.consultationService
      .cancelConsultation(
        id
      )
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({

        next: (
          updatedConsultation:
            Consultation
        ) => {

          console.log(
            'Consultation cancelled:',
            updatedConsultation
          );

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();

          this.loadConsultations();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to cancel consultation:',
            error
          );

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();

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
  // DELETE CONSULTATION
  // =====================================================

  deleteConsultation(
    id: string
  ): void {

    const consultation =
      this.consultationService
        .getConsultationByIdSnapshot(
          id
        );


    if (!consultation) {

      alert(
        'Consultation could not be found.'
      );

      return;

    }


    if (
      consultation.status ===
      'Completed'
    ) {

      alert(
        'Completed consultations cannot be deleted.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Delete consultation ${consultation.id}? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    this.isLoading = true;

    this.changeDetectorRef.detectChanges();


    this.consultationService
      .deleteConsultation(
        id
      )
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({

        next: () => {

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();

          alert(
            'Consultation deleted successfully.'
          );

          this.loadConsultations();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to delete consultation:',
            error
          );

          this.isLoading = false;

          this.changeDetectorRef.detectChanges();


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
  // REFRESH
  // =====================================================

  refreshConsultations(): void {

    this.loadConsultations();

  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error: unknown,
    fallback: string
  ): string {

    if (
      typeof error !== 'object' ||
      error === null
    ) {

      return fallback;

    }


    const response =
      error as {
        error?: unknown;
        message?: string;
      };


    // ---------------------------------------------------
    // DIRECT MESSAGE
    // ---------------------------------------------------

    if (
      typeof response.message === 'string' &&
      response.message.trim()
    ) {

      return response.message.trim();

    }


    // ---------------------------------------------------
    // STRING ERROR BODY
    // ---------------------------------------------------

    if (
      typeof response.error === 'string' &&
      response.error.trim()
    ) {

      return response.error.trim();

    }


    // ---------------------------------------------------
    // OBJECT ERROR BODY
    // ---------------------------------------------------

    if (
      typeof response.error === 'object' &&
      response.error !== null
    ) {

      const body =
        response.error as {
          message?: string;
          error?: string;
        };


      if (
        typeof body.message === 'string' &&
        body.message.trim()
      ) {

        return body.message.trim();

      }


      if (
        typeof body.error === 'string' &&
        body.error.trim()
      ) {

        return body.error.trim();

      }

    }


    return fallback;

  }

}

