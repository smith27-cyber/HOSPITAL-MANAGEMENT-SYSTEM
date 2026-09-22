package com.hms.backend.platform.service.impl;

import com.hms.backend.auth.dto.PlatformUserResponse;
import com.hms.backend.auth.entity.User;
import com.hms.backend.auth.repository.UserRepository;
import com.hms.backend.platform.service.PlatformUserService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class PlatformUserServiceImpl
        implements PlatformUserService {

    private final UserRepository userRepository;


    public PlatformUserServiceImpl(
            UserRepository userRepository) {

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // GET ALL PLATFORM USERS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PlatformUserResponse> getAllUsers() {

        return userRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PlatformUserResponse::fromUser)
                .toList();
    }


    // =====================================================
    // GET USER
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public PlatformUserResponse getUserById(
            Long id) {

        User user =
                findUser(id);

        return PlatformUserResponse
                .fromUser(user);
    }


    // =====================================================
    // ENABLE / DISABLE
    // =====================================================

    @Override
    public PlatformUserResponse updateUserStatus(
            Long id,
            boolean enabled) {

        User user =
                findUser(id);


        /*
         * Never allow a SUPER_ADMIN account
         * to be disabled through this operation.
         */

        if (isSuperAdmin(user)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "SUPER_ADMIN accounts cannot be disabled from this operation."
            );
        }


        user.setEnabled(
                enabled);


        User saved =
                userRepository.save(user);


        return PlatformUserResponse
                .fromUser(saved);
    }


    // =====================================================
    // DELETE USER
    // =====================================================

    @Override
    public void deleteUser(
            Long id) {

        User user =
                findUser(id);


        /*
         * Never allow a SUPER_ADMIN account
         * to be deleted through this operation.
         */

        if (isSuperAdmin(user)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "SUPER_ADMIN accounts cannot be deleted."
            );
        }


        userRepository.delete(user);
    }


    // =====================================================
    // FIND USER
    // =====================================================

    private User findUser(
            Long id) {

        return userRepository
                .findById(id)
                .orElseThrow(
                        () -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User with ID "
                                        + id
                                        + " was not found."
                        )
                );
    }


    // =====================================================
    // CHECK SUPER ADMIN
    // =====================================================

    private boolean isSuperAdmin(
            User user) {

        if ("SUPER_ADMIN".equalsIgnoreCase(
                user.getRole())) {

            return true;
        }


        return user.getRoles()
                .stream()
                .anyMatch(
                        role ->
                                "SUPER_ADMIN"
                                        .equalsIgnoreCase(
                                                role.getName()));
    }

}