// =====================================================
// APPOINTMENT LIST COMPONENT
// File:
// src/app/features/appointments/appointment-list/appointment-list.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  Subject,
  finalize,
  takeUntil
} from 'rxjs';

import {
  AppointmentService
} from '../../../core/services/appointment.service';

import {
  Appointment,
  AppointmentStatus
} from '../../../shared/models/appointment.model';


@Component({
  selector: 'app-appointment-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './appointment-list.html',

  styleUrl: './appointment-list.css'
})
export class AppointmentList
  implements OnInit, OnDestroy {


  // =====================================================
  // APPOINTMENTS
  // =====================================================

  appointments: Appointment[] = [];

  filteredAppointments: Appointment[] = [];


  // =====================================================
  // FILTERS
  // =====================================================

  searchTerm = '';

  selectedStatus: AppointmentStatus | '' = '';

  selectedDate = '';

  selectedDepartment = '';


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
    private appointmentService: AppointmentService,

    private changeDetectorRef: ChangeDetectorRef,

  private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    // ---------------------------------------------------
    // LISTEN FOR APPOINTMENT CHANGES
    // ---------------------------------------------------

    this.appointmentService
      .appointments$
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe(
        (appointments: Appointment[]) => {

          console.log(
            'Appointment stream updated:',
            appointments
          );


          this.appointments = [
            ...appointments
          ];


          this.applyFilters();


          // ------------------------------------------------
          // FORCE VIEW UPDATE
          // ------------------------------------------------

          this.changeDetectorRef.detectChanges();

        }
      );


    // ---------------------------------------------------
    // LOAD FROM BACKEND
    // ---------------------------------------------------

    this.loadAppointments();

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }


  // =====================================================
  // LOAD APPOINTMENTS
  // =====================================================

  loadAppointments(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.appointmentService
      .getAppointments()
      .pipe(

        finalize(
          () => {

            this.isLoading = false;

            // --------------------------------------------
            // FORCE VIEW UPDATE AFTER LOADING
            // --------------------------------------------

            this.changeDetectorRef.detectChanges();

          }
        )

      )
      .subscribe({

        next: (
          appointments: Appointment[]
        ) => {

          console.log(
            'Appointments loaded from backend:',
            appointments
          );


          if (
            !Array.isArray(
              appointments
            )
          ) {

            this.appointments = [];

            this.filteredAppointments = [];

            this.errorMessage =
              'The server returned an invalid appointments response.';

            return;

          }


          this.appointments = [
            ...appointments
          ];


          this.applyFilters();


          this.changeDetectorRef.detectChanges();

        },


        error: (
          error
        ) => {

          console.error(
            'Failed to load appointments:',
            error
          );


          this.appointments = [];

          this.filteredAppointments = [];


          if (
            error?.status === 0
          ) {

            this.errorMessage =
              'Cannot connect to the HMS backend. Make sure Spring Boot is running on port 8081.';

          } else if (
            error?.status === 404
          ) {

            this.errorMessage =
              'Appointments API endpoint was not found.';

          } else if (
            error?.status >= 500
          ) {

            this.errorMessage =
              'The HMS backend encountered an error while loading appointments.';

          } else {

            this.errorMessage =
              'Unable to load appointments. Please try again.';

          }


          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredAppointments =
      this.appointments.filter(
        (
          appointment: Appointment
        ) => {


          // ---------------------------------------------
          // SEARCH
          // ---------------------------------------------

          const matchesSearch =
            !search ||

            String(
              appointment.id ?? ''
            )
              .toLowerCase()
              .includes(search) ||

            String(
              appointment.patientName ?? ''
            )
              .toLowerCase()
              .includes(search) ||

            String(
              appointment.doctorName ?? ''
            )
              .toLowerCase()
              .includes(search) ||

            String(
              appointment.reason ?? ''
            )
              .toLowerCase()
              .includes(search);


          // ---------------------------------------------
          // STATUS
          // ---------------------------------------------

          const matchesStatus =
            !this.selectedStatus ||
            appointment.status ===
              this.selectedStatus;


          // ---------------------------------------------
          // DEPARTMENT
          // ---------------------------------------------

          const matchesDepartment =
            !this.selectedDepartment ||
            appointment.department ===
              this.selectedDepartment;


          // ---------------------------------------------
          // DATE
          // ---------------------------------------------

          const matchesDate =
            !this.selectedDate ||
            appointment.appointmentDate ===
              this.selectedDate;


          return (
            matchesSearch &&
            matchesStatus &&
            matchesDepartment &&
            matchesDate
          );

        }
      );

  }


  // =====================================================
  // SEARCH
  // =====================================================

  onSearchChange(): void {

    this.applyFilters();

    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // STATUS
  // =====================================================

  onStatusChange(): void {

    this.applyFilters();

    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // DEPARTMENT
  // =====================================================

  onDepartmentChange(): void {

    this.applyFilters();

    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // DATE
  // =====================================================

  onDateChange(): void {

    this.applyFilters();

    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = '';

    this.selectedDepartment = '';

    this.selectedDate = '';


    this.applyFilters();


    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // DELETE
  // =====================================================

  deleteAppointment(
    appointmentOrId:
      Appointment | string
  ): void {

    const id =
      this.getAppointmentId(
        appointmentOrId
      );


    if (!id) {

      return;

    }


    const appointment =
      this.appointments.find(
        (
          item: Appointment
        ) =>
          item.id === id
      );


    const confirmed =
      window.confirm(
        `Are you sure you want to delete appointment ${id}${appointment?.patientName ? ` for ${appointment.patientName}` : ''}?`
      );


    if (!confirmed) {

      return;

    }


    this.appointmentService
      .deleteAppointment(id)
      .subscribe({

        next: () => {

          // Service updates the stream.

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error
        ) => {

          console.error(
            'Failed to delete appointment:',
            error
          );


          alert(
            'Unable to delete this appointment.'
          );

        }

      });

  }


  // =====================================================
  // CONFIRM
  // =====================================================

  confirmAppointment(
    appointmentOrId:
      Appointment | string
  ): void {

    const id =
      this.getAppointmentId(
        appointmentOrId
      );


    if (!id) {

      return;

    }


    this.appointmentService
      .confirmAppointment(id)
      .subscribe({

        next: () => {

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error
        ) => {

          console.error(
            'Failed to confirm appointment:',
            error
          );


          alert(
            'Unable to confirm appointment.'
          );

        }

      });

  }


  // =====================================================
  // CHECK IN
  // =====================================================

  checkInAppointment(
    appointmentOrId:
      Appointment | string
  ): void {

    const id =
      this.getAppointmentId(
        appointmentOrId
      );


    if (!id) {

      return;

    }


    this.appointmentService
      .checkInAppointment(id)
      .subscribe({

        next: () => {

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error
        ) => {

          console.error(
            'Failed to check in appointment:',
            error
          );


          alert(
            'Unable to check in appointment.'
          );

        }

      });

  }



// =====================================================
// START CONSULTATION
// =====================================================

startConsultation(
  appointmentOrId: Appointment | string
): void {

  const id =
    this.getAppointmentId(
      appointmentOrId
    );

  if (!id) {

    alert(
      'Unable to start consultation. Appointment ID is missing.'
    );

    return;

  }

  // ---------------------------------------------------
  // UPDATE APPOINTMENT STATUS FIRST
  // ---------------------------------------------------

  this.appointmentService
    .startConsultation(id)
    .subscribe({

      next: (
        updatedAppointment: Appointment
      ) => {

        console.log(
          'Consultation started:',
          updatedAppointment
        );

        // -------------------------------------------------
        // REFRESH APPOINTMENT VIEW
        // -------------------------------------------------

        this.changeDetectorRef.detectChanges();

        // -------------------------------------------------
        // NAVIGATE TO CONSULTATION FORM
        // -------------------------------------------------

        this.router.navigate(
          ['/consultations/register'],
          {
            queryParams: {
              appointmentId: id
            }
          }
        );

      },

      error: (
        error: unknown
      ) => {

        console.error(
          'Failed to start consultation:',
          error
        );

        alert(
          'Unable to start consultation. Please try again.'
        );

      }

    });

}



  // =====================================================
  // COMPLETE
  // =====================================================

  completeAppointment(
    appointmentOrId:
      Appointment | string
  ): void {

    const id =
      this.getAppointmentId(
        appointmentOrId
      );


    if (!id) {

      return;

    }


    this.appointmentService
      .completeAppointment(id)
      .subscribe({

        next: () => {

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error
        ) => {

          console.error(
            'Failed to complete appointment:',
            error
          );


          alert(
            'Unable to complete appointment.'
          );

        }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancelAppointment(
    appointmentOrId:
      Appointment | string
  ): void {

    const id =
      this.getAppointmentId(
        appointmentOrId
      );


    if (!id) {

      return;

    }


    const appointment =
      this.appointments.find(
        (
          item: Appointment
        ) =>
          item.id === id
      );


    const confirmed =
      window.confirm(
        `Cancel appointment ${id}${appointment?.patientName ? ` for ${appointment.patientName}` : ''}?`
      );


    if (!confirmed) {

      return;

    }


    this.appointmentService
      .cancelAppointment(id)
      .subscribe({

        next: () => {

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error
        ) => {

          console.error(
            'Failed to cancel appointment:',
            error
          );


          alert(
            'Unable to cancel appointment.'
          );

        }

      });

  }


  // =====================================================
  // NO SHOW
  // =====================================================

  markNoShow(
    appointmentOrId:
      Appointment | string
  ): void {

    const id =
      this.getAppointmentId(
        appointmentOrId
      );


    if (!id) {

      return;

    }


    this.appointmentService
      .markNoShow(id)
      .subscribe({

        next: () => {

          this.changeDetectorRef.detectChanges();

        },

        error: (
          error
        ) => {

          console.error(
            'Failed to mark appointment as no-show:',
            error
          );


          alert(
            'Unable to mark appointment as no-show.'
          );

        }

      });

  }


  // =====================================================
  // GET APPOINTMENT ID
  // =====================================================

  private getAppointmentId(
    appointmentOrId:
      Appointment | string
  ): string {

    if (
      typeof appointmentOrId ===
      'string'
    ) {

      return appointmentOrId;

    }


    return appointmentOrId?.id || '';

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: AppointmentStatus
  ): string {

    switch (status) {

      case 'Scheduled':
        return 'status-scheduled';

      case 'Confirmed':
        return 'status-confirmed';

      case 'Checked-In':
        return 'status-checked-in';

      case 'In Consultation':
        return 'status-in-consultation';

      case 'Completed':
        return 'status-completed';

      case 'Cancelled':
        return 'status-cancelled';

      case 'No Show':
        return 'status-no-show';

      default:
        return '';

    }

  }


  // =====================================================
  // STATUS LABEL
  // =====================================================

  getStatusLabel(
    status: AppointmentStatus
  ): string {

    return status;

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
      amount || 0
    );

  }


  // =====================================================
  // TOTAL
  // =====================================================

  get totalAppointments(): number {

    return this.appointments.length;

  }


  // =====================================================
  // SCHEDULED
  // =====================================================

  get scheduledCount(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status ===
        'Scheduled'
    ).length;

  }


  get scheduledAppointments(): number {

    return this.scheduledCount;

  }


  // =====================================================
  // CONFIRMED
  // =====================================================

  get confirmedCount(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status ===
        'Confirmed'
    ).length;

  }


  get confirmedAppointments(): number {

    return this.confirmedCount;

  }


  // =====================================================
  // CHECKED IN
  // =====================================================

  get checkedInCount(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status ===
        'Checked-In'
    ).length;

  }


  get checkedInAppointments(): number {

    return this.checkedInCount;

  }


  // =====================================================
  // IN CONSULTATION
  // =====================================================

  get inConsultationCount(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status ===
        'In Consultation'
    ).length;

  }


  get inConsultationAppointments(): number {

    return this.inConsultationCount;

  }


  // =====================================================
  // COMPLETED
  // =====================================================

  get completedCount(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status ===
        'Completed'
    ).length;

  }


  get completedAppointments(): number {

    return this.completedCount;

  }


  // =====================================================
  // CANCELLED
  // =====================================================

  get cancelledCount(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status ===
        'Cancelled'
    ).length;

  }


  get cancelledAppointments(): number {

    return this.cancelledCount;

  }


  // =====================================================
  // NO SHOW
  // =====================================================

  get noShowCount(): number {

    return this.appointments.filter(
      appointment =>
        appointment.status ===
        'No Show'
    ).length;

  }


  get noShowAppointments(): number {

    return this.noShowCount;

  }


  // =====================================================
  // DEPARTMENTS
  // =====================================================

  get departments(): string[] {

    return Array.from(
      new Set(
        this.appointments
          .map(
            appointment =>
              appointment.department
          )
          .filter(
            (
              department
            ): department is string =>
              !!department
          )
      )
    ).sort();

  }


  // =====================================================
  // TODAY'S APPOINTMENTS
  // =====================================================

  get todayAppointments(): Appointment[] {

    const today =
      new Date()
        .toISOString()
        .split('T')[0];


    return this.appointments.filter(
      appointment =>
        appointment.appointmentDate ===
        today
    );

  }


  // =====================================================
  // TODAY COUNT
  // =====================================================

  get todayCount(): number {

    return this.todayAppointments.length;

  }


  // =====================================================
  // TRACK BY
  // =====================================================

  trackByAppointmentId(
    index: number,
    appointment: Appointment
  ): string {

    return appointment.id;

  }

}
