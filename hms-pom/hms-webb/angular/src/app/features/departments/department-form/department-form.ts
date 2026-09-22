import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../shared/models/department.model';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './department-form.html',
  styleUrl: './department-form.css'
})
export class DepartmentForm implements OnInit {

  // =====================================================
  // MODE
  // =====================================================

  isEditMode = false;

  departmentId: string | null = null;


  // =====================================================
  // LOADING
  // =====================================================

  loading = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // DEPARTMENT FORM
  // =====================================================

  department = {

    name: '',

    code: '',

    description: '',

    headOfDepartment: '',

    phone: '',

    email: '',

    location: '',

    status: 'Active' as 'Active' | 'Inactive'

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private departmentService: DepartmentService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.departmentId =
      this.route.snapshot.paramMap.get('id');


    // =====================================================
    // NEW DEPARTMENT
    // =====================================================

    if (!this.departmentId) {

      return;

    }


    // =====================================================
    // EDIT DEPARTMENT
    // =====================================================

    this.isEditMode = true;

    this.loadDepartment(
      this.departmentId
    );

  }


  // =====================================================
  // LOAD DEPARTMENT FROM BACKEND
  // =====================================================

  private loadDepartment(
    id: string
  ): void {

    this.loading = true;

    this.errorMessage = '';


    this.departmentService
      .getDepartmentById(id)
      .subscribe({

        next: (existingDepartment) => {

          this.department = {

            name:
              existingDepartment.name || '',

            code:
              existingDepartment.code || '',

            description:
              existingDepartment.description || '',

            headOfDepartment:
              existingDepartment.headOfDepartment || '',

            phone:
              existingDepartment.phone || '',

            email:
              existingDepartment.email || '',

            location:
              existingDepartment.location || '',

            status:
              existingDepartment.status

          };


          this.loading = false;

        },


        error: (error) => {

          console.error(
            'Failed to load department:',
            error
          );


          this.loading = false;

          this.errorMessage =
            'Department could not be found.';


          alert(
            'Department could not be found.'
          );


          this.router.navigate([
            '/departments'
          ]);

        }

      });

  }


  // =====================================================
  // SAVE DEPARTMENT
  // =====================================================

  saveDepartment(): void {

    // ===================================================
    // PREVENT DOUBLE SUBMISSION
    // ===================================================

    if (this.loading) {

      return;

    }


    // ===================================================
    // CLEAN INPUT
    // ===================================================

    const name =
      this.department.name
        .trim();


    const code =
      this.department.code
        .trim()
        .toUpperCase();


    const description =
      this.department.description
        .trim();


    const headOfDepartment =
      this.department.headOfDepartment
        .trim();


    const phone =
      this.department.phone
        .trim();


    const email =
      this.department.email
        .trim();


    const location =
      this.department.location
        .trim();


    // ===================================================
    // BASIC VALIDATION
    // ===================================================

    if (!name) {

      alert(
        'Department name is required.'
      );

      return;

    }


    if (!code) {

      alert(
        'Department code is required.'
      );

      return;

    }


    // ===================================================
    // CODE VALIDATION
    // ===================================================

    const validCode =
      /^[A-Z0-9&-]+$/;


    if (!validCode.test(code)) {

      alert(
        'Department code can only contain letters, numbers, hyphens and &.'
      );

      return;

    }


    // ===================================================
    // EMAIL VALIDATION
    // ===================================================

    if (email) {

      const validEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (!validEmail.test(email)) {

        alert(
          'Please enter a valid email address.'
        );

        return;

      }

    }


    // ===================================================
    // DEPARTMENT DATA
    // =====================================================

    const departmentData:
      Omit<
        Department,
        'id' | 'status' | 'createdAt'
      > = {

      name,

      code,

      description:
        description || undefined,

      headOfDepartment:
        headOfDepartment || undefined,

      phone:
        phone || undefined,

      email:
        email || undefined,

      location:
        location || undefined

    };


    // =====================================================
    // CREATE NEW DEPARTMENT
    // =====================================================

    if (!this.isEditMode) {

      this.createDepartment(
        departmentData
      );

      return;

    }


    // =====================================================
    // UPDATE EXISTING DEPARTMENT
    // =====================================================

    if (
      this.isEditMode &&
      this.departmentId
    ) {

      this.updateDepartment(
        departmentData
      );

      return;

    }

  }


