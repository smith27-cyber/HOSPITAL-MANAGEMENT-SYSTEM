package com.hms.backend.service;

import com.hms.backend.entity.Doctor;
import java.util.List;

public interface DoctorService {
    List<Doctor> getAllDoctors();
    Doctor getDoctorById(String id);
    Doctor addDoctor(Doctor doctor);
    Doctor updateDoctor(String id, Doctor doctor);
    void deleteDoctor(String id);
    Doctor updateDoctorStatus(String id, String status);
}
