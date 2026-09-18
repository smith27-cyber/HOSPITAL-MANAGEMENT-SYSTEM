// =====================================================
// DASHBOARD COMPONENT
// File:
// src/app/features/dashboard/dashboard.ts
// =====================================================

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  catchError,
  forkJoin,
  of,
  Subscription
} from 'rxjs';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

import {
  Patient
} from '../../shared/models/patient.model';

import {
  Doctor
} from '../../shared/models/doctor.model';

import {
  Department
} from '../../shared/models/department.model';

import {
  Appointment
} from '../../shared/models/appointment.model';

import {
  Bill
} from '../../shared/models/billing.model';

import {
  PharmacyPrescription
} from '../../shared/models/pharmacy.model';

import {
  InventoryItem
} from '../../shared/models/inventory.model';

import {
  PatientService
} from '../../core/services/patient.service';

import {
  DoctorService
} from '../../core/services/doctor.service';

import {
  DepartmentService
} from '../../core/services/department.service';

import {
  AppointmentService
} from '../../core/services/appointment.service';

import {
  BillingService
} from '../../core/services/billing.service';

import {
  PharmacyService
} from '../../core/services/pharmacy.service';

import {
  InventoryService
} from '../../core/services/inventory.service';

import {
  SettingsService
} from '../../core/services/settings.service';

import {
  HospitalSettings
} from '../../shared/models/settings.model';
// =====================================================
// CHART.JS
// =====================================================

Chart.register(...registerables);


// =====================================================
// MODULE LOAD RESULT
// =====================================================

interface ModuleResult<T> {
  data: T;
  available: boolean;
}


// =====================================================
// DASHBOARD COMPONENT
// =====================================================

