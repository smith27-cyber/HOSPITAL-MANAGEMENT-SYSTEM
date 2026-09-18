package com.hms.backend.settings.entity;

import com.hms.backend.tenant.entity.Tenant;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "system_preferences",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_system_preferences_tenant",
            columnNames = "tenant_id"
        )
    },
    indexes = {
        @Index(
            name = "idx_system_preferences_tenant",
            columnList = "tenant_id"
        )
    }
)
public class SystemPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    // APPEARANCE
    // =====================================================

    @Column(
        nullable = false,
        length = 20
    )
    private String theme = "System";

    // =====================================================
    // DATE / TIME
    // =====================================================

    @Column(
        name = "date_format",
        nullable = false,
        length = 30
    )
    private String dateFormat = "DD/MM/YYYY";

    @Column(
        name = "time_format",
        nullable = false,
        length = 20
    )
    private String timeFormat = "24-hour";

    // =====================================================
    // CURRENCY
    // =====================================================

    @Column(
        nullable = false,
        length = 10
    )
    private String currency = "UGX";

    @Column(
        name = "currency_symbol",
        nullable = false,
        length = 10
    )
    private String currencySymbol = "UGX";

    // =====================================================
    // LANGUAGE / TIMEZONE
    // =====================================================

    @Column(
        nullable = false,
        length = 50
    )
    private String language = "English";

    @Column(
        nullable = false,
        length = 100
    )
    private String timezone = "Africa/Kampala";

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    @Column(
        name = "enable_notifications",
        nullable = false
    )
    private boolean enableNotifications = true;

    @Column(
        name = "enable_email_notifications",
        nullable = false
    )
    private boolean enableEmailNotifications = true;

    @Column(
        name = "enable_sms_notifications",
        nullable = false
    )
    private boolean enableSmsNotifications = false;

    // =====================================================
    // AUDIT
    // =====================================================

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
        name = "updated_at",
        nullable = false
    )
    private LocalDateTime updatedAt;

    // =====================================================
    // LIFECYCLE
    // =====================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        normalize();
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();

        normalize();
    }

    // =====================================================
    // NORMALIZATION
    // =====================================================

    private void normalize() {

        theme = normalizeValue(theme, "System");
        dateFormat = normalizeValue(dateFormat, "DD/MM/YYYY");
        timeFormat = normalizeValue(timeFormat, "24-hour");
        currency = normalizeValue(currency, "UGX");
        currencySymbol = normalizeValue(currencySymbol, "UGX");
        language = normalizeValue(language, "English");
        timezone = normalizeValue(timezone, "Africa/Kampala");
    }

    private String normalizeValue(
        String value,
        String fallback
    ) {

        if (value == null || value.isBlank()) {
            return fallback;
        }

        return value.trim();
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

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public String getTimeFormat() {
        return timeFormat;
    }

    public void setTimeFormat(String timeFormat) {
        this.timeFormat = timeFormat;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getCurrencySymbol() {
        return currencySymbol;
    }

    public void setCurrencySymbol(String currencySymbol) {
        this.currencySymbol = currencySymbol;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public boolean isEnableNotifications() {
        return enableNotifications;
    }

    public void setEnableNotifications(boolean enableNotifications) {
        this.enableNotifications = enableNotifications;
    }

    public boolean isEnableEmailNotifications() {
        return enableEmailNotifications;
    }

    public void setEnableEmailNotifications(
        boolean enableEmailNotifications
    ) {
        this.enableEmailNotifications = enableEmailNotifications;
    }

    public boolean isEnableSmsNotifications() {
        return enableSmsNotifications;
    }

    public void setEnableSmsNotifications(
        boolean enableSmsNotifications
    ) {
        this.enableSmsNotifications = enableSmsNotifications;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}