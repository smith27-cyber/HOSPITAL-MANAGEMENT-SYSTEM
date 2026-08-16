import { Routes } from '@angular/router';

export const routes: Routes = [

  // =====================================================
  // DEFAULT ROUTE
  // =====================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  // =====================================================
  // AUTHENTICATION
  // =====================================================

  {
    path: 'login',

    loadComponent: () =>
      import('./auth/login/login')
        .then(m => m.Login)
  },


  // =====================================================
  // MAIN APPLICATION
  // =====================================================

  {
    path: '',

    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(m => m.MainLayout),

    children: [

      // =================================================
      // DASHBOARD
      // =================================================

      {
        path: 'dashboard',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(m => m.Dashboard)
      },


      // =================================================
      // PATIENTS
      // =================================================

      // Patient List
      {
        path: 'patients',

        loadComponent: () =>
          import(
            './features/patients/patient-list/patient-list'
          ).then(m => m.PatientList)
      },


      // Register Patient
      {
        path: 'patients/register',

        loadComponent: () =>
          import(
            './features/patients/patient-form/patient-form'
          ).then(m => m.PatientForm)
      },


      // Edit Patient
      {
        path: 'patients/:id/edit',

        loadComponent: () =>
          import(
            './features/patients/patient-form/patient-form'
          ).then(m => m.PatientForm)
      },


      // Patient Profile
      {
        path: 'patients/:id',

        loadComponent: () =>
          import(
            './features/patients/patient-profile/patient-profile'
          ).then(m => m.PatientProfile)
      },


      // =================================================
      // DOCTORS
      // =================================================

      // Doctor List
      {
        path: 'doctors',

        loadComponent: () =>
          import(
            './features/doctors/doctor-list/doctor-list'
          ).then(m => m.DoctorList)
      },


      // Register Doctor
      {
        path: 'doctors/register',

        loadComponent: () =>
          import(
            './features/doctors/doctor-form/doctor-form'
          ).then(m => m.DoctorForm)
      },


      // Edit Doctor
      {
        path: 'doctors/:id/edit',

        loadComponent: () =>
          import(
            './features/doctors/doctor-form/doctor-form'
          ).then(m => m.DoctorForm)
      },


      // =================================================
      // APPOINTMENTS
      // =================================================

      // Appointment List
      {
        path: 'appointments',

        loadComponent: () =>
          import(
            './features/appointments/appointment-list/appointment-list'
          ).then(m => m.AppointmentList)
      },


      // Register Appointment
      {
        path: 'appointments/register',

        loadComponent: () =>
          import(
            './features/appointments/appointment-register/appointment-register'
          ).then(m => m.AppointmentRegister)
      },


      // Appointment Waiting Queue
      // IMPORTANT:
      // Must come before appointments/:id

      {
        path: 'appointments/queue',

        loadComponent: () =>
          import(
            './features/appointments/appointment-queue/appointment-queue'
          ).then(m => m.AppointmentQueue)
      },


      // Appointment Edit
      {
        path: 'appointments/:id/edit',

        loadComponent: () =>
          import(
            './features/appointments/appointment-edit/appointment-edit'
          ).then(m => m.AppointmentEdit)
      },


      // Appointment Consultation
      {
        path: 'appointments/:id/consultation',

        loadComponent: () =>
          import(
            './features/appointments/appointment-consultation/appointment-consultation'
          ).then(m => m.AppointmentConsultation)
      },


      // Appointment Details
      {
        path: 'appointments/:id',

        loadComponent: () =>
          import(
            './features/appointments/appointment-details/appointment-details'
          ).then(m => m.AppointmentDetails)
      }

    ]
  },


  // =====================================================
  // UNKNOWN ROUTES
  // =====================================================

  {
    path: '**',
    redirectTo: 'login'
  }

];
