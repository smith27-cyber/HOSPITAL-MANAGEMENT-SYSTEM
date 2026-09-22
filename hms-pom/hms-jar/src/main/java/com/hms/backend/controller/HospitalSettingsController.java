// =====================================================
// HOSPITAL SETTINGS CONTROLLER
// File:
// src/main/java/com/hms/backend/controller/HospitalSettingsController.java
// =====================================================

package com.hms.backend.controller;

import com.hms.backend.entity.HospitalSettings;
import com.hms.backend.service.HospitalSettingsService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/settings/hospital")
public class HospitalSettingsController {


    // =====================================================
    // SERVICE
    // =====================================================

    private final HospitalSettingsService service;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public HospitalSettingsController(
        HospitalSettingsService service
    ) {

        this.service =
            service;

    }


    // =====================================================
    // GET HOSPITAL SETTINGS
    // =====================================================

    @GetMapping
    @PreAuthorize(
        "hasAuthority('SETTINGS_HOSPITAL_VIEW')"
    )
    public ResponseEntity<HospitalSettings>
        getSettings() {

        return ResponseEntity.ok(
            service.getSettings()
        );

    }


    // =====================================================
    // UPDATE HOSPITAL SETTINGS
    // =====================================================

    @PutMapping
    @PreAuthorize(
        "hasAuthority('SETTINGS_HOSPITAL_UPDATE')"
    )
    public ResponseEntity<HospitalSettings>
        updateSettings(
            @RequestBody HospitalSettings settings
        ) {

        return ResponseEntity.ok(
            service.updateSettings(
                settings
            )
        );

    }


    // =====================================================
    // RESET HOSPITAL SETTINGS
    // =====================================================

    @PostMapping("/reset")
    @PreAuthorize(
        "hasAuthority('SETTINGS_HOSPITAL_UPDATE')"
    )
    public ResponseEntity<HospitalSettings>
        resetSettings() {

        return ResponseEntity
            .status(HttpStatus.OK)
            .body(
                service.resetSettings()
            );

    }

}