
// =====================================================
// HOSPITAL SETTINGS COMPONENT
// File:
// src/app/features/settings/hospital-settings/hospital-settings.ts
// =====================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
export class HospitalSettingsComponent implements OnInit {

  // =====================================================
  // HOSPITAL SETTINGS
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
  // SAVING STATE
  // =====================================================

  saving = false;


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

  private loadSettings(): void {

    this.settings =
      this.settingsService
        .getHospitalSettings();

  }


  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  saveSettings(): void {

    // ---------------------------------------------------
    // PREVENT DUPLICATE SAVE
    // ---------------------------------------------------

    if (this.saving) {

      return;

    }


    // ---------------------------------------------------
    // VALIDATE HOSPITAL NAME
    // ---------------------------------------------------

    if (
      !this.settings.hospitalName ||
      !this.settings.hospitalName.trim()
    ) {

      window.alert(
        'Please enter the hospital name.'
      );

      return;

    }


    // ---------------------------------------------------
    // SAVE
    // ---------------------------------------------------

    this.saving = true;


    try {

      this.settingsService
        .updateHospitalSettings(
          this.settings
        );


      // -------------------------------------------------
      // SUCCESS MESSAGE
      // -------------------------------------------------

      window.alert(
        'Hospital information saved successfully.'
      );

    } catch (error) {

      console.error(
        'Failed to save hospital settings:',
        error
      );


      window.alert(
        'Failed to save hospital information. Please try again.'
      );

    } finally {

      this.saving = false;

    }

  }


  // =====================================================
  // RESET SETTINGS
  // =====================================================

  resetSettings(): void {

    const confirmed =
      window.confirm(
        'Reset hospital information to the default values?'
      );


    if (!confirmed) {

      return;

    }


    try {

      this.settingsService
        .resetSettings();


      this.loadSettings();


      window.alert(
        'Hospital settings have been reset.'
      );

    } catch (error) {

      console.error(
        'Failed to reset hospital settings:',
        error
      );


      window.alert(
        'Failed to reset hospital settings. Please try again.'
      );

    }

  }


  // =====================================================
  // BACK TO SETTINGS
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/settings'
    ]);

  }

}

