// =====================================================
// SYSTEM PREFERENCES COMPONENT
// File:
// src/app/features/settings/system-preferences/system-preferences.ts
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
  SystemSettings
} from '../../../shared/models/settings.model';

import {
  SettingsService
} from '../../../core/services/settings.service';


// =====================================================
// SYSTEM PREFERENCES COMPONENT
// =====================================================

@Component({
  selector: 'app-system-preferences',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './system-preferences.html',

  styleUrl: './system-preferences.css'
})
export class SystemPreferencesComponent
  implements OnInit {


  // =====================================================
  // SYSTEM SETTINGS
  // =====================================================

  settings: SystemSettings = {

    theme: 'System',

    dateFormat: 'DD/MM/YYYY',

    timeFormat: '24-hour',

    currency: 'UGX',

    currencySymbol: 'UGX',

    language: 'English',

    timezone: 'Africa/Kampala',

    enableNotifications: true,

    enableEmailNotifications: true,

    enableSmsNotifications: false

  };


  // =====================================================
  // SAVING
  // =====================================================

  saving = false;


  // =====================================================
  // OPTIONS
  // =====================================================

  themeOptions:
    SystemSettings['theme'][] = [

      'Light',

      'Dark',

      'System'

    ];


  dateFormatOptions:
    SystemSettings['dateFormat'][] = [

      'DD/MM/YYYY',

      'MM/DD/YYYY',

      'YYYY-MM-DD'

    ];


  timeFormatOptions:
    SystemSettings['timeFormat'][] = [

      '12-hour',

      '24-hour'

    ];


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

    try {

      this.settings =
        this.settingsService
          .getSystemSettings();


    } catch (error) {

      console.error(
        'Failed to load system preferences:',
        error
      );

    }


    // ---------------------------------------------------
    // Force immediate UI rendering
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  saveSettings(): void {

    // ---------------------------------------------------
    // Prevent duplicate saves
    // ---------------------------------------------------

    if (this.saving) {

      return;

    }


    this.saving = true;

    this.changeDetectorRef.detectChanges();


    try {

      // -------------------------------------------------
      // Save system settings
      // -------------------------------------------------

      this.settingsService
        .updateSystemSettings(
          this.settings
        );


      // -------------------------------------------------
      // Keep the latest state
      // -------------------------------------------------

      this.settings =
        this.settingsService
          .getSystemSettings();


      this.saving = false;

      this.changeDetectorRef.detectChanges();


      alert(
        'System preferences saved successfully.'
      );


    } catch (error) {

      console.error(
        'Failed to save system preferences:',
        error
      );


      this.saving = false;

      this.changeDetectorRef.detectChanges();


      alert(
        'Failed to save system preferences. Please try again.'
      );

    }

  }


  // =====================================================
  // RESET SETTINGS
  // =====================================================

  resetSettings(): void {

    // ---------------------------------------------------
    // Prevent reset while saving
    // ---------------------------------------------------

    if (this.saving) {

      return;

    }


    const confirmed =
      confirm(
        'Reset system preferences to the default values?'
      );


    if (!confirmed) {

      return;

    }


    this.saving = true;

    this.changeDetectorRef.detectChanges();


    try {

      // -------------------------------------------------
      // Reset through service
      // -------------------------------------------------

      this.settingsService
        .resetSettings();


      // -------------------------------------------------
      // Reload reset values
      // -------------------------------------------------

      this.settings =
        this.settingsService
          .getSystemSettings();


      this.saving = false;

      this.changeDetectorRef.detectChanges();


      alert(
        'System preferences have been reset.'
      );


    } catch (error) {

      console.error(
        'Failed to reset system preferences:',
        error
      );


      this.saving = false;

      this.changeDetectorRef.detectChanges();


      alert(
        'Failed to reset system preferences. Please try again.'
      );

    }

  }


  // =====================================================
  // BACK
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/settings'
    ]);

  }

}