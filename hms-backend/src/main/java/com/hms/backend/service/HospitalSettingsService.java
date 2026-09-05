package com.hms.backend.service;

import com.hms.backend.entity.HospitalSettings;

public interface HospitalSettingsService {

    HospitalSettings getSettings();

    HospitalSettings updateSettings(HospitalSettings settings);

    HospitalSettings resetSettings();
}