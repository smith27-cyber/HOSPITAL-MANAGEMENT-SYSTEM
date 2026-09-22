package com.hms.backend.tenant.context;

/**
 * Holds the tenant associated with the current HTTP request.
 *
 * Uses ThreadLocal so each request has its own tenant context.
 */
public final class TenantContext {

    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
        // Utility class
    }

    /**
     * Set the tenant for the current request.
     */
    public static void setTenantId(Long tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    /**
     * Get the tenant for the current request.
     */
    public static Long getTenantId() {
        return CURRENT_TENANT.get();
    }

    /**
     * Return true when a tenant has been established.
     */
    public static boolean hasTenant() {
        return CURRENT_TENANT.get() != null;
    }

    /**
     * Get the tenant ID or throw when the request
     * is supposed to be tenant-scoped but no tenant exists.
     */
    public static Long requireTenantId() {
        Long tenantId = CURRENT_TENANT.get();

        if (tenantId == null) {
            throw new IllegalStateException(
                "No tenant context is available for this request."
            );
        }

        return tenantId;
    }

    /**
     * Clear the context after the request finishes.
     *
     * This is extremely important when using thread pools.
     */
    public static void clear() {
        CURRENT_TENANT.remove();
    }
}