
// =====================================================
// REPORT COMPONENT
// File:
// src/app/features/reports/report.ts
// =====================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportService } from '../../../core/services/report.service';

import {
  Report,
  ReportType,
  ReportStatus
} from '../../../shared/models/report.model';


@Component({
  selector: 'app-report',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './report.html',

  styleUrl: './report.css'
})
export class ReportComponent implements OnInit {

  // =====================================================
  // STORAGE KEY
  // =====================================================

  private readonly storageKey = 'hms_reports';


  // =====================================================
  // REPORTS
  // =====================================================

  reports: Report[] = [];

  filteredReports: Report[] = [];


  // =====================================================
  // FILTERS
  // =====================================================

  selectedType: ReportType | 'All' = 'All';

  selectedStatus: ReportStatus | 'All' = 'All';

  searchTerm = '';

  startDate = '';

  endDate = '';


  // =====================================================
  // REPORT TYPES
  // =====================================================

  reportTypes: (ReportType | 'All')[] = [

    'All',

    'Appointments',

    'Patients',

    'Doctors',

    'Departments',

    'Consultations',

    'Pharmacy',

    'Laboratory',

    'Admissions',

    'Billing',

    'Inventory',

    'General'

  ];


  // =====================================================
  // REPORT STATUSES
  // =====================================================

