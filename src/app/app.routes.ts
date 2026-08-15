import { Routes } from '@angular/router';

export const routes: Routes = [

  // Default route
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Authentication
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login')
        .then(m => m.Login)
  },

  // Protected application area
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(m => m.MainLayout),

    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard)
      }
    ]
  },
 {
  path: 'patients',
  loadComponent: () =>
    import('./features/patients/patient-list/patient-list')
      .then(m => m.PatientList)
},
{
  path: 'patients/register',
  loadComponent: () =>
    import('./features/patients/patient-form/patient-form')
      .then(m => m.PatientForm)
},
{
  path: 'patients/:id',
  loadComponent: () =>
    import('./features/patients/patient-profile/patient-profile')
      .then(m => m.PatientProfile)
},
  // Unknown routes
  {
    path: '**',
    redirectTo: 'login'
  },



];
