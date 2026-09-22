// =====================================================
// PLATFORM TENANTS
// File:
// src/app/platform/tenants/tenants.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import { FormsModule } from '@angular/forms';

import {
  Tenant,
  TenantStatus,
  TenantType
} from '../../shared/models/platform/tenant.model';

import {
  TenantService
} from '../../core/services/platform/tenant.service';


@Component({
  selector: 'app-tenants',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],

  templateUrl: './tenants.html',

  styleUrl: './tenants.css'
})
export class Tenants implements OnInit {

  // ===================================================
  // SERVICES
  // ===================================================

  private readonly tenantService =
    inject(TenantService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // ===================================================
  // STATE
  // ===================================================

  tenants: Tenant[] = [];

  loading = true;

  errorMessage = '';

  searchTerm = '';

  selectedType: TenantType | '' = '';

  selectedStatus: TenantStatus | '' = '';


  // ===================================================
  // FILTER OPTIONS
  // ===================================================

  readonly tenantTypes: TenantType[] = [
    'PHARMACY',
    'CLINIC',
    'HOSPITAL',
    'LABORATORY',
    'OTHER'
  ];

  readonly tenantStatuses: TenantStatus[] = [
    'TRIAL',
    'ACTIVE',
    'GRACE_PERIOD',
    'SUSPENDED',
    'CANCELLED',
    'EXPIRED'
  ];


  // ===================================================
  // INITIALIZATION
  // ===================================================

  ngOnInit(): void {

    console.log(
      'PLATFORM TENANTS: initializing'
    );

    this.loadTenants();
  }


  // ===================================================
  // LOAD TENANTS
  // ===================================================

  loadTenants(): void {

    console.log(
      'PLATFORM TENANTS: loading tenants'
    );

    this.loading = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    this.tenantService
      .getAll()
      .subscribe({

        next: (tenants) => {

          console.log(
            'PLATFORM TENANTS: tenants received:',
            tenants
          );

          this.tenants = tenants ?? [];

          this.loading = false;

          this.cdr.detectChanges();

          console.log(
            'PLATFORM TENANTS: loading finished:',
            {
              count: this.tenants.length,
              loading: this.loading
            }
          );
        },

        error: (error) => {

          console.error(
            'PLATFORM TENANTS: failed to load tenants:',
            error
          );

          this.tenants = [];

          this.errorMessage =
            this.getErrorMessage(error);

          this.loading = false;

          this.cdr.detectChanges();
        }

      });
  }


  // ===================================================
  // ERROR MESSAGE
  // ===================================================

  private getErrorMessage(
    error: any
  ): string {

    if (error?.status === 401) {
      return 'Your session has expired. Please log in again.';
    }

    if (error?.status === 403) {
      return 'You do not have permission to view tenants.';
    }

    if (error?.status === 404) {
      return 'The tenant service could not be found.';
    }

    if (error?.status >= 500) {
      return 'The server encountered an error. Please try again.';
    }

    return 'Unable to load tenants. Please try again.';
  }


  // ===================================================
  // FILTERED TENANTS
  // ===================================================

  get filteredTenants(): Tenant[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.tenants.filter(
      (tenant) => {

        const name =
          tenant.name?.toLowerCase() ?? '';

        const code =
          tenant.code?.toLowerCase() ?? '';

        const city =
          tenant.city?.toLowerCase() ?? '';

        const matchesSearch =
          !search ||
          name.includes(search) ||
          code.includes(search) ||
          city.includes(search);

        const matchesType =
          !this.selectedType ||
          tenant.type === this.selectedType;

        const matchesStatus =
          !this.selectedStatus ||
          tenant.status === this.selectedStatus;

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus
        );
      }
    );
  }


  // ===================================================
  // TRACK TENANT ROWS
  // ===================================================

  trackByTenantId(
    index: number,
    tenant: Tenant
  ): number {

    return tenant.id;
  }


  // ===================================================
  // STATUS CLASS
  // ===================================================

  statusClass(
    status: TenantStatus
  ): string {

    return String(status)
      .toLowerCase()
      .replace(/_/g, '-');
  }


  // ===================================================
  // DISPLAY TYPE
  // ===================================================

  formatType(
    type: TenantType
  ): string {

    return String(type)
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(
        /\b\w/g,
        letter => letter.toUpperCase()
      );
  }


  // ===================================================
  // DISPLAY STATUS
  // ===================================================

  formatStatus(
    status: TenantStatus
  ): string {

    return String(status)
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(
        /\b\w/g,
        letter => letter.toUpperCase()
      );
  }


  // ===================================================
  // TENANT INITIAL
  // ===================================================

  getInitial(
    tenant: Tenant
  ): string {

    const name =
      tenant.name?.trim() ?? '';

    if (!name) {
      return '?';
    }

    return name
      .charAt(0)
      .toUpperCase();
  }


  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedType = '';

    this.selectedStatus = '';

    this.cdr.detectChanges();
  }


  // ===================================================
  // ACTIVE FILTER CHECK
  // ===================================================

  get hasActiveFilters(): boolean {

    return !!(
      this.searchTerm.trim() ||
      this.selectedType ||
      this.selectedStatus
    );
  }

}