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

  | 'Saliva'

  | 'Tissue'

  | 'Other';


// =====================================================
// TEST CATEGORY
// =====================================================

export type LaboratoryCategory =

  | 'Hematology'

  | 'Biochemistry'

  | 'Microbiology'

  | 'Parasitology'

  | 'Serology'

  | 'Urinalysis'

  | 'Immunology'

  | 'Pathology'

  | 'Other';


// =====================================================
// LABORATORY TEST
// =====================================================

export interface LaboratoryTest {

  id: string;

  testName: string;

  category: LaboratoryCategory;

  sampleType: SampleType;

  description?: string;

  price: number;

  normalRange?: string;

  preparationInstructions?: string;

  createdAt: string;

  updatedAt?: string;

}


// =====================================================
// LABORATORY REQUEST
// =====================================================

export interface LaboratoryRequest {

  id: string;

  patientId: string;

  patientName: string;


  // ===================================================
  // RELATED CONSULTATION
  // ===================================================

  consultationId?: string;


  // ===================================================
  // DOCTOR
  // ===================================================

  doctorId?: string;

  doctorName?: string;


  // ===================================================
  // TEST INFORMATION
  // ===================================================

  testId: string;

  testName: string;

  category: LaboratoryCategory;

  sampleType: SampleType;


  // ===================================================
  // STATUS
  // ===================================================

  status: LaboratoryStatus;


  // ===================================================
  // RESULT
  // ===================================================

  result?: string;

  notes?: string;


  // ===================================================
  // BILLING
  // ===================================================

  price: number;


  // ===================================================
  // DATES
  // ===================================================

  requestedAt: string;

  completedAt?: string;

}
