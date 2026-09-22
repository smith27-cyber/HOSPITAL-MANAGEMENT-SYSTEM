package com.hms.backend.audit.entity;

import com.hms.backend.auth.entity.User;
import com.hms.backend.tenant.entity.Tenant;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "audit_logs",
    indexes = {
        @Index(name = "idx_audit_logs_tenant", columnList = "tenant_id"),
        @Index(name = "idx_audit_logs_user", columnList = "user_id"),
        @Index(name = "idx_audit_logs_action", columnList = "action"),
        @Index(name = "idx_audit_logs_entity", columnList = "entity_type"),
        @Index(name = "idx_audit_logs_created_at", columnList = "created_at")
    }
)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * -----------------------------------------------------
     * TENANT
     * -----------------------------------------------------
     *
     * Nullable because SUPER_ADMIN platform actions may
     * not belong to a specific tenant.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    /*
     * -----------------------------------------------------
     * USER
     * -----------------------------------------------------
     *
     * Nullable because some actions may be performed by
     * the system rather than a logged-in user.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /*
     * -----------------------------------------------------
     * USERNAME SNAPSHOT
     * -----------------------------------------------------
     *
     * Keep a snapshot so the audit record remains readable
     * even if the user is later deleted or renamed.
     */
    @Column(length = 100)
    private String username;

    /*
     * -----------------------------------------------------
     * ACTION
     * -----------------------------------------------------
     *
     * Examples:
     *
     * CREATE
     * UPDATE
     * DELETE
     * LOGIN
     * LOGOUT
     * DISPENSE
     * PAYMENT
     * CANCEL
     * EXPORT
     */
    @Column(nullable = false, length = 50)
    private String action;

    /*
     * -----------------------------------------------------
     * ENTITY TYPE
     * -----------------------------------------------------
     *
     * Examples:
     *
     * PATIENT
     * PHARMACY_PRESCRIPTION
     * MEDICINE
     * INVOICE
     * USER
     * TENANT
     */
    @Column(nullable = false, length = 100)
    private String entityType;

    /*
     * -----------------------------------------------------
     * ENTITY ID
     * -----------------------------------------------------
     *
     * String allows us to support both:
     *
     * Long IDs
     * String IDs such as PAT-123 or CON-123
     */
    @Column(length = 100)
    private String entityId;

    /*
     * -----------------------------------------------------
     * DESCRIPTION
     * -----------------------------------------------------
     */
    @Column(length = 1000)
    private String description;

    /*
     * -----------------------------------------------------
     * OLD VALUE
     * -----------------------------------------------------
     *
     * Optional JSON/text snapshot before an update.
     */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String oldValue;

    /*
     * -----------------------------------------------------
     * NEW VALUE
     * -----------------------------------------------------
     *
     * Optional JSON/text snapshot after an update.
     */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String newValue;

    /*
     * -----------------------------------------------------
     * IP ADDRESS
     * -----------------------------------------------------
     */
    @Column(length = 100)
    private String ipAddress;

    /*
     * -----------------------------------------------------
     * USER AGENT
     * -----------------------------------------------------
     */
    @Column(length = 500)
    private String userAgent;

    /*
     * -----------------------------------------------------
     * CREATED AT
     * -----------------------------------------------------
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

    }

    public AuditLog() {
    }

    public Long getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}