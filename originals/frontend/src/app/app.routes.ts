
// =====================================================
// APPLICATION ROUTES
// File:
// src/app/app.routes.ts
// =====================================================

import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';


// =====================================================
// APPLICATION ROUTES
// =====================================================

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
  // LOGIN
  // PUBLIC ROUTE
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
  // MAIN APPLICATION LAYOUT
  // PROTECTED ROUTE
  // =====================================================

  {
    path: '',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(
          m => m.MainLayout
        ),

    children: [

      // ===================================================
      // DASHBOARD
      // URL: /dashboard
      // ===================================================

      {
        path: 'dashboard',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          )
            .then(
              m => m.Dashboard
            )
      },


      // ===================================================
      // PATIENTS
      // ===================================================

      {
        path: 'patients',

        children: [

          // -------------------------------------------------
          // /patients
          // -------------------------------------------------

          {
            path: '',

            loadComponent: () =>
              import(
                './features/patients/patient-list/patient-list'
              )
                .then(
                  m => m.PatientList
                )
          },


          // -------------------------------------------------
          // /patients/register
          // -------------------------------------------------

          {
            path: 'register',

            loadComponent: () =>
              import(
                './features/patients/patient-form/patient-form'
              )
                .then(
                  m => m.PatientForm
                )
          },


          // -------------------------------------------------
          // /patients/:id/edit
          // -------------------------------------------------

          {
            path: ':id/edit',

            loadComponent: () =>
              import(
                './features/patients/patient-form/patient-form'
              )
                .then(
                  m => m.PatientForm
                )
          },


          // -------------------------------------------------
          // /patients/:id
          // -------------------------------------------------

          {
            path: ':id',

            loadComponent: () =>
              import(
                './features/patients/patient-profile/patient-profile'
              )
                .then(
                  m => m.PatientProfile
                )
          }

        ]
      },


      // ===================================================
      // DOCTORS
      // ===================================================

      {
        path: 'doctors',

        children: [

          // -------------------------------------------------
          // /doctors
          // -------------------------------------------------

          {
            path: '',

            loadComponent: () =>
              import(
                './features/doctors/doctor-list/doctor-list'
              )
                .then(
                  m => m.DoctorList
                )
          },


          // -------------------------------------------------
          // /doctors/register
          // -------------------------------------------------

          {
            path: 'register',

            loadComponent: () =>
              import(
                './features/doctors/doctor-form/doctor-form'
              )
                .then(
                  m => m.DoctorForm
                )
          },


          // -------------------------------------------------
          // /doctors/:id/edit
          // -------------------------------------------------

          {
            path: ':id/edit',

            loadComponent: () =>
              import(
                './features/doctors/doctor-form/doctor-form'
              )
                .then(
                  m => m.DoctorForm
                )
          },


          // -------------------------------------------------
          // /doctors/:id
          // -------------------------------------------------

          {
            path: ':id',

            loadComponent: () =>
              import(
                './features/doctors/doctor-profile/doctor-profile'
              )
                .then(
                  m => m.DoctorProfile
                )
          }

        ]
      },


      // ===================================================
      // DEPARTMENTS
      // ===================================================

      {
        path: 'departments',

        children: [

          // -------------------------------------------------
          // /departments
          // -------------------------------------------------

          {
            path: '',

            loadComponent: () =>
              import(
                './features/departments/department-list/department-list'
              )
                .then(
                  m => m.DepartmentList
                )
          },


          // -------------------------------------------------
          // /departments/register
          // -------------------------------------------------

          {
            path: 'register',

            loadComponent: () =>
              import(
                './features/departments/department-form/department-form'
              )
                .then(
                  m => m.DepartmentForm
                )
          },


          // -------------------------------------------------
          // /departments/:id/edit
          // -------------------------------------------------

          {
            path: ':id/edit',

            loadComponent: () =>
              import(
                './features/departments/department-form/department-form'
              )
                .then(
                  m => m.DepartmentForm
                )
          },


          // -------------------------------------------------
          // /departments/:id
          // -------------------------------------------------

          {
            path: ':id',

            loadComponent: () =>
              import(
                './features/departments/department-profile/department-profile'
              )
                .then(
                  m => m.DepartmentProfile
                )
          }

        ]
      },


      // ===================================================
      // APPOINTMENTS
      // ===================================================

      {
        path: 'appointments',

        children: [

          // -------------------------------------------------
          // /appointments
          // -------------------------------------------------

          {
            path: '',

            loadComponent: () =>
              import(
                './features/appointments/appointment-list/appointment-list'
              )
                .then(
                  m => m.AppointmentList
                )
          },


          // -------------------------------------------------
          // /appointments/register
          // -------------------------------------------------

          {
            path: 'register',

            loadComponent: () =>
              import(
                './features/appointments/appointment-register/appointment-register'
              )
                .then(
                  m => m.AppointmentRegister
                )
          },


          // -------------------------------------------------
          // /appointments/queue
          // -------------------------------------------------

          {
            path: 'queue',

            loadComponent: () =>
              import(
                './features/appointments/appointment-queue/appointment-queue'
              )
                .then(
                  m => m.AppointmentQueue
                )
          },


          // -------------------------------------------------
          // /appointments/:id/edit
          // -------------------------------------------------

          {
            path: ':id/edit',

            loadComponent: () =>
              import(
                './features/appointments/appointment-register/appointment-register'
              )
                .then(
                  m => m.AppointmentRegister
                )
          },


          // -------------------------------------------------
          // /appointments/:id/consultation
          // -------------------------------------------------

          {
            path: ':id/consultation',

            loadComponent: () =>
              import(
                './features/consultations/consultation-form/consultation-form'
              )
                .then(
                  m => m.ConsultationForm
                )
          },


          // -------------------------------------------------
          // /appointments/:id
          // -------------------------------------------------

          {
            path: ':id',

            loadComponent: () =>
              import(
                './features/appointments/appointment-details/appointment-details'
              )
                .then(
                  m => m.AppointmentDetails
                )
          }

        ]
      },


      // ===================================================
      // CONSULTATIONS
      // ===================================================

      {
        path: 'consultations',

        children: [

          // -------------------------------------------------
          // /consultations
          // -------------------------------------------------

          {
            path: '',

            loadComponent: () =>
              import(
                './features/consultations/consultation-list/consultation-list'
              )
                .then(
                  m => m.ConsultationList
                )
          },


          // -------------------------------------------------
          // /consultations/register
          // -------------------------------------------------

          {
            path: 'register',

            loadComponent: () =>
              import(
                './features/consultations/consultation-form/consultation-form'
              )
                .then(
                  m => m.ConsultationForm
                )
          },


          // -------------------------------------------------
          // /consultations/:id/edit
          // -------------------------------------------------

          {
            path: ':id/edit',

            loadComponent: () =>
              import(
                './features/consultations/consultation-form/consultation-form'
              )
                .then(
                  m => m.ConsultationForm
                )
          },


          // -------------------------------------------------
          // /consultations/:id
          // -------------------------------------------------

          {
            path: ':id',

            loadComponent: () =>
              import(
                './features/consultations/consultation-profile/consultation-profile'
              )
                .then(
                  m => m.ConsultationProfile
                )
          }

        ]
      },


      // ===================================================
      // PHARMACY
      // ===================================================

      {
        path: 'pharmacy',

        children: [

          // -------------------------------------------------
          // /pharmacy
          // -------------------------------------------------

          {
            path: '',

            loadComponent: () =>
              import(
                './features/pharmacy/pharmacy-dashboard/pharmacy-dashboard'
              )
                .then(
                  m => m.PharmacyDashboard
                )
          },


          // -------------------------------------------------
          // /pharmacy/queue
          // -------------------------------------------------

          {
            path: 'queue',

            loadComponent: () =>
              import(
                './features/pharmacy/pharmacy-queue/pharmacy-queue'
              )
                .then(
                  m => m.PharmacyQueue
                )
          },


          // -------------------------------------------------
          // /pharmacy/stock
          // -------------------------------------------------

          {
            path: 'stock',

            loadComponent: () =>
              import(
                './features/pharmacy/pharmacy-stock/pharmacy-stock'
              )
                .then(
                  m => m.PharmacyStock
                )
          },


          // -------------------------------------------------
          // /pharmacy/prescriptions/:id
          // -------------------------------------------------

          {
            path: 'prescriptions/:id',

            loadComponent: () =>
              import(
                './features/pharmacy/pharmacy-prescription/pharmacy-prescription'
              )
                .then(
                  m => m.PharmacyPrescription
                )
          }

        ]
      },


      // ===================================================
      // LABORATORY
      // ===================================================

      {
        path: 'laboratory',

        children: [

          // -------------------------------------------------
          // LABORATORY TESTS
          // -------------------------------------------------

          // /laboratory

          {
            path: '',

            loadComponent: () =>
              import(
                './features/laboratory/laboratory-list/laboratory-list'
              )
                .then(
                  m => m.LaboratoryList
                )
          },


          // /laboratory/register

          {
            path: 'register',

            loadComponent: () =>
              import(
                './features/laboratory/laboratory-register/laboratory-register'
              )
                .then(
                  m => m.LaboratoryRegister
                )
          },


          // -------------------------------------------------
          // LABORATORY REQUESTS
          // -------------------------------------------------

          // /laboratory/requests

          {
            path: 'requests',

            children: [

              // /laboratory/requests

              {
                path: '',

                loadComponent: () =>
                  import(
                    './features/laboratory/laboratory-requests/laboratory-request-list/laboratory-request-list'
                  )
                    .then(
                      m => m.LaboratoryRequestList
                    )
              },


              // /laboratory/requests/register

              {
                path: 'register',

                loadComponent: () =>
                  import(
                    './features/laboratory/laboratory-requests/laboratory-request-form/laboratory-request-form'
                  )
                    .then(
                      m => m.LaboratoryRequestForm
                    )
              },


              // /laboratory/requests/:id/edit

              {
                path: ':id/edit',

                loadComponent: () =>
                  import(
                    './features/laboratory/laboratory-requests/laboratory-request-form/laboratory-request-form'
                  )
                    .then(
                      m => m.LaboratoryRequestForm
                    )
              },


              // /laboratory/requests/:id

              {
                path: ':id',

                loadComponent: () =>
                  import(
                    './features/laboratory/laboratory-requests/laboratory-request-details/laboratory-request-details'
                  )
                    .then(
                      m => m.LaboratoryRequestDetails
                    )
              }

            ]
          },


          // -------------------------------------------------
          // LABORATORY TEST EDIT
          // -------------------------------------------------

          // /laboratory/:id/edit

          {
            path: ':id/edit',

            loadComponent: () =>
              import(
                './features/laboratory/laboratory-register/laboratory-register'
              )
                .then(
                  m => m.LaboratoryRegister
                )
          },


          // -------------------------------------------------
          // LABORATORY TEST DETAILS
          // -------------------------------------------------

          // /laboratory/:id

          {
            path: ':id',

            loadComponent: () =>
              import(
                './features/laboratory/laboratory-details/laboratory-details'
              )
                .then(
                  m => m.LaboratoryDetails
                )
          }

        ]
      },


      // ===================================================
      // ADMISSIONS
      // ===================================================

      {
        path: 'admissions',

        children: [

          // -------------------------------------------------
          // /admissions
          // -------------------------------------------------

          {
            path: '',

            loadComponent: () =>
              import(
                './features/admissions/admission-list/admission-list'
              )
                .then(
                  m => m.AdmissionList
                )
          },


          // -------------------------------------------------
          // /admissions/register
          // -------------------------------------------------

          {
            path: 'register',

            loadComponent: () =>
              import(
                './features/admissions/admission-register/admission-register'
              )
                .then(
                  m => m.AdmissionRegister
                )
          },


          // -------------------------------------------------
          // /admissions/:id/edit
          // -------------------------------------------------

          {
            path: ':id/edit',

            loadComponent: () =>
              import(
                './features/admissions/admission-edit/admission-edit'
              )
                .then(
                  m => m.AdmissionEdit
                )
          },


          // -------------------------------------------------
          // /admissions/:id
          // -------------------------------------------------

          {
            path: ':id',

            loadComponent: () =>
              import(
                './features/admissions/admission-details/admission-details'
              )
                .then(
                  m => m.AdmissionDetails
                )
          }

        ]
      },


      // ===================================================
      // BILLING
      // ===================================================

      {
        path: 'billing',

        children: [

          // -------------------------------------------------
          // /billing
          // -------------------------------------------------

          {
            path: '',

            loadComponent: () =>
              import(
                './features/billing/billing-list/billing-list'
              )
                .then(
                  m => m.BillingList
                )
          },


          // -------------------------------------------------
          // /billing/register
          // -------------------------------------------------

          {
            path: 'register',

            loadComponent: () =>
              import(
                './features/billing/billing-register/billing-register'
              )
                .then(
                  m => m.BillingRegister
                )
          },


          // -------------------------------------------------
          // /billing/:id/edit
          // -------------------------------------------------

          {
            path: ':id/edit',

            loadComponent: () =>
              import(
                './features/billing/billing-edit/billing-edit'
              )
                .then(
                  m => m.BillingEdit
                )
          },


          // -------------------------------------------------
          // /billing/:id
          // -------------------------------------------------

          {
            path: ':id',

            loadComponent: () =>
              import(
                './features/billing/billing-details/billing-details'
              )
                .then(
                  m => m.BillingDetails
                )
          }

        ]
      },


      // ===================================================
      // INVENTORY
      // ===================================================

      {
        path: 'inventory',

        children: [

          // -------------------------------------------------
          // /inventory
          // -------------------------------------------------

          {
            path: '',

            loadComponent: () =>
              import(
                './features/inventory/inventory-list/inventory-list'
              )
                .then(
                  m => m.InventoryList
                )
          },


          // -------------------------------------------------
          // /inventory/register
          // -------------------------------------------------

          {
            path: 'register',

            loadComponent: () =>
              import(
                './features/inventory/inventory-register/inventory-register'
              )
                .then(
                  m => m.InventoryRegister
                )
          },


          // -------------------------------------------------
          // /inventory/stock
          // -------------------------------------------------

          {
            path: 'stock',

            loadComponent: () =>
              import(
                './features/inventory/inventory-stock/inventory-stock'
              )
                .then(
                  m => m.InventoryStock
                )
          },


          // -------------------------------------------------
          // /inventory/:id/edit
          // -------------------------------------------------

          {
            path: ':id/edit',

            loadComponent: () =>
              import(
                './features/inventory/inventory-edit/inventory-edit'
              )
                .then(
                  m => m.InventoryEdit
                )
          },


          // -------------------------------------------------
          // /inventory/:id
          // -------------------------------------------------

          {
            path: ':id',

            loadComponent: () =>
              import(
                './features/inventory/inventory-details/inventory-details'
              )
                .then(
                  m => m.InventoryDetails
                )
          }

        ]
      },


      // ===================================================
      // REPORTS
      // ===================================================

      {
        path: 'reports',

        loadComponent: () =>
          import(
            './features/reports/report/report'
          )
            .then(
              m => m.ReportComponent
            )
      },


      // ===================================================
      // SETTINGS
      // ===================================================

      {
        path: 'settings',

        children: [

          // -------------------------------------------------
          // /settings/hospital
          // -------------------------------------------------

          {
            path: 'hospital',

            loadComponent: () =>
              import(
                './features/settings/hospital-settings/hospital-settings'
              )
                .then(
                  m => m.HospitalSettingsComponent
                )
          },


          // -------------------------------------------------
          // /settings/system
          // -------------------------------------------------

          {
            path: 'system',

            loadComponent: () =>
              import(
                './features/settings/system-preferences/system-preferences'
              )
                .then(
                  m => m.SystemPreferencesComponent
                )
          },


          // -------------------------------------------------
          // /settings/notifications
          // -------------------------------------------------

          {
            path: 'notifications',

            loadComponent: () =>
              import(
                './features/settings/notification-settings/notification-settings'
              )
                .then(
                  m => m.NotificationSettingsComponent
                )
          }

        ]
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

