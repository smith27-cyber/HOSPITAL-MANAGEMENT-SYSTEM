// =====================================================
// PLATFORM PLANS
// File:
// src/app/platform/plans/plans.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PlanService } from '../../core/services/platform/plan.service';
import { Plan } from '../../shared/models/platform/plan.model';

@Component({
  selector: 'app-platform-plans',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './plans.html',
  styleUrl: './plans.css'
})
export class Plans implements OnInit {

  private readonly planService = inject(PlanService);
  private readonly cdr = inject(ChangeDetectorRef);

  plans: Plan[] = [];

  loading = true;
  errorMessage = '';

  updatingPlanId: number | null = null;

  // ===================================================
  // INITIALIZE
  // ===================================================

  ngOnInit(): void {
    console.log('PLATFORM PLANS: initializing');

    this.loadPlans();
  }

  // ===================================================
  // LOAD PLANS
  // ===================================================

  loadPlans(): void {

    console.log('PLATFORM PLANS: loading plans');

    this.loading = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    this.planService.getAll().subscribe({

      next: (plans) => {

        console.log(
          'PLATFORM PLANS: plans received:',
          plans
        );

        this.plans = plans ?? [];

        this.loading = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'PLATFORM PLANS: failed to load plans:',
          error
        );

        this.plans = [];

        this.errorMessage =
          this.getErrorMessage(error);

        this.loading = false;

        this.cdr.detectChanges();

      }

    });
  }

  // ===================================================
  // ACTIVATE / DEACTIVATE
  // ===================================================

  togglePlan(plan: Plan): void {

    if (this.updatingPlanId !== null) {
      return;
    }

    const newStatus = !plan.active;

    this.updatingPlanId = plan.id;

    this.cdr.detectChanges();

    this.planService
      .setActive(plan.id, newStatus)
      .subscribe({

        next: (updatedPlan) => {

          console.log(
            'PLATFORM PLANS: status updated:',
            updatedPlan
          );

          const index =
            this.plans.findIndex(
              current => current.id === plan.id
            );

          if (index !== -1) {
            this.plans[index] = updatedPlan;
          }

          this.updatingPlanId = null;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'PLATFORM PLANS: failed to update status:',
            error
          );

          this.updatingPlanId = null;

          this.errorMessage =
            this.getErrorMessage(error);

          this.cdr.detectChanges();

        }

      });
  }

  // ===================================================
  // HELPERS
  // ===================================================

  formatCurrency(
    amount: number,
    currency: string
  ): string {

    return new Intl.NumberFormat(
      'en-UG',
      {
        style: 'currency',
        currency: currency || 'UGX',
        maximumFractionDigits: 0
      }
    ).format(amount);
  }

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

  getModuleCount(
    plan: Plan
  ): number {

    return plan.modules?.length ?? 0;
  }

  trackByPlanId(
    index: number,
    plan: Plan
  ): number {

    return plan.id;
  }

  // ===================================================
  // ERROR HANDLING
  // ===================================================

  private getErrorMessage(
    error: any
  ): string {

    if (error?.status === 401) {

      return 'Your session has expired. Please log in again.';

    }

    if (error?.status === 403) {

      return 'You do not have permission to manage plans.';

    }

    if (error?.status === 404) {

      return 'The plans service could not be found.';

    }

    if (error?.status >= 500) {

      return 'The server encountered an error. Please try again.';

    }

    return 'Unable to load plans. Please try again.';
  }
}