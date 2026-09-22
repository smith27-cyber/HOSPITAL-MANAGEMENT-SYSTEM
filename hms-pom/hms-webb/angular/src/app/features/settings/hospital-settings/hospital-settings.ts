/**
 * =====================================================
 * TENANT / ORGANIZATION SETTINGS COMPONENT
 * File:
 * src/app/features/settings/hospital-settings/hospital-settings.ts
 * =====================================================
 *
 * Multitenant rule:
 *
 * This component NEVER sends tenantId.
 *
 * The backend resolves the current tenant through:
 *
 * TenantContext.requireTenantId()
 *
 * Therefore the same component works independently
 * for every tenant.
 * =====================================================
 */

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  HospitalSettings
} from '../../../shared/models/settings.model';

import {
  SettingsService
} from '../../../core/services/settings.service';


@Component({
  selector: 'app-hospital-settings',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './hospital-settings.html',

  styleUrl:
    './hospital-settings.css'
})
export class HospitalSettingsComponent
  implements OnInit {


  // =====================================================
  // STATE
  // =====================================================

  settings:
    HospitalSettings = {

    hospitalName: '',

    registrationNumber: '',

    phone: '',

    email: '',

    address: '',

    city: '',

    country: 'Uganda',

    website: '',

    logoUrl: ''

  };


  isLoading =
    false;

  isSaving =
    false;

  isResetting =
    false;

  errorMessage =
    '';

  successMessage =
    '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private readonly settingsService:
      SettingsService,

    private readonly router:
      Router,

    private readonly changeDetectorRef:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadSettings();

  }


  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  loadSettings(): void {

    this.isLoading =
      true;

    this.errorMessage =
      '';

    this.successMessage =
      '';

    this.changeDetectorRef.detectChanges();


    this.settingsService
      .getHospitalSettings()
      .subscribe({

        next: settings => {

          this.settings = {
            ...settings
          };

          this.isLoading =
            false;

          this.changeDetectorRef.detectChanges();

        },

        error: error => {

          console.error(
            'Failed to load organization settings:',
            error
          );

          this.isLoading =
            false;

          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load organization settings.'
            );

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  saveSettings(): void {

    if (
      this.isSaving ||
      this.isResetting
    ) {

      return;

    }


    this.errorMessage =
      '';

    this.successMessage =
      '';


    if (
      !this.settings.hospitalName?.trim()
    ) {

      this.errorMessage =
        'Organization name is required.';

      this.changeDetectorRef.detectChanges();

      return;

    }


    this.isSaving =
      true;

    this.changeDetectorRef.detectChanges();


    const payload:
      HospitalSettings = {

      hospitalName:
        this.settings.hospitalName.trim(),

      registrationNumber:
        this.cleanValue(
          this.settings.registrationNumber
        ),

      phone:
        this.cleanValue(
          this.settings.phone
        ),

      email:
        this.cleanValue(
          this.settings.email
        ),

      address:
        this.cleanValue(
          this.settings.address
        ),

      city:
        this.cleanValue(
          this.settings.city
        ),

      country:
        this.cleanValue(
          this.settings.country
        ) || 'Uganda',

      website:
        this.cleanValue(
          this.settings.website
        ),

      logoUrl:
        this.cleanValue(
          this.settings.logoUrl
        )

    };


    this.settingsService
      .updateHospitalSettings(
        payload
      )
      .subscribe({

        next: updatedSettings => {

          this.settings = {
            ...updatedSettings
          };

          this.isSaving =
            false;

          this.successMessage =
            'Organization settings saved successfully.';

          this.changeDetectorRef.detectChanges();

        },

        error: error => {

          console.error(
            'Failed to save organization settings:',
            error
          );

          this.isSaving =
            false;

          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to save organization settings.'
            );

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // RESET SETTINGS
  // =====================================================

  resetSettings(): void {

    if (
      this.isSaving ||
      this.isResetting
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        'Reset this organization\'s settings to the tenant defaults?'
      );


    if (!confirmed) {

      return;

    }


    this.errorMessage =
      '';

    this.successMessage =
      '';

    this.isResetting =
      true;

    this.changeDetectorRef.detectChanges();


    this.settingsService
      .resetHospitalSettings()
      .subscribe({

        next: settings => {

          this.settings = {
            ...settings
          };

          this.isResetting =
            false;

          this.successMessage =
            'Organization settings have been reset successfully.';

          this.changeDetectorRef.detectChanges();

        },

        error: error => {

          console.error(
            'Failed to reset organization settings:',
            error
          );

          this.isResetting =
            false;

          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to reset organization settings.'
            );

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/settings'
    ]);

  }


  // =====================================================
  // LOGO PREVIEW
  // =====================================================

  hasLogo(): boolean {

    return !!this.settings.logoUrl?.trim();

  }


  // =====================================================
  // CLEAN VALUE
  // =====================================================

  private cleanValue(
    value:
      string |
      null |
      undefined
  ): string {

    return value?.trim() || '';

  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (
      error?.error?.message
    ) {

      return error.error.message;

    }


    if (
      error?.error?.error
    ) {

      return error.error.error;

    }


    if (
      error?.message
    ) {

      return error.message;

    }


    if (
      error?.status === 403
    ) {

      return 'You do not have permission to manage organization settings.';

    }


    return fallback;

  }

}