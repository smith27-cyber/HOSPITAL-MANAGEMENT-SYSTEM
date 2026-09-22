package com.hms.backend.auth.entity;

import com.hms.backend.entity.Role;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        nullable = false,
        unique = true,
        length = 50
    )
    private String username;

    @Column(
        nullable = false
    )
    private String password;

    @Column(
        nullable = false,
        length = 100
    )
    private String fullName;

    /*
     * -----------------------------------------------------
     * LEGACY ROLE
     * -----------------------------------------------------
     *
     * Keep this temporarily so existing data does not
     * break during the RBAC migration.
     *
     * Later this field can be removed after all users
     * are migrated to the Role relationship.
     * -----------------------------------------------------
     */
    @Column(
        length = 30
    )
    private String role;

    /*
     * -----------------------------------------------------
     * RBAC ROLES
     * -----------------------------------------------------
     */

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",

        joinColumns = @JoinColumn(
            name = "user_id"
        ),

        inverseJoinColumns = @JoinColumn(
            name = "role_id"
        )
    )
    private Set<Role> roles =
        new HashSet<>();

    @Column(
        nullable = false
    )
    private boolean enabled = true;

    @Column(
        nullable = false,
        updatable = false
    )
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

    }

    public User() {
    }

    public User(
        String username,
        String password,
        String fullName,
        String role
    ) {

        this.username = username;

        this.password = password;

        this.fullName = fullName;

        this.role = role;

        this.enabled = true;

    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(
        String username
    ) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(
        String password
    ) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(
        String fullName
    ) {
        this.fullName = fullName;
    }

    /*
     * -----------------------------------------------------
     * LEGACY ROLE ACCESSORS
     * -----------------------------------------------------
     */

    public String getRole() {
        return role;
    }

    public void setRole(
        String role
    ) {
        this.role = role;
    }

    /*
     * -----------------------------------------------------
     * RBAC ROLES
     * -----------------------------------------------------
     */

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(
        Set<Role> roles
    ) {
        this.roles = roles;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(
        boolean enabled
    ) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}