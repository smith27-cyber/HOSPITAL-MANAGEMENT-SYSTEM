// =====================================================
// PLATFORM PLAN SERVICE
// File:
// src/app/core/services/platform/plan.service.ts
// =====================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Plan } from '../../../shared/models/platform/plan.model';
import { BillingCycle } from '../../../shared/models/platform/billing-cycle.model';

export interface PlanCreateRequest {
  code: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  trialDays: number;
  moduleIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private readonly http = inject(HttpClient);

  private readonly API_URL = '/api/platform/plans';

  // ===================================================
  // GET ALL PLANS
  // ===================================================

  getAll(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.API_URL);
  }

  // ===================================================
  // CREATE PLAN
  // ===================================================

  create(
    request: PlanCreateRequest
  ): Observable<Plan> {

    return this.http.post<Plan>(
      this.API_URL,
      request
    );
  }

  // ===================================================
  // ACTIVATE / DEACTIVATE PLAN
  // ===================================================

  setActive(
    id: number,
    active: boolean
  ): Observable<Plan> {

    return this.http.patch<Plan>(
      `${this.API_URL}/${id}/active`,
      null,
      {
        params: {
          value: active
        }
      }
    );
  }

  // ===================================================
  // UPDATE PLAN MODULES
  // ===================================================

  updateModules(
    id: number,
    moduleIds: number[]
  ): Observable<Plan> {

    return this.http.put<Plan>(
      `${this.API_URL}/${id}/modules`,
      moduleIds
    );
  }
}