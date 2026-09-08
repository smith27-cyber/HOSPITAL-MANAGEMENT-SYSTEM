// =====================================================
// SETTINGS SERVICE
// File:
// src/app/core/services/settings.service.ts
// =====================================================

import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  BehaviorSubject,
  throwError
} from 'rxjs';

import {
  catchError,
  map,
  tap
} from 'rxjs/operators';

import {
  HospitalSettings,
  SystemSettings,
  UserProfileSettings,
  HMSSettings
} from '../../shared/models/settings.model';


@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // =====================================================
  // API
  // =====================================================

  private readonly API_URL =
    '/api/settings';


  // =====================================================
  // DEFAULT SYSTEM SETTINGS
  // =====================================================

  private readonly defaultSystemSettings: SystemSettings = {

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

  };


  // =====================================================
  // DEFAULT PROFILE SETTINGS
  // =====================================================

  private readonly defaultProfileSettings:
    UserProfileSettings = {

      firstName: '',

      lastName: '',

      email: '',

      phone: '',

      role: 'Administrator',

      department: '',

      username: ''

    };


  // =====================================================
  // DEFAULT HOSPITAL SETTINGS
  // =====================================================

  private readonly defaultHospitalSettings:
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


  // =====================================================
  // CURRENT HOSPITAL SETTINGS
  // =====================================================

  private hospitalSettingsSubject =
    new BehaviorSubject<HospitalSettings>(
      {
        ...this.defaultHospitalSettings
      }
    );


  /**
   * Public observable.
   *
   * Any component can subscribe to this and immediately
   * receive the current hospital information.
   */
  readonly hospitalSettings$ =
    this.hospitalSettingsSubject.asObservable();


  // =====================================================
  // CURRENT SYSTEM SETTINGS
  // =====================================================

  private systemSettings: SystemSettings = {

    ...this.defaultSystemSettings

  };


  // =====================================================
  // CURRENT PROFILE SETTINGS
  // =====================================================

  private profileSettings: UserProfileSettings = {

    ...this.defaultProfileSettings

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly http: HttpClient
  ) {}


  // =====================================================
  // HOSPITAL SETTINGS
  // =====================================================

  getHospitalSettings():
    Observable<HospitalSettings> {

    return this.http
      .get<HospitalSettings>(
        `${this.API_URL}/hospital`
      )
      .pipe(

        map(settings =>
          this.normalizeHospitalSettings(settings)
        ),

        tap(settings => {

          this.hospitalSettingsSubject.next(
            settings
          );

        }),

        catchError(error => {

          console.error(
            'Failed to load hospital settings:',
            error
          );

          return throwError(
            () => error
          );

        })

      );

  }


  // =====================================================
  // UPDATE HOSPITAL SETTINGS
  // =====================================================

  updateHospitalSettings(
    settings: HospitalSettings
  ): Observable<HospitalSettings> {

    const payload =
      this.cleanHospitalSettings(settings);


    return this.http
      .put<HospitalSettings>(
        `${this.API_URL}/hospital`,
        payload
      )
      .pipe(

        map(updatedSettings =>
          this.normalizeHospitalSettings(
            updatedSettings
          )
        ),

        tap(updatedSettings => {

          // ------------------------------------------------
          // IMPORTANT
          // Update the application-wide hospital state.
          // ------------------------------------------------

          this.hospitalSettingsSubject.next(
            updatedSettings
          );

          console.log(
            'Hospital settings updated:',
            updatedSettings
          );

        }),

        catchError(error => {

          console.error(
            'Failed to update hospital settings:',
            error
          );

          return throwError(
            () => error
          );

        })

      );

  }


  // =====================================================
  // RESET HOSPITAL SETTINGS
  // =====================================================

  resetHospitalSettings():
    Observable<HospitalSettings> {

    return this.http
      .post<HospitalSettings>(
        `${this.API_URL}/hospital/reset`,
        {}
      )
      .pipe(

        map(settings =>
          this.normalizeHospitalSettings(settings)
        ),

        tap(settings => {

          this.hospitalSettingsSubject.next(
            settings
          );

          console.log(
            'Hospital settings reset:',
            settings
          );

        }),

        catchError(error => {

          console.error(
            'Failed to reset hospital settings:',
            error
          );

          return throwError(
            () => error
          );

        })

      );

  }


  // =====================================================
  // GET CURRENT HOSPITAL VALUE
  // =====================================================

  getCurrentHospitalSettings():
    HospitalSettings {

    return {
      ...this.hospitalSettingsSubject.value
    };

  }


  // =====================================================
  // SYSTEM SETTINGS
  // =====================================================

  getSystemSettings():
    SystemSettings {

    return {
      ...this.systemSettings
    };

  }


  updateSystemSettings(
    settings: SystemSettings
  ): SystemSettings {

    this.systemSettings = {

      ...this.defaultSystemSettings,

      ...settings

    };

    return {
      ...this.systemSettings
    };

  }


  resetSystemSettings():
    SystemSettings {

    this.systemSettings = {

      ...this.defaultSystemSettings

    };

    return {
      ...this.systemSettings
    };

  }


  // =====================================================
  // PROFILE SETTINGS
  // =====================================================

  getProfileSettings():
    UserProfileSettings {

    return {
      ...this.profileSettings
    };

  }


  updateProfileSettings(
    settings: UserProfileSettings
  ): UserProfileSettings {

    this.profileSettings = {

      ...this.defaultProfileSettings,

      ...settings

    };

    return {
      ...this.profileSettings
    };

  }


  resetProfileSettings():
    UserProfileSettings {

    this.profileSettings = {

      ...this.defaultProfileSettings

    };

    return {
      ...this.profileSettings
    };

  }


  // =====================================================
  // ALL SETTINGS
  // =====================================================

  getSettings():
    Observable<HMSSettings> {

    return this.getHospitalSettings()
      .pipe(

        map(hospital => ({

          hospital,

          system: {
            ...this.systemSettings
          },

          profile: {
            ...this.profileSettings
          }

        }))

      );

  }


  // =====================================================
  // SAVE ALL SETTINGS
  // =====================================================

  saveSettings(
    settings: HMSSettings
  ): Observable<HospitalSettings> {

    this.systemSettings = {

      ...this.defaultSystemSettings,

      ...settings.system

    };


    this.profileSettings = {

      ...this.defaultProfileSettings,

      ...settings.profile

    };


    return this.updateHospitalSettings(
      settings.hospital
    );

  }


  // =====================================================
  // RESET ALL SETTINGS
  // =====================================================

  resetSettings():
    Observable<HospitalSettings> {

    this.systemSettings = {

      ...this.defaultSystemSettings

    };


    this.profileSettings = {

      ...this.defaultProfileSettings

    };


    return this.resetHospitalSettings();

  }


  // =====================================================
  // NORMALIZE HOSPITAL SETTINGS
  // =====================================================

  private normalizeHospitalSettings(
    settings: HospitalSettings
  ): HospitalSettings {

    return {

      hospitalName:
        settings?.hospitalName?.trim() ?? '',

      registrationNumber:
        settings?.registrationNumber?.trim() ?? '',

      phone:
        settings?.phone?.trim() ?? '',

      email:
        settings?.email?.trim() ?? '',

      address:
        settings?.address?.trim() ?? '',

      city:
        settings?.city?.trim() ?? '',

      country:
        settings?.country?.trim() || 'Uganda',

      website:
        settings?.website?.trim() ?? '',

      logoUrl:
        settings?.logoUrl?.trim() ?? ''

    };

  }


  // =====================================================
  // CLEAN HOSPITAL SETTINGS
  // =====================================================

  private cleanHospitalSettings(
    settings: HospitalSettings
  ): HospitalSettings {

    return {

      hospitalName:
        settings.hospitalName?.trim() ?? '',

      registrationNumber:
        this.cleanValue(
          settings.registrationNumber
        ) ?? '',

      phone:
        this.cleanValue(
          settings.phone
        ) ?? '',

      email:
        this.cleanValue(
          settings.email
        ) ?? '',

      address:
        this.cleanValue(
          settings.address
        ) ?? '',

      city:
        this.cleanValue(
          settings.city
        ) ?? '',

      country:
        this.cleanValue(
          settings.country
        ) || 'Uganda',

      website:
        this.cleanValue(
          settings.website
        ) ?? '',

      logoUrl:
        this.cleanValue(
          settings.logoUrl
        ) ?? ''

    };

  }


  // =====================================================
  // CLEAN VALUE
  // =====================================================

  private cleanValue(
    value?: string | null
  ): string | undefined {

    if (
      value === null ||
      value === undefined
    ) {

      return undefined;

    }


    const cleaned =
      value.trim();


    return cleaned.length > 0
      ? cleaned
      : undefined;

  }

}