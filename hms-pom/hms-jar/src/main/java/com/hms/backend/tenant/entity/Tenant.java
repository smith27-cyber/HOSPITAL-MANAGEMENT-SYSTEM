package com.hms.backend.tenant.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "tenants",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_tenants_code",
            columnNames = "code"
        )
    },
    indexes = {
        @Index(name = "idx_tenants_status", columnList = "status"),
        @Index(name = "idx_tenants_type", columnList = "type")
    }
)
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TenantType type = TenantType.CLINIC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TenantStatus status = TenantStatus.TRIAL;

    @Column(length = 50)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country = "Uganda";

    @Column(length = 300)
    private String website;

    @Column(length = 500)
    private String logoUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        normalize();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        normalize();
    }

    private void normalize() {
        if (code != null) code = code.trim().toUpperCase();
        if (name != null) name = name.trim();
        if (phone != null) phone = phone.trim();
        if (email != null) email = email.trim().toLowerCase();
        if (address != null) address = address.trim();
        if (city != null) city = city.trim();
        if (country == null || country.isBlank()) country = "Uganda";
        else country = country.trim();
        if (website != null) website = website.trim();
        if (logoUrl != null) logoUrl = logoUrl.trim();
    }

    public Tenant() {}

    public Tenant(String code, String name, TenantType type, TenantStatus status) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public TenantType getType() { return type; }
    public void setType(TenantType type) { this.type = type; }
    public TenantStatus getStatus() { return status; }
    public void setStatus(TenantStatus status) { this.status = status; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
