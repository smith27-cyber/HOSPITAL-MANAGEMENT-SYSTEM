// =====================================================
// HOSPITAL SETTINGS SERVICE IMPLEMENTATION
// File:
// src/main/java/com/hms/backend/service/impl/HospitalSettingsServiceImpl.java
// =====================================================

package com.hms.backend.service.impl;

import com.hms.backend.entity.HospitalSettings;
import com.hms.backend.repository.HospitalSettingsRepository;
import com.hms.backend.service.HospitalSettingsService;
import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class HospitalSettingsServiceImpl
        implements HospitalSettingsService {

    private final HospitalSettingsRepository repository;

    private final TenantRepository tenantRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public HospitalSettingsServiceImpl(
            HospitalSettingsRepository repository,
            TenantRepository tenantRepository) {

        this.repository =
                repository;

        this.tenantRepository =
                tenantRepository;
    }


   // =====================================================
// GET SETTINGS
// =====================================================

@Override
@Transactional(readOnly = true)
public HospitalSettings getSettings() {

    Long tenantId =
            getCurrentTenantId();

    Tenant tenant =
            getCurrentTenant();

    System.out.println(
            "================================================="
    );

    System.out.println(
            "HOSPITAL SETTINGS GET"
    );

    System.out.println(
            "Tenant ID: " + tenantId
    );

    System.out.println(
            "Tenant Code: " + tenant.getCode()
    );

    System.out.println(
            "Tenant Name: " + tenant.getName()
    );

    HospitalSettings settings =
            repository
                    .findFirstByTenant_IdOrderByIdAsc(
                            tenantId
                    )
                    .orElseGet(
                            () ->
                                    createDefaultSettings(
                                            tenant
                                    )
                    );

    System.out.println(
            "Settings ID: " + settings.getId()
    );

    System.out.println(
            "Hospital Name: "
                    + settings.getHospitalName()
    );

    System.out.println(
            "Settings Tenant ID: "
                    + (
                        settings.getTenant() != null
                            ? settings.getTenant().getId()
                            : null
                    )
    );

    System.out.println(
            "================================================="
    );

    return settings;
}

    // =====================================================
    // UPDATE SETTINGS
    // =====================================================

    @Override
    public HospitalSettings updateSettings(
            HospitalSettings settings) {

        if (settings == null) {

            throw new IllegalArgumentException(
                    "Organization settings are required."
            );
        }

        Long tenantId =
                getCurrentTenantId();

        Tenant tenant =
                getCurrentTenant();


        // =================================================
        // FIND EXISTING SETTINGS FOR CURRENT TENANT
        // =================================================

        HospitalSettings existing =
                repository
                        .findFirstByTenant_IdOrderByIdAsc(
                                tenantId
                        )
                        .orElseGet(
                                () ->
                                        createDefaultSettings(
                                                tenant
                                        )
                        );


        // =================================================
        // FORCE CURRENT TENANT OWNERSHIP
        // =================================================

        existing.setTenant(
                tenant
        );


        // =================================================
        // UPDATE ORGANIZATION NAME
        // =================================================

        if (settings.getHospitalName() != null) {

            existing.setHospitalName(
                    settings
                            .getHospitalName()
                            .trim()
            );
        }


        // =================================================
        // REGISTRATION NUMBER
        // =================================================

        if (settings.getRegistrationNumber() != null) {

            existing.setRegistrationNumber(
                    settings
                            .getRegistrationNumber()
                            .trim()
            );
        }


        // =================================================
        // PHONE
        // =================================================

        if (settings.getPhone() != null) {

            existing.setPhone(
                    settings
                            .getPhone()
                            .trim()
            );
        }


        // =================================================
        // EMAIL
        // =================================================

        if (settings.getEmail() != null) {

            existing.setEmail(
                    settings
                            .getEmail()
                            .trim()
                            .toLowerCase()
            );
        }


        // =================================================
        // ADDRESS
        // =================================================

        if (settings.getAddress() != null) {

            existing.setAddress(
                    settings
                            .getAddress()
                            .trim()
            );
        }


        // =================================================
        // CITY
        // =================================================

        if (settings.getCity() != null) {

            existing.setCity(
                    settings
                            .getCity()
                            .trim()
            );
        }


        // =================================================
        // COUNTRY
        // =================================================

        if (settings.getCountry() != null &&
                !settings.getCountry().isBlank()) {

            existing.setCountry(
                    settings
                            .getCountry()
                            .trim()
            );

        } else {

            existing.setCountry(
                    "Uganda"
            );
        }


        // =================================================
        // WEBSITE
        // =================================================

        if (settings.getWebsite() != null) {

            existing.setWebsite(
                    settings
                            .getWebsite()
                            .trim()
            );
        }


        // =================================================
        // LOGO URL
        // =================================================

        if (settings.getLogoUrl() != null) {

            existing.setLogoUrl(
                    settings
                            .getLogoUrl()
                            .trim()
            );
        }


        // =================================================
        // VALIDATE ORGANIZATION NAME
        // =================================================

        if (existing.getHospitalName() == null ||
                existing.getHospitalName().isBlank()) {

            throw new IllegalArgumentException(
                    "Organization name is required."
            );
        }


        // =================================================
        // SAVE
        // =================================================

        return repository.save(
                existing
        );
    }


    // =====================================================
    // RESET SETTINGS
    // =====================================================

    @Override
    public HospitalSettings resetSettings() {

        Long tenantId =
                getCurrentTenantId();

        Tenant tenant =
                getCurrentTenant();


        HospitalSettings settings =
                repository
                        .findFirstByTenant_IdOrderByIdAsc(
                                tenantId
                        )
                        .orElseGet(
                                () ->
                                        createDefaultSettings(
                                                tenant
                                        )
                        );


        // =================================================
        // KEEP CURRENT TENANT
        // =================================================

        settings.setTenant(
                tenant
        );


        // =================================================
        // DEFAULT ORGANIZATION NAME
        // =================================================

        String defaultName =
                tenant.getName();

        if (defaultName == null ||
                defaultName.isBlank()) {

            defaultName =
                    "Hospital Management System";
        }


        // =================================================
        // RESET FIELDS
        // =================================================

        settings.setHospitalName(
                defaultName
        );

        settings.setRegistrationNumber(
                null
        );

        settings.setPhone(
                null
        );

        settings.setEmail(
                null
        );

        settings.setAddress(
                null
        );

        settings.setCity(
                null
        );

        settings.setCountry(
                "Uganda"
        );

        settings.setWebsite(
                null
        );

        settings.setLogoUrl(
                null
        );


        // =================================================
        // SAVE
        // =================================================

        return repository.save(
                settings
        );
    }


    // =====================================================
    // CREATE DEFAULT SETTINGS
    // =====================================================

    private HospitalSettings createDefaultSettings(
            Tenant tenant) {

        if (tenant == null) {

            throw new IllegalStateException(
                    "Current tenant could not be resolved."
            );
        }


        HospitalSettings settings =
                new HospitalSettings();


        // =================================================
        // ASSOCIATE WITH CURRENT TENANT
        // =================================================

        settings.setTenant(
                tenant
        );


        // =================================================
        // DEFAULT ORGANIZATION NAME
        // =================================================

        String defaultName =
                tenant.getName();

        if (defaultName == null ||
                defaultName.isBlank()) {

            defaultName =
                    "Hospital Management System";
        }

        settings.setHospitalName(
                defaultName
        );


        // =================================================
        // DEFAULT COUNTRY
        // =================================================

        settings.setCountry(
                "Uganda"
        );


        // =================================================
        // SAVE
        // =================================================

        return repository.save(
                settings
        );
    }


    // =====================================================
    // CURRENT TENANT ID
    // =====================================================

    private Long getCurrentTenantId() {

        return TenantContext.requireTenantId();
    }


    // =====================================================
    // CURRENT TENANT
    // =====================================================

    private Tenant getCurrentTenant() {

        Long tenantId =
                getCurrentTenantId();

        return tenantRepository
                .findById(tenantId)
                .orElseThrow(
                        () ->
                                new IllegalStateException(
                                        "Current tenant not found: "
                                                + tenantId
                                )
                );
    }
}