package com.hms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @Column(length = 36, nullable = false)
    private String id;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 20)
    private String dateOfBirth;

    @Column(nullable = false, length = 20)
    private String gender;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(length = 255)
    private String address;

    @Column(length = 50, unique = true)
    private String nationalId;

    @Column(length = 100)
    private String emergencyContactName;

    @Column(length = 30)
    private String emergencyContactPhone;

    @Column(length = 20)
    private String bloodGroup;

    @Column(length = 100)
    private String department;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Patient() {
    }


    // =====================================================
    // PRE-PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        if (status == null || status.isBlank()) {
            status = "Active";
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
    // FIRST NAME
    // =====================================================

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }


    // =====================================================
    // LAST NAME
    // =====================================================

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }


    // =====================================================
    // DATE OF BIRTH
    // =====================================================

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }


    // =====================================================
    // GENDER
    // =====================================================

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }


    // =====================================================
    // PHONE
    // =====================================================

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }


    // =====================================================
    // EMAIL
    // =====================================================

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    // =====================================================
    // ADDRESS
    // =====================================================

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }


    // =====================================================
    // NATIONAL ID
    // =====================================================

    public String getNationalId() {
        return nationalId;
    }

    public void setNationalId(String nationalId) {
        this.nationalId = nationalId;
    }


    // =====================================================
    // EMERGENCY CONTACT NAME
    // =====================================================

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(
            String emergencyContactName
    ) {
        this.emergencyContactName = emergencyContactName;
    }


    // =====================================================
    // EMERGENCY CONTACT PHONE
    // =====================================================

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(
            String emergencyContactPhone
    ) {
        this.emergencyContactPhone = emergencyContactPhone;
    }


    // =====================================================
    // BLOOD GROUP
    // =====================================================

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }


    // =====================================================
    // DEPARTMENT
    // =====================================================

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }


    // =====================================================
    // STATUS
    // =====================================================

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    // =====================================================
    // CREATED AT
    // =====================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}