  // =====================================================
  // CREATE DEPARTMENT
  // =====================================================

  private createDepartment(
    departmentData:
      Omit<
        Department,
        'id' | 'status' | 'createdAt'
      >
  ): void {

    this.loading = true;

    this.errorMessage = '';


    this.departmentService
      .addDepartment(
        departmentData
      )
      .subscribe({

        next: (newDepartment) => {

          this.loading = false;


          alert(
            `${newDepartment.name} department registered successfully.`
          );


          this.router.navigate([
            '/departments'
          ]);

        },


        error: (error) => {

          console.error(
            'Failed to create department:',
            error
          );


          this.loading = false;


          this.handleSaveError(
            error,
            'Failed to register department.'
          );

        }

      });

  }


  // =====================================================
  // UPDATE DEPARTMENT
  // =====================================================

  private updateDepartment(
    departmentData:
      Omit<
        Department,
        'id' | 'status' | 'createdAt'
      >
  ): void {

    if (!this.departmentId) {

      return;

    }


    this.loading = true;

    this.errorMessage = '';


    // ---------------------------------------------------
    // First get the current department
    // ---------------------------------------------------

    this.departmentService
      .getDepartmentById(
        this.departmentId
      )
      .subscribe({

        next: (existingDepartment) => {

          const updatedDepartment:
            Department = {

            id:
              existingDepartment.id,

            name:
              departmentData.name,

            code:
              departmentData.code,

            description:
              departmentData.description,

            headOfDepartment:
              departmentData.headOfDepartment,

            phone:
              departmentData.phone,

            email:
              departmentData.email,

            location:
              departmentData.location,

            status:
              this.department.status,

            createdAt:
              existingDepartment.createdAt

          };


          // ------------------------------------------------
          // Send update to Spring Boot
          // ------------------------------------------------

          this.departmentService
            .updateDepartment(
              this.departmentId!,
              updatedDepartment
            )
            .subscribe({

              next: (savedDepartment) => {

                this.loading = false;


                alert(
                  `${savedDepartment.name} department updated successfully.`
                );


                this.router.navigate([
                  '/departments',
                  savedDepartment.id
                ]);

              },


              error: (error) => {

                console.error(
                  'Failed to update department:',
                  error
                );


                this.loading = false;


                this.handleSaveError(
                  error,
                  'Failed to update department.'
                );

              }

            });

        },


        error: (error) => {

          console.error(
            'Failed to retrieve department:',
            error
          );


          this.loading = false;


          alert(
            'Department could not be found.'
          );


          this.router.navigate([
            '/departments'
          ]);

        }

      });

  }


  // =====================================================
  // HANDLE SAVE ERROR
  // =====================================================

  private handleSaveError(
    error: any,
    defaultMessage: string
  ): void {

    console.error(
      'Department save error:',
      error
    );


    // ---------------------------------------------------
    // Backend returned a useful message
    // ---------------------------------------------------

    if (
      error?.error?.message
    ) {

      this.errorMessage =
        error.error.message;


      alert(
        error.error.message
      );


      return;

    }


    // ---------------------------------------------------
    // Backend returned plain text
    // ---------------------------------------------------

    if (
      typeof error?.error === 'string' &&
      error.error.trim()
    ) {

      this.errorMessage =
        error.error;


      alert(
        error.error
      );


      return;

    }


    // ---------------------------------------------------
    // Default error
    // ---------------------------------------------------

    this.errorMessage =
      defaultMessage;


    alert(
      defaultMessage
    );

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    if (
      this.isEditMode &&
      this.departmentId
    ) {

      this.router.navigate([
        '/departments',
        this.departmentId
      ]);

      return;

    }


    this.router.navigate([
      '/departments'
    ]);

  }

}
