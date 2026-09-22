package com.hms.backend.platform.entity;

import com.hms.backend.tenant.entity.Tenant;
import jakarta.persistence.*;

@Entity
@Table(name = "tenant_modules",
       uniqueConstraints = @UniqueConstraint(name = "uk_tenant_module", columnNames = {"tenant_id", "module_id"}),
       indexes = {
           @Index(name = "idx_tenant_modules_tenant", columnList = "tenant_id"),
           @Index(name = "idx_tenant_modules_enabled", columnList = "tenant_id,enabled")
       })
public class TenantModule {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private PlatformModule module;

    @Column(nullable = false)
    private boolean enabled = true;

    public TenantModule() {}

    public TenantModule(Tenant tenant, PlatformModule module, boolean enabled) {
        this.tenant = tenant; this.module = module; this.enabled = enabled;
    }

    public Long getId() { return id; }
    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant tenant) { this.tenant = tenant; }
    public PlatformModule getModule() { return module; }
    public void setModule(PlatformModule module) { this.module = module; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
