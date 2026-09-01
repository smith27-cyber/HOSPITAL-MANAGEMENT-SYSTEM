export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  nationalId: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodGroup: string;
  department: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}
