package com.hms.backend.tenant.dto;

import com.hms.backend.tenant.entity.TenantType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class TenantCreateRequest {

    @NotBlank(message = "Tenant code is required")
    @Size(
        min = 3,
        max = 50,
        message = "Tenant code must be between 3 and 50 characters"
    )
    @Pattern(
        regexp = "^[A-Za-z0-9][A-Za-z0-9_-]*$",
        message = "Tenant code may contain letters, numbers, hyphens and underscores only"
    )
    private String code;

    @NotBlank(message = "Tenant name is required")
    @Size(
        max = 200,
        message = "Tenant name cannot exceed 200 characters"
    )
    private String name;

    @NotNull(message = "Tenant type is required")
    private TenantType type;

    @Size(max = 50)
    private String phone;

    @Email(message = "Invalid email address")
    @Size(max = 150)
    private String email;

    @Size(max = 500)
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String country;

    @Size(max = 300)
    private String website;

    @Size(max = 500)
    private String logoUrl;

    public TenantCreateRequest() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public TenantType getType() {
        return type;
    }

    public void setType(TenantType type) {
        this.type = type;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
}