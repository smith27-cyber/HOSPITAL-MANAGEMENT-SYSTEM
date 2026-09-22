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

  @Input()
  collapsed = false;
  // ===================================================
  // SIDEBAR EVENT
  // ===================================================

  @Output()
  closeSidebar =
    new EventEmitter<void>();


  // ===================================================
  // DEPENDENCIES
  // ===================================================

  private readonly router =
    inject(Router);

  private readonly authService =
    inject(AuthService);

  private readonly settingsService =
    inject(SettingsService);

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