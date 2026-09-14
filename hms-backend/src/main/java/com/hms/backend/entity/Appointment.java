package com.hms.backend.entity;

import com.hms.backend.tenant.entity.Tenant;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
        name = "appointments",
        indexes = {
                @Index(
                        name = "idx_appointments_tenant_id",
                        columnList = "tenant_id"
                ),
                @Index(
                        name = "idx_appointments_tenant_date",
                        columnList = "tenant_id, appointment_date"
                ),
                @Index(
                        name = "idx_appointments_tenant_status",
                        columnList = "tenant_id, status"
                ),
                @Index(
                        name = "idx_appointments_tenant_patient",
                        columnList = "tenant_id, patient_id"
                ),
                @Index(
                        name = "idx_appointments_tenant_doctor",
                        columnList = "tenant_id, doctor_id"
                )
        }
)
public class Appointment {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    // =====================================================
    // TENANT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "tenant_id",
            nullable = false
    )
    private Tenant tenant;

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
    // GETTERS / SETTERS
    // =====================================================

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public LocalTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}