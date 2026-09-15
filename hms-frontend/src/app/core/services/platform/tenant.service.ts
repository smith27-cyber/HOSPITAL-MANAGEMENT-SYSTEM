// =====================================================
// PLATFORM TENANT SERVICE
// File:
// src/app/core/services/platform/tenant.service.ts
// =====================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Tenant,
  TenantStatus,
  TenantType
} from '../../../shared/models/platform/tenant.model';


// =====================================================
// REQUEST MODELS
// =====================================================

export interface TenantCreateRequest {
  code: string;
  name: string;
  type: TenantType;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  logoUrl?: string;
}


export interface TenantUpdateRequest {
  name: string;
  type: TenantType;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  logoUrl?: string;
}


export interface TenantStatusRequest {
  status: TenantStatus;
}


export interface TenantAdminCreateRequest {
  username: string;
  password: string;
  fullName: string;
}


export interface TenantAdminResponse {
  userId: number;
  username: string;
  fullName: string;
  role: string;
  tenantId: number;
  tenantCode: string;
  tenantName: string;
}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class TenantService {

  private readonly http = inject(HttpClient);

  private readonly API_URL = '/api/tenants';


  // ===================================================
  // GET ALL TENANTS
  // ===================================================

  getAll(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(
      this.API_URL
    );
  }


  // ===================================================
  // GET TENANT BY ID
  // ===================================================

  getById(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(
      `${this.API_URL}/${id}`
    );
  }


  // ===================================================
  // CREATE TENANT
  // ===================================================

  create(
    request: TenantCreateRequest
  ): Observable<Tenant> {

    return this.http.post<Tenant>(
      this.API_URL,
      request
    );
  }


  // ===================================================
  // UPDATE TENANT
  // ===================================================

  update(
    id: number,
    request: TenantUpdateRequest
  ): Observable<Tenant> {

    return this.http.put<Tenant>(
      `${this.API_URL}/${id}`,
      request
    );
  }


  // ===================================================
  // UPDATE TENANT STATUS
  // ===================================================

  updateStatus(
    id: number,
    status: TenantStatus
  ): Observable<Tenant> {

    const request: TenantStatusRequest = {
      status
    };

    return this.http.patch<Tenant>(
      `${this.API_URL}/${id}/status`,
      request
    );
  }


  // ===================================================
  // CREATE TENANT ADMINISTRATOR
  // ===================================================

  createAdmin(
    tenantId: number,
    request: TenantAdminCreateRequest
  ): Observable<TenantAdminResponse> {

    return this.http.post<TenantAdminResponse>(
      `${this.API_URL}/${tenantId}/admin`,
      request
    );
  }

}