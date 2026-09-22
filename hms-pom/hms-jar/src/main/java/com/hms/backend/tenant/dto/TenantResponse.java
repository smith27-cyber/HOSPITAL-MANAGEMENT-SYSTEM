package com.hms.backend.tenant.dto;

import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.entity.TenantStatus;
import com.hms.backend.tenant.entity.TenantType;

import java.time.LocalDateTime;

public class TenantResponse {

    private Long id;
    private String code;
    private String name;
    private TenantType type;
    private TenantStatus status;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String country;
    private String website;
    private String logoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TenantResponse() {
    }

    public static TenantResponse fromTenant(
        Tenant tenant
    ) {

        TenantResponse response =
            new TenantResponse();

        response.id = tenant.getId();
        response.code = tenant.getCode();
        response.name = tenant.getName();
        response.type = tenant.getType();
        response.status = tenant.getStatus();
        response.phone = tenant.getPhone();
        response.email = tenant.getEmail();
        response.address = tenant.getAddress();
        response.city = tenant.getCity();
        response.country = tenant.getCountry();
        response.website = tenant.getWebsite();
        response.logoUrl = tenant.getLogoUrl();
        response.createdAt = tenant.getCreatedAt();
        response.updatedAt = tenant.getUpdatedAt();

        return response;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public TenantType getType() {
        return type;
    }

    public TenantStatus getStatus() {
        return status;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public String getWebsite() {
        return website;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}