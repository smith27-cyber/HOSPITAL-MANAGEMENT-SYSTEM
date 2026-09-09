// =====================================================
// SYSTEM PREFERENCES COMPONENT
// File:
// src/app/features/settings/system-preferences/system-preferences.ts
// =====================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
export class SystemPreferencesComponent implements OnInit {

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

  themeOptions: SystemSettings['theme'][] = [

    'Light',

    'Dark',

    'System'

  ];


  dateFormatOptions: SystemSettings['dateFormat'][] = [

    'DD/MM/YYYY',

    'MM/DD/YYYY',

    'YYYY-MM-DD'

  ];


  timeFormatOptions: SystemSettings['timeFormat'][] = [

    '12-hour',

    '24-hour'

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private settingsService: SettingsService,
    private router: Router
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

    this.settings =
      this.settingsService
        .getSystemSettings();

  }


  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  saveSettings(): void {

    this.saving = true;


    this.settingsService
      .updateSystemSettings(
        this.settings
      );


    setTimeout(() => {

      this.saving = false;

      alert(
        'System preferences saved successfully.'
      );

    }, 300);

  }


  // =====================================================
  // RESET SETTINGS
  // =====================================================

  resetSettings(): void {

    const confirmed =
      confirm(
        'Reset system preferences to the default values?'
      );


    if (!confirmed) {

      return;

    }


    this.settingsService.resetSettings();


    this.settings =
      this.settingsService
        .getSystemSettings();


    alert(
      'System preferences have been reset.'
    );

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
