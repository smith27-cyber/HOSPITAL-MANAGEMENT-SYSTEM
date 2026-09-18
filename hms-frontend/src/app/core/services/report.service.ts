// =====================================================
// HMS REPORT SERVICE
// File:
// src/app/core/services/report.service.ts
// =====================================================

import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

// =====================================================
// TENANT INFORMATION
// =====================================================

export interface ReportTenantInfo {

  id: number;

  code: string;

  name: string;

  type: string;

  phone: string | null;

  email: string | null;

  address: string | null;

  city: string | null;

  country: string | null;

  website: string | null;

  logoUrl: string | null;

  registrationNumber: string | null;
}

// =====================================================
// REPORT PERIOD
// =====================================================

export interface ReportPeriod {

  startDate: string;

  endDate: string;
}

// =====================================================
// REPORT METADATA
// =====================================================

export interface ReportMetadata {

  reportType: string;

  period: ReportPeriod;

  generatedAt: string;

  currency: string;
}

// =====================================================
// REPORT SUMMARY
// =====================================================

export interface ReportSummary {

  patients: number;

  doctors: number;

  departments: number;

  appointments: number;

  consultations: number;

  admissions: number;

  laboratoryRequests: number;

  pharmacyPrescriptions: number;

  inventoryItems: number;

  lowStockItems: number;

  billingRecords: number;

  billedAmount: number;

  amountPaid: number;

  outstandingBalance: number;
}

// =====================================================
// FINANCIAL ANALYTICS
// =====================================================

export interface ReportFinancialAnalytics {

  totalRevenue: number;

  billedAmount: number;

  amountPaid: number;

  outstandingBalance: number;

  collectionRate: number;
}

// =====================================================
// TOP MEDICINE
// =====================================================

export interface ReportTopMedicine {

  medicineName: string;

  quantity: number;

  revenue: number;
}

// =====================================================
// PHARMACY ANALYTICS
// =====================================================

export interface ReportPharmacyAnalytics {

  totalSales: number;

  totalPrescriptions: number;

  totalDispensedItems: number;

  amountPaid: number;

  outstandingBalance: number;

  topMedicines: ReportTopMedicine[];
}

// =====================================================
// INVENTORY ANALYTICS
// =====================================================

export interface ReportInventoryAnalytics {

  totalStockValue: number;

  totalItems: number;

  lowStockItems: number;

  outOfStockItems: number;

  expiringItems: number;
}

// =====================================================
// COMPLETE REPORT DASHBOARD
// =====================================================

export interface ReportDashboardResponse {

  tenant: ReportTenantInfo;

  metadata: ReportMetadata;

  summary: ReportSummary;

  financial: ReportFinancialAnalytics;

  pharmacy: ReportPharmacyAnalytics;

  inventory: ReportInventoryAnalytics;

  enabledReportModules: string[];
}

// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  // ===================================================
  // API URL
  // ===================================================

  private readonly apiUrl =
    'http://localhost:8081/api/reports';

  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(
    private readonly http: HttpClient
  ) {}

  // ===================================================
  // GET REPORT DASHBOARD
  // ===================================================

  getDashboard(
    startDate?: string,
    endDate?: string
  ): Observable<ReportDashboardResponse> {

    let params =
      new HttpParams();

    // -------------------------------------------------
    // START DATE
    // -------------------------------------------------

    if (startDate) {

      params =
        params.set(
          'startDate',
          startDate
        );
    }

    // -------------------------------------------------
    // END DATE
    // -------------------------------------------------

    if (endDate) {

      params =
        params.set(
          'endDate',
          endDate
        );
    }

    // -------------------------------------------------
    // IMPORTANT MULTI-TENANT DESIGN
    // -------------------------------------------------
    //
    // We deliberately DO NOT send tenantId here.
    //
    // The authenticated backend request determines
    // the current tenant through TenantContext.
    //
    // Therefore:
    //
    // Angular
    //    ↓
    // /api/reports/dashboard
    //    ↓
    // JWT authentication
    //    ↓
    // TenantContext
    //    ↓
    // current tenant
    //    ↓
    // tenant-scoped report queries
    //
    // This prevents the frontend from selecting another
    // tenant by simply changing a tenantId parameter.
    // -------------------------------------------------

    return this.http.get<ReportDashboardResponse>(
      `${this.apiUrl}/dashboard`,
      {
        params
      }
    );
  }
}