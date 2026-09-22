// =====================================================
// DEPARTMENT PROFILE COMPONENT
// File:
// src/app/features/departments/department-profile/department-profile.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { DatePipe } from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { first } from 'rxjs/operators';

import { DepartmentService } from '../../../core/services/department.service';

import { Department } from '../../../shared/models/department.model';


@Component({
  selector: 'app-department-profile',
  standalone: true,
  imports: [
    DatePipe
  ],
  templateUrl: './department-profile.html',
  styleUrl: './department-profile.css'
})
export class DepartmentProfile implements OnInit {

  // =====================================================
  // DEPARTMENT
  // =====================================================

  department: Department | undefined = undefined;


  // =====================================================
  // LOADING
  // =====================================================

  loading = true;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    // ---------------------------------------------------
    // NO ID
    // ---------------------------------------------------

    if (!id) {

      this.loading = false;

      this.errorMessage =
        'Department ID was not provided.';

      this.changeDetectorRef.detectChanges();

      this.router.navigate([
        '/departments'
      ]);

      return;

    }


    // ---------------------------------------------------
    // LOAD DEPARTMENT
    // ---------------------------------------------------

    this.loadDepartment(id);

  }


  // =====================================================
  // LOAD DEPARTMENT
  // =====================================================

  private loadDepartment(
    id: string
  ): void {

    this.loading = true;

    this.errorMessage = '';

    this.department = undefined;


    // ---------------------------------------------------
    // FORCE INITIAL LOADING STATE
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();


    console.log(
      'Loading department:',
      id
    );


    // ---------------------------------------------------
    // GET DEPARTMENT
    // ---------------------------------------------------

    this.departmentService
      .getDepartmentById(id)
      .pipe(first())
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (department: Department) => {

          console.log(
            'Department loaded:',
            department
          );


          // ---------------------------------------------
          // SET DATA FIRST
          // ---------------------------------------------

          this.department =
            department;


          this.errorMessage = '';


          // ---------------------------------------------
          // STOP LOADING
          // ---------------------------------------------

          this.loading = false;


          // ---------------------------------------------
          // FORCE VIEW UPDATE
          // ---------------------------------------------

          this.changeDetectorRef.detectChanges();

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error: unknown) => {

          console.error(
            'Failed to load department:',
            error
          );


          this.department =
            undefined;


          this.loading = false;


          this.errorMessage =
            'Department could not be found.';


          // ---------------------------------------------
          // UPDATE VIEW BEFORE NAVIGATION
          // ---------------------------------------------

          this.changeDetectorRef.detectChanges();


          alert(
            'Department not found.'
          );


          this.router.navigate([
            '/departments'
          ]);

        }

      });

  }


  // =====================================================
  // EDIT DEPARTMENT
  // =====================================================

  editDepartment(): void {

    if (!this.department) {

      return;

    }


    this.router.navigate([
      '/departments',
      this.department.id,
      'edit'
    ]);

  }


  // =====================================================
  // DEACTIVATE DEPARTMENT
  // =====================================================

  deactivateDepartment(): void {

    if (!this.department) {

      return;

    }


    if (
      this.department.status ===
      'Inactive'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Deactivate ${this.department.name}?`
      );


    if (!confirmed) {

      return;

    }


    this.loading = true;

    this.changeDetectorRef.detectChanges();


    this.departmentService
      .deactivateDepartment(
        this.department.id
      )
      .pipe(first())
      .subscribe({

        next: (
          updatedDepartment: Department
        ) => {

          console.log(
            'Department deactivated:',
            updatedDepartment
          );


          this.department =
            updatedDepartment;


          this.loading = false;


          this.changeDetectorRef.detectChanges();

        },


        error: (error: unknown) => {

          console.error(
            'Failed to deactivate department:',
            error
          );


          this.loading = false;


          this.changeDetectorRef.detectChanges();


          alert(
            'Failed to deactivate department.'
          );

        }

      });

  }


  // =====================================================
  // ACTIVATE DEPARTMENT
  // =====================================================

  activateDepartment(): void {

    if (!this.department) {

      return;

    }


    if (
      this.department.status ===
      'Active'
    ) {

      return;

    }


    this.loading = true;

    this.changeDetectorRef.detectChanges();


    this.departmentService
      .activateDepartment(
        this.department.id
      )
      .pipe(first())
      .subscribe({

        next: (
          updatedDepartment: Department
        ) => {

          console.log(
            'Department activated:',
            updatedDepartment
          );


          this.department =
            updatedDepartment;


          this.loading = false;


          this.changeDetectorRef.detectChanges();

        },


        error: (error: unknown) => {

          console.error(
            'Failed to activate department:',
            error
          );


          this.loading = false;


          this.changeDetectorRef.detectChanges();


          alert(
            'Failed to activate department.'
          );

        }

      });

  }


  // =====================================================
  // BACK TO DEPARTMENTS
  // =====================================================

  backToDepartments(): void {

    this.router.navigate([
      '/departments'
    ]);

  }

}
