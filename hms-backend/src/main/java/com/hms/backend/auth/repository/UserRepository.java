package com.hms.backend.auth.repository;

import com.hms.backend.auth.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    // =====================================================
    // GLOBAL USERNAME LOOKUP
    // =====================================================
    //
    // Username is currently globally unique in your User
    // entity, so this remains global.
    //
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    // =====================================================
    // TENANT-SCOPED USERS
    // =====================================================

    List<User> findAllByTenant_Id(
            Long tenantId);

    Optional<User> findByIdAndTenant_Id(
            Long id,
            Long tenantId);

    // =====================================================
    // PLATFORM USER MANAGEMENT
    // =====================================================

    List<User> findAllByOrderByCreatedAtDesc();

}