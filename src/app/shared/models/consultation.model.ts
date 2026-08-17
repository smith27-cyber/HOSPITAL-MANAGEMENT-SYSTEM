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
  // STATUS
  // =====================================================

  status:
    'Open' |
    'Completed' |
    'Cancelled';


  // =====================================================
  // AUDIT
  // =====================================================

  createdAt: string;

}
