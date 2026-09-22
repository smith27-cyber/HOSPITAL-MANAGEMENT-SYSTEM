package com.hms.backend.settings.service.impl;

import com.hms.backend.settings.entity.SystemPreferences;
import com.hms.backend.settings.repository.SystemPreferencesRepository;
import com.hms.backend.settings.service.SystemPreferencesService;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.repository.TenantRepository;
import com.hms.backend.tenant.context.TenantContext;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SystemPreferencesServiceImpl
        implements SystemPreferencesService {

    private final SystemPreferencesRepository
        systemPreferencesRepository;

    private final TenantRepository tenantRepository;

    public SystemPreferencesServiceImpl(
        SystemPreferencesRepository systemPreferencesRepository,
        TenantRepository tenantRepository
    ) {
        this.systemPreferencesRepository =
            systemPreferencesRepository;

        this.tenantRepository =
            tenantRepository;
    }

    // =====================================================
    // GET
    // =====================================================

   @Override
public SystemPreferences getPreferences() {

    Long tenantId =
        TenantContext.requireTenantId();

    return systemPreferencesRepository
        .findFirstByTenant_IdOrderByIdAsc(tenantId)
        .orElseGet(() ->
            createDefaultPreferences(tenantId)
        );
}

    // =====================================================
    // UPDATE
    // =====================================================

    @Override
    public SystemPreferences updatePreferences(
        SystemPreferences incoming
    ) {

        Long tenantId =
            TenantContext.requireTenantId();

        SystemPreferences existing =
            systemPreferencesRepository
                .findFirstByTenant_IdOrderByIdAsc(tenantId)
                .orElseGet(() ->
                    createDefaultPreferences(tenantId)
                );

        // -------------------------------------------------
        // IMPORTANT:
        // Never trust tenant information from the request.
        // The tenant always comes from TenantContext.
        // -------------------------------------------------

        existing.setTheme(
            incoming.getTheme()
        );

        existing.setDateFormat(
            incoming.getDateFormat()
        );

        existing.setTimeFormat(
            incoming.getTimeFormat()
        );

        existing.setCurrency(
            incoming.getCurrency()
        );

        existing.setCurrencySymbol(
            incoming.getCurrencySymbol()
        );

        existing.setLanguage(
            incoming.getLanguage()
        );

        existing.setTimezone(
            incoming.getTimezone()
        );

        existing.setEnableNotifications(
            incoming.isEnableNotifications()
        );

        existing.setEnableEmailNotifications(
            incoming.isEnableEmailNotifications()
        );

        existing.setEnableSmsNotifications(
            incoming.isEnableSmsNotifications()
        );

        // -------------------------------------------------
        // Tenant remains the authenticated tenant
        // -------------------------------------------------

        Tenant tenant =
            tenantRepository
                .findById(tenantId)
                .orElseThrow(() ->
                    new IllegalStateException(
                        "Current tenant could not be found."
                    )
                );

        existing.setTenant(tenant);

        return systemPreferencesRepository.save(
            existing
        );
    }

    // =====================================================
    // RESET
    // =====================================================

    @Override
    public SystemPreferences resetPreferences() {

        Long tenantId =
            TenantContext.requireTenantId();

        SystemPreferences preferences =
            systemPreferencesRepository
                .findFirstByTenant_IdOrderByIdAsc(tenantId)
                .orElseGet(() ->
                    createDefaultPreferences(tenantId)
                );

        // -------------------------------------------------
        // DEFAULT VALUES
        // -------------------------------------------------

        preferences.setTheme("System");

        preferences.setDateFormat(
            "DD/MM/YYYY"
        );

        preferences.setTimeFormat(
            "24-hour"
        );

        preferences.setCurrency(
            "UGX"
        );

        preferences.setCurrencySymbol(
            "UGX"
        );

        preferences.setLanguage(
            "English"
        );

        preferences.setTimezone(
            "Africa/Kampala"
        );

        preferences.setEnableNotifications(
            true
        );

        preferences.setEnableEmailNotifications(
            true
        );

        preferences.setEnableSmsNotifications(
            false
        );

        return systemPreferencesRepository.save(
            preferences
        );
    }

    // =====================================================
    // CREATE DEFAULT PREFERENCES
    // =====================================================

    private SystemPreferences createDefaultPreferences(
        Long tenantId
    ) {

        Tenant tenant =
            tenantRepository
                .findById(tenantId)
                .orElseThrow(() ->
                    new IllegalStateException(
                        "Current tenant could not be found."
                    )
                );

        SystemPreferences preferences =
            new SystemPreferences();

        preferences.setTenant(tenant);

        preferences.setTheme("System");

        preferences.setDateFormat(
            "DD/MM/YYYY"
        );

        preferences.setTimeFormat(
            "24-hour"
        );

        preferences.setCurrency(
            "UGX"
        );

        preferences.setCurrencySymbol(
            "UGX"
        );

        preferences.setLanguage(
            "English"
        );

        preferences.setTimezone(
            "Africa/Kampala"
        );

        preferences.setEnableNotifications(
            true
        );

        preferences.setEnableEmailNotifications(
            true
        );

        preferences.setEnableSmsNotifications(
            false
        );

        return systemPreferencesRepository.save(
            preferences
        );
    }
}