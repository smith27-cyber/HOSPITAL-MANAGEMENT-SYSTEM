// =====================================================
// NOTIFICATION SETTINGS COMPONENT
// File:
// src/app/features/settings/notification-settings/notification-settings.ts
// =====================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  SettingsService
} from '../../../core/services/settings.service';


@Component({
  selector: 'app-notification-settings',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './notification-settings.html',

  styleUrl: './notification-settings.css'
})
export class NotificationSettingsComponent implements OnInit {

  // =====================================================
  // NOTIFICATION SETTINGS
  // =====================================================

  notifications = {

    enableNotifications: true,

    enableEmailNotifications: true,

    enableSmsNotifications: false

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

    this.loadSettings();

  }


  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  private loadSettings(): void {

    const settings =
      this.settingsService.getSystemSettings();


    this.notifications = {

      enableNotifications:
        settings.enableNotifications,

      enableEmailNotifications:
        settings.enableEmailNotifications,

      enableSmsNotifications:
        settings.enableSmsNotifications

    };

  }


  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  saveSettings(): void {

    if (this.saving) {

      return;

    }


    this.saving = true;


    try {

      const settings =
        this.settingsService.getSystemSettings();


      settings.enableNotifications =
        this.notifications.enableNotifications;

      settings.enableEmailNotifications =
        this.notifications.enableEmailNotifications;

      settings.enableSmsNotifications =
        this.notifications.enableSmsNotifications;


      this.settingsService.updateSystemSettings(
        settings
      );


      window.alert(
        'Notification settings saved successfully.'
      );

    } catch (error) {

      console.error(
        'Failed to save notification settings:',
        error
      );


      window.alert(
        'Failed to save notification settings. Please try again.'
      );

    } finally {

      this.saving = false;

    }

  }


  // =====================================================
  // RESET
  // =====================================================

  resetSettings(): void {

    const confirmed =
      window.confirm(
        'Reset notification settings to their default values?'
      );


    if (!confirmed) {

      return;

    }


    this.notifications = {

      enableNotifications: true,

      enableEmailNotifications: true,

      enableSmsNotifications: false

    };


    this.saveSettings();

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
