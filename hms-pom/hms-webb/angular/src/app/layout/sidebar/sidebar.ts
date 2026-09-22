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
  // INPUTS / OUTPUTS
  // =====================================================

  @Input() collapsed = false;
  @Input() mobileOpen = false;

  @Output() closeSidebar =
    new EventEmitter<void>();


  // =====================================================
  // DEPENDENCIES
  // =====================================================

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


  // =====================================================
  // CLEANUP
  // =====================================================

  private readonly destroy$ =
    new Subject<void>();


  // =====================================================
  // HOSPITAL IDENTITY
  // =====================================================

  hospitalName =
    'Hospital Management System';

  hospitalCity =
    '';

  hospitalLogo =
    '';


  // =====================================================
  // MODULE STATE
  // =====================================================

  /**
   * Prevents the navigation from rendering before
   * tenant modules have been loaded.
   */
  modulesLoaded = false;

  /**
   * Used when the tenant module request fails.
   *
   * We fail closed:
   * no tenant-specific module is shown until the
   * entitlement information is available.
   */
  modulesLoadFailed = false;


  // =====================================================
  // LIFECYCLE
  // =====================================================

  ngOnInit(): void {

    this.loadHospitalIdentity();

    this.loadTenantModules();

  }


  // =====================================================
  // LOAD TENANT MODULES
  // =====================================================

  private loadTenantModules(): void {

    this.modulesLoaded = false;
    this.modulesLoadFailed = false;

    this.tenantModuleService
      .loadModules()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({

        next: () => {

          this.modulesLoaded = true;
          this.modulesLoadFailed = false;

          this.changeDetectorRef.detectChanges();

        },

        error: error => {

          console.error(
            'Failed to load tenant modules:',
            error
          );

          /**
           * Fail closed.
           *
           * We do NOT display tenant-specific modules
           * if entitlement information could not be loaded.
           */
          this.modulesLoaded = false;
          this.modulesLoadFailed = true;

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD HOSPITAL IDENTITY
  // =====================================================

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


  // =====================================================
  // HOSPITAL LOGO ERROR
  // =====================================================

  onLogoError(event: Event): void {

    const image =
      event.target as HTMLImageElement;

    if (image) {

      image.style.display = 'none';

    }

  }


  // =====================================================
  // PERMISSION CHECK
  // =====================================================

  hasPermission(
    permission: string
  ): boolean {

    return this.authService.hasPermission(
      permission
    );

  }


  // =====================================================
  // ANY PERMISSION CHECK
  // =====================================================

  hasAnyPermission(
    permissions: string[]
  ): boolean {

    return this.authService.hasAnyPermission(
      permissions
    );

  }


  // =====================================================
  // MODULE CHECK
  // =====================================================

  hasModule(
    moduleCode: string
  ): boolean {

    /**
     * Never expose a tenant module until the
     * entitlement data has successfully loaded.
     */
    if (!this.modulesLoaded) {

      return false;

    }

    if (this.modulesLoadFailed) {

      return false;

    }

    return this.tenantModuleService.hasModule(
      moduleCode
    );

  }


  // =====================================================
  // MODULE + PERMISSION
  // =====================================================

  hasModulePermission(
    moduleCode: string,
    permission: string
  ): boolean {

    return (
      this.hasModule(moduleCode) &&
      this.hasPermission(permission)
    );

  }


  // =====================================================
  // MODULE + ANY PERMISSION
  // =====================================================

  hasModuleAnyPermission(
    moduleCode: string,
    permissions: string[]
  ): boolean {

    return (
      this.hasModule(moduleCode) &&
      this.hasAnyPermission(permissions)
    );

  }


  // =====================================================
  // NAVIGATION
  // =====================================================

  navigate(): void {

    this.closeSidebar.emit();

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    this.closeSidebar.emit();

    this.authService.logout();

    this.router.navigate(
      ['/login'],
      {
        replaceUrl: true
      }
    );

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }

}