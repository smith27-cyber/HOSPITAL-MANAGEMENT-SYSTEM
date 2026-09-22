// =====================================================
// HOSPITAL SETTINGS ENTITY
// File:
// src/main/java/com/hms/backend/entity/HospitalSettings.java
// =====================================================

package com.hms.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(
    name = "hospital_settings",
    indexes = {
        @Index(
            name = "idx_hospital_settings_name",
            columnList = "hospital_name"
        )
    }
)
public class HospitalSettings {


    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // HOSPITAL NAME
    // =====================================================

    @Column(
        name = "hospital_name",
        nullable = false,
        length = 200
    )
    private String hospitalName;


    // =====================================================
    // REGISTRATION NUMBER
    // =====================================================

    @Column(
        name = "registration_number",
        length = 100
    )
    private String registrationNumber;


    // =====================================================
    // PHONE
    // =====================================================

    @Column(
        name = "phone",
        length = 50
    )
    private String phone;


    // =====================================================
    // EMAIL
    // =====================================================

    @Column(
        name = "email",
        length = 150
    )
    private String email;


    // =====================================================
    // ADDRESS
    // =====================================================

    @Column(
        name = "address",
        length = 500
    )
    private String address;


    // =====================================================
    // CITY
    // =====================================================

    @Column(
        name = "city",
        length = 100
    )
    private String city;


    // =====================================================
    // COUNTRY
    // =====================================================

    @Column(
        name = "country",
        nullable = false,
        length = 100
    )
    private String country = "Uganda";


    // =====================================================
    // WEBSITE
    // =====================================================

    @Column(
        name = "website",
        length = 300
    )
    private String website;


    // =====================================================
    // LOGO URL
    // =====================================================

    @Column(
        name = "logo_url",
        length = 500
    )
    private String logoUrl;


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
    // UPDATED AT
    // =====================================================

    @Column(
        name = "updated_at",
        nullable = false
    )
    private LocalDateTime updatedAt;


    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
            LocalDateTime.now();


        if (createdAt == null) {

            createdAt = now;

        }


        if (updatedAt == null) {

            updatedAt = now;

        }


        if (
            country == null ||
            country.isBlank()
        ) {

            country = "Uganda";

        }


        normalizeFields();

    }


    // =====================================================
    // PRE UPDATE
    // =====================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
            LocalDateTime.now();

        normalizeFields();

    }


    // =====================================================
    // NORMALIZE FIELDS
    // =====================================================

    private void normalizeFields() {

        if (hospitalName != null) {

            hospitalName =
                hospitalName.trim();

        }


        if (registrationNumber != null) {

            registrationNumber =
                registrationNumber.trim();

        }


        if (phone != null) {

            phone =
                phone.trim();

        }


        if (email != null) {

            email =
                email.trim().toLowerCase();

        }


        if (address != null) {

            address =
                address.trim();

        }


        if (city != null) {

            city =
                city.trim();

        }


        if (
            country == null ||
            country.isBlank()
        ) {

            country = "Uganda";

        }
        else {

            country =
                country.trim();

        }


        if (website != null) {

            website =
                website.trim();

        }


        if (logoUrl != null) {

            logoUrl =
                logoUrl.trim();

        }

    }


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public HospitalSettings() {
    }


    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Long getId() {

        return id;

    }


    public void setId(Long id) {

        this.id = id;

    }


    public String getHospitalName() {

        return hospitalName;

    }


    public void setHospitalName(
        String hospitalName
    ) {

        this.hospitalName =
            hospitalName;

    }


    public String getRegistrationNumber() {

        return registrationNumber;

    }


    public void setRegistrationNumber(
        String registrationNumber
    ) {

        this.registrationNumber =
            registrationNumber;

    }


    public String getPhone() {

        return phone;

    }


    public void setPhone(
        String phone
    ) {

        this.phone = phone;

    }


    public String getEmail() {

        return email;

    }


    public void setEmail(
        String email
    ) {

        this.email = email;

    }


    public String getAddress() {

        return address;

    }


    public void setAddress(
        String address
    ) {

        this.address = address;

    }


    public String getCity() {

        return city;

    }


    public void setCity(
        String city
    ) {

        this.city = city;

    }


    public String getCountry() {

        return country;

    }


    public void setCountry(
        String country
    ) {

        this.country = country;

    }


    public String getWebsite() {

        return website;

    }


    public void setWebsite(
        String website
    ) {

        this.website = website;

    }


    public String getLogoUrl() {

        return logoUrl;

    }


    public void setLogoUrl(
        String logoUrl
    ) {

        this.logoUrl = logoUrl;

    }


    public LocalDateTime getCreatedAt() {

        return createdAt;

    }


    public void setCreatedAt(
        LocalDateTime createdAt
    ) {

        this.createdAt = createdAt;

    }


    public LocalDateTime getUpdatedAt() {

        return updatedAt;

    }


    public void setUpdatedAt(
        LocalDateTime updatedAt
    ) {

        this.updatedAt = updatedAt;

    }

}