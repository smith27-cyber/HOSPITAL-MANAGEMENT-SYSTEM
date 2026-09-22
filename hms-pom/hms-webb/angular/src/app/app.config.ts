
// =====================================================
// APPLICATION CONFIG
// File:
// src/app/app.config.ts
// =====================================================

import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import {
  provideRouter
} from '@angular/router';

import {
  routes
} from './app.routes';

import {
  authInterceptor
} from './core/interceptors/auth.interceptor';


// =====================================================
// APPLICATION CONFIG
// =====================================================

export const appConfig: ApplicationConfig = {

  providers: [

    // =================================================
    // GLOBAL ERROR LISTENERS
    // =================================================

    provideBrowserGlobalErrorListeners(),


    // =================================================
    // ZONE CHANGE DETECTION
    // =================================================

    provideZoneChangeDetection({
      eventCoalescing: true
    }),


    // =================================================
    // HTTP CLIENT
    // =================================================

    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    ),


    // =================================================
    // ROUTER
    // =================================================

    provideRouter(routes)

  ]

};

