
package com.hms.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * =====================================================
 * BILLING REQUEST DTO
 * =====================================================
 *
 * Used when creating or updating a billing invoice.
 */
public class BillingRequest {

    // =====================================================
    // PATIENT
    // =====================================================

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    private String patientNumber;


    // =====================================================
    // RESPONSIBLE STAFF
    // =====================================================

    private String doctorId;

    private String doctorName;

    private String departmentId;

    private String departmentName;


    // =====================================================
    // BILLING INFORMATION
    // =====================================================

    private String description;

    private LocalDate dueDate;

    private String notes;


    // =====================================================
    // ITEMS
    // =====================================================

    @Valid
    private List<BillingItemRequest> items =
            new ArrayList<>();


    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

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


    public String getPatientNumber() {
        return patientNumber;
    }

    public void setPatientNumber(String patientNumber) {
        this.patientNumber = patientNumber;
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


    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }


    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }


    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }


    public List<BillingItemRequest> getItems() {
        return items;
    }

    public void setItems(List<BillingItemRequest> items) {
        this.items = items;
    }
}

