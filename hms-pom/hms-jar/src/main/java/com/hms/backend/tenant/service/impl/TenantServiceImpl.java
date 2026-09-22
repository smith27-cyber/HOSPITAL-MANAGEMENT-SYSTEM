package com.hms.backend.tenant.service.impl;

import com.hms.backend.auth.entity.User;
import com.hms.backend.auth.repository.UserRepository;
import com.hms.backend.entity.Role;
import com.hms.backend.repository.RoleRepository;
import com.hms.backend.tenant.dto.TenantAdminCreateRequest;
import com.hms.backend.tenant.dto.TenantAdminResponse;
import com.hms.backend.tenant.dto.TenantCreateRequest;
import com.hms.backend.tenant.dto.TenantResponse;
import com.hms.backend.tenant.dto.TenantStatusRequest;
import com.hms.backend.tenant.dto.TenantUpdateRequest;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.repository.TenantRepository;
import com.hms.backend.tenant.service.TenantService;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Transactional
public class TenantServiceImpl
        implements TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public TenantServiceImpl(
            TenantRepository tenantRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;

        this.userRepository = userRepository;

        this.roleRepository = roleRepository;

        this.passwordEncoder = passwordEncoder;
    }
    // =====================================================
    // GET ALL TENANTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants() {

        return tenantRepository
                .findAll()
                .stream()
                .map(TenantResponse::fromTenant)
                .toList();
    }

    // =====================================================
    // GET TENANT BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantById(
            Long id) {

        return TenantResponse.fromTenant(
                findTenant(id));
    }

    // =====================================================
    // CREATE TENANT
    // =====================================================

    @Override
    public TenantResponse createTenant(
            TenantCreateRequest request) {

        String code = normalizeCode(
                request.getCode());

        if (tenantRepository.existsByCode(code)) {

            throw new IllegalStateException(
                    "Tenant code '"
                            + code
                            + "' is already in use.");
        }

        Tenant tenant = new Tenant();

        tenant.setCode(code);

        tenant.setName(
                normalizeText(
                        request.getName()));

        tenant.setType(
                request.getType());

        tenant.setPhone(
                normalizeText(
                        request.getPhone()));

        tenant.setEmail(
                normalizeEmail(
                        request.getEmail()));

        tenant.setAddress(
                normalizeText(
                        request.getAddress()));

        tenant.setCity(
                normalizeText(
                        request.getCity()));

        tenant.setCountry(
                normalizeCountry(
                        request.getCountry()));

        tenant.setWebsite(
                normalizeText(
                        request.getWebsite()));

        tenant.setLogoUrl(
                normalizeText(
                        request.getLogoUrl()));

        /*
         * New tenants start in TRIAL.
         *
         * Activation will be controlled separately
         * from the master panel.
         */
        tenant.setStatus(
                com.hms.backend.tenant.entity.TenantStatus.TRIAL);

        Tenant savedTenant = tenantRepository.save(
                tenant);

        return TenantResponse.fromTenant(
                savedTenant);
    }
    // =====================================================
    // CREATE TENANT ADMINISTRATOR
    // =====================================================

    @Override
    public TenantAdminResponse createTenantAdmin(
            Long tenantId,
            TenantAdminCreateRequest request) {

        Tenant tenant = findTenant(tenantId);

        String username = request.getUsername()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsername(username)) {

            throw new IllegalStateException(
                    "Username '"
                            + username
                            + "' is already in use.");
        }

        Role adminRole = roleRepository
                .findByName("ADMIN")
                .orElseThrow(
                        () -> new IllegalStateException(
                                "ADMIN role was not found."));

        User user = new User();

        user.setUsername(username);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()));

        user.setFullName(
                request.getFullName().trim());

        /*
         * Tenant administrators always receive
         * the ADMIN role.
         *
         * The platform API does not allow the caller
         * to choose an arbitrary role here.
         */
        user.setRole("ADMIN");

        user.setRoles(
                new HashSet<>(
                        Set.of(adminRole)));

        user.setEnabled(true);

        /*
         * This is the critical assignment.
         *
         * The tenant comes from the tenant resource
         * selected by the SUPER_ADMIN, not from JSON.
         */
        user.setTenant(tenant);

        User savedUser = userRepository.save(user);

        return new TenantAdminResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getFullName(),
                "ADMIN",
                tenant.getId(),
                tenant.getCode(),
                tenant.getName());
    }
    // =====================================================
    // UPDATE TENANT
    // =====================================================

    @Override
    public TenantResponse updateTenant(
            Long id,
            TenantUpdateRequest request) {

        Tenant tenant = findTenant(id);

        tenant.setName(
                normalizeText(
                        request.getName()));

        tenant.setType(
                request.getType());

        tenant.setPhone(
                normalizeText(
                        request.getPhone()));

        tenant.setEmail(
                normalizeEmail(
                        request.getEmail()));

        tenant.setAddress(
                normalizeText(
                        request.getAddress()));

        tenant.setCity(
                normalizeText(
                        request.getCity()));

        tenant.setCountry(
                normalizeCountry(
                        request.getCountry()));

        tenant.setWebsite(
                normalizeText(
                        request.getWebsite()));

        tenant.setLogoUrl(
                normalizeText(
                        request.getLogoUrl()));

        Tenant updatedTenant = tenantRepository.save(
                tenant);

        return TenantResponse.fromTenant(
                updatedTenant);
    }

    // =====================================================
    // UPDATE TENANT STATUS
    // =====================================================

    @Override
    public TenantResponse updateTenantStatus(
            Long id,
            TenantStatusRequest request) {

        Tenant tenant = findTenant(id);

        /*
         * The platform tenant is not something we should
         * accidentally suspend through the normal tenant
         * management API.
         */
        if ("OLIVES-DEFAULT"
                .equalsIgnoreCase(
                        tenant.getCode())
                &&
                (request.getStatus() == com.hms.backend.tenant.entity.TenantStatus.SUSPENDED
                        ||
                        request.getStatus() == com.hms.backend.tenant.entity.TenantStatus.CANCELLED
                        ||
                        request.getStatus() == com.hms.backend.tenant.entity.TenantStatus.EXPIRED)) {

            throw new IllegalStateException(
                    "The OLIVES-DEFAULT tenant cannot be suspended, cancelled or expired.");
        }

        tenant.setStatus(
                request.getStatus());

        Tenant updatedTenant = tenantRepository.save(
                tenant);

        return TenantResponse.fromTenant(
                updatedTenant);
    }

    // =====================================================
    // FIND TENANT
    // =====================================================

    private Tenant findTenant(
            Long id) {

        return tenantRepository
                .findById(id)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Tenant with ID "
                                        + id
                                        + " was not found."));
    }

    // =====================================================
    // NORMALIZE CODE
    // =====================================================

    private String normalizeCode(
            String code) {

        if (code == null ||
                code.isBlank()) {

            throw new IllegalArgumentException(
                    "Tenant code is required.");
        }

        return code
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    // =====================================================
    // NORMALIZE TEXT
    // =====================================================

    private String normalizeText(
            String value) {

        if (value == null) {

            return null;
        }

        String normalized = value.trim();

        return normalized.isBlank()
                ? null
                : normalized;
    }

    // =====================================================
    // NORMALIZE EMAIL
    // =====================================================

    private String normalizeEmail(
            String email) {

        String normalized = normalizeText(email);

        return normalized == null
                ? null
                : normalized.toLowerCase(
                        Locale.ROOT);
    }

    // =====================================================
    // NORMALIZE COUNTRY
    // =====================================================

    private String normalizeCountry(
            String country) {

        String normalized = normalizeText(country);

        return normalized == null
                ? "Uganda"
                : normalized;
    }
}