@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css'
})
export class Dashboard
  implements
    OnInit,
    AfterViewInit,
    OnDestroy {


  // =====================================================
  // CHART REFERENCES
  // =====================================================

  @ViewChild('appointmentsChart')
  appointmentsChartRef?:
    ElementRef<HTMLCanvasElement>;

  @ViewChild('hospitalChart')
  hospitalChartRef?:
    ElementRef<HTMLCanvasElement>;

  @ViewChild('statusChart')
  statusChartRef?:
    ElementRef<HTMLCanvasElement>;


  // =====================================================
  // CHART INSTANCES
  // =====================================================

  private appointmentsChart?:
    Chart;

  private hospitalChart?:
    Chart;

  private statusChart?:
    Chart;


  // =====================================================
  // VIEW STATE
  // =====================================================

  private viewReady =
    false;

  // =====================================================
  // TENANT IDENTITY
  // =====================================================

  hospitalName =
    'Hospital Management System';

  hospitalCity = '';

  hospitalLogo = '';

  private hospitalSettingsSubscription?:
    Subscription;
  // =====================================================
  // LOADING
  // =====================================================

  isLoading =
    false;


  // =====================================================
  // DATA
  // =====================================================

  patients:
    Patient[] = [];

  doctors:
    Doctor[] = [];

  departments:
    Department[] = [];

  appointments:
    Appointment[] = [];

  bills:
    Bill[] = [];

  pharmacyPrescriptions:
    PharmacyPrescription[] = [];

  inventoryItems:
    InventoryItem[] = [];


  // =====================================================
  // MODULE AVAILABILITY
  //
  // IMPORTANT:
  // This is based on whether the tenant's API can be
  // accessed successfully.
  //
  // A 403 from ModuleAccessFilter means the module
  // is not available to this tenant.
  // =====================================================

  moduleAvailability = {

    patients: false,

    doctors: false,

    departments: false,

    appointments: false,

    billing: false,

    pharmacy: false,

    inventory: false

  };


  // =====================================================
  // CORE STATISTICS
  // =====================================================

  totalPatients =
    0;

  activeDoctors =
    0;

  totalDepartments =
    0;

  totalAppointments =
    0;

  todaysAppointments =
    0;


  // =====================================================
  // FINANCIAL STATISTICS
  // =====================================================

  totalRevenue =
    0;

  totalAmountPaid =
    0;

  totalOutstandingBalance =
    0;

  pendingBills =
    0;

  partiallyPaidBills =
    0;

  paidBills =
    0;


  // =====================================================
  // PHARMACY STATISTICS
  // =====================================================

  totalPharmacyPrescriptions =
    0;

  waitingPrescriptions =
    0;

  preparingPrescriptions =
    0;

  awaitingPaymentPrescriptions =
    0;

  readyForPickupPrescriptions =
    0;

  dispensedPrescriptions =
    0;


  // =====================================================
  // INVENTORY STATISTICS
  // =====================================================

  totalInventoryItems =
    0;

  lowStockItems =
    0;

  outOfStockItems =
    0;

  expiredItems =
    0;


  // =====================================================
  // APPOINTMENT STATISTICS
  // =====================================================

  scheduledAppointments =
    0;

  confirmedAppointments =
    0;

  checkedInAppointments =
    0;

  inConsultationAppointments =
    0;

  completedAppointments =
    0;

  cancelledAppointments =
    0;

  noShowAppointments =
    0;


  // =====================================================
  // TODAY'S STATUS
  // =====================================================

  todayScheduled =
    0;

  todayConfirmed =
    0;

  todayCheckedIn =
    0;

  todayInConsultation =
    0;

  todayCompleted =
    0;

  todayCancelled =
    0;

  todayNoShow =
    0;


  // =====================================================
  // TODAY'S APPOINTMENTS
  // =====================================================

  todayAppointments:
    Appointment[] = [];


  // =====================================================
  // CURRENT DATE
  // =====================================================

  currentDate =
    new Date();


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private patientService:
      PatientService,

    private doctorService:
      DoctorService,

    private departmentService:
      DepartmentService,

    private appointmentService:
      AppointmentService,

    private billingService:
      BillingService,

    private pharmacyService:
      PharmacyService,

    private inventoryService:
      InventoryService,

   private router:
  Router,

private cdr:
  ChangeDetectorRef,

private settingsService:
  SettingsService



  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

 ngOnInit(): void {

  this.loadHospitalIdentity();

  this.loadDashboardData();

}


  // =====================================================
  // AFTER VIEW INIT
  // =====================================================

  ngAfterViewInit(): void {

    this.viewReady =
      true;

    this.renderCharts();

  }


  // =====================================================
  // DESTROY
  // =====================================================

 ngOnDestroy(): void {

  this.destroyCharts();

  this.hospitalSettingsSubscription
    ?.unsubscribe();

}
  // =====================================================
  // LOAD CURRENT TENANT IDENTITY
  // =====================================================

  private loadHospitalIdentity(): void {

    this.hospitalSettingsSubscription =
      this.settingsService
        .hospitalSettings$
        .subscribe({

          next: (
            settings: HospitalSettings
          ) => {

            this.hospitalName =
              settings.hospitalName?.trim()
              || 'Hospital Management System';

            this.hospitalCity =
              settings.city?.trim()
              || '';

            this.hospitalLogo =
              settings.logoUrl?.trim()
              || '';

            this.cdr.detectChanges();

          }

        });

  }
  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  private loadDashboardData(): void {

    this.isLoading =
      true;


    // ---------------------------------------------------
    // Reset module availability
    // ---------------------------------------------------

    this.moduleAvailability = {

      patients: false,

      doctors: false,

      departments: false,

      appointments: false,

      billing: false,

      pharmacy: false,

      inventory: false

    };


    /*
     * IMPORTANT
     *
     * Every module request handles its own error.
     *
     * Therefore:
     *
     * Patients OFF
     *      ↓
     * 403
     *      ↓
     * patients = []
     *
     * But Billing / Pharmacy / Inventory can still load.
     *
     * This prevents one disabled module from destroying
     * the entire dashboard.
     */

    forkJoin({

      patients:
        this.patientService
          .getPatients()
          .pipe(
            catchError(
              () =>
                of(null)
            )
          ),

      doctors:
        this.doctorService
          .getDoctors()
          .pipe(
            catchError(
              () =>
                of(null)
            )
          ),

      departments:
        this.departmentService
          .getDepartments()
          .pipe(
            catchError(
              () =>
                of(null)
            )
          ),

      appointments:
        this.appointmentService
          .getAppointments()
          .pipe(
            catchError(
              () =>
                of(null)
            )
          ),

      billing:
        this.billingService
          .getBills()
          .pipe(
            catchError(
              () =>
                of(null)
            )
          ),

      pharmacy:
        this.pharmacyService
          .getPrescriptions()
          .pipe(
            catchError(
              () =>
                of(null)
            )
          ),

      inventory:
        this.inventoryService
          .getItems()
          .pipe(
            catchError(
              () =>
                of(null)
            )
          )

    }).subscribe({

      // =================================================
      // SUCCESS
      // =================================================

      next: (
        data
      ) => {


        // ===============================================
        // PATIENTS
        // ===============================================

        if (
          Array.isArray(
            data.patients
          )
        ) {

          this.moduleAvailability
            .patients =
              true;

          this.patients =
            data.patients;

          this.totalPatients =
            this.patients.length;

        } else {

          this.patients =
            [];

          this.totalPatients =
            0;

        }


        // ===============================================
        // DOCTORS
        // ===============================================

        if (
          Array.isArray(
            data.doctors
          )
        ) {

          this.moduleAvailability
            .doctors =
              true;

          this.doctors =
            data.doctors;

          this.activeDoctors =
            this.doctors.filter(
              (
                doctor: Doctor
              ) =>
                doctor.status ===
                'Active'
            ).length;

        } else {

          this.doctors =
            [];

          this.activeDoctors =
            0;

        }


        // ===============================================
        // DEPARTMENTS
        // ===============================================

        if (
          Array.isArray(
            data.departments
          )
        ) {

          this.moduleAvailability
            .departments =
              true;

          this.departments =
            data.departments;

          this.totalDepartments =
            this.departments.length;

        } else {

          this.departments =
            [];

          this.totalDepartments =
            0;

        }


        // ===============================================
        // APPOINTMENTS
        // ===============================================

        if (
          Array.isArray(
            data.appointments
          )
        ) {

          this.moduleAvailability
            .appointments =
              true;

          this.appointments =
            data.appointments;

          this.totalAppointments =
            this.appointments.length;

          this.calculateAppointmentStatistics();

          this.todayAppointments =
            this.appointments
              .filter(
                (
                  appointment:
                    Appointment
                ) =>
                  this.isToday(
                    appointment.appointmentDate
                  )
              )
              .sort(
                (
                  a:
                    Appointment,

                  b:
                    Appointment
                ) =>
                  (
                    a.appointmentTime ||
                    ''
                  ).localeCompare(
                    b.appointmentTime ||
                    ''
                  )
              );

          this.todaysAppointments =
            this.todayAppointments.length;

          this.calculateTodayStatistics();

        } else {

          this.appointments =
            [];

          this.resetAppointmentStatistics();

        }


        // ===============================================
        // BILLING
        // ===============================================

        if (
          Array.isArray(
            data.billing
          )
        ) {

          this.moduleAvailability
            .billing =
              true;

          this.bills =
            data.billing;

          this.calculateBillingStatistics();

        } else {

          this.bills =
            [];

          this.resetBillingStatistics();

        }


        // ===============================================
        // PHARMACY
        // ===============================================

        if (
          Array.isArray(
            data.pharmacy
          )
        ) {

          this.moduleAvailability
            .pharmacy =
              true;

          this.pharmacyPrescriptions =
            data.pharmacy;

          this.calculatePharmacyStatistics();

        } else {

          this.pharmacyPrescriptions =
            [];

          this.resetPharmacyStatistics();

        }


        // ===============================================
        // INVENTORY
        // ===============================================

        if (
          Array.isArray(
            data.inventory
          )
        ) {

          this.moduleAvailability
            .inventory =
              true;

          this.inventoryItems =
            data.inventory;

          this.calculateInventoryStatistics();

        } else {

          this.inventoryItems =
            [];

          this.resetInventoryStatistics();

        }


        // ===============================================
        // FINISH LOADING
        // ===============================================

        this.isLoading =
          false;


        this.cdr.detectChanges();


        // ===============================================
        // RENDER CHARTS
        // ===============================================

        setTimeout(
          () => {

            this.renderCharts();

          },
          0
        );

      },


      // =================================================
      // ERROR
      //
      // forkJoin itself should rarely fail because every
      // request has catchError().
      // =================================================

      error: (
        error: unknown
      ) => {

        console.error(
          'Dashboard loading error:',
          error
        );

        this.resetDashboard();

        this.isLoading =
          false;

        this.cdr.detectChanges();

      }

    });

  }


  // =====================================================
  // BILLING STATISTICS
  // =====================================================

  private calculateBillingStatistics(): void {

    this.totalRevenue =
      this.bills.reduce(
        (
          total: number,
          bill: Bill
        ) =>
          total +
          this.toNumber(
            bill.amount
          ),
        0
      );


    this.totalAmountPaid =
      this.bills.reduce(
        (
          total: number,
          bill: Bill
        ) =>
          total +
          this.toNumber(
            bill.amountPaid
          ),
        0
      );


    this.totalOutstandingBalance =
      this.bills.reduce(
        (
          total: number,
          bill: Bill
        ) =>
          total +
          this.toNumber(
            bill.balance
          ),
        0
      );


    this.pendingBills =
      this.bills.filter(
        (
          bill: Bill
        ) =>
          bill.status ===
          'Pending'
      ).length;


    this.partiallyPaidBills =
      this.bills.filter(
        (
          bill: Bill
        ) =>
          bill.status ===
          'Partially Paid'
      ).length;


    this.paidBills =
      this.bills.filter(
        (
          bill: Bill
        ) =>
          bill.status ===
          'Paid'
      ).length;

  }


  // =====================================================
  // PHARMACY STATISTICS
  // =====================================================

  private calculatePharmacyStatistics(): void {

    this.totalPharmacyPrescriptions =
      this.pharmacyPrescriptions.length;


    this.waitingPrescriptions =
      this.countPharmacyStatus(
        'Waiting'
      );


    this.preparingPrescriptions =
      this.countPharmacyStatus(
        'Preparing'
      );


    this.awaitingPaymentPrescriptions =
      this.countPharmacyStatus(
        'Awaiting Payment'
      );


    this.readyForPickupPrescriptions =
      this.countPharmacyStatus(
        'Ready for Pickup'
      );


    this.dispensedPrescriptions =
      this.countPharmacyStatus(
        'Dispensed'
      );

  }


  private countPharmacyStatus(
    status:
      PharmacyPrescription['status']
  ): number {

    return this.pharmacyPrescriptions
      .filter(
        (
          prescription:
            PharmacyPrescription
        ) =>
          prescription.status ===
          status
      ).length;

  }


  // =====================================================
  // INVENTORY STATISTICS
  // =====================================================

  private calculateInventoryStatistics(): void {

    this.totalInventoryItems =
      this.inventoryItems.length;


    this.lowStockItems =
      this.inventoryItems.filter(
        (
          item:
            InventoryItem
        ) =>
          item.status ===
          'Low Stock'
      ).length;


    this.outOfStockItems =
      this.inventoryItems.filter(
        (
          item:
            InventoryItem
        ) =>
          item.status ===
          'Out of Stock'
      ).length;


    this.expiredItems =
      this.inventoryItems.filter(
        (
          item:
            InventoryItem
        ) =>
          item.status ===
          'Expired'
      ).length;

  }


  // =====================================================
  // APPOINTMENT STATISTICS
  // =====================================================

  private calculateAppointmentStatistics(): void {

    this.scheduledAppointments =
      this.countAppointmentsByStatus(
        'Scheduled'
      );

    this.confirmedAppointments =
      this.countAppointmentsByStatus(
        'Confirmed'
      );

    this.checkedInAppointments =
      this.countAppointmentsByStatus(
        'Checked-In'
      );

    this.inConsultationAppointments =
      this.countAppointmentsByStatus(
        'In Consultation'
      );

    this.completedAppointments =
      this.countAppointmentsByStatus(
        'Completed'
      );

    this.cancelledAppointments =
      this.countAppointmentsByStatus(
        'Cancelled'
      );

    this.noShowAppointments =
      this.countAppointmentsByStatus(
        'No Show'
      );

  }


  // =====================================================
  // TODAY STATISTICS
  // =====================================================

  private calculateTodayStatistics(): void {

    this.todayScheduled =
      this.countTodayByStatus(
        'Scheduled'
      );

    this.todayConfirmed =
      this.countTodayByStatus(
        'Confirmed'
      );

    this.todayCheckedIn =
      this.countTodayByStatus(
        'Checked-In'
      );

    this.todayInConsultation =
      this.countTodayByStatus(
        'In Consultation'
      );

    this.todayCompleted =
      this.countTodayByStatus(
        'Completed'
      );

    this.todayCancelled =
      this.countTodayByStatus(
        'Cancelled'
      );

    this.todayNoShow =
      this.countTodayByStatus(
        'No Show'
      );

  }


  // =====================================================
  // COUNT APPOINTMENTS
  // =====================================================

  private countAppointmentsByStatus(
    status: string
  ): number {

    return this.appointments.filter(
      (
        appointment:
          Appointment
      ) =>
        appointment.status ===
        status
    ).length;

  }


  private countTodayByStatus(
    status: string
  ): number {

    return this.todayAppointments.filter(
      (
        appointment:
          Appointment
      ) =>
        appointment.status ===
        status
    ).length;

  }


  // =====================================================
  // RESET APPOINTMENT STATISTICS
  // =====================================================

  private resetAppointmentStatistics(): void {

    this.totalAppointments =
      0;

    this.todaysAppointments =
      0;

    this.todayAppointments =
      [];

    this.scheduledAppointments =
      0;

    this.confirmedAppointments =
      0;

    this.checkedInAppointments =
      0;

    this.inConsultationAppointments =
      0;

    this.completedAppointments =
      0;

    this.cancelledAppointments =
      0;

    this.noShowAppointments =
      0;

    this.todayScheduled =
      0;

    this.todayConfirmed =
      0;

    this.todayCheckedIn =
      0;

    this.todayInConsultation =
      0;

    this.todayCompleted =
      0;

    this.todayCancelled =
      0;

    this.todayNoShow =
      0;

  }


  // =====================================================
  // RESET BILLING
  // =====================================================

  private resetBillingStatistics(): void {

    this.totalRevenue =
      0;

    this.totalAmountPaid =
      0;

    this.totalOutstandingBalance =
      0;

    this.pendingBills =
      0;

    this.partiallyPaidBills =
      0;

    this.paidBills =
      0;

  }


  // =====================================================
  // RESET PHARMACY
  // =====================================================

  private resetPharmacyStatistics(): void {

    this.totalPharmacyPrescriptions =
      0;

    this.waitingPrescriptions =
      0;

    this.preparingPrescriptions =
      0;

    this.awaitingPaymentPrescriptions =
      0;

    this.readyForPickupPrescriptions =
      0;

    this.dispensedPrescriptions =
      0;

  }


  // =====================================================
  // RESET INVENTORY
  // =====================================================

  private resetInventoryStatistics(): void {

    this.totalInventoryItems =
      0;

    this.lowStockItems =
      0;

    this.outOfStockItems =
      0;

    this.expiredItems =
      0;

  }


  // =====================================================
  // RENDER CHARTS
  // =====================================================

  private renderCharts(): void {

    if (
      !this.viewReady
    ) {

      return;

    }


    this.destroyCharts();


    this.createAppointmentsChart();

    this.createHospitalChart();

    this.createStatusChart();

  }


  // =====================================================
  // APPOINTMENTS CHART
  // =====================================================

  private createAppointmentsChart(): void {

    if (
      !this.moduleAvailability
        .appointments
    ) {

      return;

    }


    const canvas =
      this.appointmentsChartRef
        ?.nativeElement;


    if (!canvas) {

      return;

    }


    const config:
      ChartConfiguration<'bar'> = {

      type:
        'bar',

      data: {

        labels: [

          'Scheduled',

          'Confirmed',

          'Checked-In',

          'In Consultation',

          'Completed',

          'Cancelled',

          'No Show'

        ],

        datasets: [

          {

            label:
              'Appointments',

            data: [

              this.scheduledAppointments,

              this.confirmedAppointments,

              this.checkedInAppointments,

              this.inConsultationAppointments,

              this.completedAppointments,

              this.cancelledAppointments,

              this.noShowAppointments

            ],

            backgroundColor: [

              '#f59e0b',

              '#10b981',

              '#0ea5e9',

              '#8b5cf6',

              '#2563eb',

              '#ef4444',

              '#64748b'

            ],

            borderRadius:
              7,

            borderSkipped:
              false,

            barThickness:
              28

          }

        ]

      },

      options: {

        responsive:
          true,

        maintainAspectRatio:
          false,

        plugins: {

          legend: {

            display:
              false

          },

          tooltip: {

            backgroundColor:
              '#111827',

            padding:
              12,

            cornerRadius:
              8

          }

        },

        scales: {

          x: {

            grid: {

              display:
                false

            },

            ticks: {

              color:
                '#6b7280',

              font: {

                size:
                  10

              }

            }

          },

          y: {

            beginAtZero:
              true,

            ticks: {

              precision:
                0,

              color:
                '#6b7280',

              font: {

                size:
                  10

              }

            },

            grid: {

              color:
                '#f1f5f9'

            }

          }

        }

      }

    };


    this.appointmentsChart =
      new Chart(
        canvas,
        config
      );

  }


  // =====================================================
  // SYSTEM OVERVIEW CHART
  // =====================================================

  private createHospitalChart(): void {

    const canvas =
      this.hospitalChartRef
        ?.nativeElement;


    if (!canvas) {

      return;

    }


    const labels:
      string[] = [];

    const data:
      number[] = [];

    const colors:
      string[] = [];


    if (
      this.moduleAvailability
        .patients
    ) {

      labels.push(
        'Patients'
      );

      data.push(
        this.totalPatients
      );

      colors.push(
        '#0ea5e9'
      );

    }


    if (
      this.moduleAvailability
        .appointments
    ) {

      labels.push(
        'Appointments'
      );

      data.push(
        this.totalAppointments
      );

      colors.push(
        '#10b981'
      );

    }


    if (
      this.moduleAvailability
        .billing
    ) {

      labels.push(
        'Billing'
      );

      data.push(
        this.bills.length
      );

      colors.push(
        '#8b5cf6'
      );

    }


    if (
      this.moduleAvailability
        .pharmacy
    ) {

      labels.push(
        'Pharmacy'
      );

      data.push(
        this.totalPharmacyPrescriptions
      );

      colors.push(
        '#f59e0b'
      );

    }


    if (
      this.moduleAvailability
        .inventory
    ) {

      labels.push(
        'Inventory'
      );

      data.push(
        this.totalInventoryItems
      );

      colors.push(
        '#14b8a6'
      );

    }


    if (!data.length) {

      return;

    }


    const config:
      ChartConfiguration<'doughnut'> = {

      type:
        'doughnut',

      data: {

        labels,

        datasets: [

          {

            data,

            backgroundColor:
              colors,

            borderWidth:
              0,

            hoverOffset:
              8

          }

        ]

      },

      options: {

        responsive:
          true,

        maintainAspectRatio:
          false,

        cutout:
          '68%',

        plugins: {

          legend: {

            position:
              'bottom',

            labels: {

              usePointStyle:
                true,

              pointStyle:
                'circle',

              padding:
                18,

              color:
                '#4b5563',

              font: {

                size:
                  11

              }

            }

          },

          tooltip: {

            backgroundColor:
              '#111827',

            padding:
              12,

            cornerRadius:
              8

          }

        }

      }

    };


    this.hospitalChart =
      new Chart(
        canvas,
        config
      );

  }


  // =====================================================
  // TODAY STATUS CHART
  // =====================================================

  private createStatusChart(): void {

    if (
      !this.moduleAvailability
        .appointments
    ) {

      return;

    }


    const canvas =
      this.statusChartRef
        ?.nativeElement;


    if (!canvas) {

      return;

    }


    if (
      this.todaysAppointments ===
      0
    ) {

      return;

    }


    const config:
      ChartConfiguration<'doughnut'> = {

      type:
        'doughnut',

      data: {

        labels: [

          'Scheduled',

          'Confirmed',

          'Checked-In',

          'In Consultation',

          'Completed',

          'Cancelled',

          'No Show'

        ],

        datasets: [

          {

            data: [

              this.todayScheduled,

              this.todayConfirmed,

              this.todayCheckedIn,

              this.todayInConsultation,

              this.todayCompleted,

              this.todayCancelled,

              this.todayNoShow

            ],

            backgroundColor: [

              '#f59e0b',

              '#10b981',

              '#0ea5e9',

              '#8b5cf6',

              '#2563eb',

              '#ef4444',

              '#64748b'

            ],

            borderWidth:
              0,

            hoverOffset:
              8

          }

        ]

      },

      options: {

        responsive:
          true,

        maintainAspectRatio:
          false,

        cutout:
          '65%',

        plugins: {

          legend: {

            position:
              'bottom',

            labels: {

              usePointStyle:
                true,

              pointStyle:
                'circle',

              padding:
                13,

              color:
                '#4b5563',

              font: {

                size:
                  10

              }

            }

          },

          tooltip: {

            backgroundColor:
              '#111827',

            padding:
              12,

            cornerRadius:
              8

          }

        }

      }

    };


    this.statusChart =
      new Chart(
        canvas,
        config
      );

  }


  // =====================================================
  // DESTROY CHARTS
  // =====================================================

  private destroyCharts(): void {

    this.appointmentsChart
      ?.destroy();

    this.hospitalChart
      ?.destroy();

    this.statusChart
      ?.destroy();

    this.appointmentsChart =
      undefined;

    this.hospitalChart =
      undefined;

    this.statusChart =
      undefined;

  }


  // =====================================================
  // RESET ENTIRE DASHBOARD
  // =====================================================

  private resetDashboard(): void {

    this.patients =
      [];

    this.doctors =
      [];

    this.departments =
      [];

    this.appointments =
      [];

    this.bills =
      [];

    this.pharmacyPrescriptions =
      [];

    this.inventoryItems =
      [];

    this.moduleAvailability = {

      patients: false,

      doctors: false,

      departments: false,

      appointments: false,

      billing: false,

      pharmacy: false,

      inventory: false

    };


    this.totalPatients =
      0;

    this.activeDoctors =
      0;

    this.totalDepartments =
      0;

    this.resetAppointmentStatistics();

    this.resetBillingStatistics();

    this.resetPharmacyStatistics();

    this.resetInventoryStatistics();

  }


  // =====================================================
  // TODAY CHECK
  // =====================================================

  private isToday(
    dateValue:
      string
  ): boolean {

    if (!dateValue) {

      return false;

    }


    const today =
      new Date();


    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        today.getDate()
      ).padStart(
        2,
        '0'
      );


    const todayString =
      `${year}-${month}-${day}`;


    const appointmentDate =
      dateValue.substring(
        0,
        10
      );


    return (
      appointmentDate ===
      todayString
    );

  }


  // =====================================================
  // CURRENT DATE
  // =====================================================

  get formattedDate(): string {

    return this.currentDate
      .toLocaleDateString(
        'en-US',
        {
          weekday:
            'long',

          month:
            'long',

          day:
            'numeric',

          year:
            'numeric'
        }
      );

  }


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    value:
      number
  ): string {

    return new Intl.NumberFormat(
      'en-UG',
      {
        minimumFractionDigits:
          0,

        maximumFractionDigits:
          0
      }
    ).format(
      this.toNumber(
        value
      )
    );

  }


  // =====================================================
  // SAFE NUMBER
  // =====================================================

  private toNumber(
    value:
      unknown
  ): number {

    const number =
      Number(value);

    return Number.isFinite(
      number
    )
      ? number
      : 0;

  }


  // =====================================================
  // APPOINTMENT TIME
  // =====================================================

  formatAppointmentTime(
    time:
      string | undefined
  ): string {

    if (!time) {

      return '—';

    }


    const parts =
      time.split(':');


    if (
      parts.length < 2
    ) {

      return time;

    }


    const hour =
      Number(
        parts[0]
      );

    const minute =
      parts[1];

    const period =
      hour >= 12
        ? 'PM'
        : 'AM';

    const displayHour =
      hour % 12 || 12;


    return (
      `${displayHour}:${minute} ${period}`
    );

  }


  // =====================================================
  // PATIENT NAME
  // =====================================================

  getPatientName(
    appointment:
      Appointment
  ): string {

    if (
      appointment.patientName
    ) {

      return appointment.patientName;

    }


    const patient =
      this.patients.find(
        (
          p:
            Patient
        ) =>
          p.id ===
          appointment.patientId
      );


    if (!patient) {

      return 'Unknown Patient';

    }


    return (
      `${patient.firstName} ` +
      `${patient.lastName}`
    );

  }


  // =====================================================
  // DOCTOR NAME
  // =====================================================

  getDoctorName(
    appointment:
      Appointment
  ): string {

    if (
      appointment.doctorName
    ) {

      return appointment.doctorName;

    }


    const doctor =
      this.doctors.find(
        (
          d:
            Doctor
        ) =>
          d.id ===
          appointment.doctorId
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
  // PATIENT ID
  // =====================================================

  getPatientId(
    appointment:
      Appointment
  ): string {

    return (
      appointment.patientId ||
      'N/A'
    );

  }


  // =====================================================
  // PATIENT INITIALS
  // =====================================================

  getPatientInitials(
    appointment:
      Appointment
  ): string {

    const name =
      this.getPatientName(
        appointment
      );


    if (
      !name ||
      name ===
        'Unknown Patient'
    ) {

      return '??';

    }


    const parts =
      name
        .trim()
        .split(
          ' '
        )
        .filter(
          part =>
            Boolean(part)
        );


    if (
      parts.length ===
      1
    ) {

      return parts[0]
        .substring(
          0,
          2
        )
        .toUpperCase();

    }


    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();

  }


  // =====================================================
  // DEPARTMENT
  // =====================================================

  getDepartment(
    appointment:
      Appointment
  ): string {

    return (
      appointment.department ||
      'General'
    );

  }


  // =====================================================
  // APPOINTMENT TYPE
  // =====================================================

  getAppointmentType(
    appointment:
      Appointment
  ): string {

    return (
      appointment.type ||
      'Consultation'
    );

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status:
      Appointment['status']
  ): string {

    switch (status) {

      case 'Confirmed':
        return 'confirmed';

      case 'Scheduled':
        return 'pending';

      case 'Checked-In':
        return 'checked-in';

      case 'In Consultation':
        return 'in-consultation';

      case 'Completed':
        return 'completed';

      case 'Cancelled':
        return 'cancelled';

      case 'No Show':
        return 'no-show';

      default:
        return '';

    }

  }


  // =====================================================
  // NAVIGATION
  // =====================================================

  viewAppointments(): void {

    this.router.navigate([
      '/appointments'
    ]);

  }


  registerPatient(): void {

    this.router.navigate([
      '/patients/register'
    ]);

  }


  newAppointment(): void {

    this.router.navigate([
      '/appointments/register'
    ]);

  }


  createPrescription(): void {

    this.router.navigate([
      '/pharmacy'
    ]);

  }


  createInvoice(): void {

    this.router.navigate([
      '/billing'
    ]);

  }

}