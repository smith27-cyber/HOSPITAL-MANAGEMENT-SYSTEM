package com.hms.backend.platform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "hms_modules", uniqueConstraints = @UniqueConstraint(name = "uk_hms_modules_code", columnNames = "code"))
public class PlatformModule {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 40)
    private ModuleCode code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    public PlatformModule() {}

    public PlatformModule(ModuleCode code, String name, String description) {
        this.code = code; this.name = name; this.description = description; this.active = true;
    }

    public Long getId() { return id; }
    public ModuleCode getCode() { return code; }
    public void setCode(ModuleCode code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
