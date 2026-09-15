import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PlatformModule } from '../../../shared/models/platform/platform-module.model';
import { TenantModule } from '../../../shared/models/platform/tenant-module.model';

@Injectable({
  providedIn: 'root'
})
export class PlatformModuleService {

  private readonly http = inject(HttpClient);

  private readonly API_URL = '/api/platform/modules';


  // =====================================================
  // ALL PLATFORM MODULES
  // =====================================================

  getAll(): Observable<PlatformModule[]> {
    return this.http.get<PlatformModule[]>(
      this.API_URL
    );
  }


  // =====================================================
  // TENANT MODULES
  // =====================================================

  getTenantModules(
    tenantId: number
  ): Observable<TenantModule[]> {

    return this.http.get<TenantModule[]>(
      `${this.API_URL}/tenant/${tenantId}`
    );
  }


  // =====================================================
  // ENABLE / DISABLE TENANT MODULE
  // =====================================================

  setTenantModule(
    tenantId: number,
    moduleId: number,
    enabled: boolean
  ): Observable<TenantModule> {

    return this.http.put<TenantModule>(
      `${this.API_URL}/tenant/${tenantId}/module/${moduleId}`,
      {
        enabled
      }
    );
  }
}