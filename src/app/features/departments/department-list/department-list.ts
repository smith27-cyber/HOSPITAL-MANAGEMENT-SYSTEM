import { Component, OnInit } from '@angular/core';
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

  departments: Department[] = [];

  searchTerm = '';

  selectedStatus: Department['status'] | '' = '';


  constructor(
    private departmentService: DepartmentService
  ) {}


  ngOnInit(): void {

    this.loadDepartments();

  }


  loadDepartments(): void {

    this.departments =
      this.departmentService.getDepartments();

  }


  get filteredDepartments(): Department[] {

    const term =
      this.searchTerm
        .toLowerCase()
        .trim();


    return this.departments.filter(
      department => {

        const matchesSearch =
          !term ||

          department.name
            .toLowerCase()
            .includes(term) ||

          department.code
            .toLowerCase()
            .includes(term) ||

          (department.headOfDepartment || '')
            .toLowerCase()
            .includes(term) ||

          (department.location || '')
            .toLowerCase()
            .includes(term);


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


  get totalDepartments(): number {

    return this.departments.length;

  }


  get activeDepartments(): number {

    return this.departments.filter(
      department =>
        department.status === 'Active'
    ).length;

  }


  get inactiveDepartments(): number {

    return this.departments.filter(
      department =>
        department.status === 'Inactive'
    ).length;

  }


  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = '';

  }


  deactivateDepartment(
    id: string
  ): void {

    const department =
      this.departments.find(
        department =>
          department.id === id
      );


    if (!department) {
      return;
    }


    if (department.status === 'Inactive') {
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
      .deactivateDepartment(id);


    this.loadDepartments();

  }


  deleteDepartment(
    id: string
  ): void {

    const department =
      this.departments.find(
        department =>
          department.id === id
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
      .deleteDepartment(id);


    this.loadDepartments();

  }


  refreshDepartments(): void {

    this.loadDepartments();

  }

}
