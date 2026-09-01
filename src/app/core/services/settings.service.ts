
import { Injectable } from '@angular/core';

import {
  HMSSettings,
  HospitalSettings,
  SystemSettings,
  UserProfileSettings
} from '../../shared/models/settings.model';


@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // =====================================================
  // STORAGE KEY
  // =====================================================

  private readonly storageKey =
    'hms_settings';


  // =====================================================
  // DEFAULT SETTINGS
  // =====================================================

  private settings: HMSSettings = {

    hospital: {

      hospitalName: 'Hospital Management System',

      registrationNumber: '',

      phone: '',

      email: '',

      address: '',

      city: '',

      country: 'Uganda',

      website: '',

      logoUrl: ''

    },


    system: {

      theme: 'Light',

      dateFormat: 'DD/MM/YYYY',

      timeFormat: '24-hour',

      currency: 'UGX',

      currencySymbol: 'UGX',

      language: 'English',

      timezone: 'Africa/Kampala',

      enableNotifications: true,

      enableEmailNotifications: true,

      enableSmsNotifications: false

    },


    profile: {

      firstName: '',

      lastName: '',

      email: '',

      phone: '',

      role: 'Administrator'

    }

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    this.loadSettings();

  }


  // =====================================================
  // GET ALL SETTINGS
  // =====================================================

  getSettings(): HMSSettings {

    return {

      hospital: {
        ...this.settings.hospital
      },

      system: {
        ...this.settings.system
      },

      profile: {
        ...this.settings.profile
      }

    };

  }


  // =====================================================
  // HOSPITAL SETTINGS
  // =====================================================

  getHospitalSettings(): HospitalSettings {

    return {
      ...this.settings.hospital
    };

  }


  updateHospitalSettings(
    settings: HospitalSettings
  ): void {

    this.settings.hospital = {
      ...settings
    };

    this.saveSettings();

  }


  // =====================================================
  // SYSTEM SETTINGS
  // =====================================================

  getSystemSettings(): SystemSettings {

    return {
      ...this.settings.system
    };

  }


  updateSystemSettings(
    settings: SystemSettings
  ): void {

    this.settings.system = {
      ...settings
    };

    this.saveSettings();

  }


  // =====================================================
  // PROFILE SETTINGS
  // =====================================================

  getProfileSettings(): UserProfileSettings {

    return {
      ...this.settings.profile
    };

  }


  updateProfileSettings(
    settings: UserProfileSettings
  ): void {

    this.settings.profile = {
      ...settings
    };

    this.saveSettings();

  }


  // =====================================================
  // RESET SETTINGS
  // =====================================================

  resetSettings(): void {

    localStorage.removeItem(
      this.storageKey
    );

    this.settings = {

      hospital: {
        hospitalName:
          'Hospital Management System',

        registrationNumber: '',

        phone: '',

        email: '',

        address: '',

        city: '',

        country: 'Uganda',

        website: '',

        logoUrl: ''
      },

      system: {

        theme: 'Light',

        dateFormat: 'DD/MM/YYYY',

        timeFormat: '24-hour',

        currency: 'UGX',

        currencySymbol: 'UGX',

        language: 'English',

        timezone: 'Africa/Kampala',

        enableNotifications: true,

        enableEmailNotifications: true,

        enableSmsNotifications: false

      },

      profile: {

        firstName: '',

        lastName: '',

        email: '',

        phone: '',

        role: 'Administrator'

      }

    };

  }


  // =====================================================
  // SAVE
  // =====================================================

  private saveSettings(): void {

    localStorage.setItem(

      this.storageKey,

      JSON.stringify(
        this.settings
      )

    );

  }


  // =====================================================
  // LOAD
  // =====================================================

  private loadSettings(): void {

    const stored =
      localStorage.getItem(
        this.storageKey
      );


    if (!stored) {

      return;

    }


    try {

      const parsed =
        JSON.parse(stored);


      if (!parsed) {

        return;

      }


      this.settings = {

        hospital: {

          ...this.settings.hospital,

          ...(parsed.hospital ?? {})

        },

        system: {

          ...this.settings.system,

          ...(parsed.system ?? {})

        },

        profile: {

          ...this.settings.profile,

          ...(parsed.profile ?? {})

        }

      };

    }

    catch (error) {

      console.error(
        'Failed to load HMS settings:',
        error
      );

    }

  }

}

