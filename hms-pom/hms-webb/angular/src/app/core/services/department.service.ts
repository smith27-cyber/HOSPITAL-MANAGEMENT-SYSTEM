// =====================================================
// DEPARTMENT SERVICE
// File:
// src/app/core/services/department.service.ts
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Department } from '../../shared/models/department.model';


@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  // =====================================================
  // API URL
  // =====================================================

  private readonly API_URL =
    '/api/departments';


  // =====================================================
  // LOCAL SNAPSHOT
  // =====================================================

  private departmentsSnapshot: Department[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET ALL DEPARTMENTS
  // =====================================================

  getDepartments(): Observable<Department[]> {

    return new Observable<Department[]>(observer => {

      this.http
        .get<Department[]>(this.API_URL)
        .subscribe({

          next: (departments) => {

            this.departmentsSnapshot =
              departments || [];

            observer.next(
              this.departmentsSnapshot
            );

            observer.complete();

          },

          error: (error) => {

            observer.error(error);

          }

        });

    });

  }


  // =====================================================
  // GET DEPARTMENTS SNAPSHOT
  // =====================================================

  getDepartmentsSnapshot(): Department[] {

    return [
      ...this.departmentsSnapshot
    ];

  }


  // =====================================================
  // GET ACTIVE DEPARTMENTS
  // =====================================================

  getActiveDepartments(): Observable<Department[]> {

    return this.http
      .get<Department[]>(
        `${this.API_URL}/active`
      );

  }


  // =====================================================
  // GET DEPARTMENT BY ID
  // =====================================================

  getDepartmentById(
    id: string
  ): Observable<Department> {

    return this.http.get<Department>(
      `${this.API_URL}/${id}`
    );

  }


  // =====================================================
  // GET DEPARTMENT BY NAME
  // =====================================================

  getDepartmentByName(
    name: string
  ): Observable<Department> {

    return this.http.get<Department>(
      `${this.API_URL}/name/${encodeURIComponent(name)}`
    );

  }


  // =====================================================
  // ADD DEPARTMENT
  // =====================================================

  addDepartment(
    department: Omit<
      Department,
      'id' | 'status' | 'createdAt'
    >
  ): Observable<Department> {

    return this.http.post<Department>(
      this.API_URL,
      department
    );

  }


  // =====================================================
  // UPDATE DEPARTMENT
  // =====================================================

  updateDepartment(
    id: string,
    department: Department
  ): Observable<Department> {

    return this.http.put<Department>(
      `${this.API_URL}/${id}`,
      department
    );

  }


  // =====================================================
  // DELETE DEPARTMENT
  // =====================================================

  deleteDepartment(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.API_URL}/${id}`
    );

  }


  // =====================================================
  // DEACTIVATE DEPARTMENT
  // =====================================================

  deactivateDepartment(
    id: string
  ): Observable<Department> {

    return this.http.patch<Department>(
      `${this.API_URL}/${id}/status`,
      {
        status: 'Inactive'
      }
    );

  }


  // =====================================================
  // ACTIVATE DEPARTMENT
  // =====================================================

  activateDepartment(
    id: string
  ): Observable<Department> {

    return this.http.patch<Department>(
      `${this.API_URL}/${id}/status`,
      {
        status: 'Active'
      }
    );

  }

}
