package com.hms.backend.service.impl;

import com.hms.backend.entity.Department;
import com.hms.backend.repository.DepartmentRepository;
import com.hms.backend.service.DepartmentService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class DepartmentServiceImpl
        implements DepartmentService {


    private final DepartmentRepository departmentRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public DepartmentServiceImpl(
            DepartmentRepository departmentRepository
    ) {

        this.departmentRepository =
                departmentRepository;
    }


    // =====================================================
    // GET ALL DEPARTMENTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {

        return departmentRepository.findAll();
    }

// =====================================================
// GET ACTIVE DEPARTMENTS
// =====================================================

@Override
@Transactional(readOnly = true)
public List<Department> getActiveDepartments() {

    return departmentRepository.findByStatus(
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

        return departmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Department not found with ID: "
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
        // NORMALIZE INPUT
        // -------------------------------------------------

        normalizeDepartment(
                department
        );


        // -------------------------------------------------
        // VALIDATE REQUIRED FIELDS
        // -------------------------------------------------

        validateRequiredFields(
                department
        );


        // -------------------------------------------------
        // CHECK DEPARTMENT NAME
        // -------------------------------------------------

        if (
                departmentRepository.existsByName(
                        department.getName()
                )
        ) {

            throw new RuntimeException(
                    "Department with name already exists: "
                            + department.getName()
            );
        }


        // -------------------------------------------------
        // CHECK DEPARTMENT CODE
        // -------------------------------------------------

        if (
                departmentRepository.existsByCode(
                        department.getCode()
                )
        ) {

            throw new RuntimeException(
                    "Department with code already exists: "
                            + department.getCode()
            );
        }


        // -------------------------------------------------
        // GENERATE DEPARTMENT ID
        //
        // Example:
        //
        // DEP-2026-0001
        // DEP-2026-0002
        // DEP-2026-0003
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

        // -------------------------------------------------
        // FIND EXISTING DEPARTMENT
        // -------------------------------------------------

        Department existingDepartment =
                getDepartmentById(id);


        // -------------------------------------------------
        // NORMALIZE INPUT
        // -------------------------------------------------

        normalizeDepartment(
                updatedDepartment
        );


        // -------------------------------------------------
        // VALIDATE REQUIRED FIELDS
        // -------------------------------------------------

        validateRequiredFields(
                updatedDepartment
        );


        // -------------------------------------------------
        // CHECK NAME
        // -------------------------------------------------

        departmentRepository
                .findByName(
                        updatedDepartment.getName()
                )
                .ifPresent(
                        existingWithName -> {

                            if (
                                    !existingWithName
                                            .getId()
                                            .equals(id)
                            ) {

                                throw new RuntimeException(
                                        "Another department already uses name: "
                                                + updatedDepartment.getName()
                                );
                            }
                        }
                );


        // -------------------------------------------------
        // CHECK CODE
        // -------------------------------------------------

        departmentRepository
                .findByCode(
                        updatedDepartment.getCode()
                )
                .ifPresent(
                        existingWithCode -> {

                            if (
                                    !existingWithCode
                                            .getId()
                                            .equals(id)
                            ) {

                                throw new RuntimeException(
                                        "Another department already uses code: "
                                                + updatedDepartment.getCode()
                                );
                            }
                        }
                );


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
        // UPDATE HEAD OF DEPARTMENT
        // -------------------------------------------------

        existingDepartment.setHeadOfDepartment(
                updatedDepartment.getHeadOfDepartment()
        );


        // -------------------------------------------------
        // UPDATE CONTACT INFORMATION
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
        // SAVE
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

            throw new RuntimeException(
                    "Invalid department status. "
                            + "Allowed values: Active, Inactive."
            );
        }


        // -------------------------------------------------
        // FIND DEPARTMENT
        // -------------------------------------------------

        Department department =
                getDepartmentById(id);


        // -------------------------------------------------
        // UPDATE STATUS
        // -------------------------------------------------

        department.setStatus(
                status
        );


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

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

        if (
                department.getName() != null
        ) {

            department.setName(
                    department.getName().trim()
            );
        }


        if (
                department.getCode() != null
        ) {

            department.setCode(
                    department.getCode()
                            .trim()
                            .toUpperCase()
            );
        }


        if (
                department.getDescription() != null
        ) {

            String description =
                    department.getDescription().trim();

            department.setDescription(
                    description.isEmpty()
                            ? null
                            : description
            );
        }


        if (
                department.getHeadOfDepartment() != null
        ) {

            String head =
                    department.getHeadOfDepartment()
                            .trim();

            department.setHeadOfDepartment(
                    head.isEmpty()
                            ? null
                            : head
            );
        }


        if (
                department.getPhone() != null
        ) {

            String phone =
                    department.getPhone().trim();

            department.setPhone(
                    phone.isEmpty()
                            ? null
                            : phone
            );
        }


        if (
                department.getEmail() != null
        ) {

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


        if (
                department.getLocation() != null
        ) {

            String location =
                    department.getLocation().trim();

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

            throw new RuntimeException(
                    "Department name is required."
            );
        }


        if (
                isBlank(
                        department.getCode()
                )
        ) {

            throw new RuntimeException(
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

                // Start from 0001 if the
                // existing ID is invalid.
            }
        }


        return String.format(
                "DEP-%d-%04d",
                currentYear,
                nextSequence
        );
    }
}