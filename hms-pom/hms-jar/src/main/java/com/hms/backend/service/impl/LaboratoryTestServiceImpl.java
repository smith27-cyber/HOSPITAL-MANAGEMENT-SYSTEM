package com.hms.backend.service.impl;

import com.hms.backend.entity.LaboratoryTest;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.repository.LaboratoryTestRepository;
import com.hms.backend.service.LaboratoryTestService;
import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.repository.TenantRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LaboratoryTestServiceImpl
        implements LaboratoryTestService {

    private final LaboratoryTestRepository laboratoryTestRepository;
    private final TenantRepository tenantRepository;

    public LaboratoryTestServiceImpl(
            LaboratoryTestRepository laboratoryTestRepository,
            TenantRepository tenantRepository
    ) {

        this.laboratoryTestRepository =
                laboratoryTestRepository;

        this.tenantRepository =
                tenantRepository;
    }

    // =====================================================
    // CURRENT TENANT
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
    // GET ALL TESTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<LaboratoryTest> getAllTests() {

        Long tenantId =
                TenantContext.requireTenantId();

        return laboratoryTestRepository
                .findAllByTenant_Id(tenantId);
    }

    // =====================================================
    // GET TEST BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Optional<LaboratoryTest> getTestById(
            Long id
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        return laboratoryTestRepository
                .findByIdAndTenant_Id(
                        id,
                        tenantId
                );
    }

    // =====================================================
    // CREATE TEST
    // =====================================================

    @Override
    public LaboratoryTest createTest(
            LaboratoryTest test
    ) {

        if (test == null) {

            throw new IllegalArgumentException(
                    "Laboratory test cannot be null."
            );
        }

        Tenant currentTenant =
                getCurrentTenant();

        test.setTenant(
                currentTenant
        );

        return laboratoryTestRepository.save(
                test
        );
    }

    // =====================================================
    // UPDATE TEST
    // =====================================================

    @Override
    public LaboratoryTest updateTest(
            Long id,
            LaboratoryTest test
    ) {

        if (test == null) {

            throw new IllegalArgumentException(
                    "Laboratory test cannot be null."
            );
        }

        Long tenantId =
                TenantContext.requireTenantId();

        LaboratoryTest existingTest =
                laboratoryTestRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Laboratory test not found: "
                                                + id
                                )
                        );

        existingTest.setTestName(
                test.getTestName()
        );

        existingTest.setCategory(
                test.getCategory()
        );

        existingTest.setSampleType(
                test.getSampleType()
        );

        existingTest.setDescription(
                test.getDescription()
        );

        existingTest.setPrice(
                test.getPrice()
        );

        existingTest.setNormalRange(
                test.getNormalRange()
        );

        existingTest.setPreparationInstructions(
                test.getPreparationInstructions()
        );

        return laboratoryTestRepository.save(
                existingTest
        );
    }

    // =====================================================
    // DELETE TEST
    // =====================================================

    @Override
    public void deleteTest(
            Long id
    ) {

        Long tenantId =
                TenantContext.requireTenantId();

        LaboratoryTest test =
                laboratoryTestRepository
                        .findByIdAndTenant_Id(
                                id,
                                tenantId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Laboratory test not found: "
                                                + id
                                )
                        );

        laboratoryTestRepository.delete(
                test
        );
    }
}