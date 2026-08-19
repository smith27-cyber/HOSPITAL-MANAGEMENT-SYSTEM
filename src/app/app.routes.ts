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
// PHARMACY
  {
  path: 'pharmacy',
  loadComponent: () =>
    import('./features/pharmacy/pharmacy-list/pharmacy-list')
      .then(m => m.PharmacyList)
},

{
  path: 'pharmacy/register',
  loadComponent: () =>
    import('./features/pharmacy/pharmacy-register/pharmacy-register')
      .then(m => m.PharmacyRegister)
},
{
  path: 'pharmacy/:id/edit',

  loadComponent: () =>
    import(
      './features/pharmacy/pharmacy-edit/pharmacy-edit'
    ).then(m => m.PharmacyEdit)
},
{
  path: 'pharmacy/:id',
  loadComponent: () =>
    import(
      './features/pharmacy/pharmacy-details/pharmacy-details'
    ).then(m => m.PharmacyDetails)
},
{
  path: 'pharmacy/stock',

  loadComponent: () =>
    import(
      './features/pharmacy/pharmacy-stock/pharmacy-stock'
    ).then(m => m.PharmacyStock)
},
// =====================================================
// LABORATORY
// =====================================================

// Laboratory List
{
  path: 'laboratory',

  loadComponent: () =>
    import(
      './features/laboratory/laboratory-list/laboratory-list'
    ).then(m => m.LaboratoryList)
},

// Register Laboratory Test
{
  path: 'laboratory/register',

  loadComponent: () =>
    import(
      './features/laboratory/laboratory-register/laboratory-register'
    ).then(m => m.LaboratoryRegister)
},

//Edit Laboratory Test
{
  path: 'laboratory/:id/edit',

  loadComponent: () =>
    import(
      './features/laboratory/laboratory-register/laboratory-register'
    ).then(m => m.LaboratoryRegister)
},

// Laboratory Test Details
{
  path: 'laboratory/:id',

  loadComponent: () =>
    import(
      './features/laboratory/laboratory-details/laboratory-details'
    ).then(m => m.LaboratoryDetails)
},

// =====================================================
// LABORATORY REQUESTS
// =====================================================

// Laboratory Request List
{
  path: 'laboratory/requests',

  loadComponent: () =>
    import(
      './features/laboratory/laboratory-requests/laboratory-request-list/laboratory-request-list'
    ).then(m => m.LaboratoryRequestList)
},

// Register Laboratory Request
{
  path: 'laboratory/requests/register',

  loadComponent: () =>
    import(
      './features/laboratory/laboratory-requests/laboratory-request-form/laboratory-request-form'
    ).then(m => m.LaboratoryRequestForm)
},

// Edit Laboratory Request
{
  path: 'laboratory/requests/:id/edit',

  loadComponent: () =>
    import(
      './features/laboratory/laboratory-requests/laboratory-request-form/laboratory-request-form'
    ).then(m => m.LaboratoryRequestForm)
},

// Laboratory Request Details
{
  path: 'laboratory/requests/:id',

  loadComponent: () =>
    import(
      './features/laboratory/laboratory-requests/laboratory-request-details/laboratory-request-details'
    ).then(m => m.LaboratoryRequestDetails)
},

// =====================================================
// ADMISSIONS
// =====================================================

// Admission List
{
  path: 'admissions',

  loadComponent: () =>
    import(
      './features/admissions/admission-list/admission-list'
    ).then(m => m.AdmissionList)
},


// Register Admission
{
  path: 'admissions/register',

  loadComponent: () =>
    import(
      './features/admissions/admission-register/admission-register'
    ).then(m => m.AdmissionRegister)
},


// Edit Admission
{
  path: 'admissions/:id/edit',

  loadComponent: () =>
    import(
      './features/admissions/admission-edit/admission-edit'
    ).then(m => m.AdmissionEdit)
},


// Admission Details
{
  path: 'admissions/:id',

  loadComponent: () =>
    import(
      './features/admissions/admission-details/admission-details'
    ).then(m => m.AdmissionDetails)
},



// =====================================================
// BILLING
// =====================================================

// Billing List
{
  path: 'billing',

  loadComponent: () =>
    import(
      './features/billing/billing-list/billing-list'
    ).then(m => m.BillingList)
},

// Register Billing
{
  path: 'billing/register',

  loadComponent: () =>
    import(
      './features/billing/billing-register/billing-register'
    ).then(m => m.BillingRegister)
},

// Edit Billing
{
  path: 'billing/:id/edit',

  loadComponent: () =>
    import(
      './features/billing/billing-edit/billing-edit'
    ).then(m => m.BillingEdit)
},

// Billing Details
{
  path: 'billing/:id',

  loadComponent: () =>
    import(
      './features/billing/billing-details/billing-details'
    ).then(m => m.BillingDetails)
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
