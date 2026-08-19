import { Injectable } from '@angular/core';

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
  // STORAGE KEYS
  // =====================================================

  private readonly testsStorageKey =
    'hms_laboratory_tests';

  private readonly requestsStorageKey =
    'hms_laboratory_requests';


  // =====================================================
  // DATA
  // =====================================================

  private tests: LaboratoryTest[] = [];

  private requests: LaboratoryRequest[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    this.loadTests();

    this.loadRequests();

  }


  // =====================================================
  // GET ALL TESTS
  // =====================================================

  getTests(): LaboratoryTest[] {

    return [
      ...this.tests
    ];

  }


  // =====================================================
  // GET TEST BY ID
  // =====================================================

  getTestById(
    id: string
  ): LaboratoryTest | undefined {

    return this.tests.find(
      test =>
        test.id === id
    );

  }


  // =====================================================
  // ADD TEST
  // =====================================================

  addTest(
    test: LaboratoryTest
  ): void {

    this.tests.push({
      ...test
    });

    this.saveTests();

  }


  // =====================================================
  // UPDATE TEST
  // =====================================================

  updateTest(
    updatedTest: LaboratoryTest
  ): boolean {

    const index =
      this.tests.findIndex(
        test =>
          test.id === updatedTest.id
      );


    if (index === -1) {

      return false;

    }


    this.tests[index] = {

      ...updatedTest,

      updatedAt:
        new Date().toISOString()

    };


    this.saveTests();


    return true;

  }


  // =====================================================
  // DELETE TEST
  // =====================================================

  deleteTest(
    id: string
  ): boolean {

    const originalLength =
      this.tests.length;


    this.tests =
      this.tests.filter(
        test =>
          test.id !== id
      );


    if (
      this.tests.length ===
      originalLength
    ) {

      return false;

    }


    this.saveTests();


    return true;

  }


  // =====================================================
  // GET ALL REQUESTS
  // =====================================================

  getRequests(): LaboratoryRequest[] {

    return [
      ...this.requests
    ];

  }


  // =====================================================
  // GET REQUEST BY ID
  // =====================================================

  getRequestById(
    id: string
  ): LaboratoryRequest | undefined {

    return this.requests.find(
      request =>
        request.id === id
    );

  }


  // =====================================================
  // ADD REQUEST
  // =====================================================

  addRequest(
    request: LaboratoryRequest
  ): void {

    this.requests.push({
      ...request
    });

    this.saveRequests();

  }


  // =====================================================
  // UPDATE REQUEST
  // =====================================================

  updateRequest(
    updatedRequest: LaboratoryRequest
  ): boolean {

    const index =
      this.requests.findIndex(
        request =>
          request.id ===
          updatedRequest.id
      );


    if (index === -1) {

      return false;

    }


    this.requests[index] = {

      ...updatedRequest

    };


    this.saveRequests();


    return true;

  }


  // =====================================================
  // DELETE REQUEST
  // =====================================================

  deleteRequest(
    id: string
  ): boolean {

    const originalLength =
      this.requests.length;


    this.requests =
      this.requests.filter(
        request =>
          request.id !== id
      );


    if (
      this.requests.length ===
      originalLength
    ) {

      return false;

    }


    this.saveRequests();


    return true;

  }


  // =====================================================
  // UPDATE REQUEST STATUS
  // =====================================================

  updateRequestStatus(
    id: string,
    status: LaboratoryStatus
  ): boolean {

    const request =
      this.getRequestById(id);


    if (!request) {

      return false;

    }


    request.status =
      status;


    if (
      status === 'Completed'
    ) {

      request.completedAt =
        new Date().toISOString();

    }


    this.saveRequests();


    return true;

  }


  // =====================================================
  // GET REQUESTS BY PATIENT
  // =====================================================

  getRequestsByPatient(
    patientId: string
  ): LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.patientId ===
        patientId
    );

  }


  // =====================================================
  // GET PENDING REQUESTS
  // =====================================================

  getPendingRequests(): LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.status ===
        'Pending'
    );

  }


  // =====================================================
  // GET IN-PROGRESS REQUESTS
  // =====================================================

  getInProgressRequests(): LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.status ===
        'In Progress'
    );

  }


  // =====================================================
  // GET COMPLETED REQUESTS
  // =====================================================

  getCompletedRequests(): LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.status ===
        'Completed'
    );

  }


  // =====================================================
  // GET CANCELLED REQUESTS
  // =====================================================

  getCancelledRequests(): LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.status ===
        'Cancelled'
    );

  }


  // =====================================================
  // SAVE TESTS
  // =====================================================

  private saveTests(): void {

    localStorage.setItem(
      this.testsStorageKey,
      JSON.stringify(
        this.tests
      )
    );

  }


  // =====================================================
  // SAVE REQUESTS
  // =====================================================

  private saveRequests(): void {

    localStorage.setItem(
      this.requestsStorageKey,
      JSON.stringify(
        this.requests
      )
    );

  }


  // =====================================================
  // LOAD TESTS
  // =====================================================

  private loadTests(): void {

    const stored =
      localStorage.getItem(
        this.testsStorageKey
      );


    if (!stored) {

      this.tests = [];

      return;

    }


    try {

      const parsed =
        JSON.parse(stored);


      if (
        Array.isArray(parsed)
      ) {

        this.tests =
          parsed;

      } else {

        this.tests = [];

      }

    } catch (error) {

      console.error(
        'Failed to load laboratory tests:',
        error
      );

      this.tests = [];

    }

  }


  // =====================================================
  // LOAD REQUESTS
  // =====================================================

  private loadRequests(): void {

    const stored =
      localStorage.getItem(
        this.requestsStorageKey
      );


    if (!stored) {

      this.requests = [];

      return;

    }


    try {

      const parsed =
        JSON.parse(stored);


      if (
        Array.isArray(parsed)
      ) {

        this.requests =
          parsed;

      } else {

        this.requests = [];

      }

    } catch (error) {

      console.error(
        'Failed to load laboratory requests:',
        error
      );

      this.requests = [];

    }

  }

}
