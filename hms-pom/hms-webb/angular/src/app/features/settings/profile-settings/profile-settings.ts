// =====================================================
// PROFILE SETTINGS COMPONENT
// File:
// src/app/features/settings/profile-settings/profile-settings.ts
// =====================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  UserProfileSettings
} from '../../../shared/models/settings.model';

import {
  SettingsService
} from '../../../core/services/settings.service';


@Component({
  selector: 'app-profile-settings',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './profile-settings.html',

  styleUrl: './profile-settings.css'
})
export class ProfileSettings implements OnInit {

  // =====================================================
  // USER PROFILE
  // =====================================================

  profile: UserProfileSettings = {

    firstName: '',

    lastName: '',

    email: '',

    phone: '',

    role: 'Administrator',

    department: '',

    username: ''

  };


  // =====================================================
  // SAVING
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

    this.loadProfile();

  }


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  private loadProfile(): void {

    const savedProfile =
      this.settingsService
        .getProfileSettings();


    this.profile = {

      firstName:
        savedProfile.firstName || '',

      lastName:
        savedProfile.lastName || '',

      email:
        savedProfile.email || '',

      phone:
        savedProfile.phone || '',

      role:
        savedProfile.role || 'Administrator',

      department:
        savedProfile.department || '',

      username:
        savedProfile.username || ''

    };

  }


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  saveProfile(): void {

    // ---------------------------------------------------
    // PREVENT DUPLICATE SAVE
    // ---------------------------------------------------

    if (this.saving) {

      return;

    }


    // ---------------------------------------------------
    // VALIDATE FIRST NAME
    // ---------------------------------------------------

    if (
      !this.profile.firstName ||
      !this.profile.firstName.trim()
    ) {

      window.alert(
        'Please enter your first name.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE LAST NAME
    // ---------------------------------------------------

    if (
      !this.profile.lastName ||
      !this.profile.lastName.trim()
    ) {

      window.alert(
        'Please enter your last name.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE EMAIL
    // ---------------------------------------------------

    if (
      !this.profile.email ||
      !this.profile.email.trim()
    ) {

      window.alert(
        'Please enter your email address.'
      );

      return;

    }


    // ---------------------------------------------------
    // SAVE PROFILE
    // ---------------------------------------------------

    this.saving = true;


    try {

      this.settingsService
        .updateProfileSettings(
          this.profile
        );


      window.alert(
        'Profile updated successfully.'
      );

    } catch (error) {

      console.error(
        'Failed to update profile:',
        error
      );


      window.alert(
        'Failed to update profile. Please try again.'
      );

    } finally {

      this.saving = false;

    }

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/settings'
    ]);

  }

}
