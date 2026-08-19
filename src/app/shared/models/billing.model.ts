// =====================================================
// BILLING STATUS
// =====================================================

export type BillingStatus =
  | 'Pending'
  | 'Partially Paid'
  | 'Paid'
  | 'Cancelled';


// =====================================================
// PAYMENT METHOD
// =====================================================

export type PaymentMethod =
  | 'Cash'
  | 'Mobile Money'
  | 'Card'
  | 'Bank Transfer'
  | 'Insurance'
  | 'Other';


// =====================================================
// BILLING TYPE
// =====================================================

export type BillingType =
  | 'Consultation'
  | 'Laboratory'
  | 'Pharmacy'
  | 'Admission'
  | 'Procedure'
  | 'Other';


// =====================================================
// BILL
// =====================================================

export interface Bill {

  id: string;

  patientId: string;

  patientName: string;

  patientNumber?: string;

  doctorId?: string;

  doctorName?: string;

  departmentId?: string;

  departmentName?: string;

  billingType: BillingType;

  description: string;

  amount: number;

  amountPaid: number;

  balance: number;

  paymentMethod?: PaymentMethod;

  status: BillingStatus;

  invoiceNumber: string;

  billingDate: string;

  dueDate?: string;

  notes?: string;

  createdAt: string;

  updatedAt?: string;

}
