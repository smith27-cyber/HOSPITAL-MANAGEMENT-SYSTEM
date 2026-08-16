import { Injectable } from '@angular/core';
import { Doctor } from '../../../shared/models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private readonly STORAGE_KEY = 'hms_doctors';

  private doctors: Doctor[] = [];


  constructor() {
    this.loadDoctorsFromStorage();
  }


  // =====================================================
  // LOAD FROM LOCAL STORAGE
  // =====================================================

  private loadDoctorsFromStorage(): void {

    const storedDoctors =
      localStorage.getItem(this.STORAGE_KEY);

    if (!storedDoctors) {

      this.doctors = [];

      return;
    }

    try {

      this.doctors =
        JSON.parse(storedDoctors) as Doctor[];

    } catch (error) {

      console.error(
        'Failed to load doctors from localStorage:',
        error
      );

      this.doctors = [];

    }
  }


  // =====================================================
  // SAVE TO LOCAL STORAGE
  // =====================================================

  private saveDoctorsToStorage(): void {

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this.doctors)
    );

  }


  // =====================================================
  // GET ALL DOCTORS
  // =====================================================

  getDoctors(): Doctor[] {

    return [...this.doctors];

  }


  // =====================================================
  // GET DOCTOR BY ID
  // =====================================================

  getDoctorById(id: string): Doctor | undefined {

    return this.doctors.find(
      doctor => doctor.id === id
    );

  }


  // =====================================================
  // ADD DOCTOR
  // =====================================================

  addDoctor(
    doctorData: Omit<
      Doctor,
      'id' | 'createdAt' | 'status'
    >
  ): Doctor {

    const newDoctor: Doctor = {

      id: this.generateDoctorId(),

      firstName: doctorData.firstName,

      lastName: doctorData.lastName,

      gender: doctorData.gender,

      dateOfBirth: doctorData.dateOfBirth,

      phone: doctorData.phone,

      email: doctorData.email,

      nationalId:
        doctorData.nationalId,

      specialization:
        doctorData.specialization,

      department:
        doctorData.department,

      licenseNumber:
        doctorData.licenseNumber,

      consultationFee:
        doctorData.consultationFee,

      status: 'Active',

      createdAt:
        new Date().toISOString()

    };


    this.doctors.push(newDoctor);

    this.saveDoctorsToStorage();


    return newDoctor;

  }


  // =====================================================
  // UPDATE DOCTOR
  // =====================================================

  updateDoctor(updatedDoctor: Doctor): void {

    const index =
      this.doctors.findIndex(
        doctor =>
          doctor.id === updatedDoctor.id
      );


    if (index === -1) {

      return;

    }


    this.doctors[index] =
      updatedDoctor;


    this.saveDoctorsToStorage();

  }


  // =====================================================
  // DEACTIVATE DOCTOR
  // =====================================================

  deactivateDoctor(id: string): void {

    const doctor =
      this.getDoctorById(id);


    if (!doctor) {

      return;

    }


    doctor.status = 'Inactive';


    this.saveDoctorsToStorage();

  }


  // =====================================================
  // DELETE DOCTOR
  // =====================================================

  deleteDoctor(id: string): void {

    this.doctors =
      this.doctors.filter(
        doctor =>
          doctor.id !== id
      );


    this.saveDoctorsToStorage();

  }


  // =====================================================
  // GENERATE DOCTOR ID
  // =====================================================

  private generateDoctorId(): string {

    const timestamp =
      Date.now().toString().slice(-6);


    return `DOC-${timestamp}`;

  }

}
