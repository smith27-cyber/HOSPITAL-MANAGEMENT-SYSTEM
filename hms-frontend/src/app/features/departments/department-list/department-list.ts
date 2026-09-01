// =====================================================
// DEPARTMENT LIST COMPONENT
// File:
// src/app/features/departments/department-list/department-list.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../shared/models/department.model';


@Component({
  selector: 'app-department-list',

  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl: './department-list.html',

  styleUrl: './department-list.css'
})
export class DepartmentList implements OnInit {


  // =====================================================
  // DEPARTMENTS
  // =====================================================

  departments: Department[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // STATUS FILTER
  // =====================================================

  selectedStatus:
    Department['status'] | '' = '';


  // =====================================================
  // LOADING
  // =====================================================

  loading = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private departmentService: DepartmentService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    console.log(
      'DepartmentList initialized'
    );

    this.loadDepartments();

  }


  // =====================================================
  // LOAD DEPARTMENTS
  // =====================================================

  loadDepartments(): void {

    console.log(
      'Loading departments...'
    );


    this.loading = true;

    this.errorMessage = '';


    this.departmentService
      .getDepartments()
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (
          departments: Department[]
        ) => {

          console.log(
            'Departments received:',
            departments
          );


          this.departments =
            Array.isArray(departments)
              ? departments
              : [];


          this.loading = false;

          this.errorMessage = '';


          // -----------------------------------------------
          // FORCE VIEW UPDATE
          // -----------------------------------------------

          this.changeDetectorRef.detectChanges();

        },


        // =================================================
        // ERROR
        // =================================================

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load departments:',
            error
          );


          this.departments = [];

          this.loading = false;


          this.errorMessage =
            'Unable to load departments from the server.';


          // -----------------------------------------------
          // FORCE VIEW UPDATE
          // -----------------------------------------------

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // =====================================================
  // FILTERED DEPARTMENTS
  // =====================================================

  get filteredDepartments(): Department[] {

    const term =
      this.searchTerm
        .toLowerCase()
        .trim();


    return this.departments.filter(
      (department: Department) => {

        // -----------------------------------------------
        // SEARCH
        // -----------------------------------------------

        const matchesSearch =
          !term ||

          (department.name || '')
            .toLowerCase()
            .includes(term) ||

          (department.code || '')
            .toLowerCase()
            .includes(term) ||

          (department.headOfDepartment || '')
            .toLowerCase()
            .includes(term) ||

          (department.location || '')
            .toLowerCase()
            .includes(term);


        // -----------------------------------------------
        // STATUS
        // -----------------------------------------------

        const matchesStatus =
          !this.selectedStatus ||

          department.status ===
            this.selectedStatus;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  }


  // =====================================================
  // TOTAL DEPARTMENTS
  // =====================================================

  get totalDepartments(): number {

    return this.departments.length;

  }


  // =====================================================
  // ACTIVE DEPARTMENTS
  // =====================================================

  get activeDepartments(): number {

    return this.departments.filter(
      (department: Department) =>
        department.status === 'Active'
    ).length;

  }


  // =====================================================
  // INACTIVE DEPARTMENTS
  // =====================================================

  get inactiveDepartments(): number {

    return this.departments.filter(
      (department: Department) =>
        department.status === 'Inactive'
    ).length;

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = '';

  }


  // =====================================================
  // DEACTIVATE DEPARTMENT
  // =====================================================

  deactivateDepartment(
    id: string
  ): void {

    const department =
      this.departments.find(
        (item: Department) =>
          item.id === id
      );


    if (!department) {
      return;
    }


    if (
      department.status === 'Inactive'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Deactivate ${department.name}?`
      );


    if (!confirmed) {
      return;
    }


    this.departmentService
      .deactivateDepartment(id)
      .subscribe({

        next: (
          updatedDepartment: Department
        ) => {

          const index =
            this.departments.findIndex(
              (item: Department) =>
                item.id === id
            );


          if (index !== -1) {

            this.departments[index] =
              updatedDepartment;

          }


          this.changeDetectorRef.detectChanges();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to deactivate department:',
            error
          );


          alert(
            'Failed to deactivate department.'
          );

        }

      });

  }


  // =====================================================
  // ACTIVATE DEPARTMENT
  // =====================================================

  activateDepartment(
    id: string
  ): void {

    const department =
      this.departments.find(
        (item: Department) =>
          item.id === id
      );


    if (!department) {
      return;
    }


    if (
      department.status === 'Active'
    ) {

      return;

    }


    this.departmentService
      .activateDepartment(id)
      .subscribe({

        next: (
          updatedDepartment: Department
        ) => {

          const index =
            this.departments.findIndex(
              (item: Department) =>
                item.id === id
            );


          if (index !== -1) {

            this.departments[index] =
              updatedDepartment;

          }


          this.changeDetectorRef.detectChanges();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to activate department:',
            error
          );


          alert(
            'Failed to activate department.'
          );

        }

      });

  }


  // =====================================================
  // DELETE DEPARTMENT
  // =====================================================

  deleteDepartment(
    id: string
  ): void {

    const department =
      this.departments.find(
        (item: Department) =>
          item.id === id
      );


    if (!department) {
      return;
    }


    const confirmed =
      window.confirm(
        `Delete ${department.name} (${department.code})? This action cannot be undone.`
      );


    if (!confirmed) {
      return;
    }


    this.departmentService
      .deleteDepartment(id)
      .subscribe({

        next: () => {

          this.departments =
            this.departments.filter(
              (item: Department) =>
                item.id !== id
            );


          this.changeDetectorRef.detectChanges();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to delete department:',
            error
          );


          alert(
            'Failed to delete department.'
          );

        }

      });

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshDepartments(): void {

    this.loadDepartments();

  }

}
