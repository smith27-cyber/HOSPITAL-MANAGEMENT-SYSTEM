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
        .then(
          m => m.Login
        )
  },


  // =====================================================
  // MAIN APPLICATION
  // =====================================================

  {
    path: '',

    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(
          m => m.MainLayout
        ),

    children: [

      // =================================================
      // DASHBOARD
      // =================================================

      {
        path: 'dashboard',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m => m.Dashboard
          )
      },


      // =================================================
      // PATIENTS
      // =================================================

      {
        path: 'patients',

        loadComponent: () =>
          import(
            './features/patients/patient-list/patient-list'
          ).then(
            m => m.PatientList
          )
      },

      {
        path: 'patients/register',

        loadComponent: () =>
          import(
            './features/patients/patient-form/patient-form'
          ).then(
            m => m.PatientForm
          )
      },

      {
        path: 'patients/:id/edit',

        loadComponent: () =>
          import(
            './features/patients/patient-form/patient-form'
          ).then(
            m => m.PatientForm
          )
      },

      {
        path: 'patients/:id',

        loadComponent: () =>
          import(
            './features/patients/patient-profile/patient-profile'
          ).then(
            m => m.PatientProfile
          )
      },


      // =================================================
      // DOCTORS
      // =================================================

      {
        path: 'doctors',

        loadComponent: () =>
          import(
            './features/doctors/doctor-list/doctor-list'
          ).then(
            m => m.DoctorList
          )
      },

      {
        path: 'doctors/register',

        loadComponent: () =>
          import(
            './features/doctors/doctor-form/doctor-form'
          ).then(
            m => m.DoctorForm
          )
      },

      {
        path: 'doctors/:id/edit',

        loadComponent: () =>
          import(
            './features/doctors/doctor-form/doctor-form'
          ).then(
            m => m.DoctorForm
          )
      },

      {
        path: 'doctors/:id',

        loadComponent: () =>
          import(
            './features/doctors/doctor-profile/doctor-profile'
          ).then(
            m => m.DoctorProfile
          )
      },


      // =================================================
      // DEPARTMENTS
      // =================================================

      {
        path: 'departments',

        loadComponent: () =>
          import(
            './features/departments/department-list/department-list'
          ).then(
            m => m.DepartmentList
          )
      },

      {
        path: 'departments/register',

        loadComponent: () =>
          import(
            './features/departments/department-form/department-form'
          ).then(
            m => m.DepartmentForm
          )
      },

      {
        path: 'departments/:id/edit',

        loadComponent: () =>
          import(
            './features/departments/department-form/department-form'
          ).then(
            m => m.DepartmentForm
          )
      },

      {
        path: 'departments/:id',

        loadComponent: () =>
          import(
            './features/departments/department-profile/department-profile'
          ).then(
            m => m.DepartmentProfile
          )
      },


      // =================================================
      // APPOINTMENTS
      // =================================================

      {
        path: 'appointments',

        loadComponent: () =>
          import(
            './features/appointments/appointment-list/appointment-list'
          ).then(
            m => m.AppointmentList
          )
      },

      {
        path: 'appointments/register',

        loadComponent: () =>
          import(
            './features/appointments/appointment-register/appointment-register'
          ).then(
            m => m.AppointmentRegister
          )
      },

      {
        path: 'appointments/queue',

        loadComponent: () =>
          import(
            './features/appointments/appointment-queue/appointment-queue'
          ).then(
            m => m.AppointmentQueue
          )
      },

      {
        path: 'appointments/:id/edit',

        loadComponent: () =>
          import(
            './features/appointments/appointment-edit/appointment-edit'
          ).then(
            m => m.AppointmentEdit
          )
      },

      {
        path: 'appointments/:id',

        loadComponent: () =>
          import(
            './features/appointments/appointment-details/appointment-details'
          ).then(
            m => m.AppointmentDetails
          )
      },


      // =================================================
      // CONSULTATIONS
      // =================================================

      {
        path: 'consultations',

        loadComponent: () =>
          import(
            './features/consultations/consultation-list/consultation-list'
          ).then(
            m => m.ConsultationList
          )
      },

      {
        path: 'consultations/register',

        loadComponent: () =>
          import(
            './features/consultations/consultation-form/consultation-form'
          ).then(
            m => m.ConsultationForm
          )
      },

      {
        path: 'consultations/:id/edit',

        loadComponent: () =>
          import(
            './features/consultations/consultation-form/consultation-form'
          ).then(
            m => m.ConsultationForm
          )
      },

      {
        path: 'consultations/:id',

        loadComponent: () =>
          import(
            './features/consultations/consultation-profile/consultation-profile'
          ).then(
            m => m.ConsultationProfile
          )
      },


      // =================================================
      // PHARMACY
      // =================================================

      {
        path: 'pharmacy',

        loadComponent: () =>
          import(
            './features/pharmacy/pharmacy-dashboard/pharmacy-dashboard'
          ).then(
            m => m.PharmacyDashboard
          )
      },

      {
        path: 'pharmacy/queue',

        loadComponent: () =>
          import(
            './features/pharmacy/pharmacy-queue/pharmacy-queue'
          ).then(
            m => m.PharmacyQueue
          )
      },

      {
        path: 'pharmacy/prescriptions/:id',

        loadComponent: () =>
          import(
            './features/pharmacy/pharmacy-prescription/pharmacy-prescription'
          ).then(
            m => m.PharmacyPrescription
          )
      },

      {
        path: 'pharmacy/stock',

        loadComponent: () =>
          import(
            './features/pharmacy/pharmacy-stock/pharmacy-stock'
          ).then(
            m => m.PharmacyStock
          )
      },


      // =================================================
      // LABORATORY
      // =================================================

      {
        path: 'laboratory',

        loadComponent: () =>
          import(
            './features/laboratory/laboratory-list/laboratory-list'
          ).then(
            m => m.LaboratoryList
          )
      },


      // =================================================
      // LABORATORY REQUESTS
      // =================================================

      {
        path: 'laboratory/requests',

        loadComponent: () =>
          import(
            './features/laboratory/laboratory-requests/laboratory-request-list/laboratory-request-list'
          ).then(
            m => m.LaboratoryRequestList
          )
      },

      {
        path: 'laboratory/requests/register',

        loadComponent: () =>
          import(
            './features/laboratory/laboratory-requests/laboratory-request-form/laboratory-request-form'
          ).then(
            m => m.LaboratoryRequestForm
          )
      },

      {
        path: 'laboratory/requests/:id/edit',

        loadComponent: () =>
          import(
            './features/laboratory/laboratory-requests/laboratory-request-form/laboratory-request-form'
          ).then(
            m => m.LaboratoryRequestForm
          )
      },

      {
        path: 'laboratory/requests/:id',

        loadComponent: () =>
          import(
            './features/laboratory/laboratory-requests/laboratory-request-details/laboratory-request-details'
          ).then(
            m => m.LaboratoryRequestDetails
          )
      },


      // =================================================
      // LABORATORY TESTS
      // =================================================

      {
        path: 'laboratory/register',

        loadComponent: () =>
          import(
            './features/laboratory/laboratory-register/laboratory-register'
          ).then(
            m => m.LaboratoryRegister
          )
      },

      {
        path: 'laboratory/:id/edit',

        loadComponent: () =>
          import(
            './features/laboratory/laboratory-register/laboratory-register'
          ).then(
            m => m.LaboratoryRegister
          )
      },

      {
        path: 'laboratory/:id',

        loadComponent: () =>
          import(
            './features/laboratory/laboratory-details/laboratory-details'
          ).then(
            m => m.LaboratoryDetails
          )
      },


      // =================================================
      // ADMISSIONS
      // =================================================

      {
        path: 'admissions',

        loadComponent: () =>
          import(
            './features/admissions/admission-list/admission-list'
          ).then(
            m => m.AdmissionList
          )
      },

      {
        path: 'admissions/register',

        loadComponent: () =>
          import(
            './features/admissions/admission-register/admission-register'
          ).then(
            m => m.AdmissionRegister
          )
      },

      {
        path: 'admissions/:id/edit',

        loadComponent: () =>
          import(
            './features/admissions/admission-edit/admission-edit'
          ).then(
            m => m.AdmissionEdit
          )
      },

      {
        path: 'admissions/:id',

        loadComponent: () =>
          import(
            './features/admissions/admission-details/admission-details'
          ).then(
            m => m.AdmissionDetails
          )
      },


      // =================================================
      // BILLING
      // =================================================

      {
        path: 'billing',

        loadComponent: () =>
          import(
            './features/billing/billing-list/billing-list'
          ).then(
            m => m.BillingList
          )
      },

      {
        path: 'billing/register',

        loadComponent: () =>
          import(
            './features/billing/billing-register/billing-register'
          ).then(
            m => m.BillingRegister
          )
      },

      {
        path: 'billing/:id/edit',

        loadComponent: () =>
          import(
            './features/billing/billing-edit/billing-edit'
          ).then(
            m => m.BillingEdit
          )
      },

      {
        path: 'billing/:id',

        loadComponent: () =>
          import(
            './features/billing/billing-details/billing-details'
          ).then(
            m => m.BillingDetails
          )
      },


      // =================================================
      // INVENTORY
      // =================================================

      {
        path: 'inventory',

        children: [

          {
            path: '',

            loadComponent: () =>
              import(
                './features/inventory/inventory-list/inventory-list'
              ).then(
                m => m.InventoryList
              )
          },

          {
            path: 'register',

            loadComponent: () =>
              import(
                './features/inventory/inventory-register/inventory-register'
              ).then(
                m => m.InventoryRegister
              )
          },

          {
            path: 'stock',

            loadComponent: () =>
              import(
                './features/inventory/inventory-stock/inventory-stock'
              ).then(
                m => m.InventoryStock
              )
          },

          {
            path: ':id/edit',

            loadComponent: () =>
              import(
                './features/inventory/inventory-edit/inventory-edit'
              ).then(
                m => m.InventoryEdit
              )
          },

          {
            path: ':id',

            loadComponent: () =>
              import(
                './features/inventory/inventory-details/inventory-details'
              ).then(
                m => m.InventoryDetails
              )
          }

        ]

      },


      // =================================================
      // REPORTS
      // =================================================

      {
        path: 'reports',

        loadComponent: () =>
          import(
            './features/reports/report/report'
          ).then(
            m => m.ReportComponent
          )
      },


     // =====================================================
// SETTINGS
// =====================================================

{
  path: 'settings',

  children: [

    // =============================================
    // SETTINGS MAIN
    // =============================================

    {
      path: '',

      loadComponent: () =>
        import(
          './features/settings/settings/settings'
        ).then(
          m => m.Settings
        )
    },


    // =============================================
    // HOSPITAL SETTINGS
    // URL: /settings/hospital
    // =============================================

    {
      path: 'hospital',

      loadComponent: () =>
        import(
          './features/settings/hospital-settings/hospital-settings'
        ).then(
          m => m.HospitalSettingsComponent
        )
    },


    // =============================================
    // PROFILE SETTINGS
    // URL: /settings/profile
    // =============================================

    {
      path: 'profile',

      loadComponent: () =>
        import(
          './features/settings/profile-settings/profile-settings'
        ).then(
          m => m.ProfileSettings
        )
    },


    // =============================================
    // SYSTEM PREFERENCES
    // URL: /settings/system
    // =============================================

    {
      path: 'system',

      loadComponent: () =>
        import(
          './features/settings/system-preferences/system-preferences'
        ).then(
          m => m.SystemPreferencesComponent
        )
    },


    // =============================================
    // NOTIFICATION SETTINGS
    // URL: /settings/notifications
    // =============================================

    {
      path: 'notifications',

      loadComponent: () =>
        import(
          './features/settings/notification-settings/notification-settings'
        ).then(
          m => m.NotificationSettingsComponent
        )
    }

  ]

},    ]

  },


  // =====================================================
  // UNKNOWN ROUTES
  // =====================================================

  {
    path: '**',
    redirectTo: 'login'
  }

];
