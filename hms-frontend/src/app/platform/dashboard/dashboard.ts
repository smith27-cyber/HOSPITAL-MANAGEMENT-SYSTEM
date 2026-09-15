// =====================================================
// PLATFORM DASHBOARD
// File:
// src/app/platform/dashboard/dashboard.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  PlatformDashboardService
} from '../../core/services/platform/platform-dashboard.service';

import {
  Tenant
} from '../../shared/models/platform/tenant.model';

import {
  Plan
} from '../../shared/models/platform/plan.model';

import {
  Subscription
} from '../../shared/models/platform/subscription.model';

import {
  PlatformModule
} from '../../shared/models/platform/platform-module.model';


@Component({
  selector: 'app-platform-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css'
})
export class PlatformDashboard implements OnInit {

  // ===================================================
  // SERVICE
  // ===================================================

  private readonly dashboardService =
    inject(PlatformDashboardService);
  private readonly cdr =
    inject(ChangeDetectorRef);

  // ===================================================
  // STATE
  // ===================================================

  tenants: Tenant[] = [];

  plans: Plan[] = [];

  subscriptions: Subscription[] = [];

  modules: PlatformModule[] = [];

  loading = true;

  errorMessage = '';


  // ===================================================
  // LIFECYCLE
  // ===================================================

  ngOnInit(): void {

    this.loadDashboard();

  }


  // ===================================================
  // LOAD DASHBOARD
  // ===================================================

  loadDashboard(): void {

    console.log(
      'PLATFORM DASHBOARD: loading started'
    );

    this.loading = true;

    this.errorMessage = '';


    this.dashboardService
      .loadDashboard()
      .subscribe({

        next: (data) => {

          console.log(
            'PLATFORM DASHBOARD: data received',
            data
          );


          this.tenants =
            data.tenants ?? [];


          this.plans =
            data.plans ?? [];


          this.subscriptions =
            data.subscriptions ?? [];


          this.modules =
            data.modules ?? [];


          this.loading = false;

          this.cdr.detectChanges();

          console.log(
            'PLATFORM DASHBOARD: loading finished',
            this.loading
          );

        },


        error: (error) => {

          console.error(
            'PLATFORM DASHBOARD: ERROR',
            error
          );


          this.errorMessage =
            'Unable to load platform dashboard data.';


          this.loading = false;

          this.cdr.detectChanges();

          console.log(
            'PLATFORM DASHBOARD: loading finished with error',
            this.loading
          );

        }

      });

  }


  // ===================================================
  // TENANT COUNTS
  // ===================================================

  get totalTenants(): number {

    return this.tenants.length;

  }


  get activeTenants(): number {

    return this.tenants.filter(
      tenant =>
        tenant.status === 'ACTIVE'
    ).length;

  }


  get trialTenants(): number {

    return this.tenants.filter(
      tenant =>
        tenant.status === 'TRIAL'
    ).length;

  }


  get suspendedTenants(): number {

    return this.tenants.filter(
      tenant =>
        tenant.status === 'SUSPENDED'
    ).length;

  }


  // ===================================================
  // PLAN COUNTS
  // ===================================================

  get totalPlans(): number {

    return this.plans.length;

  }


  get activePlans(): number {

    return this.plans.filter(
      plan =>
        plan.active
    ).length;

  }


  // ===================================================
  // SUBSCRIPTION COUNTS
  // ===================================================

  get totalSubscriptions(): number {

    return this.subscriptions.length;

  }


  get activeSubscriptions(): number {

    return this.subscriptions.filter(
      subscription =>
        subscription.status === 'ACTIVE'
    ).length;

  }


  get trialSubscriptions(): number {

    return this.subscriptions.filter(
      subscription =>
        subscription.status === 'TRIAL'
    ).length;

  }


  get suspendedSubscriptions(): number {

    return this.subscriptions.filter(
      subscription =>
        subscription.status === 'SUSPENDED'
    ).length;

  }


  // ===================================================
  // MODULE COUNTS
  // ===================================================

  get totalModules(): number {

    return this.modules.length;

  }


  get activeModules(): number {

    return this.modules.filter(
      module =>
        module.active
    ).length;

  }


  // ===================================================
  // RECENT TENANTS
  // ===================================================

  get recentTenants(): Tenant[] {

    return [
      ...this.tenants
    ]
      .sort(
        (a, b) => {

          const dateA =
            a.createdAt
              ? new Date(
                a.createdAt
              ).getTime()
              : 0;


          const dateB =
            b.createdAt
              ? new Date(
                b.createdAt
              ).getTime()
              : 0;


          return dateB - dateA;

        }
      )
      .slice(0, 5);

  }


  // ===================================================
  // CURRENCY FORMAT
  // ===================================================

  formatCurrency(
    amount: number,
    currency = 'UGX'
  ): string {

    return new Intl.NumberFormat(
      'en-UG',
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
      }
    ).format(amount);

  }


  // ===================================================
  // STATUS CLASS
  // ===================================================

  statusClass(
    status: string
  ): string {

    return status
      .toLowerCase()
      .replace(
        '_',
        '-'
      );

  }

}