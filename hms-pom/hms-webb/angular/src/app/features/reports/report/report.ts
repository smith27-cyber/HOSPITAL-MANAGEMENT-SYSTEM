// =====================================================
// HMS REPORT DASHBOARD
// File:
// src/app/features/reports/report/report.ts
// =====================================================

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

import {
  ReportDashboardResponse,
  ReportService
} from '../../../core/services/report.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './report.html',
  styleUrl: './report.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Report implements OnInit {

  // =====================================================
  // REPORT DATA
  // =====================================================

  dashboard: ReportDashboardResponse | null = null;

  // =====================================================
  // FILTERS
  // =====================================================

  startDate = '';
  endDate = '';

  // =====================================================
  // UI STATE
  // =====================================================

  loading = false;
  exporting = false;

  errorMessage = '';

  lastLoadedAt: Date | null = null;

  reportNumber = '';

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly reportService: ReportService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    const today = new Date();

    this.endDate =
      this.toInputDate(today);

    this.startDate =
      this.toInputDate(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        )
      );

    this.loadReport();
  }

  // =====================================================
  // LOAD REPORT
  // =====================================================

  loadReport(): void {

    this.errorMessage = '';

    if (
      this.startDate &&
      this.endDate &&
      this.startDate > this.endDate
    ) {

      this.errorMessage =
        'Start date cannot be later than the end date.';

      this.cdr.markForCheck();

      return;
    }

    this.loading = true;

    this.cdr.markForCheck();

    this.reportService
      .getDashboard(
        this.startDate || undefined,
        this.endDate || undefined
      )
      .subscribe({

        next: (response) => {

          this.dashboard = response;

          this.lastLoadedAt =
            new Date();

          this.reportNumber =
            this.generateReportNumber(
              response
            );

          this.loading = false;

          this.cdr.markForCheck();
        },

        error: (error) => {

          console.error(
            'Report loading failed:',
            error
          );

          this.dashboard = null;

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to load the report. Please try again.';

          this.cdr.markForCheck();
        }
      });
  }

  // =====================================================
  // APPLY FILTER
  // =====================================================

  applyDateFilter(): void {
    this.loadReport();
  }

  // =====================================================
  // RESET FILTER
  // =====================================================

  resetDateFilter(): void {

    const today = new Date();

    this.endDate =
      this.toInputDate(today);

    this.startDate =
      this.toInputDate(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        )
      );

    this.loadReport();
  }

  // =====================================================
  // MODULE ACCESS
  // =====================================================

  isModuleEnabled(
    moduleCode: string
  ): boolean {

    if (!this.dashboard) {
      return false;
    }

    /*
     * REPORTS is the current report module itself.
     * The backend has already confirmed that this tenant
     * can access reports before this dashboard is returned.
     */
    if (
      moduleCode === 'REPORTS'
    ) {
      return true;
    }

    /*
     * The backend returns the enabled modules for the
     * CURRENT TENANT.
     *
     * We intentionally do not send tenantId from Angular.
     * Tenant identity comes from the authenticated request.
     */
    return this.dashboard.enabledReportModules
      ?.includes(moduleCode) ?? false;
  }

  // =====================================================
  // REPORT PERIOD
  // =====================================================

  reportPeriodLabel(): string {

    if (!this.dashboard?.metadata?.period) {
      return '—';
    }

    const start =
      this.formatDate(
        this.dashboard.metadata.period.startDate
      );

    const end =
      this.formatDate(
        this.dashboard.metadata.period.endDate
      );

    return `${start} – ${end}`;
  }

  // =====================================================
  // REPORT NUMBER
  // =====================================================

  private generateReportNumber(
    dashboard: ReportDashboardResponse
  ): string {

    const tenantCode =
      dashboard.tenant?.code ||
      'TENANT';

    const safeTenantCode =
      tenantCode
        .replace(
          /[^a-zA-Z0-9]/g,
          ''
        )
        .toUpperCase();

    const generatedAt =
      dashboard.metadata?.generatedAt
        ? new Date(
            dashboard.metadata.generatedAt
          )
        : new Date();

    const datePart =
      this.formatCompactDate(
        generatedAt
      );

    const timePart =
      this.formatCompactTime(
        generatedAt
      );

    return `RPT-${safeTenantCode}-${datePart}-${timePart}`;
  }

  // =====================================================
  // DATE FORMATTING
  // =====================================================

  formatDate(
    value: string | Date | null | undefined
  ): string {

    if (!value) {
      return '—';
    }

    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'en-UG',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(date);
  }

  // =====================================================
  // DATETIME FORMATTING
  // =====================================================

  formatDateTime(
    value: string | Date | null | undefined
  ): string {

    if (!value) {
      return '—';
    }

    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'en-UG',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(date);
  }

  // =====================================================
  // NUMBER FORMATTING
  // =====================================================

  formatNumber(
    value: number | null | undefined
  ): string {

    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return '0';
    }

    return new Intl.NumberFormat(
      'en-UG'
    ).format(
      Number(value)
    );
  }

  // =====================================================
  // MONEY FORMATTING
  // =====================================================

  formatMoney(
    value: number | null | undefined
  ): string {

    const currency =
      this.dashboard?.metadata?.currency ||
      'UGX';

    const amount =
      Number(value ?? 0);

    return new Intl.NumberFormat(
      'en-UG',
      {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    ).format(
      Number.isFinite(amount)
        ? amount
        : 0
    );
  }

  // =====================================================
  // PERCENTAGE
  // =====================================================

  formatPercentage(
    value: number | null | undefined
  ): string {

    const amount =
      Number(value ?? 0);

    if (!Number.isFinite(amount)) {
      return '0%';
    }

    return `${amount.toFixed(1)}%`;
  }

  // =====================================================
  // PRINT REPORT
  // =====================================================

  printReport(): void {

    if (!this.dashboard) {
      return;
    }

    const reportElement =
      document.querySelector(
        '.report-page'
      ) as HTMLElement | null;

    if (!reportElement) {
      return;
    }

    const printWindow =
      window.open(
        '',
        '_blank',
        'width=1200,height=900'
      );

    if (!printWindow) {

      this.errorMessage =
        'Unable to open the print window. Please allow pop-ups for this application.';

      this.cdr.markForCheck();

      return;
    }

    const styles =
      Array.from(
        document.querySelectorAll(
          'link[rel="stylesheet"], style'
        )
      )
      .map(
        element =>
          element.outerHTML
      )
      .join('\n');

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>

          <title>
            ${this.dashboard.tenant.name}
            - HMS Report
          </title>

          <meta charset="UTF-8">

          ${styles}

        </head>

        <body class="print-document">

          ${reportElement.outerHTML}

          <script>
            window.onload = function () {

              setTimeout(function () {

                window.focus();

                window.print();

              }, 500);

            };

            window.onafterprint = function () {

              window.close();

            };
          <\/script>

        </body>
      </html>
    `);

    printWindow.document.close();
  }

  // =====================================================
  // EXPORT PDF
  // =====================================================

  async exportPdf(): Promise<void> {

    const reportElement =
      document.querySelector(
        '.report-page'
      ) as HTMLElement | null;

    if (
      !reportElement ||
      !this.dashboard
    ) {
      return;
    }

    this.exporting = true;

    this.errorMessage = '';

    this.cdr.markForCheck();

    try {

      /*
       * html2canvas captures the rendered report.
       *
       * Elements marked with the "screen-only" class
       * are intentionally excluded from the PDF.
       *
       * This keeps:
       *
       * - Download PDF
       * - Print / Save PDF
       * - Excel
       * - CSV
       * - Date filters
       *
       * visible in the browser while preventing them
       * from appearing inside the generated PDF.
       */
      const canvas =
        await html2canvas(
          reportElement,
          {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,

            scrollX: 0,
            scrollY: -window.scrollY,

            windowWidth:
              reportElement.scrollWidth,

            ignoreElements:
              (element: Element): boolean =>
                element.classList.contains(
                  'screen-only'
                )
          }
        );

      const pdf =
        new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 10;

      const usableWidth =
        pageWidth -
        (margin * 2);

      const usableHeight =
        pageHeight -
        (margin * 2);

      const imageWidth =
        usableWidth;

      const imageHeight =
        (
          canvas.height *
          imageWidth
        ) /
        canvas.width;

      const imageData =
        canvas.toDataURL(
          'image/jpeg',
          0.95
        );

      let remainingHeight =
        imageHeight;

      let offsetY = 0;

      pdf.setProperties({

        title:
          `${this.dashboard.tenant.name} HMS Report`,

        subject:
          `Management report ${this.reportNumber}`,

        author:
          'Hospital Management System',

        creator:
          'HMS'
      });

      while (
        remainingHeight > 0
      ) {

        if (
          offsetY !== 0
        ) {
          pdf.addPage();
        }

        pdf.addImage(
          imageData,
          'JPEG',
          margin,
          margin - offsetY,
          imageWidth,
          imageHeight
        );

        remainingHeight -=
          usableHeight;

        offsetY +=
          usableHeight;
      }

      const fileName =
        this.createExportFileName(
          'pdf'
        );

      pdf.save(
        fileName
      );

    } catch (error) {

      console.error(
        'PDF export failed:',
        error
      );

      this.errorMessage =
        'Unable to generate the PDF report. Please try again.';

    } finally {

      this.exporting = false;

      this.cdr.markForCheck();
    }
  }

  // =====================================================
  // EXPORT EXCEL
  // =====================================================

  exportExcel(): void {

    if (!this.dashboard) {
      return;
    }

    this.exporting = true;

    this.errorMessage = '';

    this.cdr.markForCheck();

    try {

      const workbook =
        XLSX.utils.book_new();

      // =================================================
      // REPORT INFORMATION
      // =================================================

      const informationRows = [

        [
          'Report Information',
          ''
        ],

        [
          'Report Number',
          this.reportNumber
        ],

        [
          'Tenant',
          this.dashboard.tenant.name
        ],

        [
          'Tenant Code',
          this.dashboard.tenant.code
        ],

        [
          'Tenant Type',
          this.dashboard.tenant.type
        ],

        [
          'Registration Number',
          this.dashboard.tenant.registrationNumber || ''
        ],

        [
          'Phone',
          this.dashboard.tenant.phone || ''
        ],

        [
          'Email',
          this.dashboard.tenant.email || ''
        ],

        [
          'Address',
          this.dashboard.tenant.address || ''
        ],

        [
          'City',
          this.dashboard.tenant.city || ''
        ],

        [
          'Country',
          this.dashboard.tenant.country || ''
        ],

        [
          'Website',
          this.dashboard.tenant.website || ''
        ],

        [
          'Reporting Period',
          this.reportPeriodLabel()
        ],

        [
          'Generated At',
          this.formatDateTime(
            this.dashboard.metadata.generatedAt
          )
        ],

        [
          'Currency',
          this.dashboard.metadata.currency
        ]
      ];

      const informationSheet =
        XLSX.utils.aoa_to_sheet(
          informationRows
        );

      informationSheet['!cols'] = [
        { wch: 28 },
        { wch: 45 }
      ];

      this.styleExcelHeader(
        informationSheet,
        'A1:B1'
      );

      XLSX.utils.book_append_sheet(
        workbook,
        informationSheet,
        'Report Information'
      );

      // =================================================
      // SUMMARY
      // =================================================

      const summaryRows:
        (string | number)[][] = [
          [
            'Metric',
            'Value'
          ]
        ];

      const summary =
        this.dashboard.summary;

      if (
        this.isModuleEnabled(
          'PATIENTS'
        )
      ) {

        summaryRows.push(
          [
            'Patients',
            summary.patients
          ]
        );
      }

      if (
        this.isModuleEnabled(
          'DOCTORS'
        )
      ) {

        summaryRows.push(
          [
            'Doctors',
            summary.doctors
          ]
        );
      }

      if (
        this.isModuleEnabled(
          'DEPARTMENTS'
        )
      ) {

        summaryRows.push(
          [
            'Departments',
            summary.departments
          ]
        );
      }

      if (
        this.isModuleEnabled(
          'APPOINTMENTS'
        )
      ) {

        summaryRows.push(
          [
            'Appointments',
            summary.appointments
          ]
        );
      }

      if (
        this.isModuleEnabled(
          'CONSULTATIONS'
        )
      ) {

        summaryRows.push(
          [
            'Consultations',
            summary.consultations
          ]
        );
      }

      if (
        this.isModuleEnabled(
          'ADMISSIONS'
        )
      ) {

        summaryRows.push(
          [
            'Admissions',
            summary.admissions
          ]
        );
      }

      if (
        this.isModuleEnabled(
          'LABORATORY'
        )
      ) {

        summaryRows.push(
          [
            'Laboratory Requests',
            summary.laboratoryRequests
          ]
        );
      }

      if (
        this.isModuleEnabled(
          'PHARMACY'
        )
      ) {

        summaryRows.push(
          [
            'Pharmacy Prescriptions',
            summary.pharmacyPrescriptions
          ]
        );
      }

      if (
        this.isModuleEnabled(
          'INVENTORY'
        )
      ) {

        summaryRows.push(
          [
            'Inventory Items',
            summary.inventoryItems
          ]
        );

        summaryRows.push(
          [
            'Low Stock Items',
            summary.lowStockItems
          ]
        );
      }

      if (
        this.isModuleEnabled(
          'BILLING'
        )
      ) {

        summaryRows.push(
          [
            'Billing Records',
            summary.billingRecords
          ]
        );

        summaryRows.push(
          [
            'Billed Amount',
            Number(
              summary.billedAmount || 0
            )
          ]
        );

        summaryRows.push(
          [
            'Amount Paid',
            Number(
              summary.amountPaid || 0
            )
          ]
        );

        summaryRows.push(
          [
            'Outstanding Balance',
            Number(
              summary.outstandingBalance || 0
            )
          ]
        );
      }

      const summarySheet =
        XLSX.utils.aoa_to_sheet(
          summaryRows
        );

      summarySheet['!cols'] = [
        { wch: 32 },
        { wch: 24 }
      ];

      this.styleExcelHeader(
        summarySheet,
        'A1:B1'
      );

      XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        'Summary'
      );

      // =================================================
      // FINANCIAL
      // =================================================

      if (
        this.isModuleEnabled(
          'BILLING'
        )
      ) {

        const financial =
          this.dashboard.financial;

        const financialRows = [

          [
            'Financial Metric',
            'Value'
          ],

          [
            'Total Revenue',
            Number(
              financial.totalRevenue || 0
            )
          ],

          [
            'Billed Amount',
            Number(
              financial.billedAmount || 0
            )
          ],

          [
            'Amount Paid',
            Number(
              financial.amountPaid || 0
            )
          ],

          [
            'Outstanding Balance',
            Number(
              financial.outstandingBalance || 0
            )
          ],

          [
            'Collection Rate',
            Number(
              financial.collectionRate || 0
            )
          ]
        ];

        const financialSheet =
          XLSX.utils.aoa_to_sheet(
            financialRows
          );

        financialSheet['!cols'] = [
          { wch: 32 },
          { wch: 24 }
        ];

        this.styleExcelHeader(
          financialSheet,
          'A1:B1'
        );

        XLSX.utils.book_append_sheet(
          workbook,
          financialSheet,
          'Financial'
        );
      }

      // =================================================
      // PHARMACY
      // =================================================

      if (
        this.isModuleEnabled(
          'PHARMACY'
        )
      ) {

        const pharmacy =
          this.dashboard.pharmacy;

        const pharmacyRows:
          (string | number)[][] = [

          [
            'Pharmacy Metric',
            'Value'
          ],

          [
            'Total Sales',
            Number(
              pharmacy.totalSales || 0
            )
          ],

          [
            'Total Prescriptions',
            pharmacy.totalPrescriptions
          ],

          [
            'Total Dispensed Items',
            pharmacy.totalDispensedItems
          ],

          [
            'Amount Paid',
            Number(
              pharmacy.amountPaid || 0
            )
          ],

          [
            'Outstanding Balance',
            Number(
              pharmacy.outstandingBalance || 0
            )
          ]
        ];

        const pharmacySheet =
          XLSX.utils.aoa_to_sheet(
            pharmacyRows
          );

        pharmacySheet['!cols'] = [
          { wch: 34 },
          { wch: 24 }
        ];

        this.styleExcelHeader(
          pharmacySheet,
          'A1:B1'
        );

        XLSX.utils.book_append_sheet(
          workbook,
          pharmacySheet,
          'Pharmacy'
        );

        // ===============================================
        // TOP MEDICINES
        // ===============================================

        const medicineRows:
          (string | number)[][] = [

          [
            'Medicine',
            'Quantity',
            'Revenue'
          ]
        ];

        for (
          const medicine
          of pharmacy.topMedicines ?? []
        ) {

          medicineRows.push(
            [
              medicine.medicineName,
              medicine.quantity,
              Number(
                medicine.revenue || 0
              )
            ]
          );
        }

        const medicineSheet =
          XLSX.utils.aoa_to_sheet(
            medicineRows
          );

        medicineSheet['!cols'] = [
          { wch: 35 },
          { wch: 16 },
          { wch: 20 }
        ];

        this.styleExcelHeader(
          medicineSheet,
          'A1:C1'
        );

        XLSX.utils.book_append_sheet(
          workbook,
          medicineSheet,
          'Top Medicines'
        );
      }

      // =================================================
      // INVENTORY
      // =================================================

      if (
        this.isModuleEnabled(
          'INVENTORY'
        )
      ) {

        const inventory =
          this.dashboard.inventory;

        const inventoryRows = [

          [
            'Inventory Metric',
            'Value'
          ],

          [
            'Total Stock Value',
            Number(
              inventory.totalStockValue || 0
            )
          ],

          [
            'Total Items',
            inventory.totalItems
          ],

          [
            'Low Stock Items',
            inventory.lowStockItems
          ],

          [
            'Out of Stock Items',
            inventory.outOfStockItems
          ],

          [
            'Expiring Items',
            inventory.expiringItems
          ]
        ];

        const inventorySheet =
          XLSX.utils.aoa_to_sheet(
            inventoryRows
          );

        inventorySheet['!cols'] = [
          { wch: 32 },
          { wch: 24 }
        ];

        this.styleExcelHeader(
          inventorySheet,
          'A1:B1'
        );

        XLSX.utils.book_append_sheet(
          workbook,
          inventorySheet,
          'Inventory'
        );
      }

      // =================================================
      // ENABLED MODULES
      // =================================================

      const moduleRows =
        [
          [
            'Enabled Report Modules'
          ],

          ...(
            this.dashboard
              .enabledReportModules ?? []
          ).map(
            module => [module]
          )
        ];

      const moduleSheet =
        XLSX.utils.aoa_to_sheet(
          moduleRows
        );

      moduleSheet['!cols'] = [
        { wch: 30 }
      ];

      this.styleExcelHeader(
        moduleSheet,
        'A1:A1'
      );

      XLSX.utils.book_append_sheet(
        workbook,
        moduleSheet,
        'Modules'
      );

      // =================================================
      // SAVE
      // =================================================

      const fileName =
        this.createExportFileName(
          'xlsx'
        );

      XLSX.writeFile(
        workbook,
        fileName
      );

    } catch (error) {

      console.error(
        'Excel export failed:',
        error
      );

      this.errorMessage =
        'Unable to generate the Excel report. Please try again.';

    } finally {

      this.exporting = false;

      this.cdr.markForCheck();
    }
  }

  // =====================================================
  // EXCEL HEADER HELPER
  // =====================================================

  private styleExcelHeader(
    sheet: XLSX.WorkSheet,
    range: string
  ): void {

    const decoded =
      XLSX.utils.decode_range(
        range
      );

    for (
      let row = decoded.s.r;
      row <= decoded.e.r;
      row++
    ) {

      for (
        let column = decoded.s.c;
        column <= decoded.e.c;
        column++
      ) {

        const address =
          XLSX.utils.encode_cell({
            r: row,
            c: column
          });

        const cell =
          sheet[address];

        if (cell) {

          cell.s = {
            font: {
              bold: true
            }
          };
        }
      }
    }
  }

  // =====================================================
  // EXPORT CSV
  // =====================================================

  exportCsv(): void {

    if (!this.dashboard) {
      return;
    }

    this.exporting = true;

    this.errorMessage = '';

    this.cdr.markForCheck();

    try {

      const rows:
        (string | number)[][] = [];

      const add =
        (
          section: string,
          metric: string,
          value:
            string |
            number |
            null |
            undefined
        ) => {

          rows.push(
            [
              section,
              metric,
              value ?? ''
            ]
          );
        };

      // =================================================
      // HEADER
      // =================================================

      add(
        'REPORT',
        'Report Number',
        this.reportNumber
      );

      add(
        'REPORT',
        'Tenant',
        this.dashboard.tenant.name
      );

      add(
        'REPORT',
        'Tenant Code',
        this.dashboard.tenant.code
      );

      add(
        'REPORT',
        'Tenant Type',
        this.dashboard.tenant.type
      );

      add(
        'REPORT',
        'Reporting Period',
        this.reportPeriodLabel()
      );

      add(
        'REPORT',
        'Generated At',
        this.formatDateTime(
          this.dashboard.metadata.generatedAt
        )
      );

      add(
        'REPORT',
        'Currency',
        this.dashboard.metadata.currency
      );

      // =================================================
      // SUMMARY
      // =================================================

      const summary =
        this.dashboard.summary;

      if (
        this.isModuleEnabled(
          'PATIENTS'
        )
      ) {

        add(
          'SUMMARY',
          'Patients',
          summary.patients
        );
      }

      if (
        this.isModuleEnabled(
          'DOCTORS'
        )
      ) {

        add(
          'SUMMARY',
          'Doctors',
          summary.doctors
        );
      }

      if (
        this.isModuleEnabled(
          'DEPARTMENTS'
        )
      ) {

        add(
          'SUMMARY',
          'Departments',
          summary.departments
        );
      }

      if (
        this.isModuleEnabled(
          'APPOINTMENTS'
        )
      ) {

        add(
          'SUMMARY',
          'Appointments',
          summary.appointments
        );
      }

      if (
        this.isModuleEnabled(
          'CONSULTATIONS'
        )
      ) {

        add(
          'SUMMARY',
          'Consultations',
          summary.consultations
        );
      }

      if (
        this.isModuleEnabled(
          'ADMISSIONS'
        )
      ) {

        add(
          'SUMMARY',
          'Admissions',
          summary.admissions
        );
      }

      if (
        this.isModuleEnabled(
          'LABORATORY'
        )
      ) {

        add(
          'SUMMARY',
          'Laboratory Requests',
          summary.laboratoryRequests
        );
      }

      if (
        this.isModuleEnabled(
          'PHARMACY'
        )
      ) {

        add(
          'SUMMARY',
          'Pharmacy Prescriptions',
          summary.pharmacyPrescriptions
        );
      }

      if (
        this.isModuleEnabled(
          'INVENTORY'
        )
      ) {

        add(
          'SUMMARY',
          'Inventory Items',
          summary.inventoryItems
        );

        add(
          'SUMMARY',
          'Low Stock Items',
          summary.lowStockItems
        );
      }

      // =================================================
      // BILLING
      // =================================================

      if (
        this.isModuleEnabled(
          'BILLING'
        )
      ) {

        const financial =
          this.dashboard.financial;

        add(
          'FINANCIAL',
          'Total Revenue',
          financial.totalRevenue
        );

        add(
          'FINANCIAL',
          'Billed Amount',
          financial.billedAmount
        );

        add(
          'FINANCIAL',
          'Amount Paid',
          financial.amountPaid
        );

        add(
          'FINANCIAL',
          'Outstanding Balance',
          financial.outstandingBalance
        );

        add(
          'FINANCIAL',
          'Collection Rate',
          this.formatPercentage(
            financial.collectionRate
          )
        );
      }

      // =================================================
      // PHARMACY
      // =================================================

      if (
        this.isModuleEnabled(
          'PHARMACY'
        )
      ) {

        const pharmacy =
          this.dashboard.pharmacy;

        add(
          'PHARMACY',
          'Total Sales',
          pharmacy.totalSales
        );

        add(
          'PHARMACY',
          'Total Prescriptions',
          pharmacy.totalPrescriptions
        );

        add(
          'PHARMACY',
          'Total Dispensed Items',
          pharmacy.totalDispensedItems
        );

        add(
          'PHARMACY',
          'Amount Paid',
          pharmacy.amountPaid
        );

        add(
          'PHARMACY',
          'Outstanding Balance',
          pharmacy.outstandingBalance
        );

        // ===============================================
        // TOP MEDICINES
        // ===============================================

        for (
          const medicine
          of pharmacy.topMedicines ?? []
        ) {

          add(
            'PHARMACY TOP MEDICINES',
            `${medicine.medicineName} - Quantity`,
            medicine.quantity
          );

          add(
            'PHARMACY TOP MEDICINES',
            `${medicine.medicineName} - Revenue`,
            medicine.revenue
          );
        }
      }

      // =================================================
      // INVENTORY
      // =================================================

      if (
        this.isModuleEnabled(
          'INVENTORY'
        )
      ) {

        const inventory =
          this.dashboard.inventory;

        add(
          'INVENTORY',
          'Total Stock Value',
          inventory.totalStockValue
        );

        add(
          'INVENTORY',
          'Total Items',
          inventory.totalItems
        );

        add(
          'INVENTORY',
          'Low Stock Items',
          inventory.lowStockItems
        );

        add(
          'INVENTORY',
          'Out of Stock Items',
          inventory.outOfStockItems
        );

        add(
          'INVENTORY',
          'Expiring Items',
          inventory.expiringItems
        );
      }

      // =================================================
      // MODULES
      // =================================================

      for (
        const module
        of this.dashboard.enabledReportModules ?? []
      ) {

        add(
          'MODULES',
          'Enabled Module',
          module
        );
      }

      // =================================================
      // CSV CREATION
      // =================================================

      const csv =
        rows
          .map(
            row =>
              row
                .map(
                  value =>
                    this.escapeCsvValue(
                      value
                    )
                )
                .join(',')
          )
          .join('\n');

      const blob =
        new Blob(
          [
            '\uFEFF' + csv
          ],
          {
            type:
              'text/csv;charset=utf-8;'
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          'a'
        );

      link.href = url;

      link.download =
        this.createExportFileName(
          'csv'
        );

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );

    } catch (error) {

      console.error(
        'CSV export failed:',
        error
      );

      this.errorMessage =
        'Unable to generate the CSV report. Please try again.';

    } finally {

      this.exporting = false;

      this.cdr.markForCheck();
    }
  }

  // =====================================================
  // CSV ESCAPE
  // =====================================================

  private escapeCsvValue(
    value:
      string |
      number |
      null |
      undefined
  ): string {

    const text =
      String(
        value ?? ''
      );

    if (
      text.includes(',') ||
      text.includes('"') ||
      text.includes('\n') ||
      text.includes('\r')
    ) {

      return `"${text.replace(
        /"/g,
        '""'
      )}"`;
    }

    return text;
  }

  // =====================================================
  // EXPORT FILE NAME
  // =====================================================

  private createExportFileName(
    extension: string
  ): string {

    const tenantCode =
      this.dashboard?.tenant?.code ||
      'TENANT';

    const safeTenantCode =
      tenantCode
        .replace(
          /[^a-zA-Z0-9]/g,
          '-'
        )
        .toUpperCase();

    const today =
      new Date();

    const date =
      [
        today.getFullYear(),

        String(
          today.getMonth() + 1
        ).padStart(2, '0'),

        String(
          today.getDate()
        ).padStart(2, '0')
      ].join('');

    return `HMS-${safeTenantCode}-REPORT-${date}.${extension}`;
  }

  // =====================================================
  // INPUT DATE
  // =====================================================

  private toInputDate(
    date: Date
  ): string {

    return [
      date.getFullYear(),

      String(
        date.getMonth() + 1
      ).padStart(2, '0'),

      String(
        date.getDate()
      ).padStart(2, '0')
    ].join('-');
  }

  // =====================================================
  // COMPACT DATE
  // =====================================================

  private formatCompactDate(
    date: Date
  ): string {

    return [
      date.getFullYear(),

      String(
        date.getMonth() + 1
      ).padStart(2, '0'),

      String(
        date.getDate()
      ).padStart(2, '0')
    ].join('');
  }

  // =====================================================
  // COMPACT TIME
  // =====================================================

  private formatCompactTime(
    date: Date
  ): string {

    return [
      String(
        date.getHours()
      ).padStart(2, '0'),

      String(
        date.getMinutes()
      ).padStart(2, '0'),

      String(
        date.getSeconds()
      ).padStart(2, '0')
    ].join('');
  }
}