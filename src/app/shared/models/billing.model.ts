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
// BILL ITEM
// =====================================================

export interface BillItem {

  id: string;

  billingType: BillingType;

  description: string;

  quantity: number;

  unitPrice: number;

  amount: number;

  referenceId?: string;

}


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


  // ===================================================
  // LEGACY / PRIMARY BILL INFORMATION
  //
  // Kept because existing Billing pages, forms and
  // PharmacyService still use these properties.
  // ===================================================

  billingType: BillingType;

  description: string;


  // ===================================================
  // BILLING ITEMS
  //
  // A single invoice can contain:
  //
  // Consultation
  // Laboratory
  // Pharmacy
  // Admission
  // Procedure
  // Other
  //
  // Made optional so older records/code remain valid.
  // ===================================================

  items?: BillItem[];


  // ===================================================
  // TOTALS
  // ===================================================

  amount: number;

  amountPaid: number;

  balance: number;


  // ===================================================
  // PAYMENT
  // ===================================================

  paymentMethod?: PaymentMethod;

  status: BillingStatus;


  // ===================================================
  // INVOICE
  // ===================================================

  invoiceNumber: string;

  billingDate: string;

  dueDate?: string;


  // ===================================================
  // NOTES
  // =====================================================

  notes?: string;


  // =====================================================
  // AUDIT
  // =====================================================

  createdAt: string;

  updatedAt?: string;

}
