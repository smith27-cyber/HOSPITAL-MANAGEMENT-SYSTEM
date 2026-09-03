package com.hms.backend.service;

import com.hms.backend.entity.LaboratoryTest;

import java.util.List;
import java.util.Optional;

public interface LaboratoryTestService {

    List<LaboratoryTest> getAllTests();

    Optional<LaboratoryTest> getTestById(Long id);

    LaboratoryTest createTest(LaboratoryTest test);

    LaboratoryTest updateTest(Long id, LaboratoryTest test);

    void deleteTest(Long id);
}