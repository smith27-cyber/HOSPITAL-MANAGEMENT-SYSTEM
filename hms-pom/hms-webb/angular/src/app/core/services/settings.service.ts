/**
 * =====================================================
 * SETTINGS SERVICE
 * File:
 * src/app/core/services/settings.service.ts
 * =====================================================
 *
 * MULTITENANT RULE
 *
 * This service NEVER sends tenantId from the frontend.
 *
 * The backend determines the current tenant from:
 *
 * JWT
 *  ↓
 * TenantContext
 *  ↓
 * Current tenant
 *
 * Tenant-scoped endpoints:
 *
 * Hospital:
 * GET  /api/settings/hospital
 * PUT  /api/settings/hospital
 * POST /api/settings/hospital/reset
 *
 * System:
 * GET  /api/settings/system
 * PUT  /api/settings/system
 * POST /api/settings/system/reset
 *
 * =====================================================
 */

import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
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

  private readonly defaultSystemSettings:
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
  // DEFAULT PROFILE SETTINGS
  // =====================================================

  private readonly defaultProfileSettings:
    UserProfileSettings = {

    firstName:
      '',

    lastName:
      '',

    email:
      '',

    phone:
      '',

    role:
      'Administrator',

    department:
      '',

    username:
      ''

  };


  // =====================================================
  // DEFAULT TENANT SETTINGS
  // =====================================================

  private readonly defaultHospitalSettings:
    HospitalSettings = {

    hospitalName:
      '',

    registrationNumber:
      '',

    phone:
      '',

    email:
      '',

    address:
      '',

    city:
      '',

    country:
      'Uganda',

    website:
      '',

    logoUrl:
      ''

  };


  // =====================================================
  // CURRENT TENANT SETTINGS
  // =====================================================

  private readonly hospitalSettingsSubject =
    new BehaviorSubject<HospitalSettings>(
      {
        ...this.defaultHospitalSettings
      }
    );


  /**
   * Current authenticated tenant's
   * organization settings.
   */
  readonly hospitalSettings$ =
    this.hospitalSettingsSubject.asObservable();


  // =====================================================
  // CURRENT SYSTEM SETTINGS
  // =====================================================

  private systemSettings:
    SystemSettings = {

    ...this.defaultSystemSettings

  };


  // =====================================================
  // CURRENT USER PROFILE SETTINGS
  // =====================================================

  private profileSettings:
    UserProfileSettings = {

    ...this.defaultProfileSettings

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly http:
      HttpClient
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

        map(
          settings =>
            this.normalizeHospitalSettings(
              settings
            )
        ),

        tap(
          settings => {

            this.hospitalSettingsSubject.next(
              settings
            );

            console.log(
              'Tenant settings loaded:',
              settings
            );

          }
        ),

        catchError(
          error => {

            console.error(
              'Failed to load tenant settings:',
              error
            );

            return throwError(
              () => error
            );

          }
        )

      );

  }


  updateHospitalSettings(
    settings:
      HospitalSettings
  ):
    Observable<HospitalSettings> {

    const payload =
      this.cleanHospitalSettings(
        settings
      );


    return this.http
      .put<HospitalSettings>(
        `${this.API_URL}/hospital`,
        payload
      )
      .pipe(

        map(
          updatedSettings =>
            this.normalizeHospitalSettings(
              updatedSettings
            )
        ),

        tap(
          updatedSettings => {

            this.hospitalSettingsSubject.next(
              updatedSettings
            );

            console.log(
              'Tenant settings updated:',
              updatedSettings
            );

          }
        ),

        catchError(
          error => {

            console.error(
              'Failed to update tenant settings:',
              error
            );

            return throwError(
              () => error
            );

          }
        )

      );

  }


  resetHospitalSettings():
    Observable<HospitalSettings> {

    return this.http
      .post<HospitalSettings>(
        `${this.API_URL}/hospital/reset`,
        {}
      )
      .pipe(

        map(
          settings =>
            this.normalizeHospitalSettings(
              settings
            )
        ),

        tap(
          settings => {

            this.hospitalSettingsSubject.next(
              settings
            );

            console.log(
              'Tenant settings reset:',
              settings
            );

          }
        ),

        catchError(
          error => {

            console.error(
              'Failed to reset tenant settings:',
              error
            );

            return throwError(
              () => error
            );

          }
        )

      );

  }


  getCurrentHospitalSettings():
    HospitalSettings {

    return {
      ...this.hospitalSettingsSubject.value
    };

  }


  // =====================================================
  // SYSTEM PREFERENCES
  // =====================================================

  /**
   * Load system preferences for the
   * currently authenticated tenant.
   *
   * No tenantId is sent.
   */
  getSystemPreferences():
    Observable<SystemSettings> {

    return this.http
      .get<SystemSettings>(
        `${this.API_URL}/system`
      )
      .pipe(

        map(
          settings =>
            this.normalizeSystemSettings(
              settings
            )
        ),

        tap(
          settings => {

            this.systemSettings = {
              ...settings
            };

            console.log(
              'System preferences loaded:',
              settings
            );

          }
        ),

        catchError(
          error => {

            console.error(
              'Failed to load system preferences:',
              error
            );

            return throwError(
              () => error
            );

          }
        )

      );

  }


  /**
   * Save system preferences for the
   * currently authenticated tenant.
   *
   * No tenantId is sent.
   */
  updateSystemPreferences(
    settings:
      SystemSettings
  ):
    Observable<SystemSettings> {

    const payload =
      this.cleanSystemSettings(
        settings
      );


    return this.http
      .put<SystemSettings>(
        `${this.API_URL}/system`,
        payload
      )
      .pipe(

        map(
          updatedSettings =>
            this.normalizeSystemSettings(
              updatedSettings
            )
        ),

        tap(
          updatedSettings => {

            this.systemSettings = {
              ...updatedSettings
            };

            console.log(
              'System preferences updated:',
              updatedSettings
            );

          }
        ),

        catchError(
          error => {

            console.error(
              'Failed to update system preferences:',
              error
            );

            return throwError(
              () => error
            );

          }
        )

      );

  }


  /**
   * Reset system preferences for the
   * currently authenticated tenant.
   */
  resetSystemPreferences():
    Observable<SystemSettings> {

    return this.http
      .post<SystemSettings>(
        `${this.API_URL}/system/reset`,
        {}
      )
      .pipe(

        map(
          settings =>
            this.normalizeSystemSettings(
              settings
            )
        ),

        tap(
          settings => {

            this.systemSettings = {
              ...settings
            };

            console.log(
              'System preferences reset:',
              settings
            );

          }
        ),

        catchError(
          error => {

            console.error(
              'Failed to reset system preferences:',
              error
            );

            return throwError(
              () => error
            );

          }
        )

      );

  }


  // =====================================================
  // LEGACY / LOCAL SYSTEM SETTINGS ACCESS
  // =====================================================

  /**
   * Returns the most recently loaded system settings.
   *
   * This remains synchronous for compatibility with
   * existing components.
   */
  getSystemSettings():
    SystemSettings {

    return {
      ...this.systemSettings
    };

  }


  /**
   * Local compatibility method.
   *
   * New code should use updateSystemPreferences()
   * so changes are persisted in the backend.
   */
  updateSystemSettings(
    settings:
      SystemSettings
  ):
    SystemSettings {

    this.systemSettings = {

      ...this.defaultSystemSettings,

      ...(settings || {})

    };


    return {
      ...this.systemSettings
    };

  }


  /**
   * Local compatibility method.
   *
   * New code should use resetSystemPreferences()
   * so the reset is persisted in the backend.
   */
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
    settings:
      UserProfileSettings
  ):
    UserProfileSettings {

    this.profileSettings = {

      ...this.defaultProfileSettings,

      ...(settings || {})

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
  // GET ALL SETTINGS
  // =====================================================

  getSettings():
    Observable<HMSSettings> {

    return this.getHospitalSettings()
      .pipe(

        map(
          hospital => ({

            hospital,

            system: {
              ...this.systemSettings
            },

            profile: {
              ...this.profileSettings
            }

          })
        )

      );

  }


  // =====================================================
  // SAVE ALL SETTINGS
  // =====================================================

  saveSettings(
    settings:
      HMSSettings
  ):
    Observable<HospitalSettings> {

    this.systemSettings = {

      ...this.defaultSystemSettings,

      ...(settings?.system || {})

    };


    this.profileSettings = {

      ...this.defaultProfileSettings,

      ...(settings?.profile || {})

    };


    return this.updateHospitalSettings(
      settings?.hospital ||
      {
        ...this.defaultHospitalSettings
      }
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
  // NORMALIZE SYSTEM SETTINGS
  // =====================================================

  private normalizeSystemSettings(
    settings:
      SystemSettings
  ):
    SystemSettings {

    return {

      theme:
        settings?.theme ||
        'System',

      dateFormat:
        settings?.dateFormat ||
        'DD/MM/YYYY',

      timeFormat:
        settings?.timeFormat ||
        '24-hour',

      currency:
        settings?.currency ||
        'UGX',

      currencySymbol:
        settings?.currencySymbol ||
        'UGX',

      language:
        settings?.language ||
        'English',

      timezone:
        settings?.timezone ||
        'Africa/Kampala',

      enableNotifications:
        settings?.enableNotifications ??
        true,

      enableEmailNotifications:
        settings?.enableEmailNotifications ??
        true,

      enableSmsNotifications:
        settings?.enableSmsNotifications ??
        false

    };

  }


  // =====================================================
  // CLEAN SYSTEM SETTINGS
  // =====================================================

  private cleanSystemSettings(
    settings:
      SystemSettings
  ):
    SystemSettings {

    return {

      theme:
        settings?.theme ||
        'System',

      dateFormat:
        settings?.dateFormat ||
        'DD/MM/YYYY',

      timeFormat:
        settings?.timeFormat ||
        '24-hour',

      currency:
        settings?.currency ||
        'UGX',

      currencySymbol:
        settings?.currencySymbol ||
        'UGX',

      language:
        settings?.language ||
        'English',

      timezone:
        settings?.timezone ||
        'Africa/Kampala',

      enableNotifications:
        settings?.enableNotifications ??
        true,

      enableEmailNotifications:
        settings?.enableEmailNotifications ??
        true,

      enableSmsNotifications:
        settings?.enableSmsNotifications ??
        false

    };

  }


  // =====================================================
  // NORMALIZE TENANT SETTINGS
  // =====================================================

  private normalizeHospitalSettings(
    settings:
      HospitalSettings
  ):
    HospitalSettings {

    return {

      hospitalName:
        settings?.hospitalName
          ?.trim() ||
        '',

      registrationNumber:
        settings?.registrationNumber
          ?.trim() ||
        '',

      phone:
        settings?.phone
          ?.trim() ||
        '',

      email:
        settings?.email
          ?.trim() ||
        '',

      address:
        settings?.address
          ?.trim() ||
        '',

      city:
        settings?.city
          ?.trim() ||
        '',

      country:
        settings?.country
          ?.trim() ||
        'Uganda',

      website:
        settings?.website
          ?.trim() ||
        '',

      logoUrl:
        settings?.logoUrl
          ?.trim() ||
        ''

    };

  }


  // =====================================================
  // CLEAN TENANT SETTINGS
  // =====================================================

  private cleanHospitalSettings(
    settings:
      HospitalSettings
  ):
    HospitalSettings {

    return {

      hospitalName:
        settings?.hospitalName
          ?.trim() ||
        '',

      registrationNumber:
        this.cleanValue(
          settings?.registrationNumber
        ) ||
        '',

      phone:
        this.cleanValue(
          settings?.phone
        ) ||
        '',

      email:
        this.cleanValue(
          settings?.email
        ) ||
        '',

      address:
        this.cleanValue(
          settings?.address
        ) ||
        '',

      city:
        this.cleanValue(
          settings?.city
        ) ||
        '',

      country:
        this.cleanValue(
          settings?.country
        ) ||
        'Uganda',

      website:
        this.cleanValue(
          settings?.website
        ) ||
        '',

      logoUrl:
        this.cleanValue(
          settings?.logoUrl
        ) ||
        ''

    };

  }


  // =====================================================
  // CLEAN STRING VALUE
  // =====================================================

  private cleanValue(
    value?:
      string |
      null
  ):
    string |
    undefined {

    if (
      value ===
        null ||
      value ===
        undefined
    ) {

      return undefined;

    }


    const cleaned =
      value.trim();


    return cleaned.length >
      0
      ? cleaned
      : undefined;

  }

}