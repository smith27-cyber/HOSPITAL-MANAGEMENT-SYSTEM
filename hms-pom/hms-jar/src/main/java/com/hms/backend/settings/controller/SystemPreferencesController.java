package com.hms.backend.settings.controller;

import com.hms.backend.settings.entity.SystemPreferences;
import com.hms.backend.settings.service.SystemPreferencesService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/system")
public class SystemPreferencesController {

    private final SystemPreferencesService systemPreferencesService;

    public SystemPreferencesController(
        SystemPreferencesService systemPreferencesService
    ) {
        this.systemPreferencesService = systemPreferencesService;
    }

    // =====================================================
    // GET CURRENT TENANT PREFERENCES
    // =====================================================

    @GetMapping
    public ResponseEntity<SystemPreferences> getPreferences() {

        return ResponseEntity.ok(
            systemPreferencesService.getPreferences()
        );
    }

    // =====================================================
    // UPDATE CURRENT TENANT PREFERENCES
    // =====================================================

    @PutMapping
    public ResponseEntity<SystemPreferences> updatePreferences(
        @RequestBody SystemPreferences preferences
    ) {

        return ResponseEntity.ok(
            systemPreferencesService.updatePreferences(
                preferences
            )
        );
    }

    // =====================================================
    // RESET CURRENT TENANT PREFERENCES
    // =====================================================

    @PostMapping("/reset")
    public ResponseEntity<SystemPreferences> resetPreferences() {

        return ResponseEntity.ok(
            systemPreferencesService.resetPreferences()
        );
    }
}