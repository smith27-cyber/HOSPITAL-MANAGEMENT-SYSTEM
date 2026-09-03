package com.hms.backend.repository;

import com.hms.backend.entity.LaboratoryTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LaboratoryTestRepository
        extends JpaRepository<LaboratoryTest, Long> {
}