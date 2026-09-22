// =====================================================
// REPORT SERVICE
// File:
// src/app/core/services/report.service.ts
// =====================================================

import { Injectable } from '@angular/core';

import { AppointmentService } from './appointment.service';
import { PatientService } from './patient.service';
import { DoctorService } from './doctor.service';
import { DepartmentService } from './department.service';

import {
  Appointment
} from '../../shared/models/appointment.model';

import {
  Report,
  ReportType
} from '../../shared/models/report.model';


@Injectable({
  providedIn: 'root'
})
export class ReportService {

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService
  ) {}


  // =====================================================
  // GET ALL REPORTS
  // =====================================================

  getReports(): Report[] {

    return [
      this.generateAppointmentReport(),
      this.generatePatientReport(),
      this.generateDoctorReport(),
      this.generateDepartmentReport(),
      this.generateConsultationReport(),
      this.generatePharmacyReport(),
      this.generateLaboratoryReport(),
      this.generateAdmissionReport(),
      this.generateBillingReport(),
      this.generateInventoryReport(),
      this.generateGeneralReport()
    ];

  }


  // =====================================================
  // GET REPORT BY TYPE
  // =====================================================

  getReportByType(
    type: ReportType
  ): Report {

    switch (type) {

      case 'Appointments':
        return this.generateAppointmentReport();

      case 'Patients':
        return this.generatePatientReport();

      case 'Doctors':
        return this.generateDoctorReport();

      case 'Departments':
        return this.generateDepartmentReport();

      case 'Consultations':
        return this.generateConsultationReport();

      case 'Pharmacy':
        return this.generatePharmacyReport();

      case 'Laboratory':
        return this.generateLaboratoryReport();

      case 'Admissions':
        return this.generateAdmissionReport();

      case 'Billing':
        return this.generateBillingReport();

      case 'Inventory':
        return this.generateInventoryReport();

      case 'General':
        return this.generateGeneralReport();

      default:
        return this.generateGeneralReport();

    }

  }


  // =====================================================
  // APPOINTMENT REPORT
  // =====================================================

  generateAppointmentReport(): Report {

    const appointments =
      this.appointmentService.getAppointmentsSnapshot();

    const statistics =
      this.getAppointmentStatistics();

    return {

      id:
        this.generateId('APPOINTMENTS'),

      name:
        'Appointment Report',

      type:
        'Appointments',

      description:
        'Summary of hospital appointments and appointment statuses.',

      generatedBy:
        'Administrator',

      generatedAt:
        new Date().toISOString(),

      status:
        'Generated',

      totalRecords:
        appointments.length,

      totalAppointments:
        appointments.length,

      data: {

        records:
          appointments,

        statistics

      },

      fileName:
        'appointment-report.csv',

      fileType:
        'CSV'

    };

  }


  // =====================================================
  // PATIENT REPORT
  // =====================================================

  generatePatientReport(): Report {

    const patients =
      this.patientService.getPatientsSnapshot();

    return {

      id:
        this.generateId('PATIENTS'),

      name:
        'Patient Report',

      type:
        'Patients',

      description:
        'Summary of registered hospital patients.',

      generatedBy:
        'Administrator',

      generatedAt:
        new Date().toISOString(),

      status:
        'Generated',

      totalRecords:
        patients.length,

      totalPatients:
        patients.length,

      data:
        patients,

      fileName:
        'patient-report.csv',

      fileType:
        'CSV'

    };

  }


  // =====================================================
  // DOCTOR REPORT
  // =====================================================

  generateDoctorReport(): Report {

    const doctors =
      this.doctorService.getDoctorsSnapshot();

    return {

      id:
        this.generateId('DOCTORS'),

      name:
        'Doctor Report',

      type:
        'Doctors',

      description:
        'Summary of registered hospital doctors.',

      generatedBy:
        'Administrator',

      generatedAt:
        new Date().toISOString(),

      status:
        'Generated',

      totalRecords:
        doctors.length,

      totalDoctors:
        doctors.length,

      data:
        doctors,

      fileName:
        'doctor-report.csv',

      fileType:
        'CSV'

    };

  }


  // =====================================================
  // DEPARTMENT REPORT
  // =====================================================
