// =====================================================
// PATIENT MODEL
// File:
// src/app/shared/models/patient.model.ts
// =====================================================

export type PatientGender =
  | 'Male'
  | 'Female'
  | 'Other';

export type PatientStatus =
  | 'Active'
  | 'Inactive';

export interface Patient {

  // ===================================================
  // IDENTIFICATION
  // ===================================================

  id: string;

  firstName: string;

  lastName: string;

  dateOfBirth: string;

  gender: PatientGender;

  nationalId: string | null;


  // ===================================================
  // CONTACT
  // ===================================================

  phone: string;

  email: string;

  address: string;


  // ===================================================
  // EMERGENCY CONTACT
  // ===================================================

  emergencyContactName: string;

  emergencyContactPhone: string;


  // ===================================================
  // MEDICAL
  // ===================================================

  bloodGroup: string;

  department: string;


  // ===================================================
  // STATUS
  // ===================================================

  status: PatientStatus;


  // ===================================================
  // SYSTEM
  // ===================================================

  createdAt: string;
}
