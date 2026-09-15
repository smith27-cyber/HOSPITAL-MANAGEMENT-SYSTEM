// =====================================================
// APPLICATION ROUTES
// File:
// src/app/app.routes.ts
// =====================================================

import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { platformGuard } from './core/guards/platform.guard';

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
        .then(m => m.Login)
  },


  // =====================================================
  // OLIVES TECH PLATFORM
  //
  // Separate layout for platform administration.
  // =====================================================

  {
    path: 'platform',

    canActivate: [
      authGuard,
      platformGuard
    ],

    loadComponent: () =>
      import('./layout/platform-layout/platform-layout')
        .then(m => m.PlatformLayout),

    children: [

      // =================================================
      // /platform
      // =================================================

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },


      // =================================================
      // /platform/dashboard
      // =================================================

      {
        path: 'dashboard',

        loadComponent: () =>
          import('./platform/dashboard/dashboard')
            .then(m => m.PlatformDashboard)
      },


      // =================================================
      // TENANTS
      // =================================================

      {
        path: 'tenants',

        children: [

          // -----------------------------------------------
          // /platform/tenants
          // -----------------------------------------------

          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'TENANT_VIEW'
            },

            loadComponent: () =>
              import('./platform/tenants/tenants')
                .then(m => m.Tenants)
          },


          // -----------------------------------------------
          // /platform/tenants/create
          // -----------------------------------------------

          {
            path: 'create',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'TENANT_CREATE'
            },

            loadComponent: () =>
              import(
                './platform/tenants/create-tenant/create-tenant'
              )
                .then(m => m.CreateTenant)
          },


          // -----------------------------------------------
          // /platform/tenants/:id/modules
          // -----------------------------------------------

          {
            path: ':id/modules',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PLATFORM_MODULE_MANAGE'
            },

            loadComponent: () =>
              import(
                './platform/tenants/tenant-modules/tenant-modules'
              )
                .then(m => m.TenantModules)
          },


          // -----------------------------------------------
          // /platform/tenants/:id/admin
          // -----------------------------------------------

          {
            path: ':id/admin',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'TENANT_ADMIN_CREATE'
            },

            loadComponent: () =>
              import(
                './platform/tenants/tenant-admin/tenant-admin'
              )
                .then(m => m.TenantAdmin)
          }

        ]
      },


      // =================================================
      // PLATFORM USERS
      //
      // Platform-wide users.
      //
      // URL:
      // /platform/users
      //
      // This is intentionally OUTSIDE the tenants
      // children because it is not tenant-scoped.
      // =================================================

      {
        path: 'users',

        canActivate: [
          permissionGuard
        ],

        data: {
          permission: 'PLATFORM_USER_VIEW'
        },

        loadComponent: () =>
          import('./platform/users/users')
            .then(m => m.Users)
      },


      // =================================================
      // PLANS
      // =================================================

      {
        path: 'plans',

        children: [

          // -----------------------------------------------
          // /platform/plans
          // -----------------------------------------------

          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PLATFORM_PLAN_VIEW'
            },

            loadComponent: () =>
              import('./platform/plans/plans')
                .then(m => m.Plans)
          },


          // -----------------------------------------------
          // /platform/plans/create
          // -----------------------------------------------

          {
            path: 'create',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PLATFORM_PLAN_MANAGE'
            },

            loadComponent: () =>
              import(
                './platform/plans/create-plan/create-plan'
              )
                .then(m => m.CreatePlan)
          }

        ]
      },


      // =================================================
      // SUBSCRIPTIONS
      // =================================================

      {
        path: 'subscriptions',

        children: [

          // -----------------------------------------------
          // /platform/subscriptions
          // -----------------------------------------------

          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PLATFORM_SUBSCRIPTION_VIEW'
            },

            loadComponent: () =>
              import(
                './platform/subscriptions/subscriptions'
              )
                .then(m => m.Subscriptions)
          },


          // -----------------------------------------------
          // /platform/subscriptions/create
          // -----------------------------------------------

          {
            path: 'create',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PLATFORM_SUBSCRIPTION_MANAGE'
            },

            loadComponent: () =>
              import(
                './platform/subscriptions/create-subscription/create-subscription'
              )
                .then(m => m.CreateSubscription)
          }

        ]
      },


      // =================================================
      // MODULES
      // =================================================

      // -------------------------------------------------
      // /platform/modules
      // -------------------------------------------------

      {
        path: 'modules',

        canActivate: [
          permissionGuard
        ],

        data: {
          permission: 'PLATFORM_MODULE_VIEW'
        },

        loadComponent: () =>
          import('./platform/modules/modules')
            .then(m => m.Modules)
      }

    ]
  },


  // =====================================================
  // MAIN HMS APPLICATION LAYOUT
  // AUTHENTICATED USERS ONLY
  // =====================================================

  {
    path: '',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(m => m.MainLayout),

    children: [

      // ===================================================
      // DASHBOARD
      // ===================================================

      {
        path: 'dashboard',

        canActivate: [
          permissionGuard
        ],

        data: {
          permission: 'DASHBOARD_VIEW'
        },

        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard)
      },


      // ===================================================
      // PATIENTS
      // ===================================================

      {
        path: 'patients',

        children: [

          // /patients
          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PATIENT_VIEW'
            },

            loadComponent: () =>
              import(
                './features/patients/patient-list/patient-list'
              )
                .then(m => m.PatientList)
          },


          // /patients/register
          {
            path: 'register',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PATIENT_CREATE'
            },

            loadComponent: () =>
              import(
                './features/patients/patient-form/patient-form'
              )
                .then(m => m.PatientForm)
          },


          // /patients/:id/edit
          {
            path: ':id/edit',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PATIENT_UPDATE'
            },

            loadComponent: () =>
              import(
                './features/patients/patient-form/patient-form'
              )
                .then(m => m.PatientForm)
          },


          // /patients/:id
          {
            path: ':id',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PATIENT_VIEW'
            },

            loadComponent: () =>
              import(
                './features/patients/patient-profile/patient-profile'
              )
                .then(m => m.PatientProfile)
          }

        ]
      },


      // ===================================================
      // DOCTORS
      // ===================================================

      {
        path: 'doctors',

        children: [

          // /doctors
          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'DOCTOR_VIEW'
            },

            loadComponent: () =>
              import(
                './features/doctors/doctor-list/doctor-list'
              )
                .then(m => m.DoctorList)
          },


          // /doctors/register
          {
            path: 'register',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'DOCTOR_CREATE'
            },

            loadComponent: () =>
              import(
                './features/doctors/doctor-form/doctor-form'
              )
                .then(m => m.DoctorForm)
          },


          // /doctors/:id/edit
          {
            path: ':id/edit',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'DOCTOR_UPDATE'
            },

            loadComponent: () =>
              import(
                './features/doctors/doctor-form/doctor-form'
              )
                .then(m => m.DoctorForm)
          },


          // /doctors/:id
          {
            path: ':id',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'DOCTOR_VIEW'
            },

            loadComponent: () =>
              import(
                './features/doctors/doctor-profile/doctor-profile'
              )
                .then(m => m.DoctorProfile)
          }

        ]
      },


      // ===================================================
      // DEPARTMENTS
      // ===================================================

      {
        path: 'departments',

        children: [

          // /departments
          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'DEPARTMENT_VIEW'
            },

            loadComponent: () =>
              import(
                './features/departments/department-list/department-list'
              )
                .then(m => m.DepartmentList)
          },


          // /departments/register
          {
            path: 'register',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'DEPARTMENT_CREATE'
            },

            loadComponent: () =>
              import(
                './features/departments/department-form/department-form'
              )
                .then(m => m.DepartmentForm)
          },


          // /departments/:id/edit
          {
            path: ':id/edit',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'DEPARTMENT_UPDATE'
            },

            loadComponent: () =>
              import(
                './features/departments/department-form/department-form'
              )
                .then(m => m.DepartmentForm)
          },


          // /departments/:id
          {
            path: ':id',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'DEPARTMENT_VIEW'
            },

            loadComponent: () =>
              import(
                './features/departments/department-profile/department-profile'
              )
                .then(m => m.DepartmentProfile)
          }

        ]
      },


      // ===================================================
      // APPOINTMENTS
      // ===================================================

      {
        path: 'appointments',

        children: [

          // /appointments
          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'APPOINTMENT_VIEW'
            },

            loadComponent: () =>
              import(
                './features/appointments/appointment-list/appointment-list'
              )
                .then(m => m.AppointmentList)
          },


          // /appointments/register
          {
            path: 'register',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'APPOINTMENT_CREATE'
            },

            loadComponent: () =>
              import(
                './features/appointments/appointment-register/appointment-register'
              )
                .then(m => m.AppointmentRegister)
          },


          // /appointments/queue
          {
            path: 'queue',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'APPOINTMENT_QUEUE_VIEW'
            },

            loadComponent: () =>
              import(
                './features/appointments/appointment-queue/appointment-queue'
              )
                .then(m => m.AppointmentQueue)
          },


          // /appointments/:id/edit
          {
            path: ':id/edit',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'APPOINTMENT_UPDATE'
            },

            loadComponent: () =>
              import(
                './features/appointments/appointment-register/appointment-register'
              )
                .then(m => m.AppointmentRegister)
          },


          // /appointments/:id/consultation
          {
            path: ':id/consultation',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'CONSULTATION_CREATE'
            },

            loadComponent: () =>
              import(
                './features/consultations/consultation-form/consultation-form'
              )
                .then(m => m.ConsultationForm)
          },


          // /appointments/:id
          {
            path: ':id',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'APPOINTMENT_VIEW'
            },

            loadComponent: () =>
              import(
                './features/appointments/appointment-details/appointment-details'
              )
                .then(m => m.AppointmentDetails)
          }

        ]
      },


      // ===================================================
      // CONSULTATIONS
      // ===================================================

      {
        path: 'consultations',

        children: [

          // /consultations
          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'CONSULTATION_VIEW'
            },

            loadComponent: () =>
              import(
                './features/consultations/consultation-list/consultation-list'
              )
                .then(m => m.ConsultationList)
          },


          // /consultations/register
          {
            path: 'register',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'CONSULTATION_CREATE'
            },

            loadComponent: () =>
              import(
                './features/consultations/consultation-form/consultation-form'
              )
                .then(m => m.ConsultationForm)
          },


          // /consultations/:id/edit
          {
            path: ':id/edit',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'CONSULTATION_UPDATE'
            },

            loadComponent: () =>
              import(
                './features/consultations/consultation-form/consultation-form'
              )
                .then(m => m.ConsultationForm)
          },


          // /consultations/:id
          {
            path: ':id',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'CONSULTATION_VIEW'
            },

            loadComponent: () =>
              import(
                './features/consultations/consultation-profile/consultation-profile'
              )
                .then(m => m.ConsultationProfile)
          }

        ]
      },


      // ===================================================
      // PHARMACY
      // ===================================================

      {
        path: 'pharmacy',

        children: [

          // /pharmacy
          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PHARMACY_VIEW'
            },

            loadComponent: () =>
              import(
                './features/pharmacy/pharmacy-dashboard/pharmacy-dashboard'
              )
                .then(m => m.PharmacyDashboard)
          },


          // /pharmacy/queue
          {
            path: 'queue',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PHARMACY_VIEW'
            },

            loadComponent: () =>
              import(
                './features/pharmacy/pharmacy-queue/pharmacy-queue'
              )
                .then(m => m.PharmacyQueue)
          },


          // /pharmacy/stock
          {
            path: 'stock',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PHARMACY_STOCK_VIEW'
            },

            loadComponent: () =>
              import(
                './features/pharmacy/pharmacy-stock/pharmacy-stock'
              )
                .then(m => m.PharmacyStock)
          },


          // /pharmacy/prescriptions/:id
          {
            path: 'prescriptions/:id',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'PHARMACY_PRESCRIPTION_VIEW'
            },

            loadComponent: () =>
              import(
                './features/pharmacy/pharmacy-prescription/pharmacy-prescription'
              )
                .then(m => m.PharmacyPrescription)
          }

        ]
      },


      // ===================================================
      // LABORATORY
      // ===================================================

      {
        path: 'laboratory',

        children: [

          // /laboratory
          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'LABORATORY_VIEW'
            },

            loadComponent: () =>
              import(
                './features/laboratory/laboratory-list/laboratory-list'
              )
                .then(m => m.LaboratoryList)
          },


          // /laboratory/register
          {
            path: 'register',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'LABORATORY_TEST_CREATE'
            },

            loadComponent: () =>
              import(
                './features/laboratory/laboratory-register/laboratory-register'
              )
                .then(m => m.LaboratoryRegister)
          },


          // =================================================
          // LABORATORY REQUESTS
          // =================================================

          {
            path: 'requests',

            children: [

              // /laboratory/requests
              {
                path: '',

                canActivate: [
                  permissionGuard
                ],

                data: {
                  permission: 'LABORATORY_REQUEST_VIEW'
                },

                loadComponent: () =>
                  import(
                    './features/laboratory/laboratory-requests/laboratory-request-list/laboratory-request-list'
                  )
                    .then(m => m.LaboratoryRequestList)
              },


              // /laboratory/requests/register
              {
                path: 'register',

                canActivate: [
                  permissionGuard
                ],

                data: {
                  permission: 'LABORATORY_REQUEST_CREATE'
                },

                loadComponent: () =>
                  import(
                    './features/laboratory/laboratory-requests/laboratory-request-form/laboratory-request-form'
                  )
                    .then(m => m.LaboratoryRequestForm)
              },


              // /laboratory/requests/:id/edit
              {
                path: ':id/edit',

                canActivate: [
                  permissionGuard
                ],

                data: {
                  permission: 'LABORATORY_REQUEST_UPDATE'
                },

                loadComponent: () =>
                  import(
                    './features/laboratory/laboratory-requests/laboratory-request-form/laboratory-request-form'
                  )
                    .then(m => m.LaboratoryRequestForm)
              },


              // /laboratory/requests/:id
              {
                path: ':id',

                canActivate: [
                  permissionGuard
                ],

                data: {
                  permission: 'LABORATORY_REQUEST_VIEW'
                },

                loadComponent: () =>
                  import(
                    './features/laboratory/laboratory-requests/laboratory-request-details/laboratory-request-details'
                  )
                    .then(m => m.LaboratoryRequestDetails)
              }

            ]
          },


          // /laboratory/:id/edit
          {
            path: ':id/edit',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'LABORATORY_TEST_UPDATE'
            },

            loadComponent: () =>
              import(
                './features/laboratory/laboratory-register/laboratory-register'
              )
                .then(m => m.LaboratoryRegister)
          },


          // /laboratory/:id
          {
            path: ':id',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'LABORATORY_VIEW'
            },

            loadComponent: () =>
              import(
                './features/laboratory/laboratory-details/laboratory-details'
              )
                .then(m => m.LaboratoryDetails)
          }

        ]
      },


      // ===================================================
      // ADMISSIONS
      // ===================================================

      {
        path: 'admissions',

        children: [

          // /admissions
          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'ADMISSION_VIEW'
            },

            loadComponent: () =>
              import(
                './features/admissions/admission-list/admission-list'
              )
                .then(m => m.AdmissionList)
          },


          // /admissions/register
          {
            path: 'register',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'ADMISSION_CREATE'
            },

            loadComponent: () =>
              import(
                './features/admissions/admission-register/admission-register'
              )
                .then(m => m.AdmissionRegister)
          },


          // /admissions/:id/edit
          {
            path: ':id/edit',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'ADMISSION_UPDATE'
            },

            loadComponent: () =>
              import(
                './features/admissions/admission-edit/admission-edit'
              )
                .then(m => m.AdmissionEdit)
          },


          // /admissions/:id
          {
            path: ':id',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'ADMISSION_VIEW'
            },

            loadComponent: () =>
              import(
                './features/admissions/admission-details/admission-details'
              )
                .then(m => m.AdmissionDetails)
          }

        ]
      },


      // ===================================================
      // BILLING
      // ===================================================

      {
        path: 'billing',

        children: [

          // /billing
          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'BILLING_VIEW'
            },

            loadComponent: () =>
              import(
                './features/billing/billing-list/billing-list'
              )
                .then(m => m.BillingList)
          },


          // /billing/register
          {
            path: 'register',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'BILLING_CREATE'
            },

            loadComponent: () =>
              import(
                './features/billing/billing-register/billing-register'
              )
                .then(m => m.BillingRegister)
          },


          // /billing/:id/edit
          {
            path: ':id/edit',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'BILLING_UPDATE'
            },

            loadComponent: () =>
              import(
                './features/billing/billing-edit/billing-edit'
              )
                .then(m => m.BillingEdit)
          },


          // /billing/:id
          {
            path: ':id',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'BILLING_VIEW'
            },

            loadComponent: () =>
              import(
                './features/billing/billing-details/billing-details'
              )
                .then(m => m.BillingDetails)
          }

        ]
      },


      // ===================================================
      // INVENTORY
      // ===================================================

      {
        path: 'inventory',

        children: [

          // /inventory
          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'INVENTORY_VIEW'
            },

            loadComponent: () =>
              import(
                './features/inventory/inventory-list/inventory-list'
              )
                .then(m => m.InventoryList)
          },


          // /inventory/register
          {
            path: 'register',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'INVENTORY_CREATE'
            },

            loadComponent: () =>
              import(
                './features/inventory/inventory-register/inventory-register'
              )
                .then(m => m.InventoryRegister)
          },


          // /inventory/stock
          {
            path: 'stock',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'INVENTORY_VIEW'
            },

            loadComponent: () =>
              import(
                './features/inventory/inventory-stock/inventory-stock'
              )
                .then(m => m.InventoryStock)
          },


          // /inventory/:id/edit
          {
            path: ':id/edit',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'INVENTORY_UPDATE'
            },

            loadComponent: () =>
              import(
                './features/inventory/inventory-edit/inventory-edit'
              )
                .then(m => m.InventoryEdit)
          },


          // /inventory/:id
          {
            path: ':id',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'INVENTORY_VIEW'
            },

            loadComponent: () =>
              import(
                './features/inventory/inventory-details/inventory-details'
              )
                .then(m => m.InventoryDetails)
          }

        ]
      },


      // ===================================================
      // REPORTS
      // ===================================================

      {
        path: 'reports',

        canActivate: [
          permissionGuard
        ],

        data: {
          permission: 'REPORT_VIEW'
        },

        loadComponent: () =>
          import(
            './features/reports/report/report'
          )
            .then(m => m.ReportComponent)
      },


      // ===================================================
      // SETTINGS
      // ===================================================

      {
        path: 'settings',

        children: [

          // /settings
          {
            path: '',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'SETTINGS_VIEW'
            },

            loadComponent: () =>
              import(
                './features/settings/settings/settings'
              )
                .then(m => m.Settings)
          },


          // /settings/hospital
          {
            path: 'hospital',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'SETTINGS_HOSPITAL_VIEW'
            },

            loadComponent: () =>
              import(
                './features/settings/hospital-settings/hospital-settings'
              )
                .then(m => m.HospitalSettingsComponent)
          },


          // /settings/system
          {
            path: 'system',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'SETTINGS_SYSTEM_VIEW'
            },

            loadComponent: () =>
              import(
                './features/settings/system-preferences/system-preferences'
              )
                .then(m => m.SystemPreferencesComponent)
          },


          // /settings/notifications
          {
            path: 'notifications',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'SETTINGS_NOTIFICATION_VIEW'
            },

            loadComponent: () =>
              import(
                './features/settings/notification-settings/notification-settings'
              )
                .then(m => m.NotificationSettingsComponent)
          },


          // /settings/users
          {
            path: 'users',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'SETTINGS_USER_MANAGE'
            },

            loadComponent: () =>
              import(
                './features/settings/user-management/user-management'
              )
                .then(m => m.UserManagementComponent)
          },


          // /settings/profile
          {
            path: 'profile',

            canActivate: [
              permissionGuard
            ],

            data: {
              permission: 'SETTINGS_VIEW'
            },

            loadComponent: () =>
              import(
                './features/settings/profile-settings/profile-settings'
              )
                .then(m => m.ProfileSettings)
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