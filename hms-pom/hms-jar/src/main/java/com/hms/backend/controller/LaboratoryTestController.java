
package com.hms.backend.controller;

import com.hms.backend.entity.LaboratoryTest;
import com.hms.backend.service.LaboratoryTestService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratory/tests")
@CrossOrigin(origins = "http://localhost:4200")
public class LaboratoryTestController {

    private final LaboratoryTestService laboratoryTestService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public LaboratoryTestController(
            LaboratoryTestService laboratoryTestService
    ) {

        this.laboratoryTestService =
                laboratoryTestService;
    }


    // =====================================================
    // GET ALL TESTS
    // =====================================================
    //
    // Permission:
    //
    // LABORATORY_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_VIEW')"
    )
    @GetMapping
    public ResponseEntity<List<LaboratoryTest>>
    getAllTests() {

        return ResponseEntity.ok(
                laboratoryTestService
                        .getAllTests()
        );
    }


    // =====================================================
    // GET TEST BY ID
    // =====================================================
    //
    // Permission:
    //
    // LABORATORY_VIEW
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_VIEW')"
    )
    @GetMapping("/{id}")
    public ResponseEntity<LaboratoryTest>
    getTestById(
            @PathVariable Long id
    ) {

        return laboratoryTestService
                .getTestById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }


    // =====================================================
    // CREATE TEST
    // =====================================================
    //
    // Permission:
    //
    // LABORATORY_TEST_CREATE
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_TEST_CREATE')"
    )
    @PostMapping
    public ResponseEntity<LaboratoryTest>
    createTest(
            @RequestBody LaboratoryTest test
    ) {

        LaboratoryTest createdTest =
                laboratoryTestService
                        .createTest(test);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdTest);
    }


    // =====================================================
    // UPDATE TEST
    // =====================================================
    //
    // Permission:
    //
    // LABORATORY_TEST_UPDATE
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_TEST_UPDATE')"
    )
    @PutMapping("/{id}")
    public ResponseEntity<LaboratoryTest>
    updateTest(
            @PathVariable Long id,
            @RequestBody LaboratoryTest test
    ) {

        try {

            LaboratoryTest updatedTest =
                    laboratoryTestService
                            .updateTest(
                                    id,
                                    test
                            );

            return ResponseEntity.ok(
                    updatedTest
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // =====================================================
    // DELETE TEST
    // =====================================================
    //
    // Permission:
    //
    // LABORATORY_TEST_DELETE
    //
    // =====================================================

    @PreAuthorize(
            "hasAuthority('LABORATORY_TEST_DELETE')"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteTest(
            @PathVariable Long id
    ) {

        try {

            laboratoryTestService
                    .deleteTest(id);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}

