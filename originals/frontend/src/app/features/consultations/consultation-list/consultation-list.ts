// =====================================================
// CONSULTATION LIST COMPONENT
// File:
// src/app/features/consultations/consultation-list/consultation-list.ts
// =====================================================

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

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load patients:',
            error
          );

          this.patients = [];

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

    this.isLoading = true;

    this.errorMessage = '';


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
            'Unable to load consultations. Please try again.';

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
        (currentPatient: Patient) =>
          currentPatient.id === patientId
      );


    if (!patient) {

      return patientId || 'Unknown Patient';

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
        (item: Doctor) =>
          item.id === doctorId
      );


    if (!doctor) {

      return 'Unknown Doctor';

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
            consultation.chiefComplaint || ''
          )
            .toLowerCase()
            .includes(term) ||

          (
            consultation.diagnosis || ''
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


    if (!consultation) {

      alert(
        'Consultation could not be found.'
      );

      return;

    }


    if (
      consultation.status !== 'Open'
    ) {

      alert(
        'Only Open consultations can be completed.'
      );

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
      .completeConsultation(id)
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({

        next: (
          success: boolean
        ) => {

          if (!success) {

            alert(
              'Unable to complete consultation.'
            );

            return;

          }

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to complete consultation:',
            error
          );

          alert(
            'Unable to complete consultation.'
          );

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
      consultation.status !== 'Open'
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


    this.consultationService
      .cancelConsultation(id)
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({

        next: () => {

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to cancel consultation:',
            error
          );

          alert(
            'Unable to cancel consultation.'
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


    const confirmed =
      window.confirm(
        `Delete consultation ${consultation.id}? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    this.consultationService
      .deleteConsultation(id)
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({

        next: () => {

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to delete consultation:',
            error
          );

          alert(
            'Unable to delete consultation.'
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

}
