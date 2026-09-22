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
import { Router, RouterLink } from '@angular/router';

import {
  SubscriptionStatus
} from '../../../shared/models/platform/subscription.model';

import { Tenant } from '../../../shared/models/platform/tenant.model';
import { Plan } from '../../../shared/models/platform/plan.model';

import { TenantService } from '../../../core/services/platform/tenant.service';
import { PlanService } from '../../../core/services/platform/plan.service';
import {
  SubscriptionService,
  SubscriptionCreateRequest
} from '../../../core/services/platform/subscription.service';

@Component({
  selector: 'app-create-subscription',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './create-subscription.html',
  styleUrl: './create-subscription.css'
})
export class CreateSubscription implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly tenantService = inject(TenantService);
  private readonly planService = inject(PlanService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly cdr = inject(ChangeDetectorRef);

  tenants: Tenant[] = [];
  plans: Plan[] = [];

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  readonly statusOptions: {
    value: SubscriptionStatus | null;
    label: string;
    description: string;
  }[] = [
    {
      value: null,
      label: 'Automatic',
      description: 'Use the plan trial settings automatically.'
    },
    {
      value: 'TRIAL',
      label: 'Trial',
      description: 'Start the tenant on a trial period.'
    },
    {
      value: 'ACTIVE',
      label: 'Active',
      description: 'Activate the subscription immediately.'
    }
  ];

  subscriptionForm = this.fb.nonNullable.group({
    tenantId: ['', Validators.required],
    planId: ['', Validators.required],
    status: ['' as string, Validators.required]
  });

  ngOnInit(): void {
    this.loadFormData();
  }

  loadFormData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.tenantService.getAll().subscribe({
      next: (tenants) => {
        this.tenants = tenants ?? [];

        this.planService.getAll().subscribe({
          next: (plans) => {
            this.plans = (plans ?? []).filter(plan => plan.active);
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('CREATE SUBSCRIPTION: failed to load plans', error);
            this.loading = false;
            this.errorMessage = 'Unable to load plans.';
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('CREATE SUBSCRIPTION: failed to load tenants', error);
        this.loading = false;
        this.errorMessage = 'Unable to load tenants.';
        this.cdr.detectChanges();
      }
    });
  }

  getSelectedPlan(): Plan | null {
    const planId = Number(this.subscriptionForm.controls.planId.value);

    if (!planId) {
      return null;
    }

    return this.plans.find(plan => plan.id === planId) ?? null;
  }

  getSelectedTenant(): Tenant | null {
    const tenantId = Number(this.subscriptionForm.controls.tenantId.value);

    if (!tenantId) {
      return null;
    }

    return this.tenants.find(tenant => tenant.id === tenantId) ?? null;
  }

  createSubscription(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.subscriptionForm.invalid) {
      this.subscriptionForm.markAllAsTouched();
      return;
    }

    const tenantId = Number(this.subscriptionForm.controls.tenantId.value);
    const planId = Number(this.subscriptionForm.controls.planId.value);

    const statusValue = this.subscriptionForm.controls.status.value;

    const request: SubscriptionCreateRequest = {
      tenantId,
      planId,
      status: statusValue
        ? statusValue as SubscriptionStatus
        : null
    };

    console.log('CREATE SUBSCRIPTION: request', request);

    this.saving = true;

    this.subscriptionService.create(request).subscribe({
      next: (subscription) => {
        console.log(
          'CREATE SUBSCRIPTION: created successfully',
          subscription
        );

        this.saving = false;
        this.successMessage = 'Subscription created successfully.';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/platform/subscriptions']);
        }, 700);
      },
      error: (error) => {
        console.error(
          'CREATE SUBSCRIPTION: creation failed',
          error
        );

        this.saving = false;
        this.errorMessage = this.getErrorMessage(error);
        this.cdr.detectChanges();
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error?.status === 400) {
      return error?.error?.message ||
        'The subscription information is invalid.';
    }

    if (error?.status === 401) {
      return 'Your session has expired. Please log in again.';
    }

    if (error?.status === 403) {
      return 'You do not have permission to create subscriptions.';
    }

    if (error?.status === 404) {
      return 'The selected tenant or plan could not be found.';
    }

    if (error?.status >= 500) {
      return 'The server encountered an error. Please try again.';
    }

    return 'Unable to create subscription. Please try again.';
  }
}