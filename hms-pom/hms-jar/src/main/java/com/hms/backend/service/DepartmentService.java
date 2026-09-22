package com.hms.backend.service;

import com.hms.backend.entity.Department;

import java.util.List;

public interface DepartmentService {

    // =====================================================
    // GET ALL DEPARTMENTS
    // =====================================================

    List<Department> getAllDepartments();


    // =====================================================
    // GET ACTIVE DEPARTMENTS
    // =====================================================

    List<Department> getActiveDepartments();


    // =====================================================
    // GET DEPARTMENT BY ID
    // =====================================================

    Department getDepartmentById(
            String id
    );


    // =====================================================
    // ADD DEPARTMENT
    // =====================================================

    Department addDepartment(
            Department department
    );


    // =====================================================
    // UPDATE DEPARTMENT
    // =====================================================

    Department updateDepartment(
            String id,
            Department department
    );


    // =====================================================
    // DELETE DEPARTMENT
    // =====================================================

    void deleteDepartment(
            String id
    );


    // =====================================================
    // UPDATE DEPARTMENT STATUS
    // =====================================================

    Department updateDepartmentStatus(
            String id,
            String status
    );
}