package com.hms.backend.service.impl;

import com.hms.backend.dto.ReportBillingTotals;
import com.hms.backend.dto.ReportDashboardResponse;
import com.hms.backend.dto.ReportPharmacyTotals;
import com.hms.backend.entity.HospitalSettings;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.platform.entity.ModuleCode;
import com.hms.backend.repository.AdmissionRepository;
import com.hms.backend.repository.AppointmentRepository;
import com.hms.backend.repository.BillingRepository;
import com.hms.backend.repository.ConsultationRepository;
import com.hms.backend.repository.DepartmentRepository;
import com.hms.backend.repository.DoctorRepository;
import com.hms.backend.repository.HospitalSettingsRepository;
import com.hms.backend.repository.InventoryRepository;
import com.hms.backend.repository.LaboratoryRequestRepository;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.repository.PharmacyPrescriptionRepository;
import com.hms.backend.tenant.repository.TenantRepository;
import com.hms.backend.platform.service.PlatformModuleService;
import com.hms.backend.service.ReportService;
import com.hms.backend.tenant.context.TenantContext;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final TenantRepository tenantRepository;
    private final HospitalSettingsRepository hospitalSettingsRepository;

    private final PlatformModuleService moduleService;

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationRepository consultationRepository;
    private final AdmissionRepository admissionRepository;
    private final LaboratoryRequestRepository laboratoryRequestRepository;

    private final PharmacyPrescriptionRepository pharmacyPrescriptionRepository;
    private final InventoryRepository inventoryRepository;
    private final BillingRepository billingRepository;

    public ReportServiceImpl(
        TenantRepository tenantRepository,
        HospitalSettingsRepository hospitalSettingsRepository,
        PlatformModuleService moduleService,
        PatientRepository patientRepository,
        DoctorRepository doctorRepository,
        DepartmentRepository departmentRepository,
        AppointmentRepository appointmentRepository,
        ConsultationRepository consultationRepository,
        AdmissionRepository admissionRepository,
        LaboratoryRequestRepository laboratoryRequestRepository,
        PharmacyPrescriptionRepository pharmacyPrescriptionRepository,
        InventoryRepository inventoryRepository,
        BillingRepository billingRepository
    ) {
        this.tenantRepository = tenantRepository;
        this.hospitalSettingsRepository = hospitalSettingsRepository;
        this.moduleService = moduleService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.appointmentRepository = appointmentRepository;
        this.consultationRepository = consultationRepository;
        this.admissionRepository = admissionRepository;
        this.laboratoryRequestRepository = laboratoryRequestRepository;
        this.pharmacyPrescriptionRepository = pharmacyPrescriptionRepository;
        this.inventoryRepository = inventoryRepository;
        this.billingRepository = billingRepository;
    }

    // =====================================================
    // MAIN REPORT
    // =====================================================

    @Override
    public ReportDashboardResponse getDashboard(
        LocalDate requestedStartDate,
        LocalDate requestedEndDate
    ) {

        // =================================================
        // 1. CURRENT TENANT
        // =================================================

        Long tenantId = TenantContext.requireTenantId();

        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() ->
                new IllegalStateException(
                    "Current tenant could not be found"
                )
            );

        // =================================================
        // 2. NORMALIZE DATES
        // =================================================

        LocalDate endDate =
            requestedEndDate != null
                ? requestedEndDate
                : LocalDate.now();

        LocalDate startDate =
            requestedStartDate != null
                ? requestedStartDate
                : endDate.withDayOfMonth(1);

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                "Report start date cannot be after end date"
            );
        }

        LocalDateTime startDateTime =
            startDate.atStartOfDay();

        LocalDateTime endExclusive =
            endDate.plusDays(1).atStartOfDay();

        // =================================================
        // 3. HOSPITAL SETTINGS
        // =================================================

        HospitalSettings settings =
            hospitalSettingsRepository
                .findFirstByTenant_IdOrderByIdAsc(tenantId)
                .orElse(null);

        // =================================================
        // 4. MODULE ACCESS
        // =================================================

        Map<String, Boolean> modules =
            resolveModules(tenantId);

        // =================================================
        // 5. GENERAL COUNTS
        // =================================================

        long patients = 0;
        long doctors = 0;
        long departments = 0;
        long appointments = 0;
        long consultations = 0;
        long admissions = 0;
        long laboratoryRequests = 0;
        long pharmacyPrescriptions = 0;
        long inventoryItems = 0;
        long lowStockItems = 0;
        long billingRecords = 0;

        // -------------------------------------------------
        // PATIENTS
        // -------------------------------------------------

        if (isEnabled(modules, "PATIENTS")) {
            patients =
                patientRepository
                    .countByTenant_IdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        tenantId,
                        startDateTime,
                        endExclusive
                    );
        }

        // -------------------------------------------------
        // DOCTORS
        // -------------------------------------------------

        if (isEnabled(modules, "DOCTORS")) {
            doctors =
                doctorRepository
                    .countByTenant_IdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        tenantId,
                        startDateTime,
                        endExclusive
                    );
        }

        // -------------------------------------------------
        // DEPARTMENTS
        // -------------------------------------------------

        if (isEnabled(modules, "DEPARTMENTS")) {
            departments =
                departmentRepository
                    .countByTenant_IdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        tenantId,
                        startDateTime,
                        endExclusive
                    );
        }

        // -------------------------------------------------
        // APPOINTMENTS
        // -------------------------------------------------

        if (isEnabled(modules, "APPOINTMENTS")) {
            appointments =
                appointmentRepository
                    .countByTenant_IdAndAppointmentDateBetween(
                        tenantId,
                        startDate,
                        endDate
                    );
        }

        // -------------------------------------------------
        // CONSULTATIONS
        // -------------------------------------------------

        if (isEnabled(modules, "CONSULTATIONS")) {
            consultations =
                consultationRepository
                    .countByTenant_IdAndConsultationDateBetween(
                        tenantId,
                        startDate,
                        endDate
                    );
        }

        // -------------------------------------------------
        // ADMISSIONS
        // -------------------------------------------------

        if (isEnabled(modules, "ADMISSIONS")) {
            admissions =
                admissionRepository
                    .countByTenant_IdAndAdmissionDateGreaterThanEqualAndAdmissionDateLessThan(
                        tenantId,
                        startDateTime,
                        endExclusive
                    );
        }

        // -------------------------------------------------
        // LABORATORY
        // -------------------------------------------------

        if (isEnabled(modules, "LABORATORY")) {
            laboratoryRequests =
                laboratoryRequestRepository
                    .countByTenant_IdAndRequestedAtGreaterThanEqualAndRequestedAtLessThan(
                        tenantId,
                        startDateTime,
                        endExclusive
                    );
        }

        // -------------------------------------------------
        // PHARMACY
        // -------------------------------------------------

        if (isEnabled(modules, "PHARMACY")) {
            pharmacyPrescriptions =
                pharmacyPrescriptionRepository
                    .countByTenant_IdAndPrescriptionDateGreaterThanEqualAndPrescriptionDateLessThan(
                        tenantId,
                        startDateTime,
                        endExclusive
                    );
        }

        // -------------------------------------------------
        // INVENTORY
        // -------------------------------------------------

        if (isEnabled(modules, "INVENTORY")) {
            inventoryItems =
                inventoryRepository.countByTenant_Id(
                    tenantId
                );

            lowStockItems =
                inventoryRepository.countLowStockItems(
                    tenantId
                );
        }

        // =================================================
        // 6. BILLING ANALYTICS
        // =================================================

        ReportBillingTotals billingTotals =
            ReportBillingTotals.empty();

        if (isEnabled(modules, "BILLING")) {

            ReportBillingTotals result =
                billingRepository.getReportTotals(
                    tenantId,
                    startDateTime,
                    endExclusive
                );

            if (result != null) {
                billingTotals = result;
            }

            billingRecords =
                billingTotals.billingRecords();
        }

        BigDecimal billedAmount =
            safeMoney(billingTotals.billedAmount());

        BigDecimal amountPaid =
            safeMoney(billingTotals.amountPaid());

        BigDecimal outstandingBalance =
            safeMoney(billingTotals.outstandingBalance());

        BigDecimal collectionRate =
            calculatePercentage(
                amountPaid,
                billedAmount
            );

        ReportDashboardResponse.FinancialAnalytics financial =
            new ReportDashboardResponse.FinancialAnalytics(
                amountPaid,
                billedAmount,
                amountPaid,
                outstandingBalance,
                collectionRate
            );

        // =================================================
        // 7. PHARMACY ANALYTICS
        // =================================================

        ReportDashboardResponse.PharmacyAnalytics pharmacy;

        if (isEnabled(modules, "PHARMACY")) {

            ReportPharmacyTotals pharmacyTotals =
                pharmacyPrescriptionRepository.getReportTotals(
                    tenantId,
                    startDateTime,
                    endExclusive
                );

            if (pharmacyTotals == null) {
                pharmacyTotals =
                    ReportPharmacyTotals.empty();
            }

            Long totalItemQuantity =
                pharmacyPrescriptionRepository.getTotalItemQuantity(
                    tenantId,
                    startDateTime,
                    endExclusive
                );

            long totalItems =
                totalItemQuantity != null
                    ? totalItemQuantity
                    : 0L;

            List<ReportDashboardResponse.TopMedicine>
                topMedicines =
                    getTopMedicines(
                        tenantId,
                        startDateTime,
                        endExclusive
                    );

            pharmacy =
                new ReportDashboardResponse.PharmacyAnalytics(
                    safeMoney(pharmacyTotals.totalSales()),
                    pharmacyTotals.prescriptionCount(),
                    totalItems,
                    safeMoney(pharmacyTotals.amountPaid()),
                    safeMoney(pharmacyTotals.outstandingBalance()),
                    topMedicines
                );

        } else {

            pharmacy =
                emptyPharmacyAnalytics();
        }

        // =================================================
        // 8. INVENTORY ANALYTICS
        // =================================================

        ReportDashboardResponse.InventoryAnalytics inventory;

        if (isEnabled(modules, "INVENTORY")) {

            BigDecimal stockValue =
                inventoryRepository.getTotalStockValue(
                    tenantId
                );

            long outOfStock =
                inventoryRepository.countOutOfStockItems(
                    tenantId
                );

            long expiringItems =
                inventoryRepository.countExpiringItems(
                    tenantId,
                    LocalDate.now(),
                    LocalDate.now().plusDays(30)
                );

            inventory =
                new ReportDashboardResponse.InventoryAnalytics(
                    safeMoney(stockValue),
                    inventoryItems,
                    lowStockItems,
                    outOfStock,
                    expiringItems
                );

        } else {

            inventory =
                emptyInventoryAnalytics();
        }

        // =================================================
        // 9. ENABLED REPORT MODULES
        // =================================================

        List<String> enabledReportModules =
            new ArrayList<>();

        // Reports itself is always available when this
        // endpoint is reachable.
        enabledReportModules.add("REPORTS");

        for (Map.Entry<String, Boolean> entry :
            modules.entrySet()) {

            if (Boolean.TRUE.equals(entry.getValue())
                && !"REPORTS".equals(entry.getKey())) {

                enabledReportModules.add(
                    entry.getKey()
                );
            }
        }

        // =================================================
        // 10. TENANT IDENTITY
        // =================================================

        ReportDashboardResponse.TenantInfo tenantInfo =
            buildTenantInfo(
                tenant,
                settings
            );

        // =================================================
        // 11. SUMMARY
        // =================================================

        ReportDashboardResponse.Summary summary =
            new ReportDashboardResponse.Summary(
                patients,
                doctors,
                departments,
                appointments,
                consultations,
                admissions,
                laboratoryRequests,
                pharmacyPrescriptions,
                inventoryItems,
                lowStockItems,
                billingRecords,
                billedAmount,
                amountPaid,
                outstandingBalance
            );

        // =================================================
        // 12. METADATA
        // =================================================

        ReportDashboardResponse.ReportMetadata metadata =
            new ReportDashboardResponse.ReportMetadata(
                "DASHBOARD",
                new ReportDashboardResponse.ReportPeriod(
                    startDate,
                    endDate
                ),
                LocalDateTime.now(),
                "UGX"
            );

        // =================================================
        // 13. FINAL RESPONSE
        // =================================================

        return new ReportDashboardResponse(
            tenantInfo,
            metadata,
            summary,
            financial,
            pharmacy,
            inventory,
            enabledReportModules
        );
    }

    // =====================================================
    // MODULES
    // =====================================================

    private Map<String, Boolean> resolveModules(
        Long tenantId
    ) {

        Map<String, Boolean> modules =
            new LinkedHashMap<>();

        modules.put(
            "PATIENTS",
            isModuleEnabled(
                tenantId,
                ModuleCode.PATIENTS
            )
        );

        modules.put(
            "APPOINTMENTS",
            isModuleEnabled(
                tenantId,
                ModuleCode.APPOINTMENTS
            )
        );

        modules.put(
            "DOCTORS",
            isModuleEnabled(
                tenantId,
                ModuleCode.DOCTORS
            )
        );

        modules.put(
            "DEPARTMENTS",
            isModuleEnabled(
                tenantId,
                ModuleCode.DEPARTMENTS
            )
        );

        modules.put(
            "CONSULTATIONS",
            isModuleEnabled(
                tenantId,
                ModuleCode.CONSULTATIONS
            )
        );

        modules.put(
            "LABORATORY",
            isModuleEnabled(
                tenantId,
                ModuleCode.LABORATORY
            )
        );

        modules.put(
            "PHARMACY",
            isModuleEnabled(
                tenantId,
                ModuleCode.PHARMACY
            )
        );

        modules.put(
            "ADMISSIONS",
            isModuleEnabled(
                tenantId,
                ModuleCode.ADMISSIONS
            )
        );

        modules.put(
            "BILLING",
            isModuleEnabled(
                tenantId,
                ModuleCode.BILLING
            )
        );

        modules.put(
            "INVENTORY",
            isModuleEnabled(
                tenantId,
                ModuleCode.INVENTORY
            )
        );

        modules.put(
            "REPORTS",
            true
        );

        return modules;
    }

    private boolean isModuleEnabled(
        Long tenantId,
        ModuleCode module
    ) {
        return moduleService.isEnabled(
            tenantId,
            module
        );
    }

    private boolean isEnabled(
        Map<String, Boolean> modules,
        String module
    ) {
        return Boolean.TRUE.equals(
            modules.get(module)
        );
    }

    // =====================================================
    // TOP MEDICINES
    // =====================================================

    private List<ReportDashboardResponse.TopMedicine>
    getTopMedicines(
        Long tenantId,
        LocalDateTime startDateTime,
        LocalDateTime endExclusive
    ) {

        List<Object[]> rows =
            pharmacyPrescriptionRepository.getTopMedicines(
                tenantId,
                startDateTime,
                endExclusive
            );

        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }

        List<ReportDashboardResponse.TopMedicine>
            medicines =
                new ArrayList<>();

        int limit = Math.min(
            rows.size(),
            10
        );

        for (int i = 0; i < limit; i++) {

            Object[] row = rows.get(i);

            String medicineName =
                row[0] != null
                    ? row[0].toString()
                    : "Unknown medicine";

            long quantity =
                row[1] instanceof Number
                    ? ((Number) row[1]).longValue()
                    : 0L;

            BigDecimal revenue =
                row[2] instanceof BigDecimal
                    ? (BigDecimal) row[2]
                    : BigDecimal.ZERO;

            medicines.add(
                new ReportDashboardResponse.TopMedicine(
                    medicineName,
                    quantity,
                    safeMoney(revenue)
                )
            );
        }

        return medicines;
    }

    // =====================================================
    // TENANT IDENTITY
    // =====================================================

    private ReportDashboardResponse.TenantInfo
    buildTenantInfo(
        Tenant tenant,
        HospitalSettings settings
    ) {

        String tenantName =
            firstNonBlank(
                settings != null
                    ? settings.getHospitalName()
                    : null,
                tenant.getName()
            );

        String phone =
            firstNonBlank(
                settings != null
                    ? settings.getPhone()
                    : null,
                tenant.getPhone()
            );

        String email =
            firstNonBlank(
                settings != null
                    ? settings.getEmail()
                    : null,
                tenant.getEmail()
            );

        String address =
            firstNonBlank(
                settings != null
                    ? settings.getAddress()
                    : null,
                tenant.getAddress()
            );

        String city =
            firstNonBlank(
                settings != null
                    ? settings.getCity()
                    : null,
                tenant.getCity()
            );

        String country =
            firstNonBlank(
                settings != null
                    ? settings.getCountry()
                    : null,
                tenant.getCountry()
            );

        String website =
            firstNonBlank(
                settings != null
                    ? settings.getWebsite()
                    : null,
                tenant.getWebsite()
            );

        String logoUrl =
            settings != null
                ? settings.getLogoUrl()
                : null;

        String registrationNumber =
            settings != null
                ? settings.getRegistrationNumber()
                : null;

        return new ReportDashboardResponse.TenantInfo(
            tenant.getId(),
            tenant.getCode(),
            tenantName,
            tenant.getType() != null
                ? tenant.getType().name()
                : null,
            phone,
            email,
            address,
            city,
            country,
            website,
            logoUrl,
            registrationNumber
        );
    }

    // =====================================================
    // EMPTY ANALYTICS
    // =====================================================

    private ReportDashboardResponse.PharmacyAnalytics
    emptyPharmacyAnalytics() {

        return new ReportDashboardResponse.PharmacyAnalytics(
            BigDecimal.ZERO,
            0L,
            0L,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            Collections.emptyList()
        );
    }

    private ReportDashboardResponse.InventoryAnalytics
    emptyInventoryAnalytics() {

        return new ReportDashboardResponse.InventoryAnalytics(
            BigDecimal.ZERO,
            0L,
            0L,
            0L,
            0L
        );
    }

    // =====================================================
    // MONEY
    // =====================================================

    private BigDecimal safeMoney(
        BigDecimal value
    ) {
        return value != null
            ? value
            : BigDecimal.ZERO;
    }

    // =====================================================
    // PERCENTAGE
    // =====================================================

    private BigDecimal calculatePercentage(
        BigDecimal numerator,
        BigDecimal denominator
    ) {

        numerator = safeMoney(numerator);
        denominator = safeMoney(denominator);

        if (denominator.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return numerator
            .multiply(BigDecimal.valueOf(100))
            .divide(
                denominator,
                2,
                java.math.RoundingMode.HALF_UP
            );
    }

    // =====================================================
    // STRING FALLBACK
    // =====================================================

    private String firstNonBlank(
        String primary,
        String fallback
    ) {

        if (primary != null
            && !primary.trim().isEmpty()) {

            return primary;
        }

        return fallback;
    }
}