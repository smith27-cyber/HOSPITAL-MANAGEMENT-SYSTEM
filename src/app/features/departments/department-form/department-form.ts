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

  isEditMode = false;

  departmentId: string | null = null;

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


    if (!this.departmentId) {
      return;
    }


    this.isEditMode = true;


    const existingDepartment =
      this.departmentService.getDepartmentById(
        this.departmentId
      );


    if (!existingDepartment) {

      this.router.navigate([
        '/departments'
      ]);

      return;

    }


    this.department = {

      name:
        existingDepartment.name,

      code:
        existingDepartment.code,

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

  }


  // =====================================================
  // SAVE DEPARTMENT
  // =====================================================

  saveDepartment(): void {

    // -----------------------------------------------------
    // CLEAN INPUT
    // -----------------------------------------------------

    const name =
      this.department.name.trim();

    const code =
      this.department.code.trim().toUpperCase();

    const description =
      this.department.description.trim();

    const headOfDepartment =
      this.department.headOfDepartment.trim();

    const phone =
      this.department.phone.trim();

    const email =
      this.department.email.trim();

    const location =
      this.department.location.trim();


    // -----------------------------------------------------
    // BASIC VALIDATION
    // -----------------------------------------------------

    if (!name || !code) {

      alert(
        'Department name and code are required.'
      );

      return;

    }


    // -----------------------------------------------------
    // CHECK DUPLICATE CODE
    // -----------------------------------------------------

    const duplicate =
      this.departmentService
        .getDepartments()
        .find(department =>
          department.code.toUpperCase() === code &&
          department.id !== this.departmentId
        );


    if (duplicate) {

      alert(
        `Department code "${code}" is already in use.`
      );

      return;

    }


    // =====================================================
    // EDIT DEPARTMENT
    // =====================================================

    if (
      this.isEditMode &&
      this.departmentId
    ) {

      const existingDepartment =
        this.departmentService.getDepartmentById(
          this.departmentId
        );


      if (!existingDepartment) {

        alert(
          'Department could not be found.'
        );

        this.router.navigate([
          '/departments'
        ]);

        return;

      }


      const updatedDepartment: Department = {

        id:
          existingDepartment.id,

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
          location || undefined,

        status:
          this.department.status,

        createdAt:
          existingDepartment.createdAt

      };


      this.departmentService.updateDepartment(
        updatedDepartment
      );


      alert(
        'Department updated successfully.'
      );


      this.router.navigate([
        '/departments',
        this.departmentId
      ]);

      return;

    }


    // =====================================================
    // NEW DEPARTMENT
    // =====================================================

    const newDepartment =
      this.departmentService.addDepartment({

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

      });


    alert(
      `${newDepartment.name} department registered successfully.`
    );


    // Go back to department list
    this.router.navigate([
      '/departments'
    ]);

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
