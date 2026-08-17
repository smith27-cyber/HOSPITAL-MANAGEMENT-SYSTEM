import { Routes } from '@angular/router';

export const routes: Routes = [

  // =====================================================
  // DEFAULT
  // =====================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  // =====================================================
  // LOGIN
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

      {
        path: 'patients',

        loadComponent: () =>
          import(
            './features/patients/patient-list/patient-list'
          ).then(m => m.PatientList)
      },

      {
        path: 'patients/register',

        loadComponent: () =>
          import(
            './features/patients/patient-form/patient-form'
          ).then(m => m.PatientForm)
      },

      {
        path: 'patients/:id/edit',

        loadComponent: () =>
          import(
            './features/patients/patient-form/patient-form'
          ).then(m => m.PatientForm)
      },

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

      {
        path: 'doctors',

        loadComponent: () =>
          import(
            './features/doctors/doctor-list/doctor-list'
          ).then(m => m.DoctorList)
      },

      {
        path: 'doctors/register',

        loadComponent: () =>
          import(
            './features/doctors/doctor-form/doctor-form'
          ).then(m => m.DoctorForm)
      },

      {
        path: 'doctors/:id/edit',

        loadComponent: () =>
          import(
            './features/doctors/doctor-form/doctor-form'
          ).then(m => m.DoctorForm)
      },

      {
        path: 'doctors/:id',

        loadComponent: () =>
          import(
            './features/doctors/doctor-profile/doctor-profile'
          ).then(m => m.DoctorProfile)
      },


      // =================================================
      // DEPARTMENTS
      // =================================================

      {
        path: 'departments',

        loadComponent: () =>
          import(
            './features/departments/department-list/department-list'
          ).then(m => m.DepartmentList)
      },

      {
        path: 'departments/register',

        loadComponent: () =>
          import(
            './features/departments/department-form/department-form'
          ).then(m => m.DepartmentForm)
      },

      {
        path: 'departments/:id/edit',

        loadComponent: () =>
          import(
            './features/departments/department-form/department-form'
          ).then(m => m.DepartmentForm)
      },

      {
        path: 'departments/:id',

        loadComponent: () =>
          import(
            './features/departments/department-profile/department-profile'
          ).then(m => m.DepartmentProfile)
      },


      // =================================================
      // APPOINTMENTS
      // =================================================

      {
        path: 'appointments',

        loadComponent: () =>
          import(
            './features/appointments/appointment-list/appointment-list'
          ).then(m => m.AppointmentList)
      },

      {
        path: 'appointments/register',

        loadComponent: () =>
          import(
            './features/appointments/appointment-register/appointment-register'
          ).then(m => m.AppointmentRegister)
      },

      {
        path: 'appointments/queue',

        loadComponent: () =>
          import(
            './features/appointments/appointment-queue/appointment-queue'
          ).then(m => m.AppointmentQueue)
      },

      {
        path: 'appointments/:id/edit',

        loadComponent: () =>
          import(
            './features/appointments/appointment-edit/appointment-edit'
          ).then(m => m.AppointmentEdit)
      },


      {
        path: 'appointments/:id',

        loadComponent: () =>
          import(
            './features/appointments/appointment-details/appointment-details'
          ).then(m => m.AppointmentDetails)
      },


     // =================================================
// CONSULTATIONS
// =================================================

// Consultation List
{
  path: 'consultations',

  loadComponent: () =>
    import(
      './features/consultations/consultation-list/consultation-list'
    ).then(m => m.ConsultationList)
},

{
  path: 'consultations/register',

  loadComponent: () =>
    import(
      './features/consultations/consultation-form/consultation-form'
    ).then(m => m.ConsultationForm)
},

// Consultation Edit / Form
{
  path: 'consultations/:id/edit',

  loadComponent: () =>
    import(
      './features/consultations/consultation-form/consultation-form'
    ).then(m => m.ConsultationForm)
},

// Consultation Profile
{
  path: 'consultations/:id',

  loadComponent: () =>
    import(
      './features/consultations/consultation-profile/consultation-profile'
    ).then(m => m.ConsultationProfile)
},

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
