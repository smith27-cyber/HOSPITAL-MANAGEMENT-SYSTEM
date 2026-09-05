// =====================================================
// ADMISSION SERVICE
// File:
// src/app/features/admissions/services/admission.service.ts
// =====================================================

import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpErrorResponse,
  HttpParams
} from '@angular/common/http';

import {
  Observable,
  catchError,
  forkJoin,
  throwError
} from 'rxjs';

import {
  Admission,
  AdmissionStatus,
  AdmissionType,
  WardType
} from '../../shared/models/admission.model';


@Injectable({
  providedIn: 'root'
})
export class AdmissionService {


  // =====================================================
  // API URL
  // =====================================================

  private readonly API_URL =
    'http://localhost:8081/api/admissions';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly http: HttpClient
  ) {}


  // =====================================================
  // GET ALL ADMISSIONS
  // GET /api/admissions
  // =====================================================

  getAdmissions(): Observable<Admission[]> {

    return this.http.get<Admission[]>(
      this.API_URL
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // GET ADMISSION BY ID
  // GET /api/admissions/{id}
  // =====================================================

  getAdmissionById(
    id: string
  ): Observable<Admission> {

    return this.http.get<Admission>(
      `${this.API_URL}/${encodeURIComponent(id)}`
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // ADD ADMISSION
  // POST /api/admissions
  // =====================================================

  addAdmission(
    admission: Admission
  ): Observable<Admission> {

    return this.http.post<Admission>(
      this.API_URL,
      admission
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // UPDATE ADMISSION
  // PUT /api/admissions/{id}
  // =====================================================

  updateAdmission(
    admission: Admission
  ): Observable<Admission> {

    return this.http.put<Admission>(
      `${this.API_URL}/${encodeURIComponent(admission.id)}`,
      admission
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // DELETE ADMISSION
  // DELETE /api/admissions/{id}
  // =====================================================

  deleteAdmission(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.API_URL}/${encodeURIComponent(id)}`
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // UPDATE STATUS
  // PATCH /api/admissions/{id}/status
  // =====================================================

  updateAdmissionStatus(
    id: string,
    status: AdmissionStatus
  ): Observable<Admission> {

    const params =
      new HttpParams().set(
        'status',
        status
      );

    return this.http.patch<Admission>(
      `${this.API_URL}/${encodeURIComponent(id)}/status`,
      null,
      { params }
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // DISCHARGE ADMISSION
  // PATCH /api/admissions/{id}/discharge
  // =====================================================

  dischargeAdmission(
    id: string
  ): Observable<Admission> {

    return this.http.patch<Admission>(
      `${this.API_URL}/${encodeURIComponent(id)}/discharge`,
      null
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // TRANSFER ADMISSION
  // PATCH /api/admissions/{id}/transfer
  // =====================================================

  transferAdmission(
    id: string,
    ward: WardType,
    bedNumber?: string
  ): Observable<Admission> {

    let params =
      new HttpParams().set(
        'ward',
        ward
      );

    if (bedNumber?.trim()) {

      params =
        params.set(
          'bedNumber',
          bedNumber.trim()
        );

    }

    return this.http.patch<Admission>(
      `${this.API_URL}/${encodeURIComponent(id)}/transfer`,
      null,
      { params }
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // CANCEL ADMISSION
  // PATCH /api/admissions/{id}/cancel
  // =====================================================

  cancelAdmission(
    id: string
  ): Observable<Admission> {

    return this.http.patch<Admission>(
      `${this.API_URL}/${encodeURIComponent(id)}/cancel`,
      null
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // GET BY PATIENT
  // GET /api/admissions/patient/{patientId}
  // =====================================================

  getAdmissionsByPatient(
    patientId: string
  ): Observable<Admission[]> {

    return this.http.get<Admission[]>(
      `${this.API_URL}/patient/${encodeURIComponent(patientId)}`
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // GET ACTIVE ADMISSION BY PATIENT
  // GET /api/admissions/patient/{patientId}/active
  // =====================================================

  getActiveAdmission(
    patientId: string
  ): Observable<Admission> {

    return this.http.get<Admission>(
      `${this.API_URL}/patient/${encodeURIComponent(patientId)}/active`
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // GET BY STATUS
  // GET /api/admissions/status/{status}
  // =====================================================

  getAdmissionsByStatus(
    status: AdmissionStatus
  ): Observable<Admission[]> {

    return this.http.get<Admission[]>(
      `${this.API_URL}/status/${status}`
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // GET BY DOCTOR
  // GET /api/admissions/doctor/{doctorId}
  // =====================================================

  getAdmissionsByDoctor(
    doctorId: string
  ): Observable<Admission[]> {

    return this.http.get<Admission[]>(
      `${this.API_URL}/doctor/${encodeURIComponent(doctorId)}`
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // GET BY DEPARTMENT
  // GET /api/admissions/department/{departmentId}
  // =====================================================

  getAdmissionsByDepartment(
    departmentId: string
  ): Observable<Admission[]> {

    return this.http.get<Admission[]>(
      `${this.API_URL}/department/${encodeURIComponent(departmentId)}`
    ).pipe(
      catchError(this.handleError)
    );

  }


  // =====================================================
  // GET ACTIVE ADMISSIONS BY WARD
  // GET /api/admissions/ward/{ward}/active
  // =====================================================

  getActiveAdmissionsByWard(
    ward: WardType
  ): Observable<Admission[]> {

    return this.http.get<Admission[]>(
      `${this.API_URL}/ward/${ward}/active`
    ).pipe(
      catchError(this.handleError)
    );

  }

// =====================================================
// GET ADMISSION STATISTICS
// =====================================================

getStatistics(): Observable<{
  total: number;
  active: number;
  discharged: number;
  transferred: number;
  cancelled: number;
}> {

  return forkJoin({
    total: this.http.get<number>(
      `${this.API_URL}/statistics/count`
    ),

    active: this.http.get<number>(
      `${this.API_URL}/statistics/active`
    ),

    discharged: this.http.get<number>(
      `${this.API_URL}/statistics/discharged`
    ),

    transferred: this.http.get<number>(
      `${this.API_URL}/statistics/transferred`
    ),

    cancelled: this.http.get<number>(
      `${this.API_URL}/statistics/cancelled`
    )
  }).pipe(
    catchError(this.handleError)
  );

}

  // =====================================================
  // ERROR HANDLER
  // =====================================================

  private handleError(
    error: HttpErrorResponse
  ) {

    let message =
      'An unexpected error occurred.';

    if (error.error instanceof ErrorEvent) {

      message =
        `Network error: ${error.error.message}`;

    } else if (error.status === 0) {

      message =
        'Unable to connect to the HMS backend. ' +
        'Please make sure Spring Boot is running on port 8081.';

    } else if (error.error?.message) {

      message =
        error.error.message;

    } else if (typeof error.error === 'string') {

      message =
        error.error;

    } else if (error.status === 404) {

      message =
        'Admission record was not found.';

    } else if (error.status === 409) {

      message =
        'The admission request conflicts with existing data.';

    } else if (error.status >= 400) {

      message =
        `Request failed with HTTP ${error.status}.`;

    }

    console.error(
      'AdmissionService error:',
      error
    );

    return throwError(
      () => new Error(message)
    );

  }

}