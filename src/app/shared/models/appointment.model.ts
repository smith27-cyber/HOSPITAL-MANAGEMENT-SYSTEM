export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Checked-In'
  | 'In Consultation'
  | 'Completed'
  | 'Cancelled'
  | 'No Show';

export type AppointmentType =
  | 'Consultation'
  | 'Follow-up'
  | 'Emergency'
  | 'Check-up';

export interface Appointment {

  id: string;

  patientId: string;
  patientName: string;

  doctorId: string;
  doctorName: string;

  department: string;

  appointmentDate: string;
  appointmentTime: string;

  type: AppointmentType;

  reason: string;

  status: AppointmentStatus;

  notes?: string;

  createdAt: Date;

  // =========================
  // CONSULTATION
  // =========================

  diagnosis?: string;

  consultationNotes?: string;

  treatmentPlan?: string;

  prescription?: string;

  consultationDate?: string;
}
