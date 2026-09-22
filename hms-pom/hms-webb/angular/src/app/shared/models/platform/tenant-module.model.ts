import { PlatformModule } from './platform-module.model';

export interface TenantModule {
  id: number;
  tenant: {
    id: number;
    code: string;
    name: string;
  };
  module: PlatformModule;
  enabled: boolean;
}