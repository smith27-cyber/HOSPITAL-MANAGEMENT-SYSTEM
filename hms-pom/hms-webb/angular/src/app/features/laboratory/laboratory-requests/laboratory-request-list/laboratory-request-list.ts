
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
  selector: 'app-laboratory-request-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './laboratory-request-list.html',

  styleUrl: './laboratory-request-list.css'
})
export class LaboratoryRequestList
  implements OnInit {


  // =====================================================
  // REQUESTS
  // =====================================================

  requests: LaboratoryRequest[] = [];

  filteredRequests: LaboratoryRequest[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // STATUS FILTER
  // =====================================================

  selectedStatus:
    LaboratoryStatus | 'All' = 'All';


  // =====================================================
  // STATISTICS
  // =====================================================

  totalRequests = 0;

  pendingRequests = 0;

  inProgressRequests = 0;

  completedRequests = 0;

  cancelledRequests = 0;


  // =====================================================
  // STATUS OPTIONS
  // =====================================================

  readonly statuses:
    LaboratoryStatus[] = [

      'Pending',

      'In Progress',

      'Completed',

      'Cancelled'

    ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private readonly laboratoryService:
      LaboratoryService,

    private readonly router:
      Router,

    private readonly changeDetectorRef:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    // ---------------------------------------------------
    // INITIAL VIEW STATE
    // ---------------------------------------------------

    this.requests = [];

    this.filteredRequests = [];

    this.resetStatistics();

    this.errorMessage = '';

    this.isLoading = true;


    // ---------------------------------------------------
    // LOAD DATA
    // ---------------------------------------------------

    this.loadRequests();

  }


  // =====================================================
  // LOAD REQUESTS
  // =====================================================

  loadRequests(): void {

    this.isLoading = true;

    this.errorMessage = '';


    // ---------------------------------------------------
    // FORCE INITIAL VIEW UPDATE
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();


    this.laboratoryService
      .getRequests()
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (
          response: LaboratoryRequest[]
        ) => {

          console.log(
            'Laboratory requests loaded:',
            response
          );


          // -----------------------------------------------
          // ALWAYS CREATE A NEW ARRAY
          // -----------------------------------------------

          this.requests =
            Array.isArray(response)
              ? [...response]
              : [];


          // -----------------------------------------------
          // UPDATE STATISTICS IMMEDIATELY
          // -----------------------------------------------

          this.updateStatistics();


          // -----------------------------------------------
          // APPLY FILTERS IMMEDIATELY
          // -----------------------------------------------

          this.applyFilters();


          // -----------------------------------------------
          // STOP LOADING
          // -----------------------------------------------

          this.isLoading = false;


          // -----------------------------------------------
          // FORCE ANGULAR TO RENDER NEW DATA
          // -----------------------------------------------

          this.changeDetectorRef.detectChanges();


          console.log(
            'Laboratory requests rendered:',
            {
              requests:
                this.requests,

              filteredRequests:
                this.filteredRequests,

              total:
                this.totalRequests
            }
          );

        },


        // =================================================
        // ERROR
        // =================================================

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load laboratory requests:',
            error
          );


          this.requests = [];

          this.filteredRequests = [];

          this.resetStatistics();


          this.errorMessage =
            'Unable to load laboratory requests. Please try again.';


          this.isLoading = false;


          // -----------------------------------------------
          // FORCE ERROR STATE TO RENDER
          // -----------------------------------------------

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshRequests(): void {

    if (this.isLoading) {

      return;

    }


    this.loadRequests();

  }


  // =====================================================
  // RESET STATISTICS
  // =====================================================

  private resetStatistics(): void {

    this.totalRequests = 0;

    this.pendingRequests = 0;

    this.inProgressRequests = 0;

    this.completedRequests = 0;

    this.cancelledRequests = 0;

  }


  // =====================================================
  // UPDATE STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalRequests =
      this.requests.length;


    this.pendingRequests =
      this.requests.filter(
        (
          request: LaboratoryRequest
        ) =>
          request.status === 'Pending'
      ).length;


    this.inProgressRequests =
      this.requests.filter(
        (
          request: LaboratoryRequest
        ) =>
          request.status === 'In Progress'
      ).length;


    this.completedRequests =
      this.requests.filter(
        (
          request: LaboratoryRequest
        ) =>
          request.status === 'Completed'
      ).length;


    this.cancelledRequests =
      this.requests.filter(
        (
          request: LaboratoryRequest
        ) =>
          request.status === 'Cancelled'
      ).length;

  }


  // =====================================================
  // FILTER
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredRequests =
      this.requests.filter(
        (
          request: LaboratoryRequest
        ) => {

          // ---------------------------------------------
          // SAFE SEARCH VALUES
          // ---------------------------------------------

          const patientName =
            (
              request.patientName ||
              ''
            )
              .toLowerCase();


          const testName =
            (
              request.testName ||
              ''
            )
              .toLowerCase();


          const category =
            (
              request.category ||
              ''
            )
              .toLowerCase();


          const doctorName =
            (
              request.doctorName ||
              ''
            )
              .toLowerCase();


          const requestId =
            String(
              request.id ?? ''
            )
              .toLowerCase();


          const consultationId =
            String(
              request.consultationId ?? ''
            )
              .toLowerCase();


          // ---------------------------------------------
          // SEARCH MATCH
          // ---------------------------------------------

          const matchesSearch =
            !search ||

            patientName.includes(
              search
            ) ||

            testName.includes(
              search
            ) ||

            category.includes(
              search
            ) ||

            doctorName.includes(
              search
            ) ||

            requestId.includes(
              search
            ) ||

            consultationId.includes(
              search
            );


          // ---------------------------------------------
          // STATUS MATCH
          // ---------------------------------------------

          const matchesStatus =
            this.selectedStatus === 'All' ||

            request.status ===
              this.selectedStatus;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );


    // ---------------------------------------------------
    // EXPLICIT RENDER UPDATE
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // SEARCH CHANGE
  // =====================================================

  onSearchChange(): void {

    this.applyFilters();

  }


  // =====================================================
  // STATUS CHANGE
  // =====================================================

  onStatusChange(): void {

    this.applyFilters();

  }


  // =====================================================
  // REGISTER REQUEST
  // =====================================================

  registerRequest(): void {

    this.router.navigate([
      '/laboratory/requests/register'
    ]);

  }


  // =====================================================
  // GET VALID REQUEST ID
  // =====================================================

  private getRequestId(
    request: LaboratoryRequest
  ):
    string | number | null {

    if (
      request.id === undefined ||
      request.id === null ||
      request.id === ''
    ) {

      return null;

    }

    return request.id;

  }


  // =====================================================
  // VIEW REQUEST
  // =====================================================

  viewRequest(
    request: LaboratoryRequest
  ): void {

    const id =
      this.getRequestId(
        request
      );


    if (id === null) {

      alert(
        'This laboratory request does not have a valid ID.'
      );

      return;

    }


    this.router.navigate([
      '/laboratory/requests',
      id
    ]);

  }


  // =====================================================
  // EDIT REQUEST
  // =====================================================

  editRequest(
    request: LaboratoryRequest
  ): void {

    const id =
      this.getRequestId(
        request
      );


    if (id === null) {

      alert(
        'This laboratory request does not have a valid ID.'
      );

      return;

    }


    if (
      request.status === 'Completed'
    ) {

      alert(
        'Completed laboratory requests cannot be edited.'
      );

      return;

    }


    if (
      request.status === 'Cancelled'
    ) {

      alert(
        'Cancelled laboratory requests cannot be edited.'
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
  // UPDATE STATUS
  // =====================================================

  updateStatus(
    request: LaboratoryRequest,
    status: LaboratoryStatus
  ): void {

    const id =
      this.getRequestId(
        request
      );


    if (id === null) {

      alert(
        'This laboratory request does not have a valid ID.'
      );

      return;

    }


    // ===================================================
    // PROTECT COMPLETED
    // ===================================================

    if (
      request.status === 'Completed'
    ) {

      alert(
        'Completed laboratory requests cannot be changed.'
      );

      return;

    }


    // ===================================================
    // PROTECT CANCELLED
    // ===================================================

    if (
      request.status === 'Cancelled'
    ) {

      alert(
        'Cancelled laboratory requests cannot be changed.'
      );

      return;

    }


    // ===================================================
    // PREVENT SAME STATUS REQUEST
    // ===================================================

    if (
      request.status === status
    ) {

      return;

    }


    this.laboratoryService
      .updateRequestStatus(
        id,
        status
      )
      .subscribe({

        next: (
          updatedRequest:
            LaboratoryRequest
        ) => {

          console.log(
            'Laboratory request status updated:',
            updatedRequest
          );


          // ---------------------------------------------
          // UPDATE LOCAL ARRAY IMMEDIATELY
          // ---------------------------------------------

          this.requests =
            this.requests.map(
              (
                currentRequest:
                  LaboratoryRequest
              ) => {

                const currentId =
                  this.getRequestId(
                    currentRequest
                  );


                if (
                  String(currentId) !==
                  String(id)
                ) {

                  return currentRequest;

                }


                return {
                  ...currentRequest,
                  ...updatedRequest
                };

              }
            );


          // ---------------------------------------------
          // RECALCULATE EVERYTHING
          // ---------------------------------------------

          this.updateStatistics();

          this.applyFilters();


          // ---------------------------------------------
          // RENDER
          // ---------------------------------------------

          this.changeDetectorRef.detectChanges();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to update laboratory request status:',
            error
          );


          alert(
            'Unable to update request status.'
          );

        }

      });

  }


  // =====================================================
  // DELETE REQUEST
  // =====================================================

  deleteRequest(
    request: LaboratoryRequest
  ): void {

    const id =
      this.getRequestId(
        request
      );


    if (id === null) {

      alert(
        'This laboratory request does not have a valid ID.'
      );

      return;

    }


    // ===================================================
    // PROTECT COMPLETED
    // ===================================================

    if (
      request.status === 'Completed'
    ) {

      alert(
        'Completed laboratory requests cannot be deleted.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete the laboratory request for ${request.patientName}?`
      );


    if (!confirmed) {

      return;

    }


    this.laboratoryService
      .deleteRequest(id)
      .subscribe({

        next: () => {

          // ---------------------------------------------
          // REMOVE LOCALLY FIRST
          // ---------------------------------------------

          this.requests =
            this.requests.filter(
              (
                currentRequest:
                  LaboratoryRequest
              ) => {

                const currentId =
                  this.getRequestId(
                    currentRequest
                  );


                return (
                  String(currentId) !==
                  String(id)
                );

              }
            );


          // ---------------------------------------------
          // UPDATE VIEW IMMEDIATELY
          // ---------------------------------------------

          this.updateStatistics();

          this.applyFilters();

          this.changeDetectorRef.detectChanges();


          alert(
            'Laboratory request deleted successfully.'
          );

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to delete laboratory request:',
            error
          );


          alert(
            'Unable to delete laboratory request.'
          );

        }

      });

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = 'All';

    this.applyFilters();

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: LaboratoryStatus
  ): string {

    switch (status) {

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
      Number(amount || 0)
    );

  }

}

