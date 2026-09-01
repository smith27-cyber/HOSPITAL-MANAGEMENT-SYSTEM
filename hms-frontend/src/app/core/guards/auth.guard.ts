// =====================================================
// AUTHENTICATION GUARD
// File:
// src/app/core/guards/auth.guard.ts
// =====================================================

import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';


// =====================================================
// AUTH GUARD
// =====================================================

export const authGuard: CanActivateFn = () => {

  const authService =
    inject(AuthService);

  const router =
    inject(Router);


  // ===================================================
  // USER IS AUTHENTICATED
  // ===================================================

  if (authService.isAuthenticated()) {

    return true;

  }


  // ===================================================
  // USER IS NOT AUTHENTICATED
  // ===================================================

  return router.createUrlTree(
    ['/login']
  );

};