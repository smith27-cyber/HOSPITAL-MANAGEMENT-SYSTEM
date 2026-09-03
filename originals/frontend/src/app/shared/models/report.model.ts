
// =====================================================
// REPORT MODEL
// File:
// src/app/shared/models/report.model.ts
// =====================================================

export type ReportType =
  | 'Appointments'
  | 'Patients'
  | 'Doctors'
  | 'Departments'
  | 'Consultations'
  | 'Pharmacy'
  | 'Laboratory'
  | 'Admissions'
  | 'Billing'
  | 'Inventory'
  | 'General';


export type ReportStatus =
  | 'Generated'
  | 'Pending'
  | 'Failed';


export interface Report {

  // ===================================================
  // IDENTIFICATION
  // ===================================================

  id: string;

  name: string;

  type: ReportType;

  description?: string;


  // ===================================================
  // DATE RANGE
  // ===================================================

  startDate?: string;

  endDate?: string;


  // ===================================================
  // REPORT INFORMATION
  // ===================================================

  generatedBy?: string;

  generatedAt: string;

  status: ReportStatus;


  // ===================================================
  // STATISTICS
  // ===================================================

  totalRecords?: number;

  totalPatients?: number;

  totalAppointments?: number;

  totalDoctors?: number;

  totalRevenue?: number;


  // ===================================================
  // ADDITIONAL DATA
  // ===================================================

  data?: unknown;


  // ===================================================
  // FILE INFORMATION
  // ===================================================

  fileName?: string;

  fileType?: 'PDF' | 'Excel' | 'CSV' | 'JSON';

  fileUrl?: string;

}

