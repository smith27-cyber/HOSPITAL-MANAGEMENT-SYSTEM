import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { PlatformModule } from '../../shared/models/platform/platform-module.model';
import { PlatformModuleService } from '../../core/services/platform/platform-module.service';

@Component({
  selector: 'app-platform-modules',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './modules.html',
  styleUrl: './modules.css'
})
export class Modules implements OnInit {

  private readonly moduleService = inject(PlatformModuleService);
  private readonly cdr = inject(ChangeDetectorRef);

  modules: PlatformModule[] = [];

  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.loading = true;
    this.errorMessage = '';

    this.moduleService.getAll().subscribe({
      next: (modules) => {
        console.log('PLATFORM MODULES: received', modules);

        this.modules = modules ?? [];
        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('PLATFORM MODULES: failed', error);

        this.modules = [];
        this.loading = false;

        this.errorMessage =
          this.getErrorMessage(error);

        this.cdr.detectChanges();
      }
    });
  }

  trackByModuleId(
    index: number,
    module: PlatformModule
  ): number {
    return module.id;
  }

  activeModules(): number {
    return this.modules.filter(module => module.active).length;
  }

  inactiveModules(): number {
    return this.modules.filter(module => !module.active).length;
  }

  private getErrorMessage(error: any): string {

    if (error?.status === 401) {
      return 'Your session has expired. Please log in again.';
    }

    if (error?.status === 403) {
      return 'You do not have permission to view platform modules.';
    }

    if (error?.status >= 500) {
      return 'The server encountered an error. Please try again.';
    }

    return 'Unable to load platform modules.';
  }
}