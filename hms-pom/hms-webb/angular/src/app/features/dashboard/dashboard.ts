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
  forkJoin
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


// Register all Chart.js components
Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css'
})
export class Dashboard
  implements OnInit, AfterViewInit, OnDestroy {


  // =====================================================
  // CHART REFERENCES
  // =====================================================

  @ViewChild('appointmentsChart')
  appointmentsChartRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('hospitalChart')
  hospitalChartRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('statusChart')
  statusChartRef?: ElementRef<HTMLCanvasElement>;


  // =====================================================
  // CHART INSTANCES
  // =====================================================

  private appointmentsChart?: Chart;

  private hospitalChart?: Chart;

  private statusChart?: Chart;


  // =====================================================
  // VIEW STATE
  // =====================================================

  private viewReady = false;


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = false;


  // =====================================================
  // DATA
  // =====================================================

  patients: Patient[] = [];

  doctors: Doctor[] = [];

  departments: Department[] = [];

  appointments: Appointment[] = [];


  // =====================================================
  // DASHBOARD STATISTICS
  // =====================================================

  totalPatients = 0;

  activeDoctors = 0;

  totalDepartments = 0;

  totalAppointments = 0;

  todaysAppointments = 0;


  // =====================================================
  // APPOINTMENT STATISTICS
  // =====================================================

  scheduledAppointments = 0;

  confirmedAppointments = 0;

  checkedInAppointments = 0;

  inConsultationAppointments = 0;

  completedAppointments = 0;

  cancelledAppointments = 0;

  noShowAppointments = 0;


  // =====================================================
  // TODAY'S APPOINTMENT STATUS
  // =====================================================

  todayScheduled = 0;

  todayConfirmed = 0;

  todayCheckedIn = 0;

  todayInConsultation = 0;

  todayCompleted = 0;

  todayCancelled = 0;

  todayNoShow = 0;


  // =====================================================
  // TODAY'S APPOINTMENTS
  // =====================================================

  todayAppointments: Appointment[] = [];


  // =====================================================
  // CURRENT DATE
  // =====================================================

  currentDate = new Date();


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

    private router:
      Router,

    private cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadDashboardData();

  }


  // =====================================================
  // AFTER VIEW INIT
  // =====================================================

  ngAfterViewInit(): void {

    this.viewReady = true;

    this.renderCharts();

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    this.destroyCharts();

  }


  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  private loadDashboardData(): void {

    this.isLoading = true;


    forkJoin({

      patients:
        this.patientService
          .getPatients(),

      doctors:
        this.doctorService
          .getDoctors(),

      departments:
        this.departmentService
          .getDepartments(),

      appointments:
        this.appointmentService
          .getAppointments()

    }).subscribe({

      // =================================================
      // SUCCESS
      // =================================================

      next: (data) => {

        // -----------------------------------------------
        // PATIENTS
        // -----------------------------------------------

        this.patients =
          Array.isArray(data.patients)
            ? data.patients
            : [];

        this.totalPatients =
          this.patients.length;


        // -----------------------------------------------
        // DOCTORS
        // -----------------------------------------------

        this.doctors =
          Array.isArray(data.doctors)
            ? data.doctors
            : [];

        this.activeDoctors =
          this.doctors.filter(
            (doctor: Doctor) =>
              doctor.status === 'Active'
          ).length;


        // -----------------------------------------------
        // DEPARTMENTS
        // -----------------------------------------------

        this.departments =
          Array.isArray(data.departments)
            ? data.departments
            : [];

        this.totalDepartments =
          this.departments.length;


        // -----------------------------------------------
        // APPOINTMENTS
        // -----------------------------------------------

        this.appointments =
          Array.isArray(data.appointments)
            ? data.appointments
            : [];

        this.totalAppointments =
          this.appointments.length;


        // -----------------------------------------------
        // APPOINTMENT STATISTICS
        // -----------------------------------------------

        this.calculateAppointmentStatistics();


        // -----------------------------------------------
        // TODAY'S APPOINTMENTS
        // -----------------------------------------------

        this.todayAppointments =
          this.appointments
            .filter(
              (appointment: Appointment) =>
                this.isToday(
                  appointment.appointmentDate
                )
            )
            .sort(
              (
                a: Appointment,
                b: Appointment
              ) =>
                (a.appointmentTime || '')
                  .localeCompare(
                    b.appointmentTime || ''
                  )
            );


        this.todaysAppointments =
          this.todayAppointments.length;


        // -----------------------------------------------
        // TODAY'S STATUS STATISTICS
        // -----------------------------------------------

        this.calculateTodayStatistics();


        // -----------------------------------------------
        // LOADING COMPLETE
        // -----------------------------------------------

        this.isLoading = false;


        // -----------------------------------------------
        // UPDATE VIEW
        // -----------------------------------------------

        this.cdr.detectChanges();


        // -----------------------------------------------
        // RENDER CHARTS
        // -----------------------------------------------

        setTimeout(() => {

          this.renderCharts();

        }, 0);


        // -----------------------------------------------
        // DEBUG
        // -----------------------------------------------

        console.log(
          'Dashboard data loaded:',
          {
            totalPatients:
              this.totalPatients,

            activeDoctors:
              this.activeDoctors,

            totalDepartments:
              this.totalDepartments,

            totalAppointments:
              this.totalAppointments,

            todaysAppointments:
              this.todaysAppointments,

            scheduledAppointments:
              this.scheduledAppointments,

            confirmedAppointments:
              this.confirmedAppointments,

            completedAppointments:
              this.completedAppointments,

            cancelledAppointments:
              this.cancelledAppointments,

            todayAppointments:
              this.todayAppointments
          }
        );

      },


      // =================================================
      // ERROR
      // =================================================

      error: (error: unknown) => {

        console.error(
          'Failed to load dashboard data:',
          error
        );


        this.resetDashboard();


        this.isLoading = false;


        this.cdr.detectChanges();

      }

    });

  }


  // =====================================================
  // CALCULATE APPOINTMENT STATISTICS
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
  // CALCULATE TODAY'S STATISTICS
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
  // COUNT APPOINTMENTS BY STATUS
  // =====================================================

  private countAppointmentsByStatus(
    status: string
  ): number {

    return this.appointments.filter(
      (appointment: Appointment) =>
        appointment.status === status
    ).length;

  }


  // =====================================================
  // COUNT TODAY'S APPOINTMENTS BY STATUS
  // =====================================================

  private countTodayByStatus(
    status: string
  ): number {

    return this.todayAppointments.filter(
      (appointment: Appointment) =>
        appointment.status === status
    ).length;

  }


  // =====================================================
  // RENDER ALL CHARTS
  // =====================================================

  private renderCharts(): void {

    if (!this.viewReady) {

      return;

    }


    if (
      !this.appointmentsChartRef ||
      !this.hospitalChartRef ||
      !this.statusChartRef
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

    const canvas =
      this.appointmentsChartRef
        ?.nativeElement;


    if (!canvas) {

      return;

    }


    const config:
      ChartConfiguration<'bar'> = {

      type: 'bar',

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
            label: 'Appointments',

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

            borderRadius: 7,

            borderSkipped: false,

            barThickness: 28

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {

            display: false

          },

          tooltip: {

            backgroundColor: '#111827',

            padding: 12,

            cornerRadius: 8

          }

        },

        scales: {

          x: {

            grid: {

              display: false

            },

            ticks: {

              color: '#6b7280',

              font: {

                size: 10

              }

            }

          },

          y: {

            beginAtZero: true,

            ticks: {

              precision: 0,

              color: '#6b7280',

              font: {

                size: 10

              }

            },

            grid: {

              color: '#f1f5f9'

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
  // HOSPITAL OVERVIEW CHART
  // =====================================================

  private createHospitalChart(): void {

    const canvas =
      this.hospitalChartRef
        ?.nativeElement;


    if (!canvas) {

      return;

    }


    const config:
      ChartConfiguration<'doughnut'> = {

      type: 'doughnut',

      data: {

        labels: [
          'Patients',
          'Doctors',
          'Departments',
          'Appointments'
        ],

        datasets: [

          {

            data: [

              this.totalPatients,

              this.activeDoctors,

              this.totalDepartments,

              this.totalAppointments

            ],

            backgroundColor: [

              '#0ea5e9',
              '#8b5cf6',
              '#f59e0b',
              '#10b981'

            ],

            borderWidth: 0,

            hoverOffset: 8

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: '68%',

        plugins: {

          legend: {

            position: 'bottom',

            labels: {

              usePointStyle: true,

              pointStyle: 'circle',

              padding: 18,

              color: '#4b5563',

              font: {

                size: 11

              }

            }

          },

          tooltip: {

            backgroundColor: '#111827',

            padding: 12,

            cornerRadius: 8

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

    const canvas =
      this.statusChartRef
        ?.nativeElement;


    if (!canvas) {

      return;

    }


    const config:
      ChartConfiguration<'doughnut'> = {

      type: 'doughnut',

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

            borderWidth: 0,

            hoverOffset: 8

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: '65%',

        plugins: {

          legend: {

            position: 'bottom',

            labels: {

              usePointStyle: true,

              pointStyle: 'circle',

              padding: 13,

              color: '#4b5563',

              font: {

                size: 10

              }

            }

          },

          tooltip: {

            backgroundColor: '#111827',

            padding: 12,

            cornerRadius: 8

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

    if (this.appointmentsChart) {

      this.appointmentsChart.destroy();

      this.appointmentsChart =
        undefined;

    }


    if (this.hospitalChart) {

      this.hospitalChart.destroy();

      this.hospitalChart =
        undefined;

    }


    if (this.statusChart) {

      this.statusChart.destroy();

      this.statusChart =
        undefined;

    }

  }


  // =====================================================
  // RESET DASHBOARD
  // =====================================================

  private resetDashboard(): void {

    this.patients = [];

    this.doctors = [];

    this.departments = [];

    this.appointments = [];

    this.todayAppointments = [];


    this.totalPatients = 0;

    this.activeDoctors = 0;

    this.totalDepartments = 0;

    this.totalAppointments = 0;

    this.todaysAppointments = 0;


    this.scheduledAppointments = 0;

    this.confirmedAppointments = 0;

    this.checkedInAppointments = 0;

    this.inConsultationAppointments = 0;

    this.completedAppointments = 0;

    this.cancelledAppointments = 0;

    this.noShowAppointments = 0;


    this.todayScheduled = 0;

    this.todayConfirmed = 0;

    this.todayCheckedIn = 0;

    this.todayInConsultation = 0;

    this.todayCompleted = 0;

    this.todayCancelled = 0;

    this.todayNoShow = 0;

  }


  // =====================================================
  // CHECK WHETHER DATE IS TODAY
  // =====================================================

  private isToday(
    dateValue: string
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
  // FORMAT CURRENT DATE
  // =====================================================

  get formattedDate(): string {

    return this.currentDate
      .toLocaleDateString(
        'en-US',
        {
          weekday: 'long',

          month: 'long',

          day: 'numeric',

          year: 'numeric'
        }
      );

  }


  // =====================================================
  // FORMAT APPOINTMENT TIME
  // =====================================================

  formatAppointmentTime(
    time: string | undefined
  ): string {

    if (!time) {

      return '—';

    }


    const parts =
      time.split(':');


    if (parts.length < 2) {

      return time;

    }


    const hour =
      Number(parts[0]);


    const minute =
      parts[1];


    const period =
      hour >= 12
        ? 'PM'
        : 'AM';


    const displayHour =
      hour % 12 || 12;


    return `${displayHour}:${minute} ${period}`;

  }


  // =====================================================
  // GET PATIENT NAME
  // =====================================================

  getPatientName(
    appointment: Appointment
  ): string {

    if (
      appointment.patientName
    ) {

      return appointment.patientName;

    }


    const patient =
      this.patients.find(
        (p: Patient) =>
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
  // GET DOCTOR NAME
  // =====================================================

  getDoctorName(
    appointment: Appointment
  ): string {

    if (
      appointment.doctorName
    ) {

      return appointment.doctorName;

    }


    const doctor =
      this.doctors.find(
        (d: Doctor) =>
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
  // GET PATIENT ID
  // =====================================================

  getPatientId(
    appointment: Appointment
  ): string {

    return (
      appointment.patientId ||
      'N/A'
    );

  }


  // =====================================================
  // GET PATIENT INITIALS
  // =====================================================

  getPatientInitials(
    appointment: Appointment
  ): string {

    const name =
      this.getPatientName(
        appointment
      );


    if (
      !name ||
      name === 'Unknown Patient'
    ) {

      return '??';

    }


    const parts =
      name
        .replace(
          'Dr. ',
          ''
        )
        .trim()
        .split(' ')
        .filter(
          (part: string) =>
            Boolean(part)
        );


    if (
      parts.length === 1
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
  // GET DEPARTMENT
  // =====================================================

  getDepartment(
    appointment: Appointment
  ): string {

    if (
      appointment.department
    ) {

      return appointment.department;

    }


    return 'General';

  }


  // =====================================================
  // GET APPOINTMENT TYPE
  // =====================================================

  getAppointmentType(
    appointment: Appointment
  ): string {

    if (
      appointment.type
    ) {

      return appointment.type;

    }


    return 'Consultation';

  }


  // =====================================================
  // VIEW ALL APPOINTMENTS
  // =====================================================

  viewAppointments(): void {

    this.router.navigate([
      '/appointments'
    ]);

  }


  // =====================================================
  // REGISTER PATIENT
  // =====================================================

  registerPatient(): void {

    this.router.navigate([
      '/patients/register'
    ]);

  }


  // =====================================================
  // NEW APPOINTMENT
  // =====================================================

  newAppointment(): void {

    this.router.navigate([
      '/appointments/register'
    ]);

  }


  // =====================================================
  // PRESCRIPTION
  // =====================================================

  createPrescription(): void {

    this.router.navigate([
      '/pharmacy'
    ]);

  }


  // =====================================================
  // INVOICE
  // =====================================================

  createInvoice(): void {

    this.router.navigate([
      '/billing'
    ]);

  }


  // =====================================================
  // GET STATUS CLASS
  // =====================================================

  getStatusClass(
    status: Appointment['status']
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

}