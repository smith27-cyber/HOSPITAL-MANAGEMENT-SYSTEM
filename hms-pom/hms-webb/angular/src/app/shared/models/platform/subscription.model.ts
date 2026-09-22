// =====================================================
// PLATFORM SUBSCRIPTION MODEL
// File:
// src/app/shared/models/platform/subscription.model.ts
// =====================================================

import { Tenant } from './tenant.model';
import { Plan } from './plan.model';

export type SubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'GRACE_PERIOD'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Subscription {
  id: number;

  tenant: Tenant;

  plan: Plan;

  status: SubscriptionStatus;

  startDate: string;

  trialEndsAt?: string | null;

  currentPeriodStart?: string | null;

  currentPeriodEnd?: string | null;

  nextBillingDate?: string | null;

  cancelledAt?: string | null;
}