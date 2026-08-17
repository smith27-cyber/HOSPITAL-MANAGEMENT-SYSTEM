import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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

  department: Department | undefined;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {

      this.router.navigate([
        '/departments'
      ]);

      return;

    }


    this.loadDepartment(id);

  }


  // =====================================================
  // LOAD DEPARTMENT
  // =====================================================

  private loadDepartment(id: string): void {

    this.department =
      this.departmentService
        .getDepartmentById(id);


    if (!this.department) {

      alert(
        'Department not found.'
      );

      this.router.navigate([
        '/departments'
      ]);

    }

  }


  // =====================================================
  // EDIT
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
  // DEACTIVATE
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


    this.departmentService
      .deactivateDepartment(
        this.department.id
      );


    // Reload updated department
    this.department =
      this.departmentService
        .getDepartmentById(
          this.department.id
        );

  }


  // =====================================================
  // ACTIVATE
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


    this.departmentService
      .activateDepartment(
        this.department.id
      );


    this.department =
      this.departmentService
        .getDepartmentById(
          this.department.id
        );

  }


  // =====================================================
  // BACK
  // =====================================================

  backToDepartments(): void {

    this.router.navigate([
      '/departments'
    ]);

  }

}
