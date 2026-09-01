
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  LaboratoryTest,
  LaboratoryRequest,
  LaboratoryStatus
} from '../../shared/models/laboratory.model';


@Injectable({
  providedIn: 'root'
})
export class LaboratoryService {

  // =====================================================
  // API URLS
  // =====================================================

  private readonly TESTS_API_URL =
    'http://localhost:8081/api/laboratory/tests';

  private readonly REQUESTS_API_URL =
    'http://localhost:8081/api/laboratory/requests';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly http: HttpClient
  ) {}


  // =====================================================
  // LABORATORY TESTS
  // =====================================================

  getTests(): Observable<LaboratoryTest[]> {

    return this.http.get<LaboratoryTest[]>(
      this.TESTS_API_URL
    );

  }


  // =====================================================
  // GET TEST BY ID
  // =====================================================

  getTestById(
    id: string | number
  ): Observable<LaboratoryTest | undefined> {

    return this.http.get<LaboratoryTest>(
      `${this.TESTS_API_URL}/${id}`
    );

  }


  // =====================================================
  // ADD TEST
  // =====================================================

  addTest(
    test: LaboratoryTest
  ): Observable<LaboratoryTest> {

    const payload = {

      testName:
        test.testName,

      category:
        test.category,

      sampleType:
        test.sampleType,

      description:
        test.description,

      price:
        test.price,

      normalRange:
        test.normalRange,

      preparationInstructions:
        test.preparationInstructions

    };


    return this.http.post<LaboratoryTest>(
      this.TESTS_API_URL,
      payload
    );

  }


  // =====================================================
  // UPDATE TEST
  // =====================================================

  updateTest(
    test: LaboratoryTest
  ): Observable<LaboratoryTest> {

    const payload = {

      testName:
        test.testName,

      category:
        test.category,

      sampleType:
        test.sampleType,

      description:
        test.description,

      price:
        test.price,

      normalRange:
        test.normalRange,

      preparationInstructions:
        test.preparationInstructions

    };


    return this.http.put<LaboratoryTest>(
      `${this.TESTS_API_URL}/${test.id}`,
      payload
    );

  }


  // =====================================================
  // DELETE TEST
  // =====================================================

  deleteTest(
    id: string | number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.TESTS_API_URL}/${id}`
    );

  }


  // =====================================================
  // LABORATORY REQUESTS
  // =====================================================

  getRequests(): Observable<LaboratoryRequest[]> {

    return this.http.get<LaboratoryRequest[]>(
      this.REQUESTS_API_URL
    );

  }


  // =====================================================
  // GET REQUEST BY ID
  // =====================================================

  getRequestById(
    id: string | number
  ): Observable<LaboratoryRequest | undefined> {

    return this.http.get<LaboratoryRequest>(
      `${this.REQUESTS_API_URL}/${id}`
    );

  }


  // =====================================================
  // ADD REQUEST
  // =====================================================
  //
  // IMPORTANT:
  // A new laboratory request does NOT require an ID.
  // The backend/database should generate the ID.
  //
  // This prevents the consultation form from having to
  // manufacture a permanent laboratory request ID.
  // =====================================================

  addRequest(
    request: Omit<LaboratoryRequest, 'id'>
  ): Observable<LaboratoryRequest> {

    const payload = {

      patientId:
        request.patientId,

      patientName:
        request.patientName,

      consultationId:
        request.consultationId,

      doctorId:
        request.doctorId,

      doctorName:
        request.doctorName,

      testId:
        request.testId,

      testName:
        request.testName,

      category:
        request.category,

      sampleType:
        request.sampleType,

      status:
        request.status,

      result:
        request.result,

      notes:
        request.notes,

      price:
        request.price,

      requestedAt:
        request.requestedAt,

      completedAt:
        request.completedAt

    };


    return this.http.post<LaboratoryRequest>(
      this.REQUESTS_API_URL,
      payload
    );

  }


  // =====================================================
  // UPDATE REQUEST
  // =====================================================

  updateRequest(
    request: LaboratoryRequest
  ): Observable<LaboratoryRequest> {

    const payload = {

      patientId:
        request.patientId,

      patientName:
        request.patientName,

      consultationId:
        request.consultationId,

      doctorId:
        request.doctorId,

      doctorName:
        request.doctorName,

      testId:
        request.testId,

      testName:
        request.testName,

      category:
        request.category,

      sampleType:
        request.sampleType,

      status:
        request.status,

      result:
        request.result,

      notes:
        request.notes,

      price:
        request.price,

      requestedAt:
        request.requestedAt,

      completedAt:
        request.completedAt

    };


    return this.http.put<LaboratoryRequest>(
      `${this.REQUESTS_API_URL}/${request.id}`,
      payload
    );

  }


  // =====================================================
  // UPDATE REQUEST STATUS
  // =====================================================

  updateRequestStatus(
    id: string | number,
    status: LaboratoryStatus
  ): Observable<LaboratoryRequest> {

    return this.http.patch<LaboratoryRequest>(
      `${this.REQUESTS_API_URL}/${id}/status`,
      null,
      {
        params: {
          status
        }
      }
    );

  }


  // =====================================================
  // COMPLETE REQUEST
  // =====================================================

  completeRequest(
    id: string | number
  ): Observable<LaboratoryRequest> {

    return this.updateRequestStatus(
      id,
      'Completed'
    );

  }


  // =====================================================
  // DELETE REQUEST
  // =====================================================

  deleteRequest(
    id: string | number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.REQUESTS_API_URL}/${id}`
    );

  }


  // =====================================================
  // GET REQUESTS BY PATIENT
  // =====================================================

  getRequestsByPatient(
    patientId: string | number
  ): Observable<LaboratoryRequest[]> {

    return this.http.get<LaboratoryRequest[]>(
      `${this.REQUESTS_API_URL}/patient/${encodeURIComponent(patientId)}`
    );

  }


  // =====================================================
  // GET REQUESTS BY CONSULTATION
  // =====================================================

  getRequestsByConsultation(
    consultationId: string | number
  ): Observable<LaboratoryRequest[]> {

    return this.http.get<LaboratoryRequest[]>(
      `${this.REQUESTS_API_URL}/consultation/${encodeURIComponent(consultationId)}`
    );

  }


  // =====================================================
  // GET PENDING REQUESTS
  // =====================================================

  getPendingRequests():
    Observable<LaboratoryRequest[]> {

    return this.getRequestsByStatus(
      'Pending'
    );

  }


  // =====================================================
  // GET IN-PROGRESS REQUESTS
  // =====================================================

  getInProgressRequests():
    Observable<LaboratoryRequest[]> {

    return this.getRequestsByStatus(
      'In Progress'
    );

  }


  // =====================================================
  // GET COMPLETED REQUESTS
  // =====================================================

  getCompletedRequests():
    Observable<LaboratoryRequest[]> {

    return this.getRequestsByStatus(
      'Completed'
    );

  }


  // =====================================================
  // GET CANCELLED REQUESTS
  // =====================================================

  getCancelledRequests():
    Observable<LaboratoryRequest[]> {

    return this.getRequestsByStatus(
      'Cancelled'
    );

  }


  // =====================================================
  // GET REQUESTS BY STATUS
  // =====================================================

  getRequestsByStatus(
    status: LaboratoryStatus | string
  ): Observable<LaboratoryRequest[]> {

    return this.http.get<LaboratoryRequest[]>(
      `${this.REQUESTS_API_URL}/status/${encodeURIComponent(status)}`
    );

  }


  // =====================================================
  // COMPLETED REQUESTS BY PATIENT
  // =====================================================

  getCompletedRequestsByPatient(
    patientId: string | number
  ): Observable<LaboratoryRequest[]> {

    return this.http.get<LaboratoryRequest[]>(
      `${this.REQUESTS_API_URL}/patient/${encodeURIComponent(patientId)}/completed`
    );

  }


  // =====================================================
  // COMPLETED REQUESTS BY CONSULTATION
  // =====================================================

  getCompletedRequestsByConsultation(
    consultationId: string | number
  ): Observable<LaboratoryRequest[]> {

    return this.http.get<LaboratoryRequest[]>(
      `${this.REQUESTS_API_URL}/consultation/${encodeURIComponent(consultationId)}/completed`
    );

  }

}

