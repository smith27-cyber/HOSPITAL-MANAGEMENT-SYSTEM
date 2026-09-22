// =====================================================
// TENANT ADMIN
// File:
// src/app/platform/tenants/tenant-admin/tenant-admin.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  TenantService,
  TenantAdminResponse
} from '../../../core/services/platform/tenant.service';

import { Tenant } from '../../../shared/models/platform/tenant.model';


@Component({
  selector: 'app-tenant-admin',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './tenant-admin.html',

  styleUrl: './tenant-admin.css'
})
export class TenantAdmin implements OnInit {

  // =====================================================
  // SERVICES
  // =====================================================

  private readonly fb =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly tenantService =
    inject(TenantService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // PAGE STATE
  // =====================================================

  tenantId!: number;

  tenant: Tenant | null = null;

  loading = true;

  saving = false;

  errorMessage = '';

  successMessage = '';

  createdAdmin: TenantAdminResponse | null = null;


  // =====================================================
  // PASSWORD VISIBILITY
  // =====================================================

  showPassword = false;

  showConfirmPassword = false;


  // =====================================================
  // ADMIN FORM
  // =====================================================

  adminForm = this.fb.nonNullable.group({

    fullName: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    username: [
      '',
      [
        Validators.required,
        Validators.maxLength(50)
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(100)
      ]
    ],

    confirmPassword: [
      '',
      [
        Validators.required
      ]
    ]

  });


  // =====================================================
  // PASSWORD MISMATCH
  // =====================================================

  get passwordMismatch(): boolean {

    const password =
      this.adminForm.controls.password.value;

    const confirmPassword =
      this.adminForm.controls.confirmPassword.value;

    return !!(
      password &&
      confirmPassword &&
      password !== confirmPassword
    );
  }


  // =====================================================
  // ADMIN FORM TOGGLE
  // =====================================================

  showCreateAdminForm = true;


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );


    if (!id || Number.isNaN(id)) {

      this.errorMessage =
        'Invalid tenant ID.';

      this.loading = false;

      this.cdr.detectChanges();

      return;
    }


    this.tenantId = id;

    this.loadTenant();
  }


  // =====================================================
  // LOAD TENANT
  // =====================================================

  loadTenant(): void {

    this.loading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();


    this.tenantService
      .getById(this.tenantId)
      .subscribe({

        next: (tenant) => {

          this.tenant = tenant;

          this.loading = false;

          this.errorMessage = '';

          this.cdr.detectChanges();
        },


        error: (error) => {

          console.error(
            'Failed to load tenant:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Failed to load tenant information.';


          this.loading = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // CREATE TENANT ADMIN
  // =====================================================

  submit(): void {

    this.errorMessage = '';

    this.successMessage = '';


    // ---------------------------------------------------
    // VALIDATE FORM
    // ---------------------------------------------------

    if (this.adminForm.invalid) {

      this.adminForm.markAllAsTouched();

      this.cdr.detectChanges();

      return;
    }


    // ---------------------------------------------------
    // CHECK PASSWORDS
    // ---------------------------------------------------

    if (this.passwordMismatch) {

      this.errorMessage =
        'Passwords do not match.';

      this.adminForm.controls.confirmPassword.markAsTouched();

      this.cdr.detectChanges();

      return;
    }


    // ---------------------------------------------------
    // GET FORM VALUES
    // ---------------------------------------------------

    const formValue =
      this.adminForm.getRawValue();


    // ---------------------------------------------------
    // START SAVING
    // ---------------------------------------------------

    this.saving = true;

    this.cdr.detectChanges();


    // ---------------------------------------------------
    // CREATE ADMIN
    // ---------------------------------------------------

    this.tenantService
      .createAdmin(
        this.tenantId,
        {
          username:
            formValue.username
              .trim()
              .toLowerCase(),

          password:
            formValue.password,

          fullName:
            formValue.fullName
              .trim()
        }
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Tenant administrator created:',
            response
          );


          this.createdAdmin =
            response;


          this.successMessage =
            'Tenant administrator created successfully.';


          this.saving = false;


          this.adminForm.reset();


          this.showPassword = false;

          this.showConfirmPassword = false;


          this.cdr.detectChanges();
        },


        error: (error) => {

          console.error(
            'Failed to create tenant admin:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Failed to create tenant administrator.';


          this.saving = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // FORM ERROR HELPER
  // =====================================================

  hasError(
    controlName: string,
    errorName: string
  ): boolean {

    const control =
      this.adminForm.get(controlName);


    return !!(
      control &&
      control.touched &&
      control.hasError(errorName)
    );
  }


  // =====================================================
  // PASSWORD VISIBILITY
  // =====================================================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;
  }


  toggleConfirmPassword(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;
  }


  // =====================================================
  // ADMIN FORM TOGGLE
  // =====================================================

  toggleCreateAdmin(): void {

    this.showCreateAdminForm =
      !this.showCreateAdminForm;


    this.errorMessage = '';

    this.successMessage = '';

    this.createdAdmin = null;
  }


  // =====================================================
  // MANAGE MODULES
  // =====================================================

  manageModules(): void {

    this.router.navigate([
      '/platform/tenants',
      this.tenantId,
      'modules'
    ]);
  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshTenant(): void {

    this.loadTenant();
  }


  // =====================================================
  // BACK
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/platform/tenants'
    ]);
  }


  // =====================================================
  // TENANT DISPLAY HELPERS
  // =====================================================

  getTenantInitial(): string {

    if (!this.tenant?.name) {

      return 'T';
    }


    return this.tenant.name
      .trim()
      .charAt(0)
      .toUpperCase();
  }


  formatStatus(
    status: string | null | undefined
  ): string {

    if (!status) {

      return 'Unknown';
    }


    return status
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(
        /\b\w/g,
        char => char.toUpperCase()
      );
  }


  formatType(
    type: string | null | undefined
  ): string {

    if (!type) {

      return 'Unknown';
    }


    return type
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(
        /\b\w/g,
        char => char.toUpperCase()
      );
  }


  // =====================================================
  // TRACK BY
  // =====================================================

  trackByTenantId(
    index: number,
    tenant: Tenant
  ): number {

    return tenant.id;
  }

}