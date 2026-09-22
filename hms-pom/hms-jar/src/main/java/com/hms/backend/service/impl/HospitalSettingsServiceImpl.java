// =====================================================
// HOSPITAL SETTINGS SERVICE IMPLEMENTATION
// File:
// src/main/java/com/hms/backend/service/impl/HospitalSettingsServiceImpl.java
// =====================================================

package com.hms.backend.service.impl;

import com.hms.backend.entity.HospitalSettings;
import com.hms.backend.repository.HospitalSettingsRepository;
import com.hms.backend.service.HospitalSettingsService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;


@Service
@Transactional
public class HospitalSettingsServiceImpl
        implements HospitalSettingsService {


    // =====================================================
    // EMAIL VALIDATION
    // =====================================================

    private static final Pattern EMAIL_PATTERN =
        Pattern.compile(
            "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
        );


    // =====================================================
    // REPOSITORY
    // =====================================================

    private final HospitalSettingsRepository repository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public HospitalSettingsServiceImpl(
        HospitalSettingsRepository repository
    ) {

        this.repository =
            repository;

    }


    // =====================================================
    // GET SETTINGS
    // =====================================================

    @Override
    @Transactional
    public HospitalSettings getSettings() {

        return repository
            .findFirstByOrderByIdAsc()
            .orElseGet(
                this::createDefaultSettings
            );

    }


    // =====================================================
    // UPDATE SETTINGS
    // =====================================================

    @Override
    @Transactional
    public HospitalSettings updateSettings(
        HospitalSettings settings
    ) {

        // -------------------------------------------------
        // Validate request
        // -------------------------------------------------

        if (settings == null) {

            throw new IllegalArgumentException(
                "Hospital settings cannot be null."
            );

        }


        // -------------------------------------------------
        // Hospital name
        // -------------------------------------------------

        String hospitalName =
            clean(
                settings.getHospitalName()
            );


        if (hospitalName == null) {

            throw new IllegalArgumentException(
                "Hospital name is required."
            );

        }


        if (hospitalName.length() > 200) {

            throw new IllegalArgumentException(
                "Hospital name cannot exceed 200 characters."
            );

        }


        // -------------------------------------------------
        // Email
        // -------------------------------------------------

        String email =
            clean(
                settings.getEmail()
            );


        if (
            email != null &&
            !EMAIL_PATTERN
                .matcher(email)
                .matches()
        ) {

            throw new IllegalArgumentException(
                "Please provide a valid email address."
            );

        }


        // -------------------------------------------------
        // Find existing settings
        // -------------------------------------------------

        HospitalSettings existing =
            repository
                .findFirstByOrderByIdAsc()
                .orElseGet(
                    this::createDefaultSettings
                );


        // -------------------------------------------------
        // Update hospital name
        // -------------------------------------------------

        existing.setHospitalName(
            hospitalName
        );


        // -------------------------------------------------
        // Registration number
        // -------------------------------------------------

        existing.setRegistrationNumber(
            clean(
                settings.getRegistrationNumber()
            )
        );


        // -------------------------------------------------
        // Phone
        // -------------------------------------------------

        existing.setPhone(
            clean(
                settings.getPhone()
            )
        );


        // -------------------------------------------------
        // Email
        // -------------------------------------------------

        existing.setEmail(
            email
        );


        // -------------------------------------------------
        // Address
        // -------------------------------------------------

        existing.setAddress(
            clean(
                settings.getAddress()
            )
        );


        // -------------------------------------------------
        // City
        // -------------------------------------------------

        existing.setCity(
            clean(
                settings.getCity()
            )
        );


        // -------------------------------------------------
        // Country
        // -------------------------------------------------

        String country =
            clean(
                settings.getCountry()
            );


        existing.setCountry(
            country != null
                ? country
                : "Uganda"
        );


        // -------------------------------------------------
        // Website
        // -------------------------------------------------

        existing.setWebsite(
            clean(
                settings.getWebsite()
            )
        );


        // -------------------------------------------------
        // Logo URL
        // -------------------------------------------------

        existing.setLogoUrl(
            clean(
                settings.getLogoUrl()
            )
        );


        // -------------------------------------------------
        // Save
        // -------------------------------------------------

        return repository.save(
            existing
        );

    }


    // =====================================================
    // RESET SETTINGS
    // =====================================================

    @Override
    @Transactional
    public HospitalSettings resetSettings() {

        HospitalSettings settings =
            repository
                .findFirstByOrderByIdAsc()
                .orElseGet(
                    this::createDefaultSettings
                );


        // -------------------------------------------------
        // Restore defaults
        // -------------------------------------------------

        settings.setHospitalName(
            "Hospital Management System"
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


        return repository.save(
            settings
        );

    }


    // =====================================================
    // CREATE DEFAULT SETTINGS
    // =====================================================

    private HospitalSettings createDefaultSettings() {

        HospitalSettings settings =
            new HospitalSettings();


        settings.setHospitalName(
            "Hospital Management System"
        );


        settings.setCountry(
            "Uganda"
        );


        return repository.save(
            settings
        );

    }


    // =====================================================
    // CLEAN STRING
    // =====================================================

    private String clean(
        String value
    ) {

        if (value == null) {

            return null;

        }


        String cleaned =
            value.trim();


        return cleaned.isEmpty()
            ? null
            : cleaned;

    }

}