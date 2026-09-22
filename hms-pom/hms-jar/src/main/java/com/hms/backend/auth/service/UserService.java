package com.hms.backend.auth.service;

import com.hms.backend.auth.dto.ChangePasswordRequest;
import com.hms.backend.auth.dto.UserCreateRequest;
import com.hms.backend.auth.dto.UserResponse;
import com.hms.backend.auth.dto.UserUpdateRequest;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserCreateRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUser(Long id, UserUpdateRequest request);

    UserResponse updateUserStatus(Long id, boolean enabled);

    void changePassword(Long id, ChangePasswordRequest request);

    void deleteUser(Long id);
}