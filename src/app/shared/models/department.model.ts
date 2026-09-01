export interface Department {

  id: string;

  name: string;

  code: string;

  description?: string;

  headOfDepartment?: string;

  phone?: string;

  email?: string;

  location?: string;

  status: 'Active' | 'Inactive';

  createdAt: string;

}
