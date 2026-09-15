// =====================================================
// SIDEBAR COMPONENT
// File:
// src/app/layout/sidebar/sidebar.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  Subject,
  takeUntil
} from 'rxjs';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  SettingsService
} from '../../core/services/settings.service';
import {
  TenantModuleService
} from '../../core/services/tenant/tenant-module.service';

// =====================================================
// SIDEBAR
// =====================================================

@Component({
  selector: 'app-sidebar',

  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './sidebar.html',

  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit, OnDestroy {
  // =====================================================
  // DESKTOP COLLAPSE STATE
  // =====================================================

   @Input() collapsed = false;
  @Input() mobileOpen = false;

  @Output() closeSidebar = new EventEmitter<void>();

  close(): void {
    this.closeSidebar.emit();
  }


  // ===================================================
  // DEPENDENCIES
  // ===================================================

  private readonly router =
    inject(Router);

  private readonly authService =
    inject(AuthService);

  private readonly settingsService =
    inject(SettingsService);
private readonly tenantModuleService =
  inject(TenantModuleService);
  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);


  // ===================================================
  // COMPONENT CLEANUP
  // ===================================================

  private readonly destroy$ =
    new Subject<void>();


  // ===================================================
  // HOSPITAL IDENTITY
  // ===================================================

  hospitalName =
    'Hospital Management System';

  hospitalCity =
    '';

  hospitalLogo =
    '';


  // ===================================================
  // LIFECYCLE
  // ===================================================

 ngOnInit(): void {

  this.loadHospitalIdentity();

  this.loadTenantModules();

}

// ===================================================
// LOAD TENANT MODULES
// ===================================================

private loadTenantModules(): void {

  this.tenantModuleService
    .loadModules()
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe({

      next: () => {

        this.changeDetectorRef.detectChanges();

      },

      error: error => {

        console.error(
          'Failed to load tenant modules:',
          error
        );

        this.changeDetectorRef.detectChanges();

      }

    });

}
  // ===================================================
  // LOAD HOSPITAL IDENTITY
  // ===================================================


  private loadHospitalIdentity(): void {

    this.settingsService.hospitalSettings$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({

        next: settings => {

          this.hospitalName =
            settings.hospitalName?.trim()
            || 'Hospital Management System';

          this.hospitalCity =
            settings.city?.trim()
            || '';

          this.hospitalLogo =
            settings.logoUrl?.trim()
            || '';


          // ==========================================
          // FORCE UI UPDATE
          // ==========================================

          this.changeDetectorRef.detectChanges();

        },

        error: error => {

          console.error(
            'Failed to read hospital identity:',
            error
          );

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // ===================================================
  // HOSPITAL LOGO ERROR
  // ===================================================

  onLogoError(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;

    if (image) {

      image.style.display =
        'none';

    }

  }


  // ===================================================
  // PERMISSION CHECK
  // ===================================================

  hasPermission(
    permission: string
  ): boolean {

    return this.authService.hasPermission(
      permission
    );

  }


  /**
   * Checks whether the user has at least one of the
   * supplied permissions.
   */
  hasAnyPermission(
    permissions: string[]
  ): boolean {

    return this.authService.hasAnyPermission(
      permissions
    );

  }
// ===================================================
// MODULE CHECK
// ===================================================

hasModule(
  moduleCode: string
): boolean {

  return this.tenantModuleService.hasModule(
    moduleCode
  );

}


// ===================================================
// MODULE + PERMISSION CHECK
// ===================================================

hasModulePermission(
  moduleCode: string,
  permission: string
): boolean {

  return (
    this.hasModule(moduleCode) &&
    this.hasPermission(permission)
  );

}


// ===================================================
// MODULE + ANY PERMISSION CHECK
// ===================================================

hasModuleAnyPermission(
  moduleCode: string,
  permissions: string[]
): boolean {

  return (
    this.hasModule(moduleCode) &&
    this.hasAnyPermission(permissions)
  );

}

  // ===================================================
  // NAVIGATION
  // ===================================================

  /**
   * Close the mobile sidebar after navigation.
   */
  navigate(): void {

    this.closeSidebar.emit();

  }


  // ===================================================
  // LOGOUT
  // ===================================================

  
  logout(): void {

    // ================================================
    // CLOSE SIDEBAR
    // ================================================

    this.closeSidebar.emit();


    // ================================================
    // CLEAR AUTHENTICATION
    // ================================================

    this.authService.logout();


    // ================================================
    // REDIRECT TO LOGIN
    // ================================================

    this.router.navigate(
      ['/login'],
      {
        replaceUrl: true
      }
    );

  }


  // ===================================================
  // DESTROY
  // ===================================================

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }

}