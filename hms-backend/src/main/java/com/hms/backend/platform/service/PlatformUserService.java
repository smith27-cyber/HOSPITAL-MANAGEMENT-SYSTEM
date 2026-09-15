package com.hms.backend.platform.service;

import com.hms.backend.auth.dto.PlatformUserResponse;

import java.util.List;

public interface PlatformUserService {

    List<PlatformUserResponse> getAllUsers();

    PlatformUserResponse getUserById(
            Long id
    );

    PlatformUserResponse updateUserStatus(
            Long id,
            boolean enabled
    );

    void deleteUser(
            Long id
    );
}