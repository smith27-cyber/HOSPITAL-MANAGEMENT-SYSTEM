// =====================================================
// PERMISSION GUARD
// File:
// src/app/core/guards/permission.guard.ts
// =====================================================

import { inject } from '@angular/core';

import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { AuthService } from '../services/auth.service';

// =====================================================
// PERMISSION GUARD
// =====================================================

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // ===================================================
  // REQUIRED PERMISSION
  // ===================================================

  const requiredPermission =
    route.data['permission'] as string | undefined;

  // ===================================================
  // DEBUG INFORMATION
  // ===================================================

  console.log('========================================');
  console.log('HMS Permission Guard');
  console.log('URL:', state.url);
  console.log('Required permission:', requiredPermission);
  console.log('Username:', authService.getUsername());
  console.log('Role:', authService.getRole());
  console.log('Roles:', authService.getRoles());
  console.log('Permissions:', authService.getPermissions());

  // ===================================================
  // AUTHENTICATION CHECK
  // ===================================================

  if (!authService.isAuthenticated()) {

    console.warn(
      'Permission guard: user is not authenticated.'
    );

    return router.parseUrl('/login');
  }

  // ===================================================
  // SUPER ADMIN
  // ===================================================
  //
  // SUPER_ADMIN is the Olives Tech platform administrator.
  // Allowing this role here is also useful as a safety net
  // if permissions are changed later.
  //
  // Backend authorization remains the final authority.
  //
  // ===================================================

  if (authService.hasRole('SUPER_ADMIN')) {

    console.log(
      'Permission guard: SUPER_ADMIN access granted.'
    );

    return true;
  }

  // ===================================================
  // NO PERMISSION CONFIGURED
  // ===================================================

  if (!requiredPermission) {

    console.log(
      'Permission guard: no permission required.'
    );

    return true;
  }

  // ===================================================
  // PERMISSION CHECK
  // ===================================================

  const hasPermission =
    authService.hasPermission(
      requiredPermission
    );

  console.log(
    'Permission check:',
    requiredPermission,
    '=>',
    hasPermission
  );

  // ===================================================
  // ACCESS GRANTED
  // ===================================================

  if (hasPermission) {

    console.log(
      'Permission guard: access granted.'
    );

    return true;
  }

  // ===================================================
  // ACCESS DENIED
  // ===================================================

  console.warn(
    'HMS permission denied',
    {
      permission: requiredPermission,
      url: state.url,
      username: authService.getUsername(),
      role: authService.getRole(),
      roles: authService.getRoles(),
      permissions: authService.getPermissions()
    }
  );

  // ===================================================
  // REDIRECT
  // ===================================================

  return router.parseUrl('/dashboard');
};