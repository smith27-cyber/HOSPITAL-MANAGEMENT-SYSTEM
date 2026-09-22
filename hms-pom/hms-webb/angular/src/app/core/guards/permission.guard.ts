
import {
  inject
} from '@angular/core';

import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import {
  AuthService
} from '../services/auth.service';


// =====================================================
// PERMISSION GUARD
// =====================================================

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {

  // ===================================================
  // DEPENDENCIES
  // ===================================================

  const authService =
    inject(AuthService);

  const router =
    inject(Router);


  // ===================================================
  // REQUIRED PERMISSION
  // ===================================================

  const requiredPermission =
    route.data['permission'] as
      string | undefined;


  // ===================================================
  // NO PERMISSION CONFIGURED
  // ===================================================
  //
  // If this route does not specify a permission,
  // allow it as long as the user passed authGuard.
  //
  // ===================================================

  if (
    !requiredPermission
  ) {

    return true;

  }


  // ===================================================
  // CHECK PERMISSION
  // ===================================================

  if (
    authService.hasPermission(
      requiredPermission
    )
  ) {

    return true;

  }


  // ===================================================
  // ACCESS DENIED
  // ===================================================

  console.warn(
    'HMS permission denied',
    {
      permission:
        requiredPermission,

      url:
        state.url,

      username:
        authService.getUsername(),

      role:
        authService.getRole()
    }
  );


  // ===================================================
  // REDIRECT
  // ===================================================
  //
  // Returning UrlTree is supported by CanActivateFn.
  //
  // ===================================================

  return router.parseUrl(
    '/dashboard'
  );

};