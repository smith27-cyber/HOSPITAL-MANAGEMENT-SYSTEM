
// =====================================================
// AUTHENTICATION HTTP INTERCEPTOR
// File:
// src/app/core/interceptors/auth.interceptor.ts
// =====================================================

import {
  HttpInterceptorFn
} from '@angular/common/http';


// =====================================================
// AUTH INTERCEPTOR
// =====================================================

export const authInterceptor: HttpInterceptorFn =
  (req, next) => {

    // =================================================
    // GET TOKEN FROM CURRENT SESSION
    // =================================================

    const token =
      sessionStorage.getItem('hms_token');


    // =================================================
    // NO TOKEN
    // =================================================

    if (!token) {

      return next(req);

    }


    // =================================================
    // ADD BEARER TOKEN
    // =================================================

    const authenticatedRequest =
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });


    // =================================================
    // SEND REQUEST
    // =================================================

    return next(
      authenticatedRequest
    );

  };

