
package com.hms.backend.controller;

import com.hms.backend.entity.Department;
import com.hms.backend.service.DepartmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:4200")
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
    public ResponseEntity<List<Department>> getAllDepartments() {

        return ResponseEntity.ok(
                departmentService.getAllDepartments()
        );
    }


    // =====================================================
    // GET ACTIVE DEPARTMENTS
    // =====================================================

    // IMPORTANT:
    // This must appear before /{id}
    // so "active" is not treated as a department ID.

    @GetMapping("/active")
    public ResponseEntity<List<Department>> getActiveDepartments() {

        return ResponseEntity.ok(
                departmentService.getActiveDepartments()
        );
    }


    // =====================================================
    // GET DEPARTMENT BY ID
    // =====================================================

    @GetMapping("/{id}")
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

