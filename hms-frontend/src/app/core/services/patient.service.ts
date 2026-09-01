// =====================================================
// PATIENT SERVICE
// File:
// src/app/core/services/patient.service.ts
// =====================================================

import { Injectable } from '@angular/core';
import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  tap
} from 'rxjs/operators';

import {
  Patient
} from '../../shared/models/patient.model';


@Injectable({
  providedIn: 'root'
})
export class PatientService {


  // =====================================================
  // API URL
  // =====================================================

  private readonly apiUrl =
    'http://localhost:8081/api/patients';


  // =====================================================
  // LOCAL SNAPSHOT
  // =====================================================

  private patientsSnapshot: Patient[] = [];


  private patientSnapshotMap =
    new Map<string, Patient>();


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET ALL PATIENTS
  // =====================================================
getPatients(): Observable<Patient[]> {

  return new Observable<Patient[]>(subscriber => {

    this.http
      .get<Patient[]>(
        this.apiUrl
      )
      .subscribe({

        next: (patients) => {

          this.updatePatientsSnapshot(
            patients
          );

          subscriber.next(
            patients
          );

          subscriber.complete();

        },

        error: (error) => {

          subscriber.error(
            error
          );

        }

      });

  });

}


  // =====================================================
  // GET PATIENT BY ID
  // =====================================================

  getPatientById(
    id: string
  ): Observable<Patient> {

    console.log(
      'PatientService: requesting patient:',
      id
    );


    return this.http
      .get<Patient>(
        `${this.apiUrl}/${encodeURIComponent(id)}`
      )
      .pipe(

        tap((patient) => {

          console.log(
            'PatientService: patient received:',
            patient
          );


          this.updatePatientSnapshot(
            patient
          );

        })

      );

  }


  // =====================================================
  // GET PATIENTS SNAPSHOT
  // =====================================================

  getPatientsSnapshot(): Patient[] {

    return [
      ...this.patientsSnapshot
    ];

  }


  // =====================================================
  // GET PATIENT BY ID SNAPSHOT
  // =====================================================

  getPatientByIdSnapshot(
    id: string
  ): Patient | undefined {

    return this.patientSnapshotMap.get(
      id
    );

  }


  // =====================================================
  // ADD PATIENT
  // =====================================================

  addPatient(
    patient: Omit<
      Patient,
      'id' | 'status' | 'createdAt'
    >
  ): Observable<Patient> {

    return this.http
      .post<Patient>(
        this.apiUrl,
        {
          ...patient,
          status: 'Active'
        }
      )
      .pipe(

        tap((newPatient) => {

          this.updatePatientSnapshot(
            newPatient
          );

        })

      );

  }


  // =====================================================
  // UPDATE PATIENT
  // =====================================================

  updatePatient(
    patient: Patient
  ): Observable<Patient> {

    return this.http
      .put<Patient>(
        `${this.apiUrl}/${encodeURIComponent(patient.id)}`,
        patient
      )
      .pipe(

        tap((updatedPatient) => {

          this.updatePatientSnapshot(
            updatedPatient
          );

        })

      );

  }


  // =====================================================
  // DELETE PATIENT
  // =====================================================

  deletePatient(
    id: string
  ): Observable<void> {

    return this.http
      .delete<void>(
        `${this.apiUrl}/${encodeURIComponent(id)}`
      )
      .pipe(

        tap(() => {

          this.removePatientSnapshot(
            id
          );

        })

      );

  }


  // =====================================================
  // DEACTIVATE PATIENT
  // =====================================================

  deactivatePatient(
    id: string
  ): Observable<Patient> {

    return this.updatePatientStatus(
      id,
      'Inactive'
    );

  }


  // =====================================================
  // ACTIVATE PATIENT
  // =====================================================

  activatePatient(
    id: string
  ): Observable<Patient> {

    return this.updatePatientStatus(
      id,
      'Active'
    );

  }


  // =====================================================
  // UPDATE PATIENT STATUS
  // =====================================================

  updatePatientStatus(
    id: string,
    status: Patient['status']
  ): Observable<Patient> {

    return this.http
      .patch<Patient>(
        `${this.apiUrl}/${encodeURIComponent(id)}/status`,
        {
          status
        }
      )
      .pipe(

        tap((updatedPatient) => {

          this.updatePatientSnapshot(
            updatedPatient
          );

        })

      );

  }


  // =====================================================
  // UPDATE ALL PATIENT SNAPSHOTS
  // =====================================================

  private updatePatientsSnapshot(
    patients: Patient[]
  ): void {

    this.patientsSnapshot = [
      ...patients
    ];


    this.patientSnapshotMap.clear();


    patients.forEach(
      patient => {

        if (patient.id) {

          this.patientSnapshotMap.set(
            patient.id,
            patient
          );

        }

      }
    );

  }


  // =====================================================
  // UPDATE SINGLE PATIENT SNAPSHOT
  // =====================================================

  private updatePatientSnapshot(
    patient: Patient
  ): void {

    if (!patient?.id) {

      return;

    }


    this.patientSnapshotMap.set(
      patient.id,
      patient
    );


    const index =
      this.patientsSnapshot.findIndex(
        existingPatient =>
          existingPatient.id ===
          patient.id
      );


    if (index >= 0) {

      this.patientsSnapshot[index] =
        patient;

    } else {

      this.patientsSnapshot.push(
        patient
      );

    }

  }


  // =====================================================
  // REMOVE PATIENT SNAPSHOT
  // =====================================================

  private removePatientSnapshot(
    id: string
  ): void {

    this.patientSnapshotMap.delete(
      id
    );


    this.patientsSnapshot =
      this.patientsSnapshot.filter(
        patient =>
          patient.id !== id
      );

  }

}
