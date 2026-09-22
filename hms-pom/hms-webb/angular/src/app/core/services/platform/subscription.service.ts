import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Subscription,
  SubscriptionStatus
} from '../../../shared/models/platform/subscription.model';

export interface SubscriptionCreateRequest {
  tenantId: number;
  planId: number;
  status?: SubscriptionStatus | null;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private readonly http = inject(HttpClient);

  private readonly API_URL = '/api/platform/subscriptions';


  // =====================================================
  // GET ALL SUBSCRIPTIONS
  // =====================================================

  getAll(): Observable<Subscription[]> {

    return this.http.get<Subscription[]>(
      this.API_URL
    );

  }


  // =====================================================
  // GET SUBSCRIPTION FOR TENANT
  // =====================================================

  getByTenant(
    tenantId: number
  ): Observable<Subscription> {

    return this.http.get<Subscription>(
      `${this.API_URL}/tenant/${tenantId}`
    );

  }


  // =====================================================
  // CREATE SUBSCRIPTION
  // =====================================================

  create(
    request: SubscriptionCreateRequest
  ): Observable<Subscription> {

    return this.http.post<Subscription>(
      this.API_URL,
      request
    );

  }


  // =====================================================
  // CHANGE SUBSCRIPTION STATUS
  // =====================================================

  updateStatus(
    id: number,
    status: SubscriptionStatus
  ): Observable<Subscription> {

    return this.http.patch<Subscription>(
      `${this.API_URL}/${id}/status`,
      null,
      {
        params: {
          value: status
        }
      }
    );

  }

}