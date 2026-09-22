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

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * =====================================================
 * DASHBOARD SERVICE IMPLEMENTATION
 * File:
 * src/main/java/com/hms/backend/service/impl/DashboardServiceImpl.java
 * =====================================================
 *
 * Professional HMS dashboard service.
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

    private final LaboratoryRequestRepository
            laboratoryRequestRepository;

    private final PharmacyPrescriptionRepository
            pharmacyPrescriptionRepository;

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
            InventoryRepository inventoryRepository
    ) {

        this.patientRepository =
                patientRepository;

        this.doctorRepository =
                doctorRepository;

        this.departmentRepository =
                departmentRepository;

        this.appointmentRepository =
                appointmentRepository;

        this.consultationRepository =
                consultationRepository;

        this.laboratoryRequestRepository =
                laboratoryRequestRepository;

        this.pharmacyPrescriptionRepository =
                pharmacyPrescriptionRepository;

        this.inventoryRepository =
                inventoryRepository;
    }


    // =====================================================
    // GET DASHBOARD DATA
    // =====================================================

    @Override
    public DashboardResponse getDashboardData() {

        // =================================================
        // CURRENT DATE
        // =================================================

        LocalDate today =
                LocalDate.now();


        // =================================================
        // CORE STATISTICS
        // =================================================

        long totalPatients =
                patientRepository.count();


        long activeDoctors =
                doctorRepository
                        .countByStatusIgnoreCase(
                                "Active"
                        );


        long totalDepartments =
                departmentRepository.count();


        long totalAppointments =
                appointmentRepository.count();


        // =================================================
        // TODAY'S APPOINTMENTS
        // =================================================

        List<Appointment> todayAppointments =
                appointmentRepository
                        .findByAppointmentDateOrderByAppointmentTimeAsc(
                                today
                        );


        long todaysAppointments =
                todayAppointments.size();


        // =================================================
        // TODAY'S CONSULTATIONS
        // =================================================

        long todaysConsultations =
                consultationRepository
                        .countByConsultationDate(
                                today
                        );


        // =================================================
        // LABORATORY
        // =================================================

        long pendingLaboratoryRequests =
                laboratoryRequestRepository
                        .countByStatusIgnoreCase(
                                "Pending"
                        );


        long pendingLaboratory =
                laboratoryRequestRepository
                        .countByStatusIgnoreCase(
                                "Pending"
                        );


        long completedLaboratory =
                laboratoryRequestRepository
                        .countByStatusIgnoreCase(
                                "Completed"
                        );


        long cancelledLaboratory =
                laboratoryRequestRepository
                        .countByStatusIgnoreCase(
                                "Cancelled"
                        );


        // =================================================
        // PHARMACY
        // =================================================

        long waitingPrescriptions =
                pharmacyPrescriptionRepository
                        .countByStatusIgnoreCase(
                                "Waiting"
                        );


        long preparedPrescriptions =
                pharmacyPrescriptionRepository
                        .countByStatusIgnoreCase(
                                "Prepared"
                        );


        long dispensedPrescriptions =
                pharmacyPrescriptionRepository
                        .countByStatusIgnoreCase(
                                "Dispensed"
                        );


        long pendingPharmacyPrescriptions =
                waitingPrescriptions;


        // =================================================
        // INVENTORY
        // =================================================

        long lowStockItems =
                inventoryRepository
                        .countLowStockItems();


        long expiringItems =
                inventoryRepository
                        .countExpiringItems(
                                today,
                                today.plusDays(30)
                        );


        // =================================================
        // APPOINTMENT STATUS
        // =================================================

        long scheduledAppointments =
                appointmentRepository
                        .countByStatusIgnoreCase(
                                "Scheduled"
                        );


        long completedAppointments =
                appointmentRepository
                        .countByStatusIgnoreCase(
                                "Completed"
                        );


        long cancelledAppointments =
                appointmentRepository
                        .countByStatusIgnoreCase(
                                "Cancelled"
                        );


        // =================================================
        // CONSULTATION STATUS
        // =================================================

        long openConsultations =
                consultationRepository
                        .countByStatus(
                                Consultation.ConsultationStatus.OPEN
                        );


        long completedConsultations =
                consultationRepository
                        .countByStatus(
                                Consultation.ConsultationStatus.COMPLETED
                        );


        long cancelledConsultations =
                consultationRepository
                        .countByStatus(
                                Consultation.ConsultationStatus.CANCELLED
                        );


        // =================================================
        // RETURN DASHBOARD
        // =================================================

        return new DashboardResponse(

                // Core
                totalPatients,

                activeDoctors,

                totalDepartments,

                totalAppointments,

                // Today
                todaysAppointments,

                todaysConsultations,

                // Pending
                pendingLaboratoryRequests,

                pendingPharmacyPrescriptions,

                // Inventory
                lowStockItems,

                expiringItems,

                // Appointment status
                scheduledAppointments,

                completedAppointments,

                cancelledAppointments,

                // Consultation status
                openConsultations,

                completedConsultations,

                cancelledConsultations,

                // Laboratory status
                pendingLaboratory,

                completedLaboratory,

                cancelledLaboratory,

                // Pharmacy status
                waitingPrescriptions,

                preparedPrescriptions,

                dispensedPrescriptions,

                // Today's appointments
                todayAppointments
        );
    }
}