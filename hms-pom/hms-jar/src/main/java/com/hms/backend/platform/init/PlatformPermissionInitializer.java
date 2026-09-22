package com.hms.backend.platform.init;

import com.hms.backend.entity.Permission;
import com.hms.backend.entity.Role;
import com.hms.backend.repository.PermissionRepository;
import com.hms.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Configuration
public class PlatformPermissionInitializer {
    @Bean
    @Order(110)
    CommandLineRunner initializePlatformPermissions(PermissionRepository permissionRepository, RoleRepository roleRepository) {
        return args -> {
            Map<String, String> defs = Map.of(
                "PLATFORM_MODULE_MANAGE", "Manage tenant modules and entitlements",
                "PLATFORM_PLAN_MANAGE", "Manage SaaS plans",
                "PLATFORM_SUBSCRIPTION_MANAGE", "Manage tenant subscriptions",
                "PLATFORM_REPORT_VIEW", "View platform reports",
                "PLATFORM_AUDIT_VIEW", "View platform audit logs"
            );
            Set<Permission> permissions = new HashSet<>();
            defs.forEach((code, description) -> permissions.add(permissionRepository.findByCode(code).orElseGet(() -> permissionRepository.save(new Permission(code, description)))));
            Role superAdmin = roleRepository.findByName("SUPER_ADMIN").orElseThrow(() -> new IllegalStateException("SUPER_ADMIN role not found"));
            superAdmin.getPermissions().addAll(permissions);
            roleRepository.save(superAdmin);
        };
    }
}
