// =====================================================
// SETTINGS MODEL
// File:
// src/app/shared/models/settings.model.ts
// =====================================================


// =====================================================
// THEME
// =====================================================

export type ThemeMode =
  | 'Light'
  | 'Dark'
  | 'System';


// =====================================================
// DATE FORMAT
// =====================================================

export type DateFormat =
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY-MM-DD';


// =====================================================
// TIME FORMAT
// =====================================================

export type TimeFormat =
  | '12-hour'
  | '24-hour';


// =====================================================
// HOSPITAL SETTINGS
// =====================================================

export interface HospitalSettings {

  hospitalName: string;

  registrationNumber?: string;

  phone?: string;

  email?: string;

  address?: string;

  city?: string;

  country?: string;

  website?: string;

  logoUrl?: string;

}


// =====================================================
// SYSTEM SETTINGS
// =====================================================

export interface SystemSettings {

  theme: ThemeMode;

  dateFormat: DateFormat;

  timeFormat: TimeFormat;

  currency: string;

  currencySymbol: string;

  language: string;

  timezone: string;

  enableNotifications: boolean;

  enableEmailNotifications: boolean;

  enableSmsNotifications: boolean;

}


// =====================================================
// USER PROFILE SETTINGS
// =====================================================

export interface UserProfileSettings {

  firstName: string;

  lastName: string;

  email: string;

  phone?: string;

  role: string;

  department?: string;

  username?: string;

}


// =====================================================
// COMPLETE HMS SETTINGS
// =====================================================

export interface HMSSettings {

  hospital: HospitalSettings;

  system: SystemSettings;

  profile: UserProfileSettings;

}
