import { Injectable } from '@angular/core';

import {
  Admission,
  AdmissionStatus
} from '../../shared/models/admission.model';


@Injectable({
  providedIn: 'root'
})
export class AdmissionService {


  // =====================================================
  // STORAGE KEY
  // =====================================================

  private readonly storageKey =
    'hms_admissions';


  // =====================================================
  // DATA
  // =====================================================

  private admissions: Admission[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    this.loadAdmissions();

  }


  // =====================================================
  // GET ALL ADMISSIONS
  // =====================================================

  getAdmissions(): Admission[] {

    return [
      ...this.admissions
    ];

  }


  // =====================================================
  // GET ADMISSION BY ID
  // =====================================================

  getAdmissionById(
    id: string
  ): Admission | undefined {

    return this.admissions.find(
      admission =>
        admission.id === id
    );

  }


  // =====================================================
  // ADD ADMISSION
  // =====================================================

  addAdmission(
    admission: Admission
  ): void {

    this.admissions.push({
      ...admission
    });

    this.saveAdmissions();

  }


  // =====================================================
  // UPDATE ADMISSION
  // =====================================================

  updateAdmission(
    updatedAdmission: Admission
  ): boolean {

    const index =
      this.admissions.findIndex(
        admission =>
          admission.id ===
          updatedAdmission.id
      );


    if (index === -1) {

      return false;

    }


    this.admissions[index] = {

      ...updatedAdmission,

      updatedAt:
        new Date().toISOString()

    };


    this.saveAdmissions();


    return true;

  }


  // =====================================================
  // DELETE ADMISSION
  // =====================================================

  deleteAdmission(
    id: string
  ): boolean {

    const originalLength =
      this.admissions.length;


    this.admissions =
      this.admissions.filter(
        admission =>
          admission.id !== id
      );


    if (
      this.admissions.length ===
      originalLength
    ) {

      return false;

    }


    this.saveAdmissions();


    return true;

  }


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  updateAdmissionStatus(
    id: string,
    status: AdmissionStatus
  ): boolean {

    const admission =
      this.getAdmissionById(id);


    if (!admission) {

      return false;

    }


    admission.status =
      status;


    if (
      status === 'Discharged'
    ) {

      admission.dischargeDate =
        new Date().toISOString();

    }


    this.saveAdmissions();


    return true;

  }


  // =====================================================
  // GET BY PATIENT
  // =====================================================

  getAdmissionsByPatient(
    patientId: string
  ): Admission[] {

    return this.admissions.filter(
      admission =>
        admission.patientId ===
        patientId
    );

  }


  // =====================================================
  // GET ACTIVE ADMISSIONS
  // =====================================================

  getActiveAdmissions(): Admission[] {

    return this.admissions.filter(
      admission =>
        admission.status ===
        'Admitted'
    );

  }


  // =====================================================
  // GET DISCHARGED
  // =====================================================

  getDischargedAdmissions(): Admission[] {

    return this.admissions.filter(
      admission =>
        admission.status ===
        'Discharged'
    );

  }


  // =====================================================
  // GET TRANSFERRED
  // =====================================================

  getTransferredAdmissions(): Admission[] {

    return this.admissions.filter(
      admission =>
        admission.status ===
        'Transferred'
    );

  }


  // =====================================================
  // GET CANCELLED
  // =====================================================

  getCancelledAdmissions(): Admission[] {

    return this.admissions.filter(
      admission =>
        admission.status ===
        'Cancelled'
    );

  }


  // =====================================================
  // SAVE
  // =====================================================

  private saveAdmissions(): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(
        this.admissions
      )
    );

  }


  // =====================================================
  // LOAD
  // =====================================================

  private loadAdmissions(): void {

    const stored =
      localStorage.getItem(
        this.storageKey
      );


    if (!stored) {

      this.admissions = [];

      return;

    }


    try {

      const parsed =
        JSON.parse(stored);


      if (
        Array.isArray(parsed)
      ) {

        this.admissions =
          parsed;

      } else {

        this.admissions = [];

      }

    } catch (error) {

      console.error(
        'Failed to load admissions:',
        error
      );

      this.admissions = [];

    }

  }

}
