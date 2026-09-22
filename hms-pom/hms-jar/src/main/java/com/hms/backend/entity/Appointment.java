package com.hms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @Column(length = 36, nullable = false)
    private String id;


    // =====================================================
    // PATIENT
    // =====================================================

    @Column(nullable = false, length = 36)
    private String patientId;

    @Column(nullable = false, length = 200)
    private String patientName;


    // =====================================================
    // DOCTOR
    // =====================================================

    @Column(nullable = false, length = 36)
    private String doctorId;

    @Column(nullable = false, length = 200)
    private String doctorName;


    // =====================================================
    // DEPARTMENT
    // =====================================================

    @Column(nullable = false, length = 100)
    private String department;


    // =====================================================
    // APPOINTMENT DATE
    // =====================================================

    @Column(nullable = false)
    private LocalDate appointmentDate;


    // =====================================================
    // APPOINTMENT TIME
    // =====================================================

    @Column(nullable = false)
    private LocalTime appointmentTime;


    // =====================================================
    // TYPE
    // =====================================================

    @Column(nullable = false, length = 50)
    private String type;


    // =====================================================
    // REASON
    // =====================================================

    @Column(nullable = false, length = 500)
    private String reason;


    // =====================================================
    // STATUS
    // =====================================================

    @Column(nullable = false, length = 30)
    private String status;


    // =====================================================
    // NOTES
    // =====================================================

    @Column(length = 1000)
    private String notes;


    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Appointment() {
    }


    // =====================================================
    // PRE-PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        if (status == null || status.isBlank()) {
            status = "Scheduled";
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
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


    // =====================================================
    // GET CREATED AT
    // =====================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // =====================================================
// SET CREATED AT
// =====================================================

public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
}
}