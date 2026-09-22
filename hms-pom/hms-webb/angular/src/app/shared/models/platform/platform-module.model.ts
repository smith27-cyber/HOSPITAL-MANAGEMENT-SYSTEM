// =====================================================
// PLATFORM MODULE MODEL
// File:
// src/app/shared/models/platform/platform-module.model.ts
// =====================================================

export interface PlatformModule {
  id: number;

  code: string;

  name: string;

  description?: string | null;

  active: boolean;
}