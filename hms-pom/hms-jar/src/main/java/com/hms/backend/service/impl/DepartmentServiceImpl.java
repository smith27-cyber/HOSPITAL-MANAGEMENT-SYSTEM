package com.hms.backend.service.impl;

import com.hms.backend.entity.Department;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.repository.DepartmentRepository;
import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.repository.TenantRepository;
import com.hms.backend.service.DepartmentService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class DepartmentServiceImpl
        implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final TenantRepository tenantRepository;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public DepartmentServiceImpl(
            DepartmentRepository departmentRepository,
            TenantRepository tenantRepository
    ) {
        this.departmentRepository = departmentRepository;
        this.tenantRepository = tenantRepository;
    }

    // =====================================================
    // GET CURRENT TENANT
    // =====================================================

    private Tenant getCurrentTenant() {

        Long tenantId =
                TenantContext.requireTenantId();

        return tenantRepository
                .findById(tenantId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Current tenant not found: "
                                        + tenantId
                        )
                );
    }

    // =====================================================
    // GET ALL DEPARTMENTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {

        Long tenantId =
                TenantContext.requireTenantId();

        return departmentRepository
                .findAllByTenant_Id(tenantId);
    }

    // =====================================================
    // GET ACTIVE DEPARTMENTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Department> getActiveDepartments() {

        Long tenantId =
                TenantContext.requireTenantId();

        return departmentRepository
                .findByTenant_IdAndStatus(
                        tenantId,
                        "Active"
                );
    }

    // =====================================================
    // GET DEPARTMENT BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Department getDepartmentById(
            String id
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        return departmentRepository
                .findByIdAndTenant_Id(
                        id,
                        tenantId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Department not found: "
                                        + id
                        )
                );
    }

    // =====================================================
    // ADD DEPARTMENT
    // =====================================================

    @Override
    public Department addDepartment(
            Department department
    ) {

        // -------------------------------------------------
        // CURRENT TENANT
        // -------------------------------------------------

        Tenant currentTenant =
                getCurrentTenant();

        Long tenantId =
                currentTenant.getId();

        // -------------------------------------------------
        // FORCE TENANT SERVER-SIDE
        // -------------------------------------------------

        department.setTenant(
                currentTenant
        );

        // -------------------------------------------------
        // NORMALIZE INPUT
        // -------------------------------------------------

        normalizeDepartment(
                department
        );

        // -------------------------------------------------
        // VALIDATE
        // -------------------------------------------------

        validateRequiredFields(
                department
        );

        // -------------------------------------------------
        // CHECK NAME
        // -------------------------------------------------

        if (
                departmentRepository
                        .existsByNameAndTenant_Id(
                                department.getName(),
                                tenantId
                        )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Department with name already exists: "
                            + department.getName()
            );
        }

        // -------------------------------------------------
        // CHECK CODE
        // -------------------------------------------------

        if (
                departmentRepository
                        .existsByCodeAndTenant_Id(
                                department.getCode(),
                                tenantId
                        )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Department with code already exists: "
                            + department.getCode()
            );
        }

        // -------------------------------------------------
        // GENERATE ID
        // -------------------------------------------------

        department.setId(
                generateDepartmentId()
        );

        // -------------------------------------------------
        // DEFAULT STATUS
        // -------------------------------------------------

        department.setStatus(
                "Active"
        );

        // -------------------------------------------------
        // CREATED DATE
        // -------------------------------------------------

        department.setCreatedAt(
                LocalDateTime.now()
        );

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return departmentRepository.save(
                department
        );
    }

    // =====================================================
    // UPDATE DEPARTMENT
    // =====================================================

    @Override
    public Department updateDepartment(
            String id,
            Department updatedDepartment
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        // -------------------------------------------------
        // FIND EXISTING IN CURRENT TENANT
        // -------------------------------------------------

        Department existingDepartment =
                departmentRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Department not found: "
                                                + id
                                )
                        );

        // -------------------------------------------------
        // NORMALIZE
        // -------------------------------------------------

        normalizeDepartment(
                updatedDepartment
        );

        // -------------------------------------------------
        // VALIDATE
        // -------------------------------------------------

        validateRequiredFields(
                updatedDepartment
        );

        // -------------------------------------------------
        // CHECK NAME
        // -------------------------------------------------

        if (
                departmentRepository
                        .existsByNameAndTenant_IdAndIdNot(
                                updatedDepartment.getName(),
                                tenantId,
                                id
                        )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Another department already uses name: "
                            + updatedDepartment.getName()
            );
        }

        // -------------------------------------------------
        // CHECK CODE
        // -------------------------------------------------

        if (
                departmentRepository
                        .existsByCodeAndTenant_IdAndIdNot(
                                updatedDepartment.getCode(),
                                tenantId,
                                id
                        )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Another department already uses code: "
                            + updatedDepartment.getCode()
            );
        }

        // -------------------------------------------------
        // UPDATE BASIC INFORMATION
        // -------------------------------------------------

        existingDepartment.setName(
                updatedDepartment.getName()
        );

        existingDepartment.setCode(
                updatedDepartment.getCode()
        );

        existingDepartment.setDescription(
                updatedDepartment.getDescription()
        );

        // -------------------------------------------------
        // UPDATE HEAD
        // -------------------------------------------------

        existingDepartment.setHeadOfDepartment(
                updatedDepartment.getHeadOfDepartment()
        );

        // -------------------------------------------------
        // UPDATE CONTACT
        // -------------------------------------------------

        existingDepartment.setPhone(
                updatedDepartment.getPhone()
        );

        existingDepartment.setEmail(
                updatedDepartment.getEmail()
        );

        // -------------------------------------------------
        // UPDATE LOCATION
        // -------------------------------------------------

        existingDepartment.setLocation(
                updatedDepartment.getLocation()
        );

        // -------------------------------------------------
        // IMPORTANT:
        // DO NOT CHANGE TENANT
        // -------------------------------------------------

        return departmentRepository.save(
                existingDepartment
        );
    }

    // =====================================================
    // DELETE DEPARTMENT
    // =====================================================

    @Override
    public void deleteDepartment(
            String id
    ) {

        Department department =
                getDepartmentById(id);

        departmentRepository.delete(
                department
        );
    }

    // =====================================================
    // UPDATE DEPARTMENT STATUS
    // =====================================================

    @Override
    public Department updateDepartmentStatus(
            String id,
            String status
    ) {

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

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid department status. "
                            + "Allowed values: Active, Inactive."
            );
        }

        // -------------------------------------------------
        // FIND CURRENT-TENANT DEPARTMENT
        // -------------------------------------------------

        Department department =
                getDepartmentById(id);

        // -------------------------------------------------
        // UPDATE
        // -------------------------------------------------

        department.setStatus(
                status
        );

        return departmentRepository.save(
                department
        );
    }

    // =====================================================
    // NORMALIZE DEPARTMENT
    // =====================================================

    private void normalizeDepartment(
            Department department
    ) {

        if (department.getName() != null) {

            department.setName(
                    department.getName().trim()
            );
        }

        if (department.getCode() != null) {

            department.setCode(
                    department.getCode()
                            .trim()
                            .toUpperCase()
            );
        }

        if (department.getDescription() != null) {

            String description =
                    department.getDescription()
                            .trim();

            department.setDescription(
                    description.isEmpty()
                            ? null
                            : description
            );
        }

        if (department.getHeadOfDepartment() != null) {

            String head =
                    department.getHeadOfDepartment()
                            .trim();

            department.setHeadOfDepartment(
                    head.isEmpty()
                            ? null
                            : head
            );
        }

        if (department.getPhone() != null) {

            String phone =
                    department.getPhone()
                            .trim();

            department.setPhone(
                    phone.isEmpty()
                            ? null
                            : phone
            );
        }

        if (department.getEmail() != null) {

            String email =
                    department.getEmail()
                            .trim()
                            .toLowerCase();

            department.setEmail(
                    email.isEmpty()
                            ? null
                            : email
            );
        }

        if (department.getLocation() != null) {

            String location =
                    department.getLocation()
                            .trim();

            department.setLocation(
                    location.isEmpty()
                            ? null
                            : location
            );
        }
    }

    // =====================================================
    // VALIDATE REQUIRED FIELDS
    // =====================================================

    private void validateRequiredFields(
            Department department
    ) {

        if (
                isBlank(
                        department.getName()
                )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Department name is required."
            );
        }

        if (
                isBlank(
                        department.getCode()
                )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Department code is required."
            );
        }
    }

    // =====================================================
    // CHECK BLANK
    // =====================================================

    private boolean isBlank(
            String value
    ) {

        return value == null ||
                value.trim().isEmpty();
    }

    // =====================================================
    // GENERATE DEPARTMENT ID
    // =====================================================

    private String generateDepartmentId() {

        int currentYear =
                LocalDate.now().getYear();

        int nextSequence = 1;

        var lastIdOpt =
                departmentRepository
                        .findMaxIdForCurrentYear();

        if (
                lastIdOpt.isPresent()
        ) {

            String lastId =
                    lastIdOpt.get();

            try {

                String[] parts =
                        lastId.split("-");

                if (
                        parts.length == 3
                ) {

                    nextSequence =
                            Integer.parseInt(
                                    parts[2]
                            ) + 1;
                }

            } catch (
                    NumberFormatException ignored
            ) {
                // Start from 0001
            }
        }

        return String.format(
                "DEP-%d-%04d",
                currentYear,
                nextSequence
        );
    }
}