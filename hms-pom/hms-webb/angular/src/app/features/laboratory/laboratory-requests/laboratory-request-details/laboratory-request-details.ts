
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

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
  // LOADING
  // =====================================================

  isLoading =
    false;

  isSaving =
    false;


  // =====================================================
  // RESULT
  // =====================================================

  laboratoryResult =
    '';

  laboratoryNotes =
    '';


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage =
    '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private readonly laboratoryService:
      LaboratoryService,

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const routeId =
      this.route.snapshot
        .paramMap
        .get('id');


    if (
      !routeId ||
      !routeId.trim()
    ) {

      this.errorMessage =
        'Laboratory request ID was not provided.';

      alert(
        this.errorMessage
      );

      this.backToRequests();

      return;

    }


    this.loadRequest(
      routeId.trim()
    );

  }


  // =====================================================
  // LOAD REQUEST
  // =====================================================

  private loadRequest(
    id: string
  ): void {

    this.isLoading =
      true;

    this.errorMessage =
      '';

    this.request =
      null;

    this.laboratoryResult =
      '';

    this.laboratoryNotes =
      '';


    this.cdr.detectChanges();


    this.laboratoryService
      .getRequestById(id)
      .subscribe({

        next: (
          request:
            LaboratoryRequest | undefined
        ) => {

          // ---------------------------------------------
          // REQUEST NOT FOUND
          // ---------------------------------------------

          if (!request) {

            this.isLoading =
              false;

            this.errorMessage =
              'Laboratory request could not be found.';

            this.cdr.detectChanges();


            alert(
              this.errorMessage
            );

            this.backToRequests();

            return;

          }


          // ---------------------------------------------
          // DATABASE ID REQUIRED
          // ---------------------------------------------

          if (
            request.id === undefined ||
            request.id === null
          ) {

            console.error(
              'Laboratory request has no database ID:',
              request
            );


            this.isLoading =
              false;

            this.errorMessage =
              'Invalid laboratory request: database ID is missing.';

            this.cdr.detectChanges();


            alert(
              this.errorMessage
            );

            this.backToRequests();

            return;

          }


          // ---------------------------------------------
          // STORE REQUEST
          // ---------------------------------------------

          this.request =
            {
              ...request
            };


          // ---------------------------------------------
          // LOAD RESULT
          // ---------------------------------------------

          this.laboratoryResult =
            request.result || '';


          // ---------------------------------------------
          // LOAD NOTES
          // ---------------------------------------------

          this.laboratoryNotes =
            request.notes || '';


          // ---------------------------------------------
          // COMPLETE LOADING
          // ---------------------------------------------

          this.isLoading =
            false;

          this.cdr.detectChanges();


          console.log(
            'Laboratory request loaded successfully:',
            this.request
          );

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load laboratory request:',
            error
          );


          this.request =
            null;

          this.isLoading =
            false;

          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Unable to load laboratory request.'
            );

          this.cdr.detectChanges();


          alert(
            this.errorMessage
          );

          this.backToRequests();

        }

      });

  }


  // =====================================================
  // GET REQUEST ID
  // =====================================================

  private getRequestId():
    string | number | null {

    if (
      !this.request ||
      this.request.id === undefined ||
      this.request.id === null
    ) {

      return null;

    }


    return this.request.id;

  }


  // =====================================================
  // START PROCESSING
  // =====================================================
  //
  // Workflow:
  //
  // Pending
  //    ↓
  // In Progress
  //
  // =====================================================

  startProcessing(): void {

    if (
      this.isSaving ||
      !this.request
    ) {

      return;

    }


    const id =
      this.getRequestId();


    if (
      id === null
    ) {

      alert(
        'Laboratory request ID is missing.'
      );

      return;

    }


    if (
      this.request.status !==
      'Pending'
    ) {

      return;

    }


    this.isSaving =
      true;

    this.cdr.detectChanges();


    this.laboratoryService
      .updateRequestStatus(
        id,
        'In Progress'
      )
      .subscribe({

        next: (
          updatedRequest:
            LaboratoryRequest
        ) => {

          this.request =
            {
              ...updatedRequest
            };


          this.laboratoryResult =
            updatedRequest.result || '';

          this.laboratoryNotes =
            updatedRequest.notes || '';


          this.isSaving =
            false;

          this.cdr.detectChanges();


          console.log(
            'Laboratory request moved to In Progress:',
            updatedRequest
          );

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to start laboratory processing:',
            error
          );


          this.isSaving =
            false;

          this.cdr.detectChanges();


          alert(
            this.extractErrorMessage(
              error,
              'Unable to start laboratory processing.'
            )
          );

        }

      });

  }


  // =====================================================
  // SAVE RESULT
  // =====================================================
  //
  // Saving a result does NOT complete the request.
  //
  // =====================================================

  saveResult(): void {

    if (
      this.isSaving ||
      !this.request
    ) {

      return;

    }


    const id =
      this.getRequestId();


    if (
      id === null
    ) {

      alert(
        'Laboratory request ID is missing.'
      );

      return;

    }


    if (
      this.request.status ===
      'Completed'
    ) {

      alert(
        'Completed laboratory requests cannot be modified.'
      );

      return;

    }


    if (
      this.request.status ===
      'Cancelled'
    ) {

      alert(
        'Cancelled laboratory requests cannot be modified.'
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

    this.cdr.detectChanges();


    const updatedRequest:
      LaboratoryRequest = {

      ...this.request,

      id:

        id,

      result:

        this.laboratoryResult.trim(),

      notes:

        this.laboratoryNotes.trim() ||
        undefined

    };


    this.laboratoryService
      .updateRequest(
        updatedRequest
      )
      .subscribe({

        next: (
          savedRequest:
            LaboratoryRequest
        ) => {

          this.request =
            {
              ...savedRequest
            };


          this.laboratoryResult =
            savedRequest.result || '';

          this.laboratoryNotes =
            savedRequest.notes || '';


          this.isSaving =
            false;

          this.cdr.detectChanges();


          alert(
            'Laboratory result saved successfully.'
          );

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to save laboratory result:',
            error
          );


          this.isSaving =
            false;

          this.cdr.detectChanges();


          alert(
            this.extractErrorMessage(
              error,
              'Unable to save laboratory result.'
            )
          );

        }

      });

  }


  // =====================================================
  // COMPLETE REQUEST
  // =====================================================
  //
  // Workflow:
  //
  // Pending / In Progress
  //          ↓
  //       Result
  //          ↓
  //      Completed
  //
  // IMPORTANT:
  //
  // Completing this laboratory request does NOT complete
  // the consultation.
  //
  // =====================================================

  completeRequest(): void {

    if (
      this.isSaving ||
      !this.request
    ) {

      return;

    }


    const id =
      this.getRequestId();


    if (
      id === null
    ) {

      alert(
        'Laboratory request ID is missing.'
      );

      return;

    }


    if (
      this.request.status ===
      'Completed'
    ) {

      alert(
        'This laboratory request is already completed.'
      );

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
      window.confirm(
        'Complete this laboratory request? The result will become available for doctor review.'
      );


    if (!confirmed) {

      return;

    }


    this.isSaving =
      true;

    this.cdr.detectChanges();


    // ===================================================
    // SAVE RESULT FIRST
    // ===================================================

    const updatedRequest:
      LaboratoryRequest = {

      ...this.request,

      id:

        id,

      result:

        this.laboratoryResult.trim(),

      notes:

        this.laboratoryNotes.trim() ||
        undefined

    };


    this.laboratoryService
      .updateRequest(
        updatedRequest
      )
      .subscribe({

        next: (
          savedRequest:
            LaboratoryRequest
        ) => {

          console.log(
            'Laboratory result saved:',
            savedRequest
          );


          this.request =
            {
              ...savedRequest
            };


          // =================================================
          // COMPLETE LABORATORY REQUEST
          // =================================================

          this.laboratoryService
            .completeRequest(
              id
            )
            .subscribe({

              next: (
                completedRequest:
                  LaboratoryRequest
              ) => {

                this.request =
                  {
                    ...completedRequest
                  };


                this.laboratoryResult =
                  completedRequest.result || '';

                this.laboratoryNotes =
                  completedRequest.notes || '';


                this.isSaving =
                  false;

                this.cdr.detectChanges();


                alert(
                  'Laboratory request completed successfully. The result is now available for doctor review.'
                );

              },


              error: (
                error: unknown
              ) => {

                console.error(
                  'Failed to complete laboratory request:',
                  error
                );


                this.isSaving =
                  false;

                this.cdr.detectChanges();


                alert(
                  this.extractErrorMessage(
                    error,
                    'The laboratory result was saved, but the request could not be completed.'
                  )
                );


                this.reloadCurrentRequest();

              }

            });

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to save laboratory result:',
            error
          );


          this.isSaving =
            false;

          this.cdr.detectChanges();


          alert(
            this.extractErrorMessage(
              error,
              'Unable to save laboratory result.'
            )
          );

        }

      });

  }


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  updateStatus(
    status: LaboratoryStatus
  ): void {

    if (
      this.isSaving ||
      !this.request
    ) {

      return;

    }


    switch (
      status
    ) {

      case 'In Progress':

        this.startProcessing();

        return;


      case 'Completed':

        this.completeRequest();

        return;


      case 'Cancelled':

        this.cancelRequest();

        return;


      case 'Pending':

        this.resetToPending();

        return;


      default:

        return;

    }

  }


  // =====================================================
  // RESET TO PENDING
  // =====================================================
  //
  // Normally a processed request should not be manually
  // moved backwards.
  //
  // This is kept here only because LaboratoryStatus
  // includes Pending.
  //
  // =====================================================

  private resetToPending(): void {

    if (
      !this.request
    ) {

      return;

    }


    if (
      this.request.status ===
      'Completed'
    ) {

      alert(
        'Completed laboratory requests cannot be moved back to Pending.'
      );

      return;

    }


    if (
      this.request.status ===
      'Cancelled'
    ) {

      alert(
        'Cancelled laboratory requests cannot be moved back to Pending.'
      );

      return;

    }


    const id =
      this.getRequestId();


    if (
      id === null
    ) {

      alert(
        'Laboratory request ID is missing.'
      );

      return;

    }


    if (
      this.request.status ===
      'Pending'
    ) {

      return;

    }


    this.isSaving =
      true;

    this.cdr.detectChanges();


    this.laboratoryService
      .updateRequestStatus(
        id,
        'Pending'
      )
      .subscribe({

        next: (
          updatedRequest:
            LaboratoryRequest
        ) => {

          this.request =
            {
              ...updatedRequest
            };


          this.isSaving =
            false;

          this.cdr.detectChanges();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to reset laboratory request:',
            error
          );


          this.isSaving =
            false;

          this.cdr.detectChanges();


          alert(
            this.extractErrorMessage(
              error,
              'Unable to change laboratory request status.'
            )
          );

        }

      });

  }


  // =====================================================
  // CANCEL REQUEST
  // =====================================================

  cancelRequest(): void {

    if (
      this.isSaving ||
      !this.request
    ) {

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


    const id =
      this.getRequestId();


    if (
      id === null
    ) {

      alert(
        'Laboratory request ID is missing.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        'Cancel this laboratory request?'
      );


    if (!confirmed) {

      return;

    }


    this.isSaving =
      true;

    this.cdr.detectChanges();


    this.laboratoryService
      .updateRequestStatus(
        id,
        'Cancelled'
      )
      .subscribe({

        next: (
          updatedRequest:
            LaboratoryRequest
        ) => {

          this.request =
            {
              ...updatedRequest
            };


          this.isSaving =
            false;

          this.cdr.detectChanges();


          alert(
            'Laboratory request cancelled successfully.'
          );

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to cancel laboratory request:',
            error
          );


          this.isSaving =
            false;

          this.cdr.detectChanges();


          alert(
            this.extractErrorMessage(
              error,
              'Unable to cancel laboratory request.'
            )
          );

        }

      });

  }


  // =====================================================
  // EDIT REQUEST
  // =====================================================

  editRequest(): void {

    if (
      this.isSaving ||
      !this.request
    ) {

      return;

    }


    const id =
      this.getRequestId();


    if (
      id === null
    ) {

      alert(
        'Laboratory request ID is missing.'
      );

      return;

    }


    if (
      this.request.status ===
        'Completed' ||
      this.request.status ===
        'Cancelled'
    ) {

      alert(
        'This laboratory request cannot be edited.'
      );

      return;

    }


    this.router.navigate([
      '/laboratory/requests',
      id,
      'edit'
    ]);

  }


  // =====================================================
  // DELETE REQUEST
  // =====================================================

  deleteRequest(): void {

    if (
      this.isSaving ||
      !this.request
    ) {

      return;

    }


    const id =
      this.getRequestId();


    if (
      id === null
    ) {

      alert(
        'Laboratory request ID is missing.'
      );

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
      window.confirm(
        `Are you sure you want to delete laboratory request ${id}? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    this.isSaving =
      true;

    this.cdr.detectChanges();


    this.laboratoryService
      .deleteRequest(
        id
      )
      .subscribe({

        next: () => {

          this.isSaving =
            false;

          this.cdr.detectChanges();


          alert(
            'Laboratory request deleted successfully.'
          );


          this.backToRequests();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to delete laboratory request:',
            error
          );


          this.isSaving =
            false;

          this.cdr.detectChanges();


          alert(
            this.extractErrorMessage(
              error,
              'Unable to delete laboratory request.'
            )
          );

        }

      });

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

    const id =
      this.getRequestId();


    if (
      id === null
    ) {

      return;

    }


    this.isLoading =
      true;

    this.cdr.detectChanges();


    this.laboratoryService
      .getRequestById(
        id
      )
      .subscribe({

        next: (
          updatedRequest:
            LaboratoryRequest | undefined
        ) => {

          this.request =
            updatedRequest
              ? {
                  ...updatedRequest
                }
              : null;


          if (
            this.request
          ) {

            this.laboratoryResult =
              this.request.result || '';

            this.laboratoryNotes =
              this.request.notes || '';

          }


          this.isLoading =
            false;

          this.cdr.detectChanges();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to reload laboratory request:',
            error
          );


          this.isLoading =
            false;

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(): string {

    if (
      !this.request
    ) {

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

    if (
      !this.request
    ) {

      return false;

    }


    return (
      this.request.status !==
        'Completed' &&
      this.request.status !==
        'Cancelled'
    );

  }


  // =====================================================
  // CAN START PROCESSING
  // =====================================================

  canStartProcessing(): boolean {

    return (
      !!this.request &&
      this.request.status ===
        'Pending' &&
      !this.isSaving
    );

  }


  // =====================================================
  // CAN SAVE RESULT
  // =====================================================

  canSaveResult(): boolean {

    if (
      !this.request ||
      this.isSaving
    ) {

      return false;

    }


    return (
      this.request.status ===
        'Pending' ||
      this.request.status ===
        'In Progress'
    );

  }


  // =====================================================
  // CAN COMPLETE
  // =====================================================

  canComplete(): boolean {

    if (
      !this.request ||
      this.isSaving
    ) {

      return false;

    }


    if (
      this.request.status ===
        'Completed' ||
      this.request.status ===
        'Cancelled'
    ) {

      return false;

    }


    return !!this.laboratoryResult.trim();

  }


  // =====================================================
  // IS COMPLETED
  // =====================================================

  get isCompleted(): boolean {

    return (
      this.request?.status ===
      'Completed'
    );

  }


  // =====================================================
  // IS CANCELLED
  // =====================================================

  get isCancelled(): boolean {

    return (
      this.request?.status ===
      'Cancelled'
    );

  }


  // =====================================================
  // IS PENDING
  // =====================================================

  get isPending(): boolean {

    return (
      this.request?.status ===
      'Pending'
    );

  }


  // =====================================================
  // IS IN PROGRESS
  // =====================================================

  get isInProgress(): boolean {

    return (
      this.request?.status ===
      'In Progress'
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
      Number(
        amount || 0
      )
    );

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?: string
  ): string {

    if (
      !date
    ) {

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

    if (
      !date
    ) {

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
  // ERROR MESSAGE
  // =====================================================

  private extractErrorMessage(
    error: unknown,
    fallback: string
  ): string {

    if (
      typeof error !==
        'object' ||
      error ===
        null
    ) {

      return fallback;

    }


    const response =
      error as {
        error?: unknown;
        message?: string;
      };


    // ---------------------------------------------------
    // DIRECT MESSAGE
    // ---------------------------------------------------

    if (
      typeof response.message ===
        'string' &&
      response.message.trim()
    ) {

      return response.message.trim();

    }


    // ---------------------------------------------------
    // STRING ERROR BODY
    // ---------------------------------------------------

    if (
      typeof response.error ===
        'string' &&
      response.error.trim()
    ) {

      return response.error.trim();

    }


    // ---------------------------------------------------
    // OBJECT ERROR BODY
    // ---------------------------------------------------

    if (
      typeof response.error ===
        'object' &&
      response.error !==
        null
    ) {

      const body =
        response.error as {
          message?: string;
          error?: string;
        };


      if (
        typeof body.message ===
          'string' &&
        body.message.trim()
      ) {

        return body.message.trim();

      }


      if (
        typeof body.error ===
          'string' &&
        body.error.trim()
      ) {

        return body.error.trim();

      }

    }


    return fallback;

  }


  // =====================================================
  // BACK
  // =====================================================

  backToRequests(): void {

    if (
      this.isSaving
    ) {

      return;

    }


    this.router.navigate([
      '/laboratory/requests'
    ]);

  }

}

