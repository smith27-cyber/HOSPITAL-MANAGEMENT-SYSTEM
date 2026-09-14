package com.hms.backend.auth;

import com.hms.backend.auth.entity.User;
import com.hms.backend.auth.repository.UserRepository;
import com.hms.backend.entity.Permission;
import com.hms.backend.entity.Role;
import com.hms.backend.repository.PermissionRepository;
import com.hms.backend.repository.RoleRepository;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.entity.TenantStatus;
import com.hms.backend.tenant.entity.TenantType;
import com.hms.backend.tenant.repository.TenantRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class RbacDataInitializer {

        // =====================================================
        // MAIN INITIALIZER
        // =====================================================

        @Bean
        CommandLineRunner initializeRbacData(
                        RoleRepository roleRepository,
                        PermissionRepository permissionRepository,
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        TenantRepository tenantRepository) {

                return args -> {

                        initializeRbac(
                                        roleRepository,
                                        permissionRepository,
                                        userRepository,
                                        passwordEncoder,
                                        tenantRepository);

                };
        }

        // =====================================================
        // INITIALIZE RBAC
        // =====================================================

        @Transactional
        public void initializeRbac(
                        RoleRepository roleRepository,
                        PermissionRepository permissionRepository,
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        TenantRepository tenantRepository) {

                Tenant defaultTenant = ensureDefaultTenant(tenantRepository);

                System.out.println(
                                "=================================================");

                System.out.println(
                                "INITIALIZING HMS RBAC");

                System.out.println(
                                "=================================================");

                // =================================================
                // 1. PERMISSIONS
                // =================================================

                Map<String, Permission> permissionMap = initializePermissions(
                                permissionRepository);

                // =================================================
                // 2. ROLES
                // =================================================

                Map<String, Role> roleMap = initializeRoles(
                                roleRepository);

                // =================================================
                // 3. ROLE-PERMISSION ASSIGNMENTS
                // =================================================

                configureRolePermissions(
                                roleRepository,
                                roleMap,
                                permissionMap);

                // =================================================
                // 4. MIGRATE EXISTING USERS
                // =================================================

                // =================================================
                // 4. MIGRATE EXISTING USERS
                // =================================================

                migrateUsers(
                                userRepository,
                                roleRepository,
                                passwordEncoder,
                                defaultTenant);

                // =================================================
                // 5. ENSURE PLATFORM SUPER ADMIN
                // =================================================

                ensureSuperAdmin(
                                userRepository,
                                roleRepository,
                                passwordEncoder);

                // =================================================
                // 6. CREATE RBAC TEST USERS
                // =================================================

                createRbacTestUsers(
                                userRepository,
                                roleRepository,
                                passwordEncoder,
                                defaultTenant);

                System.out.println(
                                "=================================================");

                System.out.println(
                                "HMS RBAC INITIALIZATION COMPLETE");

                System.out.println(
                                "=================================================");
        }

        // =====================================================
        // INITIALIZE PERMISSIONS
        // =====================================================

        private Map<String, Permission> initializePermissions(
                        PermissionRepository permissionRepository) {

                Map<String, String> definitions = new LinkedHashMap<>();

                // =================================================
                // TENANT MANAGEMENT
                // =================================================

                definitions.put(
                                "TENANT_VIEW",
                                "View platform tenants");
                definitions.put(
                                "TENANT_ADMIN_CREATE",
                                "Create a tenant administrator");

                definitions.put(
                                "TENANT_CREATE",
                                "Create new platform tenants");

                definitions.put(
                                "TENANT_UPDATE",
                                "Update platform tenant information");

                definitions.put(
                                "TENANT_STATUS_UPDATE",
                                "Activate, suspend or cancel tenants");
                // =================================================
                // DASHBOARD
                // =================================================

                definitions.put(
                                "DASHBOARD_VIEW",
                                "View the HMS dashboard");

                // =================================================
                // PATIENTS
                // =================================================

                definitions.put(
                                "PATIENT_VIEW",
                                "View patient records");

                definitions.put(
                                "PATIENT_CREATE",
                                "Register new patients");

                definitions.put(
                                "PATIENT_UPDATE",
                                "Update patient records");

                definitions.put(
                                "PATIENT_DELETE",
                                "Delete patient records");

                // =================================================
                // DOCTORS
                // =================================================

                definitions.put(
                                "DOCTOR_VIEW",
                                "View doctors");

                definitions.put(
                                "DOCTOR_CREATE",
                                "Register doctors");

                definitions.put(
                                "DOCTOR_UPDATE",
                                "Update doctor records");

                definitions.put(
                                "DOCTOR_DELETE",
                                "Delete doctor records");

                // =================================================
                // DEPARTMENTS
                // =================================================

                definitions.put(
                                "DEPARTMENT_VIEW",
                                "View departments");

                definitions.put(
                                "DEPARTMENT_CREATE",
                                "Create departments");

                definitions.put(
                                "DEPARTMENT_UPDATE",
                                "Update departments");

                definitions.put(
                                "DEPARTMENT_DELETE",
                                "Delete departments");

                // =================================================
                // APPOINTMENTS
                // =================================================

                definitions.put(
                                "APPOINTMENT_VIEW",
                                "View appointments");

                definitions.put(
                                "APPOINTMENT_CREATE",
                                "Create appointments");

                definitions.put(
                                "APPOINTMENT_UPDATE",
                                "Update appointments");

                definitions.put(
                                "APPOINTMENT_CANCEL",
                                "Cancel appointments");

                definitions.put(
                                "APPOINTMENT_QUEUE_VIEW",
                                "View appointment queue");

                // =================================================
                // CONSULTATIONS
                // =================================================

                definitions.put(
                                "CONSULTATION_VIEW",
                                "View consultations");

                definitions.put(
                                "CONSULTATION_CREATE",
                                "Create consultations");

                definitions.put(
                                "CONSULTATION_UPDATE",
                                "Update consultation progress");

                definitions.put(
                                "CONSULTATION_COMPLETE",
                                "Complete consultations");

                definitions.put(
                                "CONSULTATION_DELETE",
                                "Delete consultations");

                // =================================================
                // LABORATORY
                // =================================================

                definitions.put(
                                "LABORATORY_VIEW",
                                "View laboratory services");

                definitions.put(
                                "LABORATORY_TEST_CREATE",
                                "Create laboratory tests");

                definitions.put(
                                "LABORATORY_TEST_UPDATE",
                                "Update laboratory tests");

                definitions.put(
                                "LABORATORY_TEST_DELETE",
                                "Delete laboratory tests");

                definitions.put(
                                "LABORATORY_REQUEST_VIEW",
                                "View laboratory requests");

                definitions.put(
                                "LABORATORY_REQUEST_CREATE",
                                "Create laboratory requests");

                definitions.put(
                                "LABORATORY_REQUEST_UPDATE",
                                "Update laboratory requests");

                definitions.put(
                                "LABORATORY_RESULT_ENTER",
                                "Enter laboratory results");

                definitions.put(
                                "LABORATORY_RESULT_VIEW",
                                "View laboratory results");

                // =================================================
                // PHARMACY
                // =================================================

                definitions.put(
                                "PHARMACY_VIEW",
                                "View pharmacy");

                definitions.put(
                                "PHARMACY_PRESCRIPTION_VIEW",
                                "View prescriptions");

                definitions.put(
                                "PHARMACY_PRESCRIPTION_CREATE",
                                "Create pharmacy prescriptions");

                definitions.put(
                                "PHARMACY_PRESCRIPTION_UPDATE",
                                "Update pharmacy prescriptions before preparation");

                definitions.put(
                                "PHARMACY_PRESCRIPTION_CANCEL",
                                "Cancel pharmacy prescriptions");

                definitions.put(
                                "PHARMACY_DISPENSE",
                                "Prepare, process and dispense medication");

                definitions.put(
                                "PHARMACY_STOCK_VIEW",
                                "View pharmacy stock");

                definitions.put(
                                "PHARMACY_STOCK_UPDATE",
                                "Update pharmacy stock");

                // =================================================
                // ADMISSIONS
                // =================================================

                definitions.put(
                                "ADMISSION_VIEW",
                                "View admissions");

                definitions.put(
                                "ADMISSION_CREATE",
                                "Create admissions");

                definitions.put(
                                "ADMISSION_UPDATE",
                                "Update admissions");

                definitions.put(
                                "ADMISSION_DISCHARGE",
                                "Discharge patients");

                definitions.put(
                                "ADMISSION_TRANSFER",
                                "Transfer patients");

                definitions.put(
                                "ADMISSION_CANCEL",
                                "Cancel admissions");

                // =================================================
                // BILLING
                // =================================================

                definitions.put(
                                "BILLING_VIEW",
                                "View billing");

                definitions.put(
                                "BILLING_CREATE",
                                "Create billing");

                definitions.put(
                                "BILLING_UPDATE",
                                "Update billing");

                definitions.put(
                                "BILLING_RECORD_PAYMENT",
                                "Record payments");

                definitions.put(
                                "BILLING_CANCEL",
                                "Cancel billing");

                // =================================================
                // INVENTORY
                // =================================================

                definitions.put(
                                "INVENTORY_VIEW",
                                "View inventory");

                definitions.put(
                                "INVENTORY_CREATE",
                                "Create inventory items");

                definitions.put(
                                "INVENTORY_UPDATE",
                                "Update inventory items");

                definitions.put(
                                "INVENTORY_DELETE",
                                "Delete inventory items");

                // =================================================
                // REPORTS
                // =================================================

                definitions.put(
                                "REPORT_VIEW",
                                "View reports");

                definitions.put(
                                "REPORT_GENERATE",
                                "Generate reports");

                // =================================================
                // SETTINGS
                // =================================================

                definitions.put(
                                "SETTINGS_VIEW",
                                "View system settings");

                definitions.put(
                                "SETTINGS_HOSPITAL_VIEW",
                                "View hospital settings");

                definitions.put(
                                "SETTINGS_HOSPITAL_UPDATE",
                                "Update hospital settings");

                definitions.put(
                                "SETTINGS_SYSTEM_VIEW",
                                "View system preferences");

                definitions.put(
                                "SETTINGS_SYSTEM_UPDATE",
                                "Update system preferences");

                definitions.put(
                                "SETTINGS_NOTIFICATION_VIEW",
                                "View notification settings");

                definitions.put(
                                "SETTINGS_NOTIFICATION_UPDATE",
                                "Update notification settings");

                definitions.put(
                                "SETTINGS_USER_MANAGE",
                                "Manage HMS users");

                definitions.put(
                                "SETTINGS_ROLE_MANAGE",
                                "Manage roles and permissions");

                // =================================================
                // CREATE / LOAD PERMISSIONS
                // =================================================

                Map<String, Permission> permissionMap = new LinkedHashMap<>();

                for (Map.Entry<String, String> entry : definitions.entrySet()) {

                        Permission permission = permissionRepository
                                        .findByCode(
                                                        entry.getKey())
                                        .orElseGet(
                                                        () -> permissionRepository.save(
                                                                        new Permission(
                                                                                        entry.getKey(),
                                                                                        entry.getValue())));

                        permissionMap.put(
                                        entry.getKey(),
                                        permission);
                }

                System.out.println(
                                "Permissions loaded: "
                                                + permissionMap.size());

                return permissionMap;
        }

        // =====================================================
        // INITIALIZE ROLES
        // =====================================================

        private Map<String, Role> initializeRoles(
                        RoleRepository roleRepository) {

                Map<String, String> definitions = new LinkedHashMap<>();

                definitions.put(
                                "SUPER_ADMIN",
                                "Full unrestricted HMS administration");

                definitions.put(
                                "ADMIN",
                                "Hospital system administration");

                definitions.put(
                                "DOCTOR",
                                "Clinical consultation and treatment");

                definitions.put(
                                "NURSE",
                                "Nursing and patient care");

                definitions.put(
                                "RECEPTIONIST",
                                "Patient registration and appointments");

                definitions.put(
                                "PHARMACIST",
                                "Pharmacy and medication dispensing");

                definitions.put(
                                "LABORATORY_TECHNICIAN",
                                "Laboratory operations and results");

                definitions.put(
                                "ACCOUNTANT",
                                "Billing and financial operations");

                definitions.put(
                                "RECORDS_OFFICER",
                                "Patient records management");

                definitions.put(
                                "HOSPITAL_MANAGER",
                                "Hospital management and reporting");

                Map<String, Role> roleMap = new LinkedHashMap<>();

                // =================================================
                // CREATE / LOAD ROLES
                // =================================================

                for (Map.Entry<String, String> entry : definitions.entrySet()) {

                        Role role = roleRepository
                                        .findByName(
                                                        entry.getKey())
                                        .orElseGet(
                                                        () -> roleRepository.save(
                                                                        new Role(
                                                                                        entry.getKey(),
                                                                                        entry.getValue())));

                        roleMap.put(
                                        entry.getKey(),
                                        role);
                }

                System.out.println(
                                "Roles loaded: "
                                                + roleMap.size());

                return roleMap;
        }

        // =====================================================
        // CONFIGURE ROLE PERMISSIONS
        // =====================================================

        private void configureRolePermissions(
                        RoleRepository roleRepository,
                        Map<String, Role> roleMap,
                        Map<String, Permission> permissionMap) {

                // =================================================
                // SUPER ADMIN
                // =================================================

                Role superAdmin = roleMap.get(
                                "SUPER_ADMIN");

                if (superAdmin != null) {

                        superAdmin.setPermissions(
                                        new HashSet<>(
                                                        permissionMap.values()));

                        roleRepository.save(
                                        superAdmin);
                }

                // =================================================
                // ADMIN
                // =================================================

                Role admin = roleMap.get(
                                "ADMIN");

                if (admin != null) {

                        Set<Permission> adminPermissions = permissionMap.entrySet()
                                        .stream()
                                        .filter(
                                                        entry -> !entry.getKey().startsWith(
                                                                        "TENANT_"))
                                        .map(
                                                        Map.Entry::getValue)
                                        .collect(
                                                        Collectors.toCollection(
                                                                        HashSet::new));

                        admin.setPermissions(
                                        adminPermissions);

                        roleRepository.save(
                                        admin);
                }

                // =================================================
                // DOCTOR
                // =================================================

                setPermissions(
                                roleRepository,
                                roleMap.get("DOCTOR"),
                                permissionMap,

                                "DASHBOARD_VIEW",

                                "PATIENT_VIEW",

                                "DOCTOR_VIEW",

                                "DEPARTMENT_VIEW",

                                "APPOINTMENT_VIEW",

                                "CONSULTATION_VIEW",
                                "CONSULTATION_CREATE",
                                "CONSULTATION_UPDATE",
                                "CONSULTATION_COMPLETE",

                                "LABORATORY_VIEW",
                                "LABORATORY_REQUEST_VIEW",
                                "LABORATORY_REQUEST_CREATE",
                                "LABORATORY_RESULT_VIEW",

                                "PHARMACY_VIEW",
                                "PHARMACY_PRESCRIPTION_VIEW",
                                "PHARMACY_PRESCRIPTION_CREATE",
                                "PHARMACY_PRESCRIPTION_UPDATE",
                                "PHARMACY_PRESCRIPTION_CANCEL",

                                "ADMISSION_VIEW",

                                "REPORT_VIEW",

                                "SETTINGS_VIEW");

                // =================================================
                // NURSE
                // =================================================

                setPermissions(
                                roleRepository,
                                roleMap.get("NURSE"),
                                permissionMap,

                                "DASHBOARD_VIEW",

                                "PATIENT_VIEW",
                                "PATIENT_UPDATE",

                                "DOCTOR_VIEW",

                                "DEPARTMENT_VIEW",

                                "APPOINTMENT_VIEW",
                                "APPOINTMENT_QUEUE_VIEW",

                                "CONSULTATION_VIEW",

                                "LABORATORY_VIEW",
                                "LABORATORY_REQUEST_VIEW",
                                "LABORATORY_RESULT_VIEW",

                                "ADMISSION_VIEW",
                                "ADMISSION_CREATE",
                                "ADMISSION_UPDATE",

                                "REPORT_VIEW",

                                "SETTINGS_VIEW");

                // =================================================
                // RECEPTIONIST
                // =================================================

                setPermissions(
                                roleRepository,
                                roleMap.get("RECEPTIONIST"),
                                permissionMap,

                                "DASHBOARD_VIEW",

                                "PATIENT_VIEW",
                                "PATIENT_CREATE",
                                "PATIENT_UPDATE",

                                "DOCTOR_VIEW",

                                "DEPARTMENT_VIEW",

                                "APPOINTMENT_VIEW",
                                "APPOINTMENT_CREATE",
                                "APPOINTMENT_UPDATE",
                                "APPOINTMENT_CANCEL",
                                "APPOINTMENT_QUEUE_VIEW",

                                "CONSULTATION_VIEW",

                                "ADMISSION_VIEW",
                                "ADMISSION_CREATE",

                                "BILLING_VIEW",

                                "REPORT_VIEW",

                                "SETTINGS_VIEW");

                // =================================================
                // PHARMACIST
                // =================================================

                setPermissions(
                                roleRepository,
                                roleMap.get("PHARMACIST"),
                                permissionMap,

                                "DASHBOARD_VIEW",

                                "PATIENT_VIEW",

                                "APPOINTMENT_VIEW",

                                "CONSULTATION_VIEW",

                                "PHARMACY_VIEW",
                                "PHARMACY_PRESCRIPTION_VIEW",
                                "PHARMACY_PRESCRIPTION_UPDATE",
                                "PHARMACY_PRESCRIPTION_CANCEL",
                                "PHARMACY_DISPENSE",
                                "PHARMACY_STOCK_VIEW",
                                "PHARMACY_STOCK_UPDATE",

                                "INVENTORY_VIEW",
                                "INVENTORY_UPDATE",

                                "BILLING_VIEW",

                                "REPORT_VIEW",

                                "SETTINGS_VIEW");

                // =================================================
                // LABORATORY TECHNICIAN
                // =================================================

                setPermissions(
                                roleRepository,
                                roleMap.get("LABORATORY_TECHNICIAN"),
                                permissionMap,

                                "DASHBOARD_VIEW",

                                "PATIENT_VIEW",

                                "DOCTOR_VIEW",

                                "APPOINTMENT_VIEW",

                                "CONSULTATION_VIEW",

                                "LABORATORY_VIEW",

                                "LABORATORY_TEST_CREATE",
                                "LABORATORY_TEST_UPDATE",
                                "LABORATORY_TEST_DELETE",

                                "LABORATORY_REQUEST_VIEW",
                                "LABORATORY_REQUEST_UPDATE",

                                "LABORATORY_RESULT_ENTER",
                                "LABORATORY_RESULT_VIEW",

                                "REPORT_VIEW",

                                "SETTINGS_VIEW");

                // =================================================
                // ACCOUNTANT
                // =================================================

                setPermissions(
                                roleRepository,
                                roleMap.get("ACCOUNTANT"),
                                permissionMap,

                                "DASHBOARD_VIEW",

                                "PATIENT_VIEW",

                                "APPOINTMENT_VIEW",

                                "CONSULTATION_VIEW",

                                "LABORATORY_VIEW",

                                "PHARMACY_VIEW",

                                "ADMISSION_VIEW",

                                "BILLING_VIEW",
                                "BILLING_CREATE",
                                "BILLING_UPDATE",
                                "BILLING_RECORD_PAYMENT",
                                "BILLING_CANCEL",

                                "REPORT_VIEW",
                                "REPORT_GENERATE",

                                "SETTINGS_VIEW");

                // =================================================
                // RECORDS OFFICER
                // =================================================

                setPermissions(
                                roleRepository,
                                roleMap.get("RECORDS_OFFICER"),
                                permissionMap,

                                "DASHBOARD_VIEW",

                                "PATIENT_VIEW",
                                "PATIENT_CREATE",
                                "PATIENT_UPDATE",

                                "DOCTOR_VIEW",

                                "DEPARTMENT_VIEW",

                                "APPOINTMENT_VIEW",
                                "APPOINTMENT_CREATE",
                                "APPOINTMENT_UPDATE",

                                "CONSULTATION_VIEW",

                                "LABORATORY_VIEW",
                                "LABORATORY_REQUEST_VIEW",
                                "LABORATORY_RESULT_VIEW",

                                "ADMISSION_VIEW",

                                "BILLING_VIEW",

                                "REPORT_VIEW",
                                "REPORT_GENERATE",

                                "SETTINGS_VIEW");

                // =================================================
                // HOSPITAL MANAGER
                // =================================================

                setPermissions(
                                roleRepository,
                                roleMap.get("HOSPITAL_MANAGER"),
                                permissionMap,

                                "DASHBOARD_VIEW",

                                "PATIENT_VIEW",

                                "DOCTOR_VIEW",

                                "DEPARTMENT_VIEW",

                                "APPOINTMENT_VIEW",

                                "CONSULTATION_VIEW",

                                "LABORATORY_VIEW",
                                "LABORATORY_REQUEST_VIEW",
                                "LABORATORY_RESULT_VIEW",

                                "PHARMACY_VIEW",
                                "PHARMACY_PRESCRIPTION_VIEW",

                                "ADMISSION_VIEW",

                                "BILLING_VIEW",
                                "BILLING_RECORD_PAYMENT",

                                "INVENTORY_VIEW",

                                "REPORT_VIEW",
                                "REPORT_GENERATE",

                                "SETTINGS_VIEW",
                                "SETTINGS_HOSPITAL_VIEW",
                                "SETTINGS_SYSTEM_VIEW",
                                "SETTINGS_NOTIFICATION_VIEW");

                // =================================================
                // DISPLAY SUMMARY
                // =================================================

                roleMap.forEach(
                                (name, role) -> {

                                        int count = role.getPermissions() == null
                                                        ? 0
                                                        : role.getPermissions().size();

                                        System.out.println(
                                                        "ROLE "
                                                                        + name
                                                                        + " -> "
                                                                        + count
                                                                        + " permissions");
                                });
        }

        // =====================================================
        // SET PERMISSIONS
        // =====================================================

        private void setPermissions(
                        RoleRepository roleRepository,
                        Role role,
                        Map<String, Permission> permissionMap,
                        String... codes) {

                if (role == null) {

                        return;

                }

                Set<Permission> permissions = Arrays.stream(
                                codes)
                                .map(
                                                permissionMap::get)
                                .filter(
                                                Objects::nonNull)
                                .collect(
                                                Collectors.toCollection(
                                                                HashSet::new));

                role.setPermissions(
                                permissions);

                roleRepository.save(
                                role);
        }

        // =====================================================
        // ENSURE DEFAULT TENANT
        // =====================================================

        private Tenant ensureDefaultTenant(TenantRepository tenantRepository) {

                return tenantRepository.findByCode("OLIVES-DEFAULT")
                                .orElseGet(() -> {
                                        Tenant tenant = new Tenant(
                                                        "OLIVES-DEFAULT",
                                                        "Olives Tech Default Tenant",
                                                        TenantType.CLINIC,
                                                        TenantStatus.ACTIVE);

                                        tenant.setCity("Kampala");
                                        tenant.setCountry("Uganda");

                                        Tenant saved = tenantRepository.save(tenant);

                                        System.out.println("DEFAULT TENANT CREATED: " + saved.getCode());
                                        return saved;
                                });
        }

        // =====================================================
        // MIGRATE USERS
        // =====================================================

        private void migrateUsers(
                        UserRepository userRepository,
                        RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder,
                        Tenant defaultTenant) {

                List<User> users = userRepository.findAll();

                for (User user : users) {

                        // -------------------------------------------------
                        // Attach legacy users to the default tenant
                        // -------------------------------------------------

                        /*
                         * SUPER_ADMIN is a platform-level account and must
                         * not belong to a tenant.
                         */
                        boolean hasSuperAdminRole = user.getRoles() != null &&
                                        user.getRoles()
                                                        .stream()
                                                        .anyMatch(
                                                                        role -> "SUPER_ADMIN".equalsIgnoreCase(
                                                                                        role.getName()));

                        boolean legacySuperAdmin = user.getRole() != null &&
                                        "SUPER_ADMIN".equalsIgnoreCase(
                                                        user.getRole());

                        boolean isSuperAdmin = hasSuperAdminRole ||
                                        legacySuperAdmin;

                        if (user.getTenant() == null &&
                                        !isSuperAdmin) {
                                user.setTenant(defaultTenant);
                        }
                        // -------------------------------------------------
                        // Ensure roles collection exists
                        // -------------------------------------------------

                        if (user.getRoles() == null) {

                                user.setRoles(
                                                new HashSet<>());
                        }

                        // -------------------------------------------------
                        // Migrate legacy role
                        // -------------------------------------------------

                        String legacyRole = user.getRole();

                        if (legacyRole != null &&
                                        !legacyRole.isBlank()) {

                                roleRepository
                                                .findByName(
                                                                legacyRole
                                                                                .trim()
                                                                                .toUpperCase())
                                                .ifPresent(
                                                                role -> user.getRoles()
                                                                                .add(role));
                        }

                        // -------------------------------------------------
                        // Ensure admin is ADMIN
                        // -------------------------------------------------

                        if ("admin".equalsIgnoreCase(
                                        user.getUsername())) {

                                Role adminRole = roleRepository
                                                .findByName(
                                                                "ADMIN")
                                                .orElseThrow(
                                                                () -> new IllegalStateException(
                                                                                "ADMIN role was not found."));

                                user.getRoles().add(
                                                adminRole);

                                /*
                                 * Keep the legacy field synchronized
                                 * during the migration period.
                                 */

                                user.setRole(
                                                "ADMIN");
                        }

                        userRepository.save(
                                        user);
                }

                // =================================================
                // GUARANTEE ADMIN ACCOUNT EXISTS
                // =================================================

                if (!userRepository
                                .existsByUsername("admin")) {

                        Role adminRole = roleRepository
                                        .findByName(
                                                        "ADMIN")
                                        .orElseThrow(
                                                        () -> new IllegalStateException(
                                                                        "ADMIN role was not found."));

                        User admin = new User(
                                        "admin",
                                        passwordEncoder.encode(
                                                        "admin123"),
                                        "HMS Administrator",
                                        "ADMIN");

                        admin.setEnabled(
                                        true);

                        admin.setTenant(defaultTenant);

                        admin.setRoles(
                                        new HashSet<>(
                                                        Set.of(
                                                                        adminRole)));

                        userRepository.save(
                                        admin);

                        System.out.println(
                                        "=================================================");

                        System.out.println(
                                        "HMS ADMIN USER CREATED");

                        System.out.println(
                                        "Username: admin");

                        System.out.println(
                                        "Password: admin123");

                        System.out.println(
                                        "Role: ADMIN");

                        System.out.println(
                                        "=================================================");
                }
        }

        // =====================================================
        // CREATE RBAC TEST USERS
        // =====================================================

        private void createRbacTestUsers(
                        UserRepository userRepository,
                        RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder,
                        Tenant defaultTenant) {

                System.out.println(
                                "=================================================");

                System.out.println(
                                "CREATING / VERIFYING RBAC TEST USERS");

                System.out.println(
                                "=================================================");

                // -------------------------------------------------
                // DOCTOR
                // -------------------------------------------------

                createTestUser(
                                userRepository,
                                roleRepository,
                                passwordEncoder,
                                "test_doctor",
                                "doctor123",
                                "RBAC Test Doctor",
                                "DOCTOR",
                                defaultTenant);

                // -------------------------------------------------
                // NURSE
                // -------------------------------------------------

                createTestUser(
                                userRepository,
                                roleRepository,
                                passwordEncoder,
                                "test_nurse",
                                "nurse123",
                                "RBAC Test Nurse",
                                "NURSE",
                                defaultTenant);

                // -------------------------------------------------
                // RECEPTIONIST
                // -------------------------------------------------

                createTestUser(
                                userRepository,
                                roleRepository,
                                passwordEncoder,
                                "test_receptionist",
                                "receptionist123",
                                "RBAC Test Receptionist",
                                "RECEPTIONIST",
                                defaultTenant);

                // -------------------------------------------------
                // PHARMACIST
                // -------------------------------------------------

                createTestUser(
                                userRepository,
                                roleRepository,
                                passwordEncoder,
                                "test_pharmacist",
                                "pharmacist123",
                                "RBAC Test Pharmacist",
                                "PHARMACIST",
                                defaultTenant);

                // -------------------------------------------------
                // LABORATORY TECHNICIAN
                // -------------------------------------------------

                createTestUser(
                                userRepository,
                                roleRepository,
                                passwordEncoder,
                                "test_labtech",
                                "labtech123",
                                "RBAC Test Laboratory Technician",
                                "LABORATORY_TECHNICIAN",
                                defaultTenant);

                // -------------------------------------------------
                // ACCOUNTANT
                // -------------------------------------------------

                createTestUser(
                                userRepository,
                                roleRepository,
                                passwordEncoder,
                                "test_accountant",
                                "accountant123",
                                "RBAC Test Accountant",
                                "ACCOUNTANT",
                                defaultTenant);

                // -------------------------------------------------
                // RECORDS OFFICER
                // -------------------------------------------------

                createTestUser(
                                userRepository,
                                roleRepository,
                                passwordEncoder,
                                "test_records",
                                "records123",
                                "RBAC Test Records Officer",
                                "RECORDS_OFFICER",
                                defaultTenant);

                // -------------------------------------------------
                // HOSPITAL MANAGER
                // -------------------------------------------------

                createTestUser(
                                userRepository,
                                roleRepository,
                                passwordEncoder,
                                "test_manager",
                                "manager123",
                                "RBAC Test Hospital Manager",
                                "HOSPITAL_MANAGER",
                                defaultTenant);

                System.out.println(
                                "=================================================");

                System.out.println(
                                "RBAC TEST USERS READY");

                System.out.println(
                                "=================================================");
        }

        // =====================================================
        // CREATE / VERIFY SINGLE TEST USER
        // =====================================================

        private void createTestUser(
                        UserRepository userRepository,
                        RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder,
                        String username,
                        String password,
                        String fullName,
                        String roleName,
                        Tenant defaultTenant) {

                Role role = roleRepository
                                .findByName(
                                                roleName)
                                .orElseThrow(
                                                () -> new IllegalStateException(
                                                                "Role not found: "
                                                                                + roleName));

                User user = userRepository
                                .findByUsername(
                                                username)
                                .orElse(null);

                // =================================================
                // CREATE USER IF NOT FOUND
                // =================================================

                if (user == null) {

                        user = new User(
                                        username,
                                        passwordEncoder.encode(
                                                        password),
                                        fullName,
                                        roleName);

                        user.setEnabled(
                                        true);

                        user.setTenant(defaultTenant);

                        user.setRoles(
                                        new HashSet<>(
                                                        Set.of(
                                                                        role)));

                        userRepository.save(
                                        user);

                        System.out.println(
                                        "CREATED TEST USER: "
                                                        + username
                                                        + " -> "
                                                        + roleName);

                        return;
                }

                // =================================================
                // USER ALREADY EXISTS
                // =================================================

                if (user.getTenant() == null) {
                        user.setTenant(defaultTenant);
                }

                if (user.getRoles() == null) {

                        user.setRoles(
                                        new HashSet<>());
                }

                // =================================================
                // ENSURE CORRECT ROLE
                // =================================================

                user.getRoles().add(
                                role);

                // =================================================
                // KEEP LEGACY ROLE SYNCHRONIZED
                // =================================================

                user.setRole(
                                roleName);

                // =================================================
                // ENSURE ACCOUNT IS ENABLED
                // =================================================

                user.setEnabled(
                                true);

                /*
                 * IMPORTANT:
                 *
                 * We deliberately do NOT change the password
                 * when the test user already exists.
                 *
                 * This prevents an existing test account from
                 * having its password unexpectedly overwritten.
                 */

                userRepository.save(
                                user);

                System.out.println(
                                "VERIFIED TEST USER: "
                                                + username
                                                + " -> "
                                                + roleName);
        }

        // =====================================================
        // ENSURE PLATFORM SUPER ADMIN
        // =====================================================

        private void ensureSuperAdmin(
                        UserRepository userRepository,
                        RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder) {

                Role superAdminRole = roleRepository
                                .findByName("SUPER_ADMIN")
                                .orElseThrow(
                                                () -> new IllegalStateException(
                                                                "SUPER_ADMIN role was not found."));

                User superAdmin = userRepository
                                .findByUsername("superadmin")
                                .orElse(null);

                // =================================================
                // CREATE IF MISSING
                // =================================================

                if (superAdmin == null) {

                        superAdmin = new User(
                                        "superadmin",
                                        passwordEncoder.encode("superadmin123"),
                                        "Olives Tech Platform Administrator",
                                        "SUPER_ADMIN");

                        superAdmin.setEnabled(true);

                        /*
                         * IMPORTANT:
                         *
                         * SUPER_ADMIN is a platform-level account.
                         * It does NOT belong to a clinic/hospital/pharmacy.
                         */
                        superAdmin.setTenant(null);

                        superAdmin.setRoles(
                                        new HashSet<>(
                                                        Set.of(superAdminRole)));

                        userRepository.save(superAdmin);

                        System.out.println(
                                        "=================================================");

                        System.out.println(
                                        "PLATFORM SUPER ADMIN CREATED");

                        System.out.println(
                                        "Username: superadmin");

                        System.out.println(
                                        "Password: superadmin123");

                        System.out.println(
                                        "Tenant: PLATFORM");

                        System.out.println(
                                        "=================================================");

                        return;
                }

                // =================================================
                // VERIFY EXISTING SUPER ADMIN
                // =================================================

                if (superAdmin.getRoles() == null) {
                        superAdmin.setRoles(
                                        new HashSet<>());
                }

                superAdmin.getRoles().add(
                                superAdminRole);

                superAdmin.setRole(
                                "SUPER_ADMIN");

                superAdmin.setEnabled(
                                true);

                /*
                 * Keep platform account tenant-free.
                 */
                superAdmin.setTenant(null);

                userRepository.save(
                                superAdmin);

                System.out.println(
                                "VERIFIED PLATFORM SUPER ADMIN");
        }

}