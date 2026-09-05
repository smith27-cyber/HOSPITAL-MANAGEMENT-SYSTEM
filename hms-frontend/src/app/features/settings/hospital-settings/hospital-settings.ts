// =====================================================
// HOSPITAL SETTINGS COMPONENT
// File:
// src/app/features/settings/hospital-settings/hospital-settings.ts
// =====================================================

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

  templateUrl: './hospital-settings.html',

  styleUrl: './hospital-settings.css'
})
export class HospitalSettingsComponent
  implements OnInit {


  // =====================================================
  // SETTINGS
  // =====================================================

  settings: HospitalSettings = {

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


  // =====================================================
  // STATE
  // =====================================================

  loading = true;

  saving = false;

  resetting = false;


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
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadSettings();

  }


  // =====================================================
  // LOAD
  // =====================================================

  private loadSettings(): void {

    this.loading = true;


    this.settingsService
      .getHospitalSettings()
      .subscribe({

        next: (
          settings: HospitalSettings
        ) => {

          this.settings =
            this.normalizeSettings(settings);

          this.loading = false;

          this.changeDetectorRef.detectChanges();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load hospital settings:',
            error
          );

          this.loading = false;

          this.changeDetectorRef.detectChanges();


          window.alert(
            'Unable to load hospital settings. Please make sure the HMS backend is running.'
          );

        }

      });

  }


  // =====================================================
  // SAVE
  // =====================================================

  saveSettings(): void {

    if (
      this.saving ||
      this.resetting
    ) {

      return;

    }


    this.prepareSettings();


    // ===================================================
    // REQUIRED VALIDATION
    // ===================================================

    if (!this.settings.hospitalName) {

      window.alert(
        'Please enter the hospital name.'
      );

      return;

    }


    // ===================================================
    // EMAIL VALIDATION
    // ===================================================

    if (
      this.settings.email &&
      !this.isValidEmail(
        this.settings.email
      )
    ) {

      window.alert(
        'Please enter a valid email address.'
      );

      return;

    }


    // ===================================================
    // WEBSITE VALIDATION
    // ===================================================

    if (
      this.settings.website &&
      !this.isValidUrl(
        this.settings.website
      )
    ) {

      window.alert(
        'Please enter a valid website URL, for example https://www.hospital.com'
      );

      return;

    }


    // ===================================================
    // LOGO URL VALIDATION
    // ===================================================

    if (
      this.settings.logoUrl &&
      !this.isValidUrl(
        this.settings.logoUrl
      )
    ) {

      window.alert(
        'Please enter a valid logo URL.'
      );

      return;

    }


    // ===================================================
    // START SAVE
    // ===================================================

    this.saving = true;

    this.changeDetectorRef.detectChanges();


    const payload: HospitalSettings = {

      ...this.settings

    };


    // ===================================================
    // BACKEND SAVE
    // ===================================================

    this.settingsService
      .updateHospitalSettings(payload)
      .subscribe({

        next: (
          updatedSettings: HospitalSettings
        ) => {

          this.settings =
            this.normalizeSettings(
              updatedSettings
            );


          this.saving = false;

          this.changeDetectorRef.detectChanges();


          window.alert(
            'Hospital information saved successfully.'
          );

        },


        error: (
          error: any
        ) => {

          console.error(
            'Failed to save hospital settings:',
            error
          );


          this.saving = false;

          this.changeDetectorRef.detectChanges();


          let message =
            'Failed to save hospital information. Please try again.';


          if (error?.status === 0) {

            message =
              'Unable to connect to the HMS backend on port 8081.';

          }
          else if (error?.status === 400) {

            message =
              error?.error?.message ||
              'The hospital information is invalid.';

          }
          else if (error?.status === 401) {

            message =
              'Your session has expired. Please log in again.';

          }
          else if (error?.status === 403) {

            message =
              'You do not have permission to update hospital settings.';

          }
          else if (error?.status === 500) {

            message =
              'The server encountered an error while saving hospital settings. Check the Spring Boot console.';

          }


          window.alert(message);

        }

      });

  }


  // =====================================================
  // RESET
  // =====================================================

  resetSettings(): void {

    if (
      this.saving ||
      this.resetting
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        'Are you sure you want to reset the hospital information? This will replace the current saved hospital details with the system defaults.'
      );


    if (!confirmed) {

      return;

    }


    this.resetting = true;

    this.changeDetectorRef.detectChanges();


    this.settingsService
      .resetHospitalSettings()
      .subscribe({

        next: (
          settings: HospitalSettings
        ) => {

          this.settings =
            this.normalizeSettings(
              settings
            );


          this.resetting = false;

          this.changeDetectorRef.detectChanges();


          window.alert(
            'Hospital information has been reset successfully.'
          );

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to reset hospital settings:',
            error
          );


          this.resetting = false;

          this.changeDetectorRef.detectChanges();


          window.alert(
            'Failed to reset hospital information. Please try again.'
          );

        }

      });

  }


  // =====================================================
  // BACK
  // =====================================================

  goBack(): void {

    if (
      this.saving ||
      this.resetting
    ) {

      return;

    }


    this.router.navigate([
      '/settings'
    ]);

  }


  // =====================================================
  // PREPARE SETTINGS
  // =====================================================

  private prepareSettings(): void {

    this.settings.hospitalName =
      this.settings.hospitalName
        ?.trim() ?? '';


    this.settings.registrationNumber =
      this.settings.registrationNumber
        ?.trim() ?? '';


    this.settings.phone =
      this.settings.phone
        ?.trim() ?? '';


    this.settings.email =
      this.settings.email
        ?.trim()
        .toLowerCase() ?? '';


    this.settings.address =
      this.settings.address
        ?.trim() ?? '';


    this.settings.city =
      this.settings.city
        ?.trim() ?? '';


    this.settings.country =
      this.settings.country
        ?.trim() || 'Uganda';


    this.settings.website =
      this.settings.website
        ?.trim() ?? '';


    this.settings.logoUrl =
      this.settings.logoUrl
        ?.trim() ?? '';

  }


  // =====================================================
  // NORMALIZE
  // =====================================================

  private normalizeSettings(
    settings: HospitalSettings
  ): HospitalSettings {

    return {

      hospitalName:
        settings?.hospitalName ?? '',

      registrationNumber:
        settings?.registrationNumber ?? '',

      phone:
        settings?.phone ?? '',

      email:
        settings?.email ?? '',

      address:
        settings?.address ?? '',

      city:
        settings?.city ?? '',

      country:
        settings?.country || 'Uganda',

      website:
        settings?.website ?? '',

      logoUrl:
        settings?.logoUrl ?? ''

    };

  }


  // =====================================================
  // EMAIL VALIDATION
  // =====================================================

  private isValidEmail(
    email: string
  ): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email);

  }


  // =====================================================
  // URL VALIDATION
  // =====================================================

  private isValidUrl(
    value: string
  ): boolean {

    try {

      const url =
        new URL(value);

      return (
        url.protocol === 'http:' ||
        url.protocol === 'https:'
      );

    }
    catch {

      return false;

    }

  }

}