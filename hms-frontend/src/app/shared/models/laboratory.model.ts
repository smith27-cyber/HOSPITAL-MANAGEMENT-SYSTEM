
export type LaboratoryCategory =

  | 'Hematology'
  | 'Chemistry'
  | 'Biochemistry'
  | 'Microbiology'
  | 'Immunology'
  | 'Parasitology'
  | 'Serology'
  | 'Urinalysis'
  | 'Blood Bank'
  | 'Pathology'
  | 'Molecular'
  | 'Other';


// =====================================================
// LABORATORY STATUS
// =====================================================

export type LaboratoryStatus =

  | 'Pending'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';


// =====================================================
// SAMPLE TYPE
// =====================================================

export type SampleType =

  | 'Blood'
  | 'Urine'
  | 'Stool'
  | 'Sputum'
  | 'Swab'
  | 'Serum'
  | 'Plasma'
  | 'Saliva'
  | 'Tissue'
  | 'Other';


// =====================================================
// LABORATORY TEST
// =====================================================

export interface LaboratoryTest {

  // PostgreSQL generated ID
  // New tests use 0 before being saved.
  id: number;

  testName: string;

  category: LaboratoryCategory;

  sampleType: SampleType;

  description?: string;

  price: number;

  normalRange?: string;

  preparationInstructions?: string;

  createdAt?: string;

  updatedAt?: string;
}


// =====================================================
// LABORATORY REQUEST
// =====================================================
//
// Existing requests from PostgreSQL have numeric IDs.
//
// New requests created in the frontend do not have a
// PostgreSQL ID yet.
//
// The consultation form may temporarily use a string ID
// for frontend-only tracking.
//
// =====================================================

export interface LaboratoryRequest {

  id?: number | string;

  patientId: string;

  patientName: string;

  consultationId?: string;

  doctorId?: string;

  doctorName?: string;

  testId: number;

  testName: string;

  category: LaboratoryCategory;

  sampleType: SampleType;

  status: LaboratoryStatus;

  result?: string;

  notes?: string;

  price: number;

  requestedAt?: string;

  completedAt?: string;
}

