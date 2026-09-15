// =====================================================
// PLATFORM TENANT MODEL
// File:
// src/app/shared/models/platform/tenant.model.ts
// =====================================================

export type TenantType =
  | 'PHARMACY'
  | 'CLINIC'
  | 'HOSPITAL'
  | 'LABORATORY'
  | 'OTHER';

export type TenantStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'GRACE_PERIOD'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Tenant {
  id: number;
  code: string;
  name: string;
  type: TenantType;
  status: TenantStatus;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}