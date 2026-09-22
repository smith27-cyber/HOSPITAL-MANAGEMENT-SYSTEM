import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const platformGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const platformPermissions = [
    'PLATFORM_MODULE_VIEW',
    'PLATFORM_MODULE_MANAGE',
    'PLATFORM_PLAN_VIEW',
    'PLATFORM_PLAN_MANAGE',
    'PLATFORM_SUBSCRIPTION_VIEW',
    'PLATFORM_SUBSCRIPTION_MANAGE',
    'PLATFORM_REPORT_VIEW',
    'PLATFORM_AUDIT_VIEW'
  ];

  const hasPlatformAccess = platformPermissions.some(
    permission => authService.hasPermission(permission)
  );

  if (hasPlatformAccess) {
    return true;
  }

  console.warn('Platform access denied', {
    username: authService.getUsername(),
    role: authService.getRole()
  });

  return router.parseUrl('/dashboard');
};