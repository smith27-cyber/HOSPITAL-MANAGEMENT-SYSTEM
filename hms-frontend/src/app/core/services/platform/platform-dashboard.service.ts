// =====================================================
// PLATFORM DASHBOARD SERVICE
// File:
// src/app/core/services/platform/platform-dashboard.service.ts
// =====================================================

import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  forkJoin,
  tap
} from 'rxjs';

import {
  Tenant
} from '../../../shared/models/platform/tenant.model';

import {
  Plan
} from '../../../shared/models/platform/plan.model';

import {
  Subscription
} from '../../../shared/models/platform/subscription.model';

import {
  PlatformModule
} from '../../../shared/models/platform/platform-module.model';


export interface PlatformDashboardData {

  tenants: Tenant[];

  plans: Plan[];

  subscriptions: Subscription[];

  modules: PlatformModule[];

}


@Injectable({
  providedIn: 'root'
})
export class PlatformDashboardService {

  private readonly http =
    inject(HttpClient);


  private readonly tenantsUrl =
    '/api/tenants';

  private readonly plansUrl =
    '/api/platform/plans';

  private readonly subscriptionsUrl =
    '/api/platform/subscriptions';

  private readonly modulesUrl =
    '/api/platform/modules';


  // ===================================================
  // LOAD DASHBOARD
  // ===================================================

  loadDashboard():
    Observable<PlatformDashboardData> {

    console.log(
      'DASHBOARD SERVICE: starting requests'
    );


    return forkJoin({

      tenants: this.http
        .get<Tenant[]>(
          this.tenantsUrl
        )
        .pipe(
          tap(data =>
            console.log(
              'TENANTS COMPLETE:',
              data
            )
          )
        ),


      plans: this.http
        .get<Plan[]>(
          this.plansUrl
        )
        .pipe(
          tap(data =>
            console.log(
              'PLANS COMPLETE:',
              data
            )
          )
        ),


      subscriptions: this.http
        .get<Subscription[]>(
          this.subscriptionsUrl
        )
        .pipe(
          tap(data =>
            console.log(
              'SUBSCRIPTIONS COMPLETE:',
              data
            )
          )
        ),


      modules: this.http
        .get<PlatformModule[]>(
          this.modulesUrl
        )
        .pipe(
          tap(data =>
            console.log(
              'MODULES COMPLETE:',
              data
            )
          )
        )

    });

  }

}