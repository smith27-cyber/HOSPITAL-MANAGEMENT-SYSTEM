// =====================================================
// DOCTOR SERVICE
// File:
// src/app/core/services/doctor.service.ts
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { Doctor } from '../../shared/models/doctor.model';


@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  // =====================================================
  // API URL
  // =====================================================

  private readonly API_URL =
    '/api/doctors';


  // =====================================================
  // LOCAL CACHE
  // =====================================================

  private doctors: Doctor[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET ALL DOCTORS
  // =====================================================

  getDoctors(): Observable<Doctor[]> {

    return this.http
      .get<Doctor[]>(
        this.API_URL
      )
      .pipe(

        tap(
          (doctors: Doctor[]) => {

            this.doctors =
              [...doctors];

          }
        )

      );

  }


  // =====================================================
  // GET DOCTORS SNAPSHOT
  // =====================================================
  //
  // Used by existing synchronous HMS services such as
  // ReportService.
  //
  // IMPORTANT:
  // This returns the latest doctors received from the
  // Spring Boot API.
  // =====================================================

  getDoctorsSnapshot(): Doctor[] {

    return [
      ...this.doctors
    ];

  }


  // =====================================================
  // GET DOCTOR BY ID
  // =====================================================

  getDoctorById(
    id: string
  ): Observable<Doctor> {

    return this.http
      .get<Doctor>(
        `${this.API_URL}/${id}`
      );

  }


  // =====================================================
  // ADD DOCTOR
  // =====================================================

  addDoctor(
    doctorData:
      Omit<
        Doctor,
        'id' |
        'status' |
        'createdAt'
      >
  ): Observable<Doctor> {

    return this.http
      .post<Doctor>(
        this.API_URL,
        doctorData
      )
      .pipe(

        tap(
          (doctor: Doctor) => {

            this.doctors = [
              ...this.doctors,
              doctor
            ];

          }
        )

      );

  }


  // =====================================================
  // UPDATE DOCTOR
  // =====================================================

  updateDoctor(
    updatedDoctor: Doctor
  ): Observable<Doctor> {

    return this.http
      .put<Doctor>(
        `${this.API_URL}/${updatedDoctor.id}`,
        updatedDoctor
      )
      .pipe(

        tap(
          (doctor: Doctor) => {

            const index =
              this.doctors.findIndex(
                (item: Doctor) =>
                  item.id === doctor.id
              );


            if (index !== -1) {

              this.doctors[index] =
                doctor;

            } else {

              this.doctors.push(
                doctor
              );

            }

            this.doctors = [
              ...this.doctors
            ];

          }
        )

      );

  }


  // =====================================================
  // DEACTIVATE DOCTOR
  // =====================================================

  deactivateDoctor(
    id: string
  ): Observable<Doctor> {

    return this.http
      .patch<Doctor>(
        `${this.API_URL}/${id}/status`,
        {
          status: 'Inactive'
        }
      )
      .pipe(

        tap(
          (doctor: Doctor) => {

            this.updateCachedDoctor(
              doctor
            );

          }
        )

      );

  }


  // =====================================================
  // ACTIVATE DOCTOR
  // =====================================================

  activateDoctor(
    id: string
  ): Observable<Doctor> {

    return this.http
      .patch<Doctor>(
        `${this.API_URL}/${id}/status`,
        {
          status: 'Active'
        }
      )
      .pipe(

        tap(
          (doctor: Doctor) => {

            this.updateCachedDoctor(
              doctor
            );

          }
        )

      );

  }


  // =====================================================
  // DELETE DOCTOR
  // =====================================================

  deleteDoctor(
    id: string
  ): Observable<void> {

    return this.http
      .delete<void>(
        `${this.API_URL}/${id}`
      )
      .pipe(

        tap(
          () => {

            this.doctors =
              this.doctors.filter(
                (doctor: Doctor) =>
                  doctor.id !== id
              );

          }
        )

      );

  }


  // =====================================================
  // UPDATE CACHED DOCTOR
  // =====================================================

  private updateCachedDoctor(
    updatedDoctor: Doctor
  ): void {

    const index =
      this.doctors.findIndex(
        (doctor: Doctor) =>
          doctor.id ===
          updatedDoctor.id
      );


    if (index !== -1) {

      this.doctors[index] =
        updatedDoctor;

    } else {

      this.doctors.push(
        updatedDoctor
      );

    }


    this.doctors = [
      ...this.doctors
    ];

  }

}
