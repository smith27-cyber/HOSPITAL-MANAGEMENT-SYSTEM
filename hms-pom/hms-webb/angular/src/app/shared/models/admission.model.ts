// =====================================================
// ADMISSION MODEL
// File:
// src/app/shared/models/admission.model.ts
// =====================================================


// =====================================================
// ADMISSION STATUS
// Must match Spring Boot AdmissionStatus enum
// =====================================================

export type AdmissionStatus =
  | 'ADMITTED'
  | 'DISCHARGED'
  | 'TRANSFERRED'
  | 'CANCELLED';


// =====================================================
// ADMISSION TYPE
// Must match Spring Boot AdmissionType enum
// =====================================================

export type AdmissionType =
  | 'EMERGENCY'
  | 'ROUTINE'
  | 'REFERRAL'
  | 'SURGICAL'
  | 'MATERNITY'
  | 'OTHER';


// =====================================================
// WARD TYPE
// Must match Spring Boot WardType enum
// =====================================================

export type WardType =
  | 'GENERAL'
  | 'PRIVATE'
  | 'PEDIATRIC'
  | 'MATERNITY'
  | 'SURGICAL'
  | 'ICU'
  | 'EMERGENCY'
  | 'OTHER';


// =====================================================
// ADMISSION
// =====================================================

export interface Admission {

  id: string;

  patientId: string;

  patientName: string;

  patientNumber?: string;

  doctorId?: string;

  doctorName?: string;

  departmentId?: string;

  departmentName?: string;

  ward: WardType;

  bedNumber?: string;

  admissionType: AdmissionType;

  admissionDate: string;

  expectedDischargeDate?: string;

  dischargeDate?: string;

  reason: string;

  diagnosis?: string;

  notes?: string;

  status: AdmissionStatus;

  createdAt: string;

  updatedAt?: string;

}