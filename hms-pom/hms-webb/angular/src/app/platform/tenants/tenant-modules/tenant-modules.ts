import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Tenant } from '../../../shared/models/platform/tenant.model';
import { PlatformModule } from '../../../shared/models/platform/platform-module.model';
import { TenantModule } from '../../../shared/models/platform/tenant-module.model';

import { TenantService } from '../../../core/services/platform/tenant.service';
import { PlatformModuleService } from '../../../core/services/platform/platform-module.service';

@Component({
  selector: 'app-tenant-modules',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './tenant-modules.html',
  styleUrl: './tenant-modules.css'
})
export class TenantModules implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly tenantService = inject(TenantService);
  private readonly moduleService = inject(PlatformModuleService);
  private readonly cdr = inject(ChangeDetectorRef);

  tenant: Tenant | null = null;

  modules: PlatformModule[] = [];
  tenantModules: TenantModule[] = [];

  loading = true;
  savingModuleId: number | null = null;

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const tenantId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!tenantId) {
      this.errorMessage = 'Invalid tenant ID.';
      this.loading = false;
      return;
    }

    this.loadTenant(tenantId);
  }


  // =====================================================
  // LOAD TENANT
  // =====================================================

  loadTenant(tenantId: number): void {

    this.loading = true;
    this.errorMessage = '';

    this.tenantService.getById(tenantId).subscribe({

      next: (tenant) => {

        this.tenant = tenant;

        this.loadModules(tenantId);
      },

      error: (error) => {

        console.error(
          'TENANT MODULES: failed to load tenant',
          error
        );

        this.loading = false;

        this.errorMessage =
          this.getErrorMessage(error);

        this.cdr.detectChanges();
      }

    });
  }


  // =====================================================
  // LOAD MODULES
  // =====================================================

  loadModules(tenantId: number): void {

    this.moduleService.getAll().subscribe({

      next: (modules) => {

        this.modules = modules ?? [];

        this.loadTenantModules(tenantId);
      },

      error: (error) => {

        console.error(
          'TENANT MODULES: failed to load platform modules',
          error
        );

        this.loading = false;

        this.errorMessage =
          'Unable to load platform modules.';

        this.cdr.detectChanges();
      }

    });
  }


  // =====================================================
  // LOAD TENANT ENTITLEMENTS
  // =====================================================

  loadTenantModules(tenantId: number): void {

    this.moduleService
      .getTenantModules(tenantId)
      .subscribe({

        next: (tenantModules) => {

          this.tenantModules =
            tenantModules ?? [];

          this.loading = false;

          console.log(
            'TENANT MODULES: loaded',
            this.tenantModules
          );

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'TENANT MODULES: failed to load tenant modules',
            error
          );

          this.loading = false;

          this.errorMessage =
            this.getErrorMessage(error);

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // CHECK WHETHER MODULE IS ENABLED
  // =====================================================

  isModuleEnabled(
    moduleId: number
  ): boolean {

    const tenantModule =
      this.tenantModules.find(
        item => item.module.id === moduleId
      );

    return tenantModule?.enabled ?? false;
  }


  // =====================================================
  // TOGGLE MODULE
  // =====================================================

  toggleModule(
    module: PlatformModule
  ): void {

    if (!this.tenant) {
      return;
    }

    if (this.savingModuleId !== null) {
      return;
    }

    const currentState =
      this.isModuleEnabled(module.id);

    const newState = !currentState;

    this.savingModuleId = module.id;

    this.errorMessage = '';
    this.successMessage = '';

    this.moduleService
      .setTenantModule(
        this.tenant.id,
        module.id,
        newState
      )
      .subscribe({

        next: (updatedModule) => {

          console.log(
            'TENANT MODULES: updated',
            updatedModule
          );

          const index =
            this.tenantModules.findIndex(
              item => item.module.id === module.id
            );

          if (index !== -1) {

            this.tenantModules[index] =
              updatedModule;

          } else {

            this.tenantModules.push(
              updatedModule
            );

          }

          this.savingModuleId = null;

          this.successMessage =
            `${module.name} ${
              newState ? 'enabled' : 'disabled'
            } successfully.`;

          this.cdr.detectChanges();

          setTimeout(() => {

            this.successMessage = '';

            this.cdr.detectChanges();

          }, 2500);
        },

        error: (error) => {

          console.error(
            'TENANT MODULES: update failed',
            error
          );

          this.savingModuleId = null;

          this.errorMessage =
            this.getErrorMessage(error);

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // COUNTS
  // =====================================================

  enabledCount(): number {

    return this.modules.filter(
      module => this.isModuleEnabled(module.id)
    ).length;
  }


  disabledCount(): number {

    return this.modules.length -
      this.enabledCount();
  }


  // =====================================================
  // TRACKING
  // =====================================================

  trackByModuleId(
    index: number,
    module: PlatformModule
  ): number {

    return module.id;
  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error: any
  ): string {

    if (error?.status === 401) {
      return 'Your session has expired. Please log in again.';
    }

    if (error?.status === 403) {
      return 'You do not have permission to manage tenant modules.';
    }

    if (error?.status === 404) {
      return 'The tenant or module could not be found.';
    }

    if (error?.status >= 500) {
      return 'The server encountered an error. Please try again.';
    }

    return 'Unable to update tenant modules.';
  }
}