  reportStatuses: (ReportStatus | 'All')[] = [

    'All',

    'Generated',

    'Pending',

    'Failed'

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private reportService: ReportService
  ) {}


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.loadReports();

  }


  // =====================================================
  // LOAD REPORTS
  // =====================================================

  loadReports(): void {

    const storedReports =
      localStorage.getItem(
        this.storageKey
      );


    if (!storedReports) {

      this.reports = [];

      this.filteredReports = [];

      return;

    }


    try {

      const parsedReports =
        JSON.parse(
          storedReports
        );


      if (
        Array.isArray(parsedReports)
      ) {

        this.reports =
          parsedReports as Report[];

      } else {

        this.reports = [];

      }

    } catch (error) {

      console.error(
        'Failed to load reports:',
        error
      );

      this.reports = [];

    }


    this.applyFilters();

  }


  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredReports =
      this.reports.filter(
        report => {

          // ---------------------------------------------
          // SEARCH
          // ---------------------------------------------

          const matchesSearch =

            !search ||

            (report.name || '')
              .toLowerCase()
              .includes(search) ||

            (report.type || '')
              .toLowerCase()
              .includes(search) ||

            (report.description || '')
              .toLowerCase()
              .includes(search) ||

            (report.generatedBy || '')
              .toLowerCase()
              .includes(search);


          // ---------------------------------------------
          // REPORT TYPE
          // ---------------------------------------------

          const matchesType =

            this.selectedType === 'All' ||

            report.type ===
              this.selectedType;


          // ---------------------------------------------
          // STATUS
          // ---------------------------------------------

          const matchesStatus =

            this.selectedStatus === 'All' ||

            report.status ===
              this.selectedStatus;


          // ---------------------------------------------
          // START DATE
          // ---------------------------------------------

          const matchesStartDate =

            !this.startDate ||

            !report.startDate ||

            report.startDate >=
              this.startDate;


          // ---------------------------------------------
          // END DATE
          // ---------------------------------------------

          const matchesEndDate =

            !this.endDate ||

            !report.endDate ||

            report.endDate <=
              this.endDate;


          // ---------------------------------------------
          // FINAL RESULT
          // ---------------------------------------------

          return (

            matchesSearch &&

            matchesType &&

            matchesStatus &&

            matchesStartDate &&

            matchesEndDate

          );

        }
      );

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedType = 'All';

    this.selectedStatus = 'All';

    this.startDate = '';

    this.endDate = '';


    this.applyFilters();

  }


  // =====================================================
  // GENERATE REPORT
  // =====================================================

  generateReport(
    type: ReportType
  ): void {

    try {

      const report =
        this.reportService.getReportByType(
          type
        );


      // -----------------------------------------------
      // DATE RANGE
      // -----------------------------------------------

      report.startDate =
        this.startDate ||
        this.getToday();


      report.endDate =
        this.endDate ||
        this.getToday();


      // -----------------------------------------------
      // REPORT INFORMATION
      // -----------------------------------------------

      report.generatedBy =
        report.generatedBy ||
        'Administrator';


      report.generatedAt =
        new Date().toISOString();


      report.status =
        'Generated';


      // -----------------------------------------------
      // ADD TO HISTORY
      // -----------------------------------------------

      this.reports.unshift(
        report
      );


      // -----------------------------------------------
      // SAVE
      // -----------------------------------------------

      this.saveReports();


      // -----------------------------------------------
      // REFRESH
      // -----------------------------------------------

      this.applyFilters();


      // -----------------------------------------------
      // SUCCESS MESSAGE
      // -----------------------------------------------

      window.alert(

        `${type} report generated successfully.\n\n` +

        `Records: ${report.totalRecords ?? 0}\n` +

        `Report ID: ${report.id}`

      );

    } catch (error) {

      console.error(
        'Report generation failed:',
        error
      );


      window.alert(
        `Failed to generate ${type} report.`
      );

    }

  }


  // =====================================================
  // GENERATE ALL REPORTS
  // =====================================================

  generateAllReports(): void {

    const types: ReportType[] = [

      'Appointments',

      'Patients',

      'Doctors',

      'Departments',

      'Consultations',

      'Pharmacy',

      'Laboratory',

      'Admissions',

      'Billing',

      'Inventory',

      'General'

    ];


    let generatedCount = 0;


    try {

      for (
        const type of types
      ) {

        const report =
          this.reportService.getReportByType(
            type
          );


        report.startDate =
          this.startDate ||
          this.getToday();


        report.endDate =
          this.endDate ||
          this.getToday();


        report.generatedBy =
          'Administrator';


        report.generatedAt =
          new Date().toISOString();


        report.status =
          'Generated';


        this.reports.unshift(
          report
        );


        generatedCount++;

      }


      this.saveReports();

      this.applyFilters();


      window.alert(

        `${generatedCount} reports generated successfully.`

      );

    } catch (error) {

      console.error(
        'Failed to generate reports:',
        error
      );


      window.alert(
        'Failed to generate all reports.'
      );

    }

  }


  // =====================================================
  // VIEW REPORT
  // =====================================================

  viewReport(
    report: Report
  ): void {

    const start =
      report.startDate ||
      'Not specified';


    const end =
      report.endDate ||
      'Not specified';


    const generated =
      this.formatDate(
        report.generatedAt
      );


    window.alert(

      `REPORT DETAILS\n\n` +

      `Report: ${report.name}\n` +

      `Report ID: ${report.id}\n` +

      `Type: ${report.type}\n` +

      `Status: ${report.status}\n` +

      `Date Range: ${start} → ${end}\n` +

      `Generated By: ${report.generatedBy || 'System'}\n` +

      `Generated At: ${generated}\n` +

      `Total Records: ${report.totalRecords ?? 0}\n\n` +

      `${report.description || 'No description available.'}`

    );

  }


  // =====================================================
  // DOWNLOAD REPORT
  // =====================================================

  downloadReport(
    report: Report
  ): void {

    const reportData =
      this.prepareReportData(
        report
      );


    if (
      reportData.length === 0
    ) {

      window.alert(
        'There is no report data available to download.'
      );

      return;

    }


    const csv =
      this.convertToCsv(
        reportData
      );


    const blob =
      new Blob(
        [csv],
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


    link.href =
      url;


    link.download =
      report.fileName ||
      `${this.slugify(report.name)}.csv`;


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

  }


  // =====================================================
  // PREPARE REPORT DATA
  // =====================================================

  private prepareReportData(
    report: Report
  ): any[] {

    // -----------------------------------------------
    // DIRECT ARRAY
    // -----------------------------------------------

    if (
      Array.isArray(report.data)
    ) {

      return report.data;

    }


    // -----------------------------------------------
    // RECORDS ARRAY
    // -----------------------------------------------

    if (

      report.data &&

      typeof report.data === 'object' &&

      Array.isArray(
        (report.data as any).records
      )

    ) {

      return (
        (report.data as any).records
      );

    }


    // -----------------------------------------------
    // OBJECT DATA
    // -----------------------------------------------

    if (

      report.data &&

      typeof report.data === 'object'

    ) {

      const data =
        report.data as any;


      const rows: any[] = [];


      Object.keys(data).forEach(
        key => {

          const value =
            data[key];


          if (
            Array.isArray(value)
          ) {

            value.forEach(
              item => {

                if (
                  item &&
                  typeof item === 'object'
                ) {

                  rows.push({

                    module:
                      key,

                    ...item

                  });

                } else {

                  rows.push({

                    module:
                      key,

                    value:
                      item

                  });

                }

              }
            );

          }

        }
      );


      if (
        rows.length > 0
      ) {

        return rows;

      }

    }


    // -----------------------------------------------
    // FALLBACK REPORT DATA
    // -----------------------------------------------

    return [

      {

        reportId:
          report.id,

        reportName:
          report.name,

        type:
          report.type,

        description:
          report.description || '',

        startDate:
          report.startDate || '',

        endDate:
          report.endDate || '',

        generatedBy:
          report.generatedBy || 'System',

        generatedAt:
          report.generatedAt || '',

        status:
          report.status,

        totalRecords:
          report.totalRecords ?? 0,

        totalPatients:
          report.totalPatients ?? 0,

        totalAppointments:
          report.totalAppointments ?? 0,

        totalDoctors:
          report.totalDoctors ?? 0,

        totalRevenue:
          report.totalRevenue ?? 0

      }

    ];

  }


  // =====================================================
  // CONVERT TO CSV
  // =====================================================

  private convertToCsv(
    data: any[]
  ): string {

    if (
      !data ||
      data.length === 0
    ) {

      return '';

    }


    // -----------------------------------------------
    // COLLECT COLUMN NAMES
    // -----------------------------------------------

    const headers =
      new Set<string>();


    data.forEach(
      row => {

        if (
          row &&
          typeof row === 'object'
        ) {

          Object.keys(row).forEach(
            key => {

              headers.add(key);

            }
          );

        }

      }
    );


    const headerArray =
      Array.from(headers);


    // -----------------------------------------------
    // HEADER
    // -----------------------------------------------

    const headerRow =
      headerArray
        .map(
          header =>
            this.escapeCsvValue(
              header
            )
        )
        .join(',');


    // -----------------------------------------------
    // DATA ROWS
    // -----------------------------------------------

    const rows =
      data.map(
        row => {

          return headerArray
            .map(
              header => {

                const value =
                  row?.[header];


                if (

                  value === null ||

                  value === undefined

                ) {

                  return '';

                }


                if (
                  typeof value === 'object'
                ) {

                  return this.escapeCsvValue(
                    JSON.stringify(
                      value
                    )
                  );

                }


                return this.escapeCsvValue(
                  String(value)
                );

              }
            )
            .join(',');

        }
      );


    return (

      headerRow +

      '\n' +

      rows.join('\n')

    );

  }


  // =====================================================
  // ESCAPE CSV VALUE
  // =====================================================

  private escapeCsvValue(
    value: string
  ): string {

    return (

      `"${String(value)
        .replace(
          /"/g,
          '""'
        )}"`

    );

  }


  // =====================================================
  // DELETE REPORT
  // =====================================================

  deleteReport(
    id: string
  ): void {

    const report =
      this.reports.find(
        item =>
          item.id === id
      );


    if (!report) {

      return;

    }


    const confirmed =
      window.confirm(

        `Are you sure you want to delete this report?\n\n` +

        `${report.name}\n` +

        `Report ID: ${report.id}\n\n` +

        `This action cannot be undone.`

      );


    if (!confirmed) {

      return;

    }


    this.reports =
      this.reports.filter(
        item =>
          item.id !== id
      );


    this.saveReports();

    this.applyFilters();

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  get totalReports(): number {

    return this.reports.length;

  }


  get generatedReports(): number {

    return this.reports.filter(
      report =>
        report.status ===
        'Generated'
    ).length;

  }


  get pendingReports(): number {

    return this.reports.filter(
      report =>
        report.status ===
        'Pending'
    ).length;

  }


  get failedReports(): number {

    return this.reports.filter(
      report =>
        report.status ===
        'Failed'
    ).length;

  }


  // =====================================================
  // TOTAL RECORDS
  // =====================================================

  get totalRecords(): number {

    return this.reports.reduce(
      (
        total,
        report
      ) =>

        total +
        (report.totalRecords ?? 0),

      0
    );

  }


  // =====================================================
  // REPORT TYPE COUNT
  // =====================================================

  getTypeCount(
    type: ReportType
  ): number {

    return this.reports.filter(
      report =>
        report.type === type
    ).length;

  }


  // =====================================================
  // STATUS CSS CLASS
  // =====================================================

  getStatusClass(
    status: ReportStatus
  ): string {

    switch (status) {

      case 'Generated':

        return 'status-generated';


      case 'Pending':

        return 'status-pending';


      case 'Failed':

        return 'status-failed';


      default:

        return '';

    }

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?: string
  ): string {

    if (!date) {

      return '—';

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return date;

    }


    return new Intl.DateTimeFormat(
      'en-US',
      {
        dateStyle:
          'medium',

        timeStyle:
          'short'
      }
    ).format(
      parsedDate
    );

  }


  // =====================================================
  // SAVE REPORTS
  // =====================================================

  private saveReports(): void {

    localStorage.setItem(

      this.storageKey,

      JSON.stringify(
        this.reports
      )

    );

  }


  // =====================================================
  // GET TODAY
  // =====================================================

  private getToday(): string {

    const now =
      new Date();


    const year =
      now.getFullYear();


    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        '0'
      );


    return `${year}-${month}-${day}`;

  }


  // =====================================================
  // SLUGIFY FILE NAME
  // =====================================================

  private slugify(
    value: string
  ): string {

    return value

      .toLowerCase()

      .replace(
        /[^a-z0-9]+/g,
        '-'
      )

      .replace(
        /(^-|-$)/g,
        '');

  }

}

