package com.hms.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
public class Department {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @Column(nullable = false, unique = true)
    private String id;


    // =====================================================
    // BASIC INFORMATION
    // =====================================================

    @Column(nullable = false)
    private String name;


    @Column(nullable = false, unique = true)
    private String code;


    @Column(length = 1000)
    private String description;


    // =====================================================
    // HEAD OF DEPARTMENT
    // =====================================================

    private String headOfDepartment;


    // =====================================================
    // CONTACT INFORMATION
    // =====================================================

    private String phone;

    private String email;


    // =====================================================
    // LOCATION
    // =====================================================

    private String location;


    // =====================================================
    // STATUS
    // =====================================================

    @Column(nullable = false)
    private String status;


    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(nullable = false)
    private LocalDateTime createdAt;


    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public Department() {
    }


    public Department(
            String id,
            String name,
            String code,
            String description,
            String headOfDepartment,
            String phone,
            String email,
            String location,
            String status,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.headOfDepartment = headOfDepartment;
        this.phone = phone;
        this.email = email;
        this.location = location;
        this.status = status;
        this.createdAt = createdAt;
    }


    // =====================================================
    // GETTERS AND SETTERS
    // =====================================================

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public String getHeadOfDepartment() {
        return headOfDepartment;
    }

    public void setHeadOfDepartment(String headOfDepartment) {
        this.headOfDepartment = headOfDepartment;
    }


    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}