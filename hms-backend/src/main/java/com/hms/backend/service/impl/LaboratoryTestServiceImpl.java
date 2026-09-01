package com.hms.backend.service.impl;

import com.hms.backend.entity.LaboratoryTest;
import com.hms.backend.repository.LaboratoryTestRepository;
import com.hms.backend.service.LaboratoryTestService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LaboratoryTestServiceImpl implements LaboratoryTestService {

    private final LaboratoryTestRepository laboratoryTestRepository;

    public LaboratoryTestServiceImpl(
            LaboratoryTestRepository laboratoryTestRepository) {

        this.laboratoryTestRepository =
                laboratoryTestRepository;
    }

    @Override
    public List<LaboratoryTest> getAllTests() {

        return laboratoryTestRepository.findAll();
    }

    @Override
    public Optional<LaboratoryTest> getTestById(Long id) {

        return laboratoryTestRepository.findById(id);
    }

    @Override
    public LaboratoryTest createTest(
            LaboratoryTest test) {

        return laboratoryTestRepository.save(test);
    }

    @Override
    public LaboratoryTest updateTest(
            Long id,
            LaboratoryTest test) {

        LaboratoryTest existingTest =
                laboratoryTestRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Laboratory test not found with id: "
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

    @Override
    public void deleteTest(Long id) {

        if (!laboratoryTestRepository.existsById(id)) {

            throw new RuntimeException(
                    "Laboratory test not found with id: "
                            + id
            );
        }

        laboratoryTestRepository.deleteById(id);
    }
}