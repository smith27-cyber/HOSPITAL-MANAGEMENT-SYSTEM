
package com.hms.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;


// =====================================================
// APPOINTMENT REQUEST DTO
// File:
// src/main/java/com/hms/backend/dto/AppointmentRequest.java
// =====================================================

public class AppointmentRequest {

    // =====================================================
    // APPOINTMENT ID
    // =====================================================

    private String id;


    // =====================================================
    // PATIENT
    // =====================================================

    private String patientId;

    private String patientName;


    // =====================================================
    // DOCTOR
    // =====================================================

    private String doctorId;

    private String doctorName;


    // =====================================================
    // DEPARTMENT
    // =====================================================

    private String department;


    // =====================================================
    // APPOINTMENT DATE
    // =====================================================

    private LocalDate appointmentDate;


    // =====================================================
    // APPOINTMENT TIME
    // =====================================================

    private LocalTime appointmentTime;


    // =====================================================
    // APPOINTMENT TYPE
    // =====================================================

    private String type;


    // =====================================================
    // REASON
    // =====================================================

    private String reason;


    // =====================================================
    // STATUS
    // =====================================================

    private String status;


    // =====================================================
    // NOTES
    // =====================================================

    private String notes;


    // =====================================================
    // DEFAULT CONSTRUCTOR
    // =====================================================

    public AppointmentRequest() {
    }


    // =====================================================
    // GET ID
    // =====================================================

    public String getId() {
        return id;
    }


    // =====================================================
    // SET ID
    // =====================================================

    public void setId(String id) {
        this.id = id;
    }


    // =====================================================
    // GET PATIENT ID
    // =====================================================

    public String getPatientId() {
        return patientId;
    }


    // =====================================================
    // SET PATIENT ID
    // =====================================================

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }


    // =====================================================
    // GET PATIENT NAME
    // =====================================================

    public String getPatientName() {
        return patientName;
    }


    // =====================================================
    // SET PATIENT NAME
    // =====================================================

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }


    // =====================================================
    // GET DOCTOR ID
    // =====================================================

    public String getDoctorId() {
        return doctorId;
    }


    // =====================================================
    // SET DOCTOR ID
    // =====================================================

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }


    // =====================================================
    // GET DOCTOR NAME
    // =====================================================

    public String getDoctorName() {
        return doctorName;
    }


    // =====================================================
    // SET DOCTOR NAME
    // =====================================================

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }


    // =====================================================
    // GET DEPARTMENT
    // =====================================================

    public String getDepartment() {
        return department;
    }


    // =====================================================
    // SET DEPARTMENT
    // =====================================================

    public void setDepartment(String department) {
        this.department = department;
    }


    // =====================================================
    // GET APPOINTMENT DATE
    // =====================================================

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }


    // =====================================================
    // SET APPOINTMENT DATE
    // =====================================================

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }


    // =====================================================
    // GET APPOINTMENT TIME
    // =====================================================

    public LocalTime getAppointmentTime() {
        return appointmentTime;
    }


    // =====================================================
    // SET APPOINTMENT TIME
    // =====================================================

    public void setAppointmentTime(LocalTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }


    // =====================================================
    // GET TYPE
    // =====================================================

    public String getType() {
        return type;
    }


    // =====================================================
    // SET TYPE
    // =====================================================

    public void setType(String type) {
        this.type = type;
    }


    // =====================================================
    // GET REASON
    // =====================================================

    public String getReason() {
        return reason;
    }


    // =====================================================
    // SET REASON
    // =====================================================

    public void setReason(String reason) {
        this.reason = reason;
    }


    // =====================================================
    // GET STATUS
    // =====================================================

    public String getStatus() {
        return status;
    }


    // =====================================================
    // SET STATUS
    // =====================================================

    public void setStatus(String status) {
        this.status = status;
    }


    // =====================================================
    // GET NOTES
    // =====================================================

    public String getNotes() {
        return notes;
    }


    // =====================================================
    // SET NOTES
    // =====================================================

    public void setNotes(String notes) {
        this.notes = notes;
    }

}

