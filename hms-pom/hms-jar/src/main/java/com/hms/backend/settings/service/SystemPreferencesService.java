package com.hms.backend.settings.service;

import com.hms.backend.settings.entity.SystemPreferences;

public interface SystemPreferencesService {

    /**
     * Get the system preferences for the current tenant.
     * Creates default preferences if none exist.
     */
    SystemPreferences getPreferences();

    /**
     * Update the system preferences for the current tenant.
     */
    SystemPreferences updatePreferences(
        SystemPreferences preferences
    );

    /**
     * Reset the current tenant's preferences to defaults.
     */
    SystemPreferences resetPreferences();
}