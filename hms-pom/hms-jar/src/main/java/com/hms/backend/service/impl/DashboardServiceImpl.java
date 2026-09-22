package com.hms.backend.service.impl;

import com.hms.backend.dto.DashboardResponse;
import com.hms.backend.entity.Appointment;
import com.hms.backend.entity.Consultation;
import com.hms.backend.repository.AppointmentRepository;
import com.hms.backend.repository.ConsultationRepository;
import com.hms.backend.repository.DepartmentRepository;
import com.hms.backend.repository.DoctorRepository;
import com.hms.backend.repository.InventoryRepository;
import com.hms.backend.repository.LaboratoryRequestRepository;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.repository.PharmacyPrescriptionRepository;
import com.hms.backend.service.DashboardService;
import com.hms.backend.tenant.context.TenantContext;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * =====================================================
 * DASHBOARD SERVICE IMPLEMENTATION
 * =====================================================
 *
 * Fully tenant-aware dashboard service.
 *
 * All dashboard statistics are calculated using the
 * current tenant from TenantContext.
 *
 * Tenant-aware modules:
 * - Patients
 * - Doctors
 * - Departments
 * - Appointments
 * - Consultations
 * - Laboratory
 * - Pharmacy
 * - Inventory
 */
@Service
public class DashboardServiceImpl
                implements DashboardService {

        // =====================================================
        // REPOSITORIES
        // =====================================================

        private final PatientRepository patientRepository;

        private final DoctorRepository doctorRepository;

        private final DepartmentRepository departmentRepository;

        private final AppointmentRepository appointmentRepository;

        private final ConsultationRepository consultationRepository;

        private final LaboratoryRequestRepository laboratoryRequestRepository;

        private final PharmacyPrescriptionRepository pharmacyPrescriptionRepository;

        private final InventoryRepository inventoryRepository;

        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public DashboardServiceImpl(
                        PatientRepository patientRepository,
                        DoctorRepository doctorRepository,
                        DepartmentRepository departmentRepository,
                        AppointmentRepository appointmentRepository,
                        ConsultationRepository consultationRepository,
                        LaboratoryRequestRepository laboratoryRequestRepository,
                        PharmacyPrescriptionRepository pharmacyPrescriptionRepository,
                        InventoryRepository inventoryRepository) {

                this.patientRepository = patientRepository;

                this.doctorRepository = doctorRepository;

                this.departmentRepository = departmentRepository;

                this.appointmentRepository = appointmentRepository;

                this.consultationRepository = consultationRepository;

                this.laboratoryRequestRepository = laboratoryRequestRepository;

                this.pharmacyPrescriptionRepository = pharmacyPrescriptionRepository;

                this.inventoryRepository = inventoryRepository;
        }

        // =====================================================
        // GET DASHBOARD DATA
        // =====================================================

        @Override
        public DashboardResponse getDashboardData() {

                // =================================================
                // CURRENT TENANT
                // =================================================

                Long tenantId = TenantContext.requireTenantId();

                // =================================================
                // CURRENT DATE
                // =================================================

                LocalDate today = LocalDate.now();

                // =================================================
                // CORE STATISTICS
                // =================================================

                long totalPatients = patientRepository
                                .findAllByTenant_Id(
                                                tenantId)
                                .size();

                long activeDoctors = doctorRepository
                                .countByTenant_IdAndStatusIgnoreCase(
                                                tenantId,
                                                "Active");

                long totalDepartments = departmentRepository
                                .findAllByTenant_Id(
                                                tenantId)
                                .size();

                long totalAppointments = appointmentRepository
                                .findAllByTenant_Id(
                                                tenantId)
                                .size();

                // =================================================
                // TODAY'S APPOINTMENTS
                // =================================================

                List<Appointment> todayAppointments = appointmentRepository
                                .findByTenant_IdAndAppointmentDateOrderByAppointmentTimeAsc(
                                                tenantId,
                                                today);

                long todaysAppointments = todayAppointments.size();

                // =================================================
                // TODAY'S CONSULTATIONS
                // =================================================

                long todaysConsultations = consultationRepository
                                .countByTenant_IdAndConsultationDate(
                                                tenantId,
                                                today);

                // =================================================
                // LABORATORY
                // =================================================

                long pendingLaboratoryRequests = laboratoryRequestRepository
                                .countByTenant_IdAndStatusIgnoreCase(
                                                tenantId,
                                                "Pending");

                long pendingLaboratory = laboratoryRequestRepository
                                .countByTenant_IdAndStatusIgnoreCase(
                                                tenantId,
                                                "Pending");

                long completedLaboratory = laboratoryRequestRepository
                                .countByTenant_IdAndStatusIgnoreCase(
                                                tenantId,
                                                "Completed");

                long cancelledLaboratory = laboratoryRequestRepository
                                .countByTenant_IdAndStatusIgnoreCase(
                                                tenantId,
                                                "Cancelled");

                // =================================================
                // PHARMACY
                // =================================================

                /*
                 * Pharmacy statuses currently used by the system:
                 *
                 * Waiting
                 * Preparing
                 * Awaiting Payment
                 * Ready for Pickup
                 * Dispensed
                 * Cancelled
                 */

                long waitingPrescriptions = pharmacyPrescriptionRepository
                                .countByTenant_IdAndStatusIgnoreCase(
                                                tenantId,
                                                "Waiting");

                /*
                 * The old dashboard used "Prepared", but the
                 * pharmacy workflow uses "Preparing".
                 */
                long preparedPrescriptions = pharmacyPrescriptionRepository
                                .countByTenant_IdAndStatusIgnoreCase(
                                                tenantId,
                                                "Preparing");

                long dispensedPrescriptions = pharmacyPrescriptionRepository
                                .countByTenant_IdAndStatusIgnoreCase(
                                                tenantId,
                                                "Dispensed");

                long pendingPharmacyPrescriptions = waitingPrescriptions;

                // =================================================
                // INVENTORY
                // =================================================

                long lowStockItems = inventoryRepository
                                .countLowStockItems(
                                                tenantId);

                long expiringItems = inventoryRepository
                                .countExpiringItems(
                                                tenantId,
                                                today,
                                                today.plusDays(30));

                // =================================================
                // APPOINTMENT STATUS
                // =================================================

                long scheduledAppointments = appointmentRepository
                                .countByTenant_IdAndStatusIgnoreCase(
                                                tenantId,
                                                "Scheduled");

                long completedAppointments = appointmentRepository
                                .countByTenant_IdAndStatusIgnoreCase(
                                                tenantId,
                                                "Completed");

                long cancelledAppointments = appointmentRepository
                                .countByTenant_IdAndStatusIgnoreCase(
                                                tenantId,
                                                "Cancelled");

                // =================================================
                // CONSULTATION STATUS
                // =================================================

                long openConsultations = consultationRepository
                                .countByTenant_IdAndStatus(
                                                tenantId,
                                                Consultation.ConsultationStatus.OPEN);

                long completedConsultations = consultationRepository
                                .countByTenant_IdAndStatus(
                                                tenantId,
                                                Consultation.ConsultationStatus.COMPLETED);

                long cancelledConsultations = consultationRepository
                                .countByTenant_IdAndStatus(
                                                tenantId,
                                                Consultation.ConsultationStatus.CANCELLED);

                // =================================================
                // RETURN DASHBOARD
                // =================================================

                return new DashboardResponse(

                                // -------------------------------------------------
                                // CORE
                                // -------------------------------------------------

                                totalPatients,

                                activeDoctors,

                                totalDepartments,

                                totalAppointments,

                                // -------------------------------------------------
                                // TODAY
                                // -------------------------------------------------

                                todaysAppointments,

                                todaysConsultations,

                                // -------------------------------------------------
                                // PENDING
                                // -------------------------------------------------

                                pendingLaboratoryRequests,

                                pendingPharmacyPrescriptions,

                                // -------------------------------------------------
                                // INVENTORY
                                // -------------------------------------------------

                                lowStockItems,

                                expiringItems,

                                // -------------------------------------------------
                                // APPOINTMENT STATUS
                                // -------------------------------------------------

                                scheduledAppointments,

                                completedAppointments,

                                cancelledAppointments,

                                // -------------------------------------------------
                                // CONSULTATION STATUS
                                // -------------------------------------------------

                                openConsultations,

                                completedConsultations,

                                cancelledConsultations,

                                // -------------------------------------------------
                                // LABORATORY STATUS
                                // -------------------------------------------------

                                pendingLaboratory,

                                completedLaboratory,

                                cancelledLaboratory,

                                // -------------------------------------------------
                                // PHARMACY STATUS
                                // -------------------------------------------------

                                waitingPrescriptions,

                                preparedPrescriptions,

                                dispensedPrescriptions,

                                // -------------------------------------------------
                                // TODAY'S APPOINTMENTS
                                // -------------------------------------------------

                                todayAppointments);
        }
}