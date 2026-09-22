// =====================================================
// PLATFORM PLAN MODEL
// File:
// src/app/shared/models/platform/plan.model.ts
// =====================================================

import {
  BillingCycle
} from './billing-cycle.model';

import {
  PlatformModule
} from './platform-module.model';

export interface Plan {

  id: number;

  code: string;

  name: string;

  description?: string | null;

  price: number;

  currency: string;

  billingCycle: BillingCycle;

  trialDays: number;

  active: boolean;

  modules: PlatformModule[];
}