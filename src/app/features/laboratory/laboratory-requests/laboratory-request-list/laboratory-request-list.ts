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

    this.requests =
      this.laboratoryService.getRequests();

    this.updateStatistics();

    this.applyFilters();

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalRequests =
      this.requests.length;

    this.pendingRequests =
      this.requests.filter(
        request =>
          request.status === 'Pending'
      ).length;

    this.inProgressRequests =
      this.requests.filter(
        request =>
          request.status === 'In Progress'
      ).length;

    this.completedRequests =
      this.requests.filter(
        request =>
          request.status === 'Completed'
      ).length;

    this.cancelledRequests =
      this.requests.filter(
        request =>
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
        request => {

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

            request.id
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

    const updated =
      this.laboratoryService.updateRequestStatus(
        request.id,
        status
      );


    if (!updated) {

      alert(
        'Unable to update request status.'
      );

      return;

    }


    this.loadRequests();

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


    const deleted =
      this.laboratoryService.deleteRequest(
        request.id
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


    this.loadRequests();

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
