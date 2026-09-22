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
  // SETTINGS
  // =====================================================

  settings:
    SystemSettings = {

    theme:
      'System',

    dateFormat:
      'DD/MM/YYYY',

    timeFormat:
      '24-hour',

    currency:
      'UGX',

    currencySymbol:
      'UGX',

    language:
      'English',

    timezone:
      'Africa/Kampala',

    enableNotifications:
      true,

    enableEmailNotifications:
      true,

    enableSmsNotifications:
      false

  };


  // =====================================================
  // UI STATE
  // =====================================================

  loading = false;

  saving = false;

  resetting = false;


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
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadSettings();

  }


  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  loadSettings(): void {

    if (this.loading) {
      return;
    }


    this.loading = true;

    this.changeDetectorRef.detectChanges();


    this.settingsService
      .getSystemPreferences()
      .subscribe({

        next: settings => {

          this.settings = {
            ...settings
          };

          this.loading = false;

          this.changeDetectorRef.detectChanges();

        },


        error: error => {

          console.error(
            'Failed to load system preferences:',
            error
          );

          this.loading = false;

          this.changeDetectorRef.detectChanges();

          alert(
            'Failed to load system preferences. Please try again.'
          );

        }

      });

  }


  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  saveSettings(): void {

    if (
      this.saving ||
      this.loading ||
      this.resetting
    ) {

      return;

    }


    this.saving = true;

    this.changeDetectorRef.detectChanges();


    this.settingsService
      .updateSystemPreferences(
        this.settings
      )
      .subscribe({

        next: updatedSettings => {

          this.settings = {
            ...updatedSettings
          };

          this.saving = false;

          this.changeDetectorRef.detectChanges();

          alert(
            'System preferences saved successfully.'
          );

        },


        error: error => {

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

      });

  }


  // =====================================================
  // RESET SETTINGS
  // =====================================================

  resetSettings(): void {

    if (
      this.saving ||
      this.loading ||
      this.resetting
    ) {

      return;

    }


    const confirmed =
      confirm(
        'Reset system preferences to the default values?'
      );


    if (!confirmed) {
      return;
    }


    this.resetting = true;

    this.changeDetectorRef.detectChanges();


    this.settingsService
      .resetSystemPreferences()
      .subscribe({

        next: resetSettings => {

          this.settings = {
            ...resetSettings
          };

          this.resetting = false;

          this.changeDetectorRef.detectChanges();

          alert(
            'System preferences have been reset.'
          );

        },


        error: error => {

          console.error(
            'Failed to reset system preferences:',
            error
          );

          this.resetting = false;

          this.changeDetectorRef.detectChanges();

          alert(
            'Failed to reset system preferences. Please try again.'
          );

        }

      });

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