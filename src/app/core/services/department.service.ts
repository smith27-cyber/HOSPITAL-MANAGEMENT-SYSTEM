import { Injectable } from '@angular/core';
import { Department } from '../../shared/models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private readonly STORAGE_KEY = 'hms_departments';

  private departments: Department[] = [];


  constructor() {
    this.loadDepartments();
  }


  // =====================================================
  // LOAD FROM LOCAL STORAGE
  // =====================================================

  private loadDepartments(): void {

    const storedDepartments =
      localStorage.getItem(this.STORAGE_KEY);

    if (!storedDepartments) {

      this.departments = [];

      return;
    }

    try {

      this.departments =
        JSON.parse(storedDepartments) as Department[];

    } catch (error) {

      console.error(
        'Failed to load departments from localStorage:',
        error
      );

      this.departments = [];

    }

  }


  // =====================================================
  // SAVE TO LOCAL STORAGE
  // =====================================================

  private saveDepartments(): void {

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this.departments)
    );

  }


  // =====================================================
  // GET ALL DEPARTMENTS
  // =====================================================

  getDepartments(): Department[] {

    return [...this.departments];

  }


  // =====================================================
  // GET DEPARTMENT BY ID
  // =====================================================

  getDepartmentById(
    id: string
  ): Department | undefined {

    return this.departments.find(
      department =>
        department.id === id
    );

  }


  // =====================================================
  // ADD DEPARTMENT
  // =====================================================

  addDepartment(
    departmentData: Omit<
      Department,
      'id' | 'status' | 'createdAt'
    >
  ): Department {

    const department: Department = {

      id: this.generateDepartmentId(),

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

      status: 'Active',

      createdAt:
        new Date().toISOString()

    };


    this.departments.push(
      department
    );

    this.saveDepartments();


    return department;

  }


  // =====================================================
  // UPDATE DEPARTMENT
  // =====================================================

  updateDepartment(
    updatedDepartment: Department
  ): void {

    const index =
      this.departments.findIndex(
        department =>
          department.id ===
          updatedDepartment.id
      );


    if (index === -1) {
      return;
    }


    this.departments[index] =
      updatedDepartment;


    this.saveDepartments();

  }


  // =====================================================
  // DEACTIVATE DEPARTMENT
  // =====================================================

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


    department.status =
      'Inactive';


    this.saveDepartments();

  }


  // =====================================================
  // ACTIVATE DEPARTMENT
  // =====================================================

  activateDepartment(
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


    department.status =
      'Active';


    this.saveDepartments();

  }


  // =====================================================
  // DELETE DEPARTMENT
  // =====================================================

  deleteDepartment(
    id: string
  ): void {

    this.departments =
      this.departments.filter(
        department =>
          department.id !== id
      );


    this.saveDepartments();

  }


  // =====================================================
  // GENERATE DEPARTMENT ID
  // =====================================================

  private generateDepartmentId(): string {

    const year =
      new Date().getFullYear();


    const numbers =
      this.departments.map(
        department => {

          const match =
            department.id.match(
              /DEPT-(\d+)/
            );


          return match
            ? Number(match[1])
            : 0;

        }
      );


    const nextNumber =
      numbers.length > 0
        ? Math.max(...numbers) + 1
        : 1;


    return `DEPT-${year}-${String(
      nextNumber
    ).padStart(4, '0')}`;

  }

}
