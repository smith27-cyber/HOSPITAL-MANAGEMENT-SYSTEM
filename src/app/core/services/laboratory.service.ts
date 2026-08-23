import { Injectable } from '@angular/core';

import {
  LaboratoryTest,
  LaboratoryRequest,
  LaboratoryStatus
} from '../../shared/models/laboratory.model';

import {
  BillingService
} from './billing.service';

import {
  PatientService
} from './patient.service';

import {
  DoctorService
} from './doctor.service';


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
  // DEFAULT LABORATORY FEE
  // =====================================================

  private readonly DEFAULT_LABORATORY_FEE =
    20000;


  // =====================================================
  // DATA
  // =====================================================

  private tests:
    LaboratoryTest[] = [];

  private requests:
    LaboratoryRequest[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private billingService:
      BillingService,

    private patientService:
      PatientService,

    private doctorService:
      DoctorService
  ) {

    this.loadTests();

    this.loadRequests();

  }


  // =====================================================
  // TEST METHODS
  // =====================================================

  getTests():
    LaboratoryTest[] {

    return [
      ...this.tests
    ];

  }


  getTestById(
    id: string
  ): LaboratoryTest | undefined {

    return this.tests.find(
      test =>
        test.id === id
    );

  }


  addTest(
    test: LaboratoryTest
  ): void {

    this.tests.push({
      ...test
    });

    this.saveTests();

  }


  updateTest(
    updatedTest: LaboratoryTest
  ): boolean {

    const index =
      this.tests.findIndex(
        test =>
          test.id ===
          updatedTest.id
      );


    if (
      index === -1
    ) {

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
  // REQUEST METHODS
  // =====================================================

  getRequests():
    LaboratoryRequest[] {

    return [
      ...this.requests
    ];

  }


  getRequestById(
    id: string
  ): LaboratoryRequest | undefined {

    return this.requests.find(
      request =>
        request.id === id
    );

  }


  addRequest(
    request: LaboratoryRequest
  ): void {

    this.requests.push({
      ...request
    });

    this.saveRequests();

  }


  updateRequest(
    updatedRequest: LaboratoryRequest
  ): boolean {

    const index =
      this.requests.findIndex(
        request =>
          request.id ===
          updatedRequest.id
      );


    if (
      index === -1
    ) {

      return false;

    }


    const previousRequest =
      this.requests[index];


    this.requests[index] = {

      ...updatedRequest

    };


    // ===================================================
    // ADD BILLING WHEN COMPLETED
    // ===================================================

    if (
      updatedRequest.status ===
      'Completed'
    ) {

      this.addLaboratoryCharge(
        this.requests[index]
      );

    }


    this.saveRequests();


    return true;

  }


  deleteRequest(
    id: string
  ): boolean {

    const request =
      this.getRequestById(
        id
      );


    if (!request) {

      return false;

    }


    // ===================================================
    // PROTECT COMPLETED REQUESTS
    // ===================================================

    if (
      request.status ===
      'Completed'
    ) {

      return false;

    }


    const originalLength =
      this.requests.length;


    this.requests =
      this.requests.filter(
        currentRequest =>
          currentRequest.id !==
          id
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
      this.getRequestById(
        id
      );


    if (!request) {

      return false;

    }


    // ===================================================
    // PREVENT INVALID STATUS CHANGE
    // ===================================================

    if (
      request.status ===
      'Cancelled' &&
      status !== 'Cancelled'
    ) {

      return false;

    }


    // ===================================================
    // CHECK PREVIOUS STATUS
    // ===================================================

    const wasAlreadyCompleted =
      request.status ===
      'Completed';


    // ===================================================
    // UPDATE STATUS
    // ===================================================

    request.status =
      status;


    // ===================================================
    // COMPLETION DATE
    // ===================================================

    if (
      status === 'Completed'
    ) {

      if (
        !request.completedAt
      ) {

        request.completedAt =
          new Date().toISOString();

      }

    }


    // ===================================================
    // SAVE REQUEST
    // ===================================================

    this.saveRequests();


    // ===================================================
    // ADD BILLING ON FIRST COMPLETION
    // ===================================================

    if (
      status === 'Completed' &&
      !wasAlreadyCompleted
    ) {

      this.addLaboratoryCharge(
        request
      );

    }


    return true;

  }


  // =====================================================
  // COMPLETE REQUEST
  // =====================================================

  completeRequest(
    id: string
  ): boolean {

    return this.updateRequestStatus(
      id,
      'Completed'
    );

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
  // GET REQUESTS BY CONSULTATION
  // =====================================================

  getRequestsByConsultation(
    consultationId: string
  ): LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.consultationId ===
        consultationId
    );

  }


  // =====================================================
  // GET PENDING REQUESTS
  // =====================================================

  getPendingRequests():
    LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.status ===
        'Pending'
    );

  }


  // =====================================================
  // GET IN-PROGRESS REQUESTS
  // =====================================================

  getInProgressRequests():
    LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.status ===
        'In Progress'
    );

  }


  // =====================================================
  // GET COMPLETED REQUESTS
  // =====================================================

  getCompletedRequests():
    LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.status ===
        'Completed'
    );

  }


  // =====================================================
  // GET CANCELLED REQUESTS
  // =====================================================

  getCancelledRequests():
    LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.status ===
        'Cancelled'
    );

  }


  // =====================================================
  // GET COMPLETED REQUESTS BY PATIENT
  // =====================================================

  getCompletedRequestsByPatient(
    patientId: string
  ): LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.patientId ===
        patientId &&
        request.status ===
        'Completed'
    );

  }


  // =====================================================
  // GET COMPLETED REQUESTS BY CONSULTATION
  // =====================================================

  getCompletedRequestsByConsultation(
    consultationId: string
  ): LaboratoryRequest[] {

    return this.requests.filter(
      request =>
        request.consultationId ===
        consultationId &&
        request.status ===
        'Completed'
    );

  }


  // =====================================================
  // ADD LABORATORY CHARGE
  // =====================================================

  private addLaboratoryCharge(
    request:
      LaboratoryRequest
  ): void {

    // ===================================================
    // VERIFY PATIENT
    // ===================================================

    const patient =
      this.patientService.getPatientById(
        request.patientId
      );


    if (!patient) {

      console.error(
        'Laboratory billing failed: patient not found.',
        request.patientId
      );

      return;

    }


    // ===================================================
    // PATIENT NAME
    // ===================================================

    const patientName =
      `${patient.firstName} ${patient.lastName}`;


    // ===================================================
    // DOCTOR
    // ===================================================

    let doctorName:
      string | undefined;


    if (
      request.doctorId
    ) {

      const doctor =
        this.doctorService.getDoctorById(
          request.doctorId
        );


      if (doctor) {

        doctorName =
          `Dr. ${doctor.firstName} ${doctor.lastName}`;

      }

    }


    // ===================================================
    // PREVENT DUPLICATE BILLING
    // ===================================================

    const existingBills =
      this.billingService.getBillsByPatient(
        request.patientId
      );


    const alreadyBilled =
      existingBills.some(
        bill =>
          (bill.items ?? []).some(
            item =>
              item.billingType ===
                'Laboratory' &&

              item.referenceId ===
                request.id
          )
      );


    if (
      alreadyBilled
    ) {

      return;

    }


    // ===================================================
    // LABORATORY TEST NAME
    // ===================================================

    const testName =
      request.testName ||
      'Laboratory Test';


    // ===================================================
    // LABORATORY CHARGE
    // ===================================================

    const amount =
      this.getLaboratoryCharge(
        request
      );


    if (
      amount <= 0
    ) {

      console.error(
        'Laboratory billing failed: invalid laboratory charge.',
        request.id
      );

      return;

    }


    // ===================================================
    // ADD TO SHARED PATIENT BILL
    // ===================================================

    const bill =
      this.billingService.addServiceCharge(

        request.patientId,

        patientName,

        'Laboratory',

        testName,

        amount,

        request.id,

        {

          doctorId:
            request.doctorId,

          doctorName:
            doctorName,

          notes:
            request.notes

        }

      );


    if (!bill) {

      console.error(
        'Unable to add laboratory charge to billing.',
        request.id
      );

      return;

    }


    // ===================================================
    // LOG SUCCESS
    // ===================================================

    console.log(
      'Laboratory charge added successfully.',
      {

        requestId:
          request.id,

        consultationId:
          request.consultationId,

        testName:
          testName,

        amount:
          amount,

        invoiceNumber:
          bill.invoiceNumber,

        billId:
          bill.id

      }
    );

  }


  // =====================================================
  // GET LABORATORY CHARGE
  // =====================================================

  private getLaboratoryCharge(
    request:
      LaboratoryRequest
  ): number {

    if (
      typeof request.price ===
      'number' &&
      request.price > 0
    ) {

      return request.price;

    }


    return this.DEFAULT_LABORATORY_FEE;

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
        JSON.parse(
          stored
        );


      if (
        Array.isArray(parsed)
      ) {

        this.tests =
          parsed;

      } else {

        this.tests = [];

      }

    }

    catch (
      error
    ) {

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
        JSON.parse(
          stored
        );


      if (
        Array.isArray(parsed)
      ) {

        this.requests =
          parsed;

      } else {

        this.requests = [];

      }

    }

    catch (
      error
    ) {

      console.error(
        'Failed to load laboratory requests:',
        error
      );


      this.requests = [];

    }

  }

}
