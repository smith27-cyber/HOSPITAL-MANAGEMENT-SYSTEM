export interface Doctor {

  id: string;

  firstName: string;
  lastName: string;

  gender: 'Male' | 'Female' | 'Other'|'';

  dateOfBirth: string;

  phone: string;
  email: string;

  nationalId?: string;

  specialization: string;
  department: string;

  licenseNumber: string;

  status: 'Active' | 'Inactive';

  consultationFee?: number;

  createdAt: string;

}
