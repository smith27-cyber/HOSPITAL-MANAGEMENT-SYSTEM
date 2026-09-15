// =====================================================
// CREATE PLATFORM TENANT
// File:
// src/app/platform/tenants/create-tenant/create-tenant.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  TenantType
} from '../../../shared/models/platform/tenant.model';

import {
  TenantCreateRequest,
  TenantService
} from '../../../core/services/platform/tenant.service';


@Component({
  selector: 'app-create-tenant',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './create-tenant.html',

  styleUrl: './create-tenant.css'
})
export class CreateTenant {

  // ===================================================
  // SERVICES
  // ===================================================

  private readonly tenantService =
    inject(TenantService);

  private readonly router =
    inject(Router);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // ===================================================
  // FORM
  // ===================================================

  form: TenantCreateRequest = {
    code: '',
    name: '',
    type: 'CLINIC',

    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Uganda',
    website: '',
    logoUrl: ''
  };


  // ===================================================
  // OPTIONS
  // ===================================================

  readonly tenantTypes: TenantType[] = [
    'PHARMACY',
    'CLINIC',
    'HOSPITAL',
    'LABORATORY',
    'OTHER'
  ];


  // ===================================================
  // STATE
  // ===================================================

  saving = false;

  errorMessage = '';

  successMessage = '';


  // ===================================================
  // SUBMIT
  // ===================================================

  submit(): void {

    if (this.saving) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';


    // -----------------------------------------------
    // CLIENT-SIDE VALIDATION
    // -----------------------------------------------

    this.form.code =
      this.form.code.trim().toUpperCase();

    this.form.name =
      this.form.name.trim();

    this.form.phone =
      this.form.phone?.trim() ?? '';

    this.form.email =
      this.form.email?.trim() ?? '';

    this.form.address =
      this.form.address?.trim() ?? '';

    this.form.city =
      this.form.city?.trim() ?? '';

    this.form.country =
      this.form.country?.trim() ?? '';

    this.form.website =
      this.form.website?.trim() ?? '';

    this.form.logoUrl =
      this.form.logoUrl?.trim() ?? '';


    if (!this.form.code) {
      this.errorMessage =
        'Tenant code is required.';
      return;
    }

    if (!/^[A-Z0-9][A-Z0-9_-]*$/.test(this.form.code)) {
      this.errorMessage =
        'Tenant code may contain letters, numbers, hyphens and underscores only.';
      return;
    }

    if (this.form.code.length < 3) {
      this.errorMessage =
        'Tenant code must be at least 3 characters.';
      return;
    }

    if (!this.form.name) {
      this.errorMessage =
        'Tenant name is required.';
      return;
    }

    if (!this.form.type) {
      this.errorMessage =
        'Please select the tenant type.';
      return;
    }


    // -----------------------------------------------
    // SAVE
    // -----------------------------------------------

    this.saving = true;

    this.cdr.detectChanges();

    this.tenantService
      .create(this.form)
      .subscribe({

        next: (tenant) => {

          console.log(
            'PLATFORM TENANT: created successfully',
            tenant
          );

          this.successMessage =
            `Tenant "${tenant.name}" was created successfully.`;

          this.saving = false;

          this.cdr.detectChanges();


          // Give the user a short moment to see success
          setTimeout(() => {

            this.router.navigate([
              '/platform/tenants'
            ]);

          }, 700);

        },

        error: (error) => {

          console.error(
            'PLATFORM TENANT: create failed',
            error
          );

          this.saving = false;

          this.errorMessage =
            this.getErrorMessage(error);

          this.cdr.detectChanges();

        }

      });
  }


  // ===================================================
  // ERROR HANDLING
  // ===================================================

  private getErrorMessage(
    error: any
  ): string {

    if (error?.status === 400) {

      const message =
        error?.error?.message;

      if (message) {
        return message;
      }

      return 'Some tenant information is invalid. Please check the form.';
    }


    if (error?.status === 401) {
      return 'Your session has expired. Please log in again.';
    }


    if (error?.status === 403) {
      return 'You do not have permission to create tenants.';
    }


    if (error?.status === 409) {
      return 'A tenant with this code already exists.';
    }


    if (error?.status >= 500) {
      return 'The server encountered an error. Please try again.';
    }


    return 'Unable to create tenant. Please try again.';
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
  // RESET
  // ===================================================

  resetForm(): void {

    this.form = {
      code: '',
      name: '',
      type: 'CLINIC',

      phone: '',
      email: '',
      address: '',
      city: '',
      country: 'Uganda',
      website: '',
      logoUrl: ''
    };

    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.detectChanges();
  }

}