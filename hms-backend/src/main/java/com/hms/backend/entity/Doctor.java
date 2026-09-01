
package com.hms.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "doctors",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_doctor_national_id",
                        columnNames = "national_id"
                ),
                @UniqueConstraint(
                        name = "uk_doctor_license_number",
                        columnNames = "license_number"
                ),
                @UniqueConstraint(
                        name = "uk_doctor_email",
                        columnNames = "email"
                )
        }
)
public class Doctor {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @Column(
            name = "id",
            length = 20,
            nullable = false
    )
    private String id;


    // =====================================================
    // FIRST NAME
    // =====================================================

    @Column(
            name = "first_name",
            nullable = false,
            length = 100
    )
    private String firstName;


    // =====================================================
    // LAST NAME
    // =====================================================

    @Column(
            name = "last_name",
            nullable = false,
            length = 100
    )
    private String lastName;


    // =====================================================
    // GENDER
    // =====================================================

    @Column(
            name = "gender",
            nullable = false,
            length = 20
    )
    private String gender;


    // =====================================================
    // DATE OF BIRTH
    // =====================================================

    @Column(
            name = "date_of_birth",
            nullable = false
    )
    private LocalDate dateOfBirth;


    // =====================================================
    // PHONE
    // =====================================================

    @Column(
            name = "phone",
            nullable = false,
            length = 30
    )
    private String phone;


    // =====================================================
    // EMAIL
    // =====================================================

    @Column(
            name = "email",
            nullable = false,
            length = 150,
            unique = true
    )
    private String email;


    // =====================================================
    // NATIONAL ID
    // =====================================================

    @Column(
            name = "national_id",
            length = 50,
            unique = true
    )
    private String nationalId;


    // =====================================================
    // SPECIALIZATION
    // =====================================================

    @Column(
            name = "specialization",
            nullable = false,
            length = 150
    )
    private String specialization;


    // =====================================================
    // DEPARTMENT
    // =====================================================

    @Column(
            name = "department",
            nullable = false,
            length = 150
    )
    private String department;


    // =====================================================
    // LICENSE NUMBER
    // =====================================================

    @Column(
            name = "license_number",
            nullable = false,
            length = 100,
            unique = true
    )
    private String licenseNumber;


    // =====================================================
    // STATUS
    // =====================================================

    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    private String status = "Active";


    // =====================================================
    // CONSULTATION FEE
    // =====================================================
    // BigDecimal is used for financial values.
    // Do NOT use scale with Double or Float.
    // =====================================================

    @Column(
            name = "consultation_fee"
    )
    private BigDecimal consultationFee;


    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Doctor() {
    }


    // =====================================================
    // PRE-PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        if (
                status == null ||
                status.isBlank()
        ) {
            status = "Active";
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }


    // =====================================================
    // ID
    // =====================================================

    public String getId() {
        return id;
    }

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
    // GENDER
    // =====================================================

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }


    // =====================================================
    // DATE OF BIRTH
    // =====================================================

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
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
    // NATIONAL ID
    // =====================================================

    public String getNationalId() {
        return nationalId;
    }

    public void setNationalId(String nationalId) {
        this.nationalId = nationalId;
    }


    // =====================================================
    // SPECIALIZATION
    // =====================================================

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
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
    // LICENSE NUMBER
    // =====================================================

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
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
    // CONSULTATION FEE
    // =====================================================

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(
            BigDecimal consultationFee
    ) {
        this.consultationFee = consultationFee;
    }


    // =====================================================
    // CREATED AT
    // =====================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }
}

