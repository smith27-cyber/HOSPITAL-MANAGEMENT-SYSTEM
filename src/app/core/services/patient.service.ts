import { Injectable } from '@angular/core';
import { Patient } from '../../shared/models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private readonly storageKey = 'hms_patients';

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


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor() {

    this.loadPatients();

  }


  // =========================
  // GET ALL PATIENTS
  // =========================

  getPatients(): Patient[] {

    return [...this.patients];

  }


  // =========================
  // GET PATIENT BY ID
  // =========================

  getPatientById(
    id: string
  ): Patient | undefined {

    return this.patients.find(
      patient =>
        patient.id === id
    );

  }


  // =========================
  // ADD PATIENT
  // =========================

  addPatient(
    patientData: Omit<
      Patient,
      'id' | 'status' | 'createdAt'
    >
  ): Patient {

    const patient: Patient = {

      ...patientData,

      id: this.generatePatientId(),

      status: 'Active',

      createdAt:
        new Date().toISOString()

    };


    this.patients.push(
      patient
    );


    this.savePatients();


    return patient;

  }


  // =========================
  // UPDATE PATIENT
  // =========================

  updatePatient(
    updatedPatient: Patient
  ): void {

    const index =
      this.patients.findIndex(
        patient =>
          patient.id ===
          updatedPatient.id
      );


    if (index === -1) {
      return;
    }


    this.patients[index] = {
      ...updatedPatient
    };


    this.savePatients();

  }


  // =========================
  // DELETE PATIENT
  // =========================

  deletePatient(
    id: string
  ): void {

    this.patients =
      this.patients.filter(
        patient =>
          patient.id !== id
      );


    this.savePatients();

  }


  // =========================
  // DEACTIVATE PATIENT
  // =========================

  deactivatePatient(
    id: string
  ): void {

    const patient =
      this.patients.find(
        patient =>
          patient.id === id
      );


    if (!patient) {
      return;
    }


    patient.status =
      'Inactive';


    this.savePatients();

  }


  // =========================
  // GENERATE PATIENT ID
  // =========================

  private generatePatientId(): string {

    /*
     * Find the highest existing
     * patient number instead of
     * relying on array length.
     */

    let highestNumber = 123;


    for (const patient of this.patients) {

      const number =
        parseInt(
          patient.id.replace(
            'PT-',
            ''
          ),
          10
        );


      if (
        !isNaN(number) &&
        number > highestNumber
      ) {

        highestNumber = number;

      }

    }


    const nextNumber =
      highestNumber + 1;


    return `PT-${String(nextNumber).padStart(6, '0')}`;

  }


  // =========================
  // LOAD PATIENTS
  // =========================

  private loadPatients(): void {

    const stored =
      localStorage.getItem(
        this.storageKey
      );


    /*
     * If there is no saved data,
     * keep the default patients.
     */

    if (!stored) {

      this.savePatients();

      return;

    }


    try {

      const parsed =
        JSON.parse(stored);


      if (Array.isArray(parsed)) {

        this.patients =
          parsed;

      }

    } catch (error) {

      console.error(
        'Failed to load patients from localStorage:',
        error
      );

    }

  }


  // =========================
  // SAVE PATIENTS
  // =========================

  private savePatients(): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(
        this.patients
      )
    );

  }
    // =========================
  // UPDATE PATIENT STATUS
  // =========================

  updatePatientStatus(
    id: string,
    status: Patient['status']
  ): void {

    const patient =
      this.patients.find(
        patient =>
          patient.id === id
      );

    if (!patient) {
      return;
    }

    patient.status = status;

    this.savePatients();

  }

}
