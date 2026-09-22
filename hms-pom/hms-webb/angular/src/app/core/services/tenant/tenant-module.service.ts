// =====================================================
// TENANT MODULE SERVICE
// File:
// src/app/core/services/tenant/tenant-module.service.ts
// =====================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TenantModuleService {

  // =====================================================
  // API
  // =====================================================

  private readonly apiUrl =
    'http://localhost:8081/api/tenant/modules';


  // =====================================================
  // DEPENDENCIES
  // =====================================================

  private readonly http =
    inject(HttpClient);


  // =====================================================
  // ENABLED MODULES
  // =====================================================

  private enabledModules = new Set<string>();


  private loaded = false;


  // =====================================================
  // LOAD MODULES
  // =====================================================

  loadModules(): Observable<string[]> {

    return this.http
      .get<string[]>(this.apiUrl)
      .pipe(

        tap(modules => {

          this.enabledModules =
            new Set(
              modules.map(module =>
                module.toUpperCase()
              )
            );

          this.loaded = true;

          console.log(
            'Tenant enabled modules:',
            modules
          );

        }),

        catchError(error => {

          console.error(
            'Failed to load tenant modules:',
            error
          );

          this.enabledModules.clear();

          this.loaded = true;

          return of([]);

        })

      );

  }


  // =====================================================
  // CHECK SINGLE MODULE
  // =====================================================

  hasModule(
    moduleCode: string
  ): boolean {

    return this.enabledModules.has(
      moduleCode.toUpperCase()
    );

  }


  // =====================================================
  // CHECK MULTIPLE MODULES
  // =====================================================

  hasAnyModule(
    moduleCodes: string[]
  ): boolean {

    return moduleCodes.some(
      moduleCode =>
        this.hasModule(moduleCode)
    );

  }


  // =====================================================
  // CHECK WHETHER MODULES HAVE LOADED
  // =====================================================

  isLoaded(): boolean {

    return this.loaded;

  }


  // =====================================================
  // CLEAR
  // =====================================================

  clear(): void {

    this.enabledModules.clear();

    this.loaded = false;

  }

}