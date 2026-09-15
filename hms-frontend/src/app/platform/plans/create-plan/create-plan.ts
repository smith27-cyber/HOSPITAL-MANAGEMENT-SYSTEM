// =====================================================
// CREATE PLATFORM PLAN
// File:
// src/app/platform/plans/create-plan/create-plan.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  BillingCycle
} from '../../../shared/models/platform/billing-cycle.model';

import {
  PlatformModule
} from '../../../shared/models/platform/platform-module.model';

import {
  PlanCreateRequest,
  PlanService
} from '../../../core/services/platform/plan.service';

import {
  PlatformModuleService
} from '../../../core/services/platform/platform-module.service';

@Component({
  selector: 'app-create-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './create-plan.html',
  styleUrl: './create-plan.css'
})
export class CreatePlan implements OnInit {

  private readonly planService =
    inject(PlanService);

  private readonly moduleService =
    inject(PlatformModuleService);

  private readonly router =
    inject(Router);

  private readonly cdr =
    inject(ChangeDetectorRef);

  // ===================================================
  // FORM
  // ===================================================

  form: PlanCreateRequest = {

    code: '',

    name: '',

    description: '',

    price: 0,

    currency: 'UGX',

    billingCycle: 'MONTHLY' as BillingCycle,

    trialDays: 14,

    moduleIds: []

  };

  // ===================================================
  // MODULES
  // ===================================================

  modules: PlatformModule[] = [];

  loadingModules = true;

  // ===================================================
  // STATE
  // ===================================================

  saving = false;

  errorMessage = '';

  successMessage = '';

  // ===================================================
  // BILLING CYCLES
  // ===================================================

  readonly billingCycles: BillingCycle[] = [
    'MONTHLY',
    'YEARLY'
  ];

  // ===================================================
  // INITIALIZE
  // ===================================================

  ngOnInit(): void {

    console.log(
      'CREATE PLAN: initializing'
    );

    this.loadModules();

  }

  // ===================================================
  // LOAD MODULES
  // ===================================================

  loadModules(): void {

    this.loadingModules = true;

    this.moduleService
      .getAll()
      .subscribe({

        next: (modules) => {

          console.log(
            'CREATE PLAN: modules received:',
            modules
          );

          this.modules =
            (modules ?? [])
              .filter(module => module.active);

          this.loadingModules = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'CREATE PLAN: failed to load modules:',
            error
          );

          this.modules = [];

          this.loadingModules = false;

          this.errorMessage =
            'Unable to load platform modules.';

          this.cdr.detectChanges();

        }

      });

  }

  // ===================================================
  // MODULE SELECTION
  // ===================================================

  isModuleSelected(
    moduleId: number
  ): boolean {

    return this.form.moduleIds
      .includes(moduleId);

  }

  toggleModule(
    moduleId: number
  ): void {

    const index =
      this.form.moduleIds.indexOf(moduleId);

    if (index === -1) {

      this.form.moduleIds.push(moduleId);

    } else {

      this.form.moduleIds.splice(
        index,
        1
      );

    }

    this.cdr.detectChanges();

  }

  selectAllModules(): void {

    this.form.moduleIds =
      this.modules.map(
        module => module.id
      );

    this.cdr.detectChanges();

  }

  clearModules(): void {

    this.form.moduleIds = [];

    this.cdr.detectChanges();

  }

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
    // CLEAN INPUT
    // -----------------------------------------------

    this.form.code =
      this.form.code
        .trim()
        .toUpperCase();

    this.form.name =
      this.form.name
        .trim();

    this.form.description =
      this.form.description
        ?.trim() ?? '';

    this.form.currency =
      this.form.currency
        .trim()
        .toUpperCase();

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!this.form.code) {

      this.errorMessage =
        'Plan code is required.';

      return;

    }

    if (
      !/^[A-Z0-9][A-Z0-9_-]*$/
        .test(this.form.code)
    ) {

      this.errorMessage =
        'Plan code may contain letters, numbers, hyphens and underscores only.';

      return;

    }

    if (this.form.code.length < 3) {

      this.errorMessage =
        'Plan code must be at least 3 characters.';

      return;

    }

    if (!this.form.name) {

      this.errorMessage =
        'Plan name is required.';

      return;

    }

    if (
      this.form.price === null ||
      this.form.price < 0
    ) {

      this.errorMessage =
        'Plan price cannot be negative.';

      return;

    }

    if (
      !this.form.currency
    ) {

      this.errorMessage =
        'Currency is required.';

      return;

    }

    if (
      this.form.trialDays < 0
    ) {

      this.errorMessage =
        'Trial days cannot be negative.';

      return;

    }

    if (
      !this.form.billingCycle
    ) {

      this.errorMessage =
        'Billing cycle is required.';

      return;

    }

    if (
      this.form.moduleIds.length === 0
    ) {

      this.errorMessage =
        'Select at least one module for this plan.';

      return;

    }

    // -----------------------------------------------
    // SAVE
    // -----------------------------------------------

    this.saving = true;

    this.cdr.detectChanges();

    console.log(
      'CREATE PLAN: submitting:',
      this.form
    );

    this.planService
      .create(this.form)
      .subscribe({

        next: (plan) => {

          console.log(
            'CREATE PLAN: created successfully:',
            plan
          );

          this.successMessage =
            `Plan "${plan.name}" was created successfully.`;

          this.saving = false;

          this.cdr.detectChanges();

          setTimeout(() => {

            this.router.navigate(
              ['/platform/plans']
            );

          }, 700);

        },

        error: (error) => {

          console.error(
            'CREATE PLAN: creation failed:',
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
  // RESET
  // ===================================================

  resetForm(): void {

    this.form = {

      code: '',

      name: '',

      description: '',

      price: 0,

      currency: 'UGX',

      billingCycle:
        'MONTHLY' as BillingCycle,

      trialDays: 14,

      moduleIds: []

    };

    this.errorMessage = '';

    this.successMessage = '';

    this.cdr.detectChanges();

  }

  // ===================================================
  // ERROR HANDLING
  // ===================================================

  private getErrorMessage(
    error: any
  ): string {

    if (error?.status === 400) {

      return (
        error?.error?.message ??
        'Some plan information is invalid.'
      );

    }

    if (error?.status === 401) {

      return 'Your session has expired. Please log in again.';

    }

    if (error?.status === 403) {

      return 'You do not have permission to create plans.';

    }

    if (error?.status === 409) {

      return 'A plan with this code already exists.';

    }

    if (error?.status >= 500) {

      return 'The server encountered an error. Please try again.';

    }

    return 'Unable to create the plan. Please try again.';

  }

  // ===================================================
  // DISPLAY HELPERS
  // ===================================================

  formatBillingCycle(
    cycle: string
  ): string {

    return String(cycle)
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(
        /\b\w/g,
        letter => letter.toUpperCase()
      );

  }

}