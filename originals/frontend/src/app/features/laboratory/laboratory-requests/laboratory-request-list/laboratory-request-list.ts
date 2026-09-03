import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
export class LaboratoryRequestList implements OnInit {


  // =====================================================
  // REQUESTS
  // =====================================================

  requests: LaboratoryRequest[] = [];

  filteredRequests: LaboratoryRequest[] = [];


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

  statuses: LaboratoryStatus[] = [

    'Pending',

    'In Progress',

    'Completed',

    'Cancelled'

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private laboratoryService: LaboratoryService,
    private router: Router  
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadRequests();

  }


  // =====================================================
  // LOAD REQUESTS
  // =====================================================

  loadRequests(): void {

    this.laboratoryService
      .getRequests()
      .subscribe({

        next: (
          requests: LaboratoryRequest[]
        ) => {

          this.requests =
            requests;

          this.updateStatistics();

          this.applyFilters();

        },

        error: (
          error
        ) => {

          console.error(
            'Failed to load laboratory requests:',
            error
          );

          this.requests = [];

          this.updateStatistics();

          this.applyFilters();

        }

      });

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalRequests =
      this.requests.length;


    this.pendingRequests =
      this.requests.filter(
        (
          request: LaboratoryRequest
        ) =>
          request.status ===
          'Pending'
      ).length;


    this.inProgressRequests =
      this.requests.filter(
        (
          request: LaboratoryRequest
        ) =>
          request.status ===
          'In Progress'
      ).length;


    this.completedRequests =
      this.requests.filter(
        (
          request: LaboratoryRequest
        ) =>
          request.status ===
          'Completed'
      ).length;


    this.cancelledRequests =
      this.requests.filter(
        (
          request: LaboratoryRequest
        ) =>
          request.status ===
          'Cancelled'
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

          const matchesSearch =
            !search ||

            request.patientName
              .toLowerCase()
              .includes(search) ||

            request.testName
              .toLowerCase()
              .includes(search) ||

            request.category
              .toLowerCase()
              .includes(search) ||

            (request.doctorName ?? '')
              .toLowerCase()
              .includes(search) ||

            String(request.id)
              .toLowerCase()
              .includes(search);


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
  // VIEW REQUEST
  // =====================================================

  viewRequest(
    request: LaboratoryRequest
  ): void {

    this.router.navigate([
      '/laboratory/requests',
      request.id
    ]);

  }


  // =====================================================
  // EDIT REQUEST
  // =====================================================

  editRequest(
    request: LaboratoryRequest
  ): void {

    this.router.navigate([
      '/laboratory/requests',
      request.id,
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

    this.laboratoryService
      .updateRequestStatus(
        request.id,
        status
      )
      .subscribe({

        next: (
          updatedRequest: LaboratoryRequest
        ) => {

          console.log(
            'Laboratory request status updated:',
            updatedRequest
          );

          this.loadRequests();

        },

        error: (
          error
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
  // DELETE
  // =====================================================

  deleteRequest(
    request: LaboratoryRequest
  ): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete the laboratory request for ${request.patientName}?`
      );


    if (!confirmed) {

      return;

    }


    this.laboratoryService
      .deleteRequest(
        request.id
      )
      .subscribe({

        next: () => {

          alert(
            'Laboratory request deleted successfully.'
          );

          this.loadRequests();

        },

        error: (
          error
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
    ).format(amount);

  }

}