generateDepartmentReport(): Report {

  const departments =
    this.departmentService.getDepartmentsSnapshot();

  return {

    id:
      this.generateId('DEPARTMENTS'),

    name:
      'Department Report',

    type:
      'Departments',

    description:
      'Summary of hospital departments.',

    generatedBy:
      'Administrator',

    generatedAt:
      new Date().toISOString(),

    status:
      'Generated',

    totalRecords:
      departments.length,

    data:
      departments,

    fileName:
      'department-report.csv',

    fileType:
      'CSV'

  };

}


  // =====================================================
  // CONSULTATION REPORT
  // =====================================================

  generateConsultationReport(): Report {

    const consultations =
      this.getStoredRecords([
        'hms_consultations',
        'consultations'
      ]);

    return {

      id:
        this.generateId('CONSULTATIONS'),

      name:
        'Consultation Report',

      type:
        'Consultations',

      description:
        'Summary of patient consultations and clinical records.',

      generatedBy:
        'Administrator',

      generatedAt:
        new Date().toISOString(),

      status:
        'Generated',

      totalRecords:
        consultations.length,

      data:
        consultations,

      fileName:
        'consultation-report.csv',

      fileType:
        'CSV'

    };

  }


  // =====================================================
  // PHARMACY REPORT
  // =====================================================

  generatePharmacyReport(): Report {

    const pharmacyRecords =
      this.getStoredRecords([
        'hms_pharmacy',
        'pharmacy',
        'hms_prescriptions',
        'prescriptions'
      ]);

    return {

      id:
        this.generateId('PHARMACY'),

      name:
        'Pharmacy Report',

      type:
        'Pharmacy',

      description:
        'Summary of pharmacy medicines, prescriptions and pharmacy records.',

      generatedBy:
        'Administrator',

      generatedAt:
        new Date().toISOString(),

      status:
        'Generated',

      totalRecords:
        pharmacyRecords.length,

      data:
        pharmacyRecords,

      fileName:
        'pharmacy-report.csv',

      fileType:
        'CSV'

    };

  }


  // =====================================================
  // LABORATORY REPORT
  // =====================================================

  generateLaboratoryReport(): Report {

    const laboratoryRecords =
      this.getStoredRecords([
        'hms_laboratory',
        'laboratory',
        'hms_lab_requests',
        'lab_requests'
      ]);

    return {

      id:
        this.generateId('LABORATORY'),

      name:
        'Laboratory Report',

      type:
        'Laboratory',

      description:
        'Summary of laboratory tests and laboratory requests.',

      generatedBy:
        'Administrator',

      generatedAt:
        new Date().toISOString(),

      status:
        'Generated',

      totalRecords:
        laboratoryRecords.length,

      data:
        laboratoryRecords,

      fileName:
        'laboratory-report.csv',

      fileType:
        'CSV'

    };

  }


  // =====================================================
  // ADMISSION REPORT
  // =====================================================

  generateAdmissionReport(): Report {

    const admissions =
      this.getStoredRecords([
        'hms_admissions',
        'admissions'
      ]);

    return {

      id:
        this.generateId('ADMISSIONS'),

      name:
        'Admission Report',

      type:
        'Admissions',

      description:
        'Summary of hospital patient admissions and admission records.',

      generatedBy:
        'Administrator',

      generatedAt:
        new Date().toISOString(),

      status:
        'Generated',

      totalRecords:
        admissions.length,

      data:
        admissions,

      fileName:
        'admission-report.csv',

      fileType:
        'CSV'

    };

  }


  // =====================================================
  // BILLING REPORT
  // =====================================================

  generateBillingReport(): Report {

    const billingRecords =
      this.getStoredRecords([
        'hms_billing',
        'billing'
      ]);

    const totalRevenue =
      this.calculateRevenue(
        billingRecords
      );

    return {

      id:
        this.generateId('BILLING'),

      name:
        'Billing Report',

      type:
        'Billing',

      description:
        'Summary of hospital billing, invoices and financial records.',

      generatedBy:
        'Administrator',

      generatedAt:
        new Date().toISOString(),

      status:
        'Generated',

      totalRecords:
        billingRecords.length,

      totalRevenue:
        totalRevenue,

      data:
        billingRecords,

      fileName:
        'billing-report.csv',

      fileType:
        'CSV'

    };

  }


  // =====================================================
  // INVENTORY REPORT
  // =====================================================

  generateInventoryReport(): Report {

    const inventoryRecords =
      this.getStoredRecords([
        'hms_inventory',
        'inventory'
      ]);

    return {

      id:
        this.generateId('INVENTORY'),

      name:
        'Inventory Report',

      type:
        'Inventory',

      description:
        'Summary of hospital inventory and stock records.',

      generatedBy:
        'Administrator',

      generatedAt:
        new Date().toISOString(),

      status:
        'Generated',

      totalRecords:
        inventoryRecords.length,

      data:
        inventoryRecords,

      fileName:
        'inventory-report.csv',

      fileType:
        'CSV'

    };

  }


  // =====================================================
  // GENERAL HMS REPORT
  // =====================================================

  generateGeneralReport(): Report {

    const appointments =
      this.appointmentService.getAppointmentsSnapshot();

    const patients =
      this.patientService.getPatientsSnapshot();

    const doctors =
      this.doctorService.getDoctorsSnapshot();

    const departments =
  this.departmentService.getDepartmentsSnapshot();

    const consultations =
      this.getStoredRecords([
        'hms_consultations',
        'consultations'
      ]);

    const pharmacy =
      this.getStoredRecords([
        'hms_pharmacy',
        'pharmacy',
        'hms_prescriptions',
        'prescriptions'
      ]);

    const laboratory =
      this.getStoredRecords([
        'hms_laboratory',
        'laboratory',
        'hms_lab_requests',
        'lab_requests'
      ]);

    const admissions =
      this.getStoredRecords([
        'hms_admissions',
        'admissions'
      ]);

    const billing =
      this.getStoredRecords([
        'hms_billing',
        'billing'
      ]);

    const inventory =
      this.getStoredRecords([
        'hms_inventory',
        'inventory'
      ]);


    // ===================================================
    // TOTAL RECORDS
    // ===================================================

    const totalRecords =
      appointments.length +
      patients.length +
      doctors.length +
      departments.length +
      consultations.length +
      pharmacy.length +
      laboratory.length +
      admissions.length +
      billing.length +
      inventory.length;


    return {

      id:
        this.generateId('GENERAL'),

      name:
        'General HMS Report',

      type:
        'General',

      description:
        'Comprehensive summary of hospital management system records.',

      generatedBy:
        'Administrator',

      generatedAt:
        new Date().toISOString(),

      status:
        'Generated',

      totalRecords:
        totalRecords,

      totalPatients:
        patients.length,

      totalAppointments:
        appointments.length,

      totalDoctors:
        doctors.length,

      totalRevenue:
        this.calculateRevenue(
          billing
        ),

      data: {

        appointments,

        patients,

        doctors,

        departments,

        consultations,

        pharmacy,

        laboratory,

        admissions,

        billing,

        inventory

      },

      fileName:
        'general-hms-report.csv',

      fileType:
        'CSV'

    };

  }


  // =====================================================
  // APPOINTMENT STATISTICS
  // =====================================================

  getAppointmentStatistics() {

    const appointments: Appointment[] =
      this.appointmentService
        .getAppointmentsSnapshot();


    return {

      total:
        appointments.length,

      scheduled:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'Scheduled'
        ).length,

      confirmed:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'Confirmed'
        ).length,

      checkedIn:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'Checked-In'
        ).length,

      inConsultation:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'In Consultation'
        ).length,

      completed:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'Completed'
        ).length,

      cancelled:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'Cancelled'
        ).length,

      noShow:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'No Show'
        ).length

    };

  }


  // =====================================================
  // DASHBOARD / HMS SUMMARY
  // =====================================================

  getSummary() {

    const appointments: Appointment[] =
      this.appointmentService
        .getAppointmentsSnapshot();

    const patients =
      this.patientService.getPatientsSnapshot();

    const doctors =
      this.doctorService.getDoctorsSnapshot();

    const departments =
  this.departmentService.getDepartmentsSnapshot();

    const consultations =
      this.getStoredRecords([
        'hms_consultations',
        'consultations'
      ]);

    const pharmacy =
      this.getStoredRecords([
        'hms_pharmacy',
        'pharmacy',
        'hms_prescriptions',
        'prescriptions'
      ]);

    const laboratory =
      this.getStoredRecords([
        'hms_laboratory',
        'laboratory',
        'hms_lab_requests',
        'lab_requests'
      ]);

    const admissions =
      this.getStoredRecords([
        'hms_admissions',
        'admissions'
      ]);

    const billing =
      this.getStoredRecords([
        'hms_billing',
        'billing'
      ]);

    const inventory =
      this.getStoredRecords([
        'hms_inventory',
        'inventory'
      ]);


    return {

      // -------------------------------------------------
      // MAIN COUNTS
      // -------------------------------------------------

      totalAppointments:
        appointments.length,

      totalPatients:
        patients.length,

      totalDoctors:
        doctors.length,

      totalDepartments:
        departments.length,

      totalConsultations:
        consultations.length,

      totalPharmacyRecords:
        pharmacy.length,

      totalLaboratoryRecords:
        laboratory.length,

      totalAdmissions:
        admissions.length,

      totalBillingRecords:
        billing.length,

      totalInventoryRecords:
        inventory.length,


      // -------------------------------------------------
      // APPOINTMENT STATISTICS
      // -------------------------------------------------

      scheduledAppointments:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'Scheduled'
        ).length,

      confirmedAppointments:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'Confirmed'
        ).length,

      completedAppointments:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'Completed'
        ).length,

      cancelledAppointments:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'Cancelled'
        ).length,

      checkedInAppointments:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'Checked-In'
        ).length,

      inConsultationAppointments:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'In Consultation'
        ).length,

      noShowAppointments:
        appointments.filter(
          (appointment: Appointment) =>
            appointment.status ===
            'No Show'
        ).length,


      // -------------------------------------------------
      // FINANCIAL
      // -------------------------------------------------

      totalRevenue:
        this.calculateRevenue(
          billing
        )

    };

  }


  // =====================================================
  // GET STORED RECORDS
  // =====================================================

  private getStoredRecords(
    keys: string[]
  ): any[] {

    for (
      const key of keys
    ) {

      const stored =
        localStorage.getItem(
          key
        );


      if (!stored) {

        continue;

      }


      try {

        const parsed =
          JSON.parse(
            stored
          );


        // -----------------------------------------------
        // DIRECT ARRAY
        // -----------------------------------------------

        if (
          Array.isArray(parsed)
        ) {

          return parsed;

        }


        // -----------------------------------------------
        // OBJECT WITH DATA
        // -----------------------------------------------

        if (
          parsed &&
          Array.isArray(
            parsed.data
          )
        ) {

          return parsed.data;

        }


        // -----------------------------------------------
        // OBJECT WITH ITEMS
        // -----------------------------------------------

        if (
          parsed &&
          Array.isArray(
            parsed.items
          )
        ) {

          return parsed.items;

        }


        // -----------------------------------------------
        // OBJECT WITH RECORDS
        // -----------------------------------------------

        if (
          parsed &&
          Array.isArray(
            parsed.records
          )
        ) {

          return parsed.records;

        }

      }

      catch {

        // Ignore invalid localStorage data

      }

    }


    return [];

  }


  // =====================================================
  // CALCULATE BILLING REVENUE
  // =====================================================

  private calculateRevenue(
    records: any[]
  ): number {

    let total = 0;


    for (
      const record of records
    ) {

      if (!record) {

        continue;

      }


      const possibleValues = [

        record.total,

        record.amount,

        record.totalAmount,

        record.grandTotal,

        record.netAmount,

        record.paidAmount,

        record.price

      ];


      for (
        const value of possibleValues
      ) {

        const number =
          Number(
            value
          );


        if (
          Number.isFinite(
            number
          )
        ) {

          total +=
            number;

          break;

        }

      }

    }


    return total;

  }


  // =====================================================
  // GENERATE REPORT ID
  // =====================================================

  private generateId(
    type: string
  ): string {

    return (

      `RPT-${type.toUpperCase()}-` +

      `${Date.now()}-` +

      `${Math.floor(
        Math.random() * 1000
      )}`

    );

  }

}
