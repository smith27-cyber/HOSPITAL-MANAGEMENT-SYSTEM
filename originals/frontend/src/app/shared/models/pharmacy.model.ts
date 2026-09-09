
import { BillingStatus } from './billing.model';


// =====================================================
// PHARMACY PRESCRIPTION STATUS
// =====================================================

export type PharmacyPrescriptionStatus =
  | 'Waiting'
  | 'Preparing'
  | 'Awaiting Payment'
  | 'Paid'
  | 'Ready for Pickup'
  | 'Dispensed'
  | 'Cancelled';


// =====================================================
// PRESCRIPTION ITEM
// =====================================================

export interface PharmacyPrescriptionItem {

  medicineId: string;

  medicineName: string;

  itemCode?: string;

  quantity: number;

  unit: string;

  unitPrice: number;

  totalPrice: number;

  dosage?: string;

  frequency?: string;

  duration?: string;

  instructions?: string;

}


// =====================================================
// PHARMACY PRESCRIPTION
// =====================================================

export interface PharmacyPrescription {

  /**
   * Backend uses Long for the prescription ID.
   */
  id: number;

  prescriptionNumber: string;

  patientId: string;

  patientName: string;

  patientNumber?: string;

  consultationId?: string;

  doctorId?: string;

  doctorName?: string;

  items: PharmacyPrescriptionItem[];

  subtotal: number;

  amountPaid: number;

  balance: number;

  billingId?: string;

  billingStatus?: BillingStatus;

  status: PharmacyPrescriptionStatus;

  prescriptionDate: string;

  preparedAt?: string;

  paymentDate?: string;

  dispensedAt?: string;

  dispensedBy?: string;

  notes?: string;

  createdAt: string;

  updatedAt?: string;

}

