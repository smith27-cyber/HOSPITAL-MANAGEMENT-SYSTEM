package com.hms.backend.platform.filter;

import com.hms.backend.platform.entity.ModuleCode;
import com.hms.backend.platform.service.PlatformModuleService;
import com.hms.backend.tenant.context.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
public class ModuleAccessFilter extends OncePerRequestFilter {
    private final PlatformModuleService moduleService;

    private static final Map<String, ModuleCode> ROUTES = Map.ofEntries(
        Map.entry("/api/patients", ModuleCode.PATIENTS),
        Map.entry("/api/doctors", ModuleCode.DOCTORS),
        Map.entry("/api/departments", ModuleCode.DEPARTMENTS),
        Map.entry("/api/appointments", ModuleCode.APPOINTMENTS),
        Map.entry("/api/consultations", ModuleCode.CONSULTATIONS),
        Map.entry("/api/laboratory", ModuleCode.LABORATORY),
        Map.entry("/api/pharmacy", ModuleCode.PHARMACY),
        Map.entry("/api/admissions", ModuleCode.ADMISSIONS),
        Map.entry("/api/billing", ModuleCode.BILLING),
        Map.entry("/api/inventory", ModuleCode.INVENTORY),
        Map.entry("/api/reports", ModuleCode.REPORTS),
        Map.entry("/api/settings", ModuleCode.SETTINGS),
        Map.entry("/api/dashboard", ModuleCode.DASHBOARD)
    );

    public ModuleAccessFilter(PlatformModuleService moduleService) { this.moduleService = moduleService; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();

        if (path.startsWith("/api/auth/") || path.equals("/api/health") || path.startsWith("/api/platform/") || path.startsWith("/api/tenants") || path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs")) {
            chain.doFilter(request, response);
            return;
        }

        ModuleCode module = resolve(path);
        Long tenantId = TenantContext.getTenantId();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (module == null || tenantId == null || isSuperAdmin(auth)) {
            chain.doFilter(request, response);
            return;
        }

        if (!moduleService.isEnabled(tenantId, module)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"MODULE_NOT_ENABLED\",\"message\":\"The " + module.name() + " module is not enabled for this tenant.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private ModuleCode resolve(String path) {
        for (Map.Entry<String, ModuleCode> e : ROUTES.entrySet()) {
            if (path.equals(e.getKey()) || path.startsWith(e.getKey() + "/")) return e.getValue();
        }
        return null;
    }

    private boolean isSuperAdmin(Authentication auth) {
        return auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_SUPER_ADMIN".equals(a.getAuthority()));
    }
}
