package com.hms.backend.controller;

import com.hms.backend.entity.Department;
import com.hms.backend.service.DepartmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public DepartmentController(
            DepartmentService departmentService
    ) {

        this.departmentService =
                departmentService;
    }


    // =====================================================
    // GET ALL DEPARTMENTS
    // =====================================================

    @GetMapping
    @PreAuthorize("hasAuthority('DEPARTMENT_VIEW')")
    public ResponseEntity<List<Department>> getAllDepartments() {

        return ResponseEntity.ok(
                departmentService.getAllDepartments()
        );
    }


    // =====================================================
    // GET ACTIVE DEPARTMENTS
    // =====================================================

    /*
     * This must appear before /{id}
     * so "active" is not treated as a department ID.
     */

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('DEPARTMENT_VIEW')")
    public ResponseEntity<List<Department>> getActiveDepartments() {

        return ResponseEntity.ok(
                departmentService.getActiveDepartments()
        );
    }


    // =====================================================
    // GET DEPARTMENT BY ID
    // =====================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DEPARTMENT_VIEW')")
    public ResponseEntity<Department> getDepartmentById(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                departmentService.getDepartmentById(id)
        );
    }


    // =====================================================
    // ADD DEPARTMENT
    // =====================================================

    @PostMapping
    @PreAuthorize("hasAuthority('DEPARTMENT_CREATE')")
    public ResponseEntity<Department> addDepartment(
            @RequestBody Department department
    ) {

        Department savedDepartment =
                departmentService.addDepartment(
                        department
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedDepartment);
    }


    // =====================================================
    // UPDATE DEPARTMENT
    // =====================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DEPARTMENT_UPDATE')")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable String id,
            @RequestBody Department department
    ) {

        return ResponseEntity.ok(
                departmentService.updateDepartment(
                        id,
                        department
                )
        );
    }


    // =====================================================
    // DELETE DEPARTMENT
    // =====================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DEPARTMENT_DELETE')")
    public ResponseEntity<Void> deleteDepartment(
            @PathVariable String id
    ) {

        departmentService.deleteDepartment(id);

        return ResponseEntity
                .noContent()
                .build();
    }


    // =====================================================
    // UPDATE DEPARTMENT STATUS
    // =====================================================

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('DEPARTMENT_UPDATE')")
    public ResponseEntity<Department> updateDepartmentStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request
    ) {

        String status =
                request.get("status");


        // -------------------------------------------------
        // VALIDATE STATUS
        // -------------------------------------------------

        if (
                status == null ||
                (
                        !status.equals("Active") &&
                        !status.equals("Inactive")
                )
        ) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }


        return ResponseEntity.ok(
                departmentService.updateDepartmentStatus(
                        id,
                        status
                )
        );
    }
}