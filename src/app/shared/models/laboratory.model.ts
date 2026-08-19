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

  doctorId?: string;

  doctorName?: string;

  testId: string;

  testName: string;

  category: LaboratoryCategory;

  sampleType: SampleType;

  status: LaboratoryStatus;

  result?: string;

  notes?: string;

  price: number;

  requestedAt: string;

  completedAt?: string;

}
