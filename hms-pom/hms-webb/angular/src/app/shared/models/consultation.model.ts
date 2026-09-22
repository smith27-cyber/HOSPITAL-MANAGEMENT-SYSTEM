
// =====================================================
// CONSULTATION MODEL
// File:
// src/app/shared/models/consultation.model.ts
// =====================================================

export type ConsultationStatus =
  | 'Open'
  | 'Pending Results'
  | 'Ready For Review'
  | 'Completed'
  | 'Cancelled';


export interface Consultation {

  // =====================================================
  // IDENTIFICATION
  // =====================================================

  id: string;


  // =====================================================
  // RELATED RECORDS
  // =====================================================

  patientId: string;

  doctorId: string;

  appointmentId?: string;


  // =====================================================
  // DISPLAY INFORMATION
  // =====================================================

  patientName?: string;

  doctorName?: string;


  // =====================================================
  // CONSULTATION DETAILS
  // =====================================================

  consultationDate: string;

  consultationTime: string;


  // =====================================================
  // CLINICAL INFORMATION
  // =====================================================

  chiefComplaint: string;

  symptoms?: string;

  diagnosis?: string;

  clinicalNotes?: string;

  treatmentPlan?: string;


  // =====================================================
  // FOLLOW-UP
  // =====================================================

  followUpDate?: string;


  // =====================================================
  // WORKFLOW STATUS
  // =====================================================

  status: ConsultationStatus;


  // =====================================================
  // WORKFLOW FLAGS
  // =====================================================

  hasLaboratoryRequests: boolean;

  hasLaboratoryResults: boolean;

  laboratoryResultsReviewed: boolean;

  hasPrescription: boolean;

  hasBilling: boolean;


  // =====================================================
  // AUDIT
  // =====================================================

  createdAt: string;

  updatedAt?: string;

  completedAt?: string;

}

