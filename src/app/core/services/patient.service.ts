import { Injectable } from '@angular/core';
import { Patient } from '../../shared/models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private patients: Patient[] = [
    {
      id: 'PT-000124',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1992-05-14',
      gender: 'Male',
      phone: '0701 234 567',
      email: 'john.doe@example.com',
      address: 'Kampala',
      nationalId: '',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '0702 345 678',
      bloodGroup: 'O+',
      department: 'General Medicine',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'PT-000125',
      firstName: 'Mary',
      lastName: 'Jane',
      dateOfBirth: '1997-08-21',
      gender: 'Female',
      phone: '0772 345 678',
      email: 'mary.jane@example.com',
      address: 'Entebbe',
      nationalId: '',
      emergencyContactName: 'Peter Jane',
      emergencyContactPhone: '0773 456 789',
      bloodGroup: 'A+',
      department: 'Cardiology',
      status: 'Active',
      createdAt: new Date().toISOString()
    }
  ];

  getPatients(): Patient[] {
    return this.patients;
  }

  getPatientById(id: string): Patient | undefined {
    return this.patients.find(patient => patient.id === id);
  }

  addPatient(patientData: Omit<Patient, 'id' | 'status' | 'createdAt'>): Patient {

    const patient: Patient = {
      ...patientData,
      id: this.generatePatientId(),
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    this.patients.push(patient);

    return patient;
  }

  updatePatient(updatedPatient: Patient): void {

    const index = this.patients.findIndex(
      patient => patient.id === updatedPatient.id
    );

    if (index !== -1) {
      this.patients[index] = updatedPatient;
    }
  }

  deletePatient(id: string): void {
    this.patients = this.patients.filter(
      patient => patient.id !== id
    );
  }

  private generatePatientId(): string {

    const nextNumber = this.patients.length + 124;

    return `PT-${String(nextNumber).padStart(6, '0')}`;
  }

}
