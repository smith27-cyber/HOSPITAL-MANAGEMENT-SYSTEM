// =====================================================
// HMS MAIN LAYOUT
// File:
// src/app/layout/main-layout/main-layout.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';

import { ThemeService } from '../../core/services/theme.service';
import { SettingsService } from '../../core/services/settings.service';

import { SystemSettings } from '../../shared/models/settings.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Sidebar,
    Header
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit {

  // =====================================================
  // MOBILE SIDEBAR STATE
  // =====================================================

  sidebarOpen = false;


  // =====================================================
  // DESKTOP SIDEBAR STATE
  // =====================================================

  sidebarCollapsed = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly settingsService: SettingsService,
    private readonly themeService: ThemeService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadTenantHospitalSettings();

    this.loadTenantSystemPreferences();

  }


  // =====================================================
  // LOAD CURRENT TENANT HOSPITAL SETTINGS
  // =====================================================

  private loadTenantHospitalSettings(): void {

    this.settingsService
      .getHospitalSettings()
      .subscribe({

        next: () => {

          /*
           * SettingsService updates its
           * hospitalSettings$ BehaviorSubject.
           *
           * Sidebar, Header and Dashboard subscribe
           * to that subject and automatically receive
           * the current tenant's identity.
           */

          this.cdr.detectChanges();

        },

        error: (error: unknown) => {

          console.error(
            'Failed to load tenant hospital settings:',
            error
          );

          /*
           * Do not block the application if hospital
           * settings cannot be loaded.
           */

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD CURRENT TENANT SYSTEM PREFERENCES
  // =====================================================

  private loadTenantSystemPreferences(): void {

    /*
     * IMPORTANT:
     *
     * getSystemPreferences() performs the actual HTTP
     * request to:
     *
     * GET /api/settings/system
     *
     * The backend determines the tenant from the JWT.
     *
     * No tenantId is sent from Angular.
     */

    this.settingsService
      .getSystemPreferences()
      .subscribe({

        next: (settings: SystemSettings) => {

          /*
           * Apply the current tenant's saved theme.
           */

          this.themeService
            .applySystemSettings(settings);

        },

        error: (error: unknown) => {

          console.error(
            'Failed to load tenant system preferences:',
            error
          );

          /*
           * Safe fallback.
           *
           * The application remains usable even if
           * tenant preferences cannot be loaded.
           */

          this.themeService.applyTheme(
            'System'
          );

        }

      });

  }


  // =====================================================
  // TOGGLE SIDEBAR
  // =====================================================

  toggleSidebar(): void {

    /*
     * Mobile
     */

    if (window.innerWidth <= 700) {

      this.sidebarOpen =
        !this.sidebarOpen;

      this.cdr.detectChanges();

      return;

    }


    /*
     * Desktop / tablet
     */

    this.sidebarCollapsed =
      !this.sidebarCollapsed;

    this.cdr.detectChanges();

  }


  // =====================================================
  // CLOSE SIDEBAR
  // =====================================================

  closeSidebar(): void {

    this.sidebarOpen = false;

    this.cdr.detectChanges();

  }

}