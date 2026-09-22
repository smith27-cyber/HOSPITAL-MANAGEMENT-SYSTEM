package com.hms.backend.auth.service.impl;

import com.hms.backend.auth.dto.ChangePasswordRequest;
import com.hms.backend.auth.dto.UserCreateRequest;
import com.hms.backend.auth.dto.UserResponse;
import com.hms.backend.auth.dto.UserUpdateRequest;
import com.hms.backend.auth.entity.User;
import com.hms.backend.auth.repository.UserRepository;
import com.hms.backend.auth.service.UserService;
import com.hms.backend.entity.Role;
import com.hms.backend.repository.RoleRepository;

import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.repository.TenantRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantRepository tenantRepository;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            TenantRepository tenantRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tenantRepository = tenantRepository;
    }

    @Override
    public UserResponse createUser(
            UserCreateRequest request) {

        String username = request.getUsername()
                .trim()
                .toLowerCase(Locale.ROOT);

        String roleName = normalizeRole(
                request.getRole());

        ensureTenantSafeRole(roleName);

        if (userRepository.existsByUsername(username)) {

            throw new IllegalStateException(
                    "Username '"
                            + username
                            + "' is already in use.");
        }

        Role role = findRole(roleName);

        Tenant currentTenant = getCurrentTenant();

        User user = new User();

        user.setUsername(username);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()));

        user.setFullName(
                request.getFullName().trim());

        user.setRole(roleName);

        user.setEnabled(
                request.getEnabled() == null
                        || request.getEnabled());

        user.setTenant(
                currentTenant);

        Set<Role> roles = new HashSet<>();

        roles.add(role);

        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        return UserResponse.fromUser(
                savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {

        Long tenantId = getCurrentTenantId();

        return userRepository
                .findAllByTenant_Id(tenantId)
                .stream()
                .map(UserResponse::fromUser)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {

        User user = findUser(id);

        return UserResponse.fromUser(user);
    }

    private Long getCurrentTenantId() {

        return TenantContext.requireTenantId();
    }

    private Tenant getCurrentTenant() {

        Long tenantId = getCurrentTenantId();

        return tenantRepository
                .findById(tenantId)
                .orElseThrow(
                        () -> new IllegalStateException(
                                "Current tenant was not found: "
                                        + tenantId));
    }

    @Override
    public UserResponse updateUser(
            Long id,
            UserUpdateRequest request) {

        User user = findUser(id);

        String roleName = normalizeRole(
                request.getRole());

        ensureTenantSafeRole(roleName);

        Role role = findRole(roleName);

        user.setFullName(
                request.getFullName().trim());

        /*
         * Keep legacy role synchronized while the legacy
         * field still exists.
         */
        user.setRole(roleName);

        Set<Role> roles = new HashSet<>();
        roles.add(role);

        user.setRoles(roles);

        if (request.getEnabled() != null) {
            user.setEnabled(
                    request.getEnabled());
        }

        User updatedUser = userRepository.save(user);

        return UserResponse.fromUser(updatedUser);
    }

    @Override
    public UserResponse updateUserStatus(
            Long id,
            boolean enabled) {

        User user = findUser(id);

        user.setEnabled(enabled);

        User updatedUser = userRepository.save(user);

        return UserResponse.fromUser(updatedUser);
    }

    @Override
    public void changePassword(
            Long id,
            ChangePasswordRequest request) {

        User user = findUser(id);

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()));

        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {

        User user = findUser(id);

        /*
         * For now we physically delete the account.
         *
         * Later, for an HMS production environment, we can
         * change this to account deactivation instead so
         * historical audit information is preserved.
         */
        userRepository.delete(user);
    }

    private User findUser(Long id) {

        Long tenantId = getCurrentTenantId();

        return userRepository
                .findByIdAndTenant_Id(
                        id,
                        tenantId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "User with ID "
                                        + id
                                        + " was not found."));
    }

    private Role findRole(String roleName) {

        return roleRepository.findByName(roleName)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Role '" + roleName + "' does not exist."));
    }

    private void ensureTenantSafeRole(String roleName) {
        if ("SUPER_ADMIN".equals(roleName)) {
            throw new IllegalArgumentException(
                    "SUPER_ADMIN can only be created or assigned by the platform administration layer.");
        }
    }

    private String normalizeRole(String role) {

        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException(
                    "Role is required.");
        }

        return role.trim()
                .toUpperCase(Locale.ROOT);
    }
}