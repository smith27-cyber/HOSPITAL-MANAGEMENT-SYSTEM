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

  // Unknown routes
  {
    path: '**',
    redirectTo: 'login'
  }

];
