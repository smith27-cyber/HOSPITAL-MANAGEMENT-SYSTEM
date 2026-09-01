// =====================================================
// ADMISSION STATUS
// =====================================================

export type AdmissionStatus =
  | 'Admitted'
  | 'Discharged'
  | 'Transferred'
  | 'Cancelled';


// =====================================================
// ADMISSION TYPE
// =====================================================

export type AdmissionType =
  | 'Emergency'
  | 'Routine'
  | 'Referral'
  | 'Surgical'
  | 'Maternity'
  | 'Other';


// =====================================================
// WARD TYPE
// =====================================================

export type WardType =
  | 'General'
  | 'Private'
  | 'Pediatric'
  | 'Maternity'
  | 'Surgical'
  | 'ICU'
  | 'Emergency'
  | 'Other';


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
