
// =====================================================
// LABORATORY REQUEST DETAILS COMPONENT
// File:
// src/app/features/laboratory/laboratory-requests/laboratory-request-details/laboratory-request-details.ts
// =====================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  LaboratoryRequest,
  LaboratoryStatus
} from '../../../../shared/models/laboratory.model';

import {
  LaboratoryService
} from '../../../../core/services/laboratory.service';


@Component({
  selector: 'app-laboratory-request-details',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './laboratory-request-details.html',

  styleUrl:
    './laboratory-request-details.css'
})
export class LaboratoryRequestDetails
  implements OnInit {


  // =====================================================
  // REQUEST
  // =====================================================

  request:
    LaboratoryRequest | null = null;


  // =====================================================
  // RESULT
  // =====================================================

  laboratoryResult = '';

  laboratoryNotes = '';


  // =====================================================
  // PROCESSING
  // =====================================================

  isSaving = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private laboratoryService:
      LaboratoryService,

    private route:
      ActivatedRoute,

    private router:
      Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get(
        'id'
      );


    if (!id) {

      alert(
        'Laboratory request ID was not provided.'
      );

      this.backToRequests();

      return;

    }


    this.loadRequest(
      id
    );

  }


  // =====================================================
  // LOAD REQUEST
  // =====================================================

  private loadRequest(
    id: string
  ): void {

    this.laboratoryService
      .getRequestById(id)
      .subscribe({

        next: (
          request: LaboratoryRequest | undefined
        ) => {

          if (!request) {

            this.request = null;

            alert(
              'Laboratory request could not be found.'
            );

            this.backToRequests();

            return;

          }


          this.request =
            request;


          this.laboratoryResult =
            request.result || '';


          this.laboratoryNotes =
            request.notes || '';

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load laboratory request:',
            error
          );

          this.request = null;

          alert(
            'Unable to load laboratory request.'
          );

          this.backToRequests();

        }

      });

  }


  // =====================================================
  // START PROCESSING
  // =====================================================

  startProcessing(): void {

    if (!this.request) {

      return;

    }


    if (
      this.request.status !==
      'Pending'
    ) {

      return;

    }


    const success =
      this.laboratoryService
        .updateRequestStatus(
          this.request.id,
          'In Progress'
        );


    if (!success) {

      alert(
        'Unable to start laboratory processing.'
      );

      return;

    }


    this.reloadCurrentRequest();

  }


  // =====================================================
  // SAVE RESULT
  // =====================================================

  saveResult(): void {

    if (!this.request) {

      return;

    }


    if (
      this.request.status ===
      'Cancelled'
    ) {

      alert(
        'Cancelled laboratory requests cannot be updated.'
      );

      return;

    }


    if (
      !this.laboratoryResult.trim()
    ) {

      alert(
        'Please enter the laboratory result.'
      );

      return;

    }


    this.isSaving =
      true;


    const updatedRequest:
      LaboratoryRequest = {

      ...this.request,

      result:
        this.laboratoryResult.trim(),

      notes:
        this.laboratoryNotes.trim() ||
        undefined

    };


    const success =
      this.laboratoryService
        .updateRequest(
          updatedRequest
        );


    this.isSaving =
      false;


    if (!success) {

      alert(
        'Unable to save laboratory result.'
      );

      return;

    }


    this.reloadCurrentRequest();


    alert(
      'Laboratory result saved successfully.'
    );

  }


  // =====================================================
  // COMPLETE REQUEST
  // =====================================================

  completeRequest(): void {

    if (!this.request) {

      return;

    }


    if (
      this.request.status ===
      'Completed'
    ) {

      return;

    }


    if (
      this.request.status ===
      'Cancelled'
    ) {

      alert(
        'Cancelled laboratory requests cannot be completed.'
      );

      return;

    }


    if (
      !this.laboratoryResult.trim()
    ) {

      alert(
        'Please enter the laboratory result before completing this request.'
      );

      return;

    }


    const confirmed =
      confirm(
        'Complete this laboratory request? The laboratory charge will be added to the patient billing.'
      );


    if (!confirmed) {

      return;

    }


    // ===================================================
    // SAVE RESULT FIRST
    // ===================================================

    const updatedRequest:
      LaboratoryRequest = {

      ...this.request,

      result:
        this.laboratoryResult.trim(),

      notes:
        this.laboratoryNotes.trim() ||
        undefined

    };


    const resultSaved =
      this.laboratoryService
        .updateRequest(
          updatedRequest
        );


    if (!resultSaved) {

      alert(
        'Unable to save laboratory result.'
      );

      return;

    }


    // ===================================================
    // COMPLETE REQUEST
    // ===================================================

    const completed =
      this.laboratoryService
        .completeRequest(
          this.request.id
        );


    if (!completed) {

      alert(
        'The result was saved, but the laboratory request could not be completed.'
      );

      this.reloadCurrentRequest();

      return;

    }


    this.reloadCurrentRequest();


    alert(
      'Laboratory request completed successfully. The laboratory charge has been added to billing.'
    );

  }


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  updateStatus(
    status: LaboratoryStatus
  ): void {

    if (!this.request) {

      return;

    }


    // ===================================================
    // COMPLETE REQUIRES RESULT
    // ===================================================

    if (
      status === 'Completed'
    ) {

      this.completeRequest();

      return;

    }


    // ===================================================
    // START PROCESSING
    // ===================================================

    if (
      status === 'In Progress'
    ) {

      this.startProcessing();

      return;

    }


    // ===================================================
    // CANCEL
    // ===================================================

    if (
      status === 'Cancelled'
    ) {

      this.cancelRequest();

      return;

    }


    // ===================================================
    // OTHER STATUS
    // ===================================================

    const success =
      this.laboratoryService
        .updateRequestStatus(
          this.request.id,
          status
        );


    if (!success) {

      alert(
        'Unable to update request status.'
      );

      return;

    }


    this.reloadCurrentRequest();

  }


  // =====================================================
  // CANCEL REQUEST
  // =====================================================

  cancelRequest(): void {

    if (!this.request) {

      return;

    }


    if (
      this.request.status ===
      'Completed'
    ) {

      alert(
        'Completed laboratory requests cannot be cancelled.'
      );

      return;

    }


    if (
      this.request.status ===
      'Cancelled'
    ) {

      return;

    }


    const confirmed =
      confirm(
        'Cancel this laboratory request?'
      );


    if (!confirmed) {

      return;

    }


    const success =
      this.laboratoryService
        .updateRequestStatus(
          this.request.id,
          'Cancelled'
        );


    if (!success) {

      alert(
        'Unable to cancel laboratory request.'
      );

      return;

    }


    this.reloadCurrentRequest();


    alert(
      'Laboratory request cancelled.'
    );

  }


  // =====================================================
  // EDIT REQUEST
  // =====================================================

  editRequest(): void {

    if (!this.request) {

      return;

    }


    if (
      this.request.status ===
        'Completed' ||
      this.request.status ===
        'Cancelled'
    ) {

      return;

    }


    this.router.navigate([
      '/laboratory/requests',
      this.request.id,
      'edit'
    ]);

  }


  // =====================================================
  // DELETE REQUEST
  // =====================================================

  deleteRequest(): void {

    if (!this.request) {

      return;

    }


    if (
      this.request.status ===
      'Completed'
    ) {

      alert(
        'Completed laboratory requests cannot be deleted.'
      );

      return;

    }


    const confirmed =
      confirm(
        `Are you sure you want to delete laboratory request ${this.request.id}?`
      );


    if (!confirmed) {

      return;

    }


    const deleted =
      this.laboratoryService
        .deleteRequest(
          this.request.id
        );


    if (!deleted) {

      alert(
        'Unable to delete laboratory request.'
      );

      return;

    }


    alert(
      'Laboratory request deleted successfully.'
    );


    this.backToRequests();

  }


  // =====================================================
  // VIEW CONSULTATION
  // =====================================================

  viewConsultation(): void {

    if (
      !this.request?.consultationId
    ) {

      alert(
        'This laboratory request is not linked to a consultation.'
      );

      return;

    }


    this.router.navigate([
      '/consultations',
      this.request.consultationId
    ]);

  }


  // =====================================================
  // RELOAD CURRENT REQUEST
  // =====================================================

  private reloadCurrentRequest(): void {

    if (!this.request) {

      return;

    }


    const id =
      this.request.id;


    this.laboratoryService
      .getRequestById(id)
      .subscribe({

        next: (
          updated: LaboratoryRequest | undefined
        ) => {

          this.request =
            updated ?? null;


          if (this.request) {

            this.laboratoryResult =
              this.request.result || '';

            this.laboratoryNotes =
              this.request.notes || '';

          }

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to reload laboratory request:',
            error
          );

        }

      });

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(): string {

    if (!this.request) {

      return '';

    }


    switch (
      this.request.status
    ) {

      case 'Pending':

        return 'pending';


      case 'In Progress':

        return 'in-progress';


      case 'Completed':

        return 'completed';


      case 'Cancelled':

        return 'cancelled';


      default:

        return '';

    }

  }


  // =====================================================
  // CAN EDIT
  // =====================================================

  canEdit(): boolean {

    if (!this.request) {

      return false;

    }


    return (
      this.request.status !== 'Completed' &&
      this.request.status !== 'Cancelled'
    );

  }


  // =====================================================
  // CAN START PROCESSING
  // =====================================================

  canStartProcessing(): boolean {

    return (
      this.request?.status ===
      'Pending'
    );

  }


  // =====================================================
  // CAN SAVE RESULT
  // =====================================================

  canSaveResult(): boolean {

    if (!this.request) {

      return false;

    }


    return (
      this.request.status ===
        'In Progress' ||
      this.request.status ===
        'Pending'
    );

  }


  // =====================================================
  // CAN COMPLETE
  // =====================================================

  canComplete(): boolean {

    if (!this.request) {

      return false;

    }


    return (
      this.request.status ===
        'In Progress' ||
      this.request.status ===
        'Pending'
    );

  }


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    amount: number
  ): string {

    return new Intl.NumberFormat(
      'en-UG',
      {
        style: 'currency',
        currency: 'UGX',
        maximumFractionDigits: 0
      }
    ).format(
      amount || 0
    );

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?: string
  ): string {

    if (!date) {

      return '—';

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—';

    }


    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(
      parsedDate
    );

  }


  // =====================================================
  // FORMAT DATE TIME
  // =====================================================

  formatDateTime(
    date?: string
  ): string {

    if (!date) {

      return '—';

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—';

    }


    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(
      parsedDate
    );

  }


  // =====================================================
  // BACK
  // =====================================================

  backToRequests(): void {

    this.router.navigate([
      '/laboratory/requests'
    ]);

  }

}

