export type MedicineStatus =
  | 'Available'
  | 'Low Stock'
  | 'Out of Stock'
  | 'Expired';


export type MedicineForm =
  | 'Tablet'
  | 'Capsule'
  | 'Syrup'
  | 'Injection'
  | 'Cream'
  | 'Ointment'
  | 'Drops'
  | 'Inhaler'
  | 'Other';


export interface Medicine {

  id: string;

  name: string;

  genericName: string;

  category: string;

  form: MedicineForm;

  strength: string;

  manufacturer: string;

  batchNumber: string;

  quantity: number;

  reorderLevel: number;

  unitPrice: number;

  expiryDate: string;

  status: MedicineStatus;

  description?: string;

  createdAt: string;

  updatedAt?: string;

}
