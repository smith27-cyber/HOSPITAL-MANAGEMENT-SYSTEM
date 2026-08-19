import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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
    CommonModule
  ],

  templateUrl: './laboratory-request-details.html',

  styleUrl: './laboratory-request-details.css'
})
export class LaboratoryRequestDetails implements OnInit {


  // =====================================================
  // REQUEST
  // =====================================================

  request: LaboratoryRequest | null = null;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private laboratoryService: LaboratoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {

      alert(
        'Laboratory request ID was not provided.'
      );

      this.backToRequests();

      return;

    }


    this.request =
      this.laboratoryService.getRequestById(id)
      ?? null;


    if (!this.request) {

      alert(
        'Laboratory request could not be found.'
      );

      this.backToRequests();

    }

  }


  // =====================================================
  // STATUS
  // =====================================================

  updateStatus(
    status: LaboratoryStatus
  ): void {

    if (!this.request) {
      return;
    }


    const success =
      this.laboratoryService.updateRequestStatus(
        this.request.id,
        status
      );


    if (!success) {

      alert(
        'Unable to update request status.'
      );

      return;

    }


    this.request =
      this.laboratoryService.getRequestById(
        this.request.id
      ) ?? null;

  }


  // =====================================================
  // EDIT
  // =====================================================

  editRequest(): void {

    if (!this.request) {
      return;
    }


    this.router.navigate([
      '/laboratory/requests',
      this.request.id,
      'edit'
    ]);

  }


  // =====================================================
  // DELETE
  // =====================================================

  deleteRequest(): void {

    if (!this.request) {
      return;
    }


    const confirmed =
      confirm(
        `Are you sure you want to delete this laboratory request?`
      );


    if (!confirmed) {
      return;
    }


    const deleted =
      this.laboratoryService.deleteRequest(
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
  // STATUS CLASS
  // =====================================================

  getStatusClass(): string {

    if (!this.request) {
      return '';
    }


    switch (this.request.status) {

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
  // CURRENCY
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


  // =====================================================
  // BACK
  // =====================================================

  backToRequests(): void {

    this.router.navigate([
      '/laboratory/requests'
    ]);

  }

}
