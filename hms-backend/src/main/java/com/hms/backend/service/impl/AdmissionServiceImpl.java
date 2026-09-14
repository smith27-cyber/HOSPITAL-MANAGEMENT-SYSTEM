package com.hms.backend.service.impl;

import com.hms.backend.entity.Admission;
import com.hms.backend.entity.Admission.AdmissionStatus;
import com.hms.backend.entity.Admission.WardType;
import com.hms.backend.repository.AdmissionRepository;
import com.hms.backend.service.AdmissionService;
import com.hms.backend.tenant.context.TenantContext;
import com.hms.backend.tenant.entity.Tenant;
import com.hms.backend.tenant.repository.TenantRepository;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AdmissionServiceImpl
        implements AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final TenantRepository tenantRepository;

    public AdmissionServiceImpl(
            AdmissionRepository admissionRepository,
            TenantRepository tenantRepository
    ) {
        this.admissionRepository =
                admissionRepository;
        this.tenantRepository = tenantRepository;
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @Override
    public List<Admission> getAllAdmissions() {

        return admissionRepository.findAllByTenant_IdOrderByAdmissionDateDesc(getCurrentTenantId());
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    public Optional<Admission> getAdmissionById(
            String id
    ) {

        if (isBlank(id)) {
            return Optional.empty();
        }

        return admissionRepository.findByIdAndTenant_Id(
                id.trim(), getCurrentTenantId()
        );
    }

    // =========================================================
    // GET BY PATIENT
    // =========================================================

    @Override
    public List<Admission> getAdmissionsByPatient(
            String patientId
    ) {

        if (isBlank(patientId)) {
            return List.of();
        }

        return admissionRepository
                .findByTenant_IdAndPatientIdOrderByAdmissionDateDesc(
                        getCurrentTenantId(), patientId.trim()
                );
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Override
    public List<Admission> getAdmissionsByStatus(
            AdmissionStatus status
    ) {

        if (status == null) {
            return List.of();
        }

        return admissionRepository
                .findByTenant_IdAndStatusOrderByAdmissionDateDesc(
                        getCurrentTenantId(), status
                );
    }

    // =========================================================
    // GET BY DOCTOR
    // =========================================================

    @Override
    public List<Admission> getAdmissionsByDoctor(
            String doctorId
    ) {

        if (isBlank(doctorId)) {
            return List.of();
        }

        return admissionRepository
                .findByTenant_IdAndDoctorIdOrderByAdmissionDateDesc(
                        getCurrentTenantId(), doctorId.trim()
                );
    }

    // =========================================================
    // GET BY DEPARTMENT
    // =========================================================

    @Override
    public List<Admission> getAdmissionsByDepartment(
            String departmentId
    ) {

        if (isBlank(departmentId)) {
            return List.of();
        }

        return admissionRepository
                .findByTenant_IdAndDepartmentIdOrderByAdmissionDateDesc(
                        getCurrentTenantId(), departmentId.trim()
                );
    }

    // =========================================================
    // GET ACTIVE BY WARD
    // =========================================================

    @Override
    public List<Admission> getActiveAdmissionsByWard(
            WardType ward
    ) {

        if (ward == null) {
            return List.of();
        }

        return admissionRepository
                .findByTenant_IdAndWardAndStatusOrderByAdmissionDateDesc(
                        getCurrentTenantId(), ward,
                        AdmissionStatus.ADMITTED
                );
    }

    // =========================================================
    // GET ACTIVE PATIENT ADMISSION
    // =========================================================

    @Override
    public Optional<Admission> getActiveAdmissionByPatient(
            String patientId
    ) {

        if (isBlank(patientId)) {
            return Optional.empty();
        }

        return admissionRepository
                .findFirstByTenant_IdAndPatientIdAndStatusOrderByAdmissionDateDesc(
                        getCurrentTenantId(), patientId.trim(),
                        AdmissionStatus.ADMITTED
                );
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Override
    public Admission createAdmission(
            Admission admission
    ) {

        validateAdmission(admission);

        String patientId =
                admission.getPatientId().trim();

        /*
         * A patient should not have two active admissions
         * at the same time.
         */
        if (
                admissionRepository
                        .existsByTenant_IdAndPatientIdAndStatus(
                                getCurrentTenantId(), patientId,
                                AdmissionStatus.ADMITTED
                        )
        ) {

            throw new IllegalStateException(
                    "The patient already has an active admission."
            );
        }

        /*
         * Check bed availability when a bed number is supplied.
         */
        if (!isBlank(admission.getBedNumber())) {

            ensureBedAvailable(
                    admission.getWard(),
                    admission.getBedNumber().trim()
            );
        }

        admission.setId(
                generateAdmissionId()
        );

        admission.setPatientId(
                patientId
        );

        admission.setPatientName(
                admission.getPatientName().trim()
        );

        admission.setPatientNumber(
                clean(admission.getPatientNumber())
        );

        admission.setDoctorId(
                clean(admission.getDoctorId())
        );

        admission.setDoctorName(
                clean(admission.getDoctorName())
        );

        admission.setDepartmentId(
                clean(admission.getDepartmentId())
        );

        admission.setDepartmentName(
                clean(admission.getDepartmentName())
        );

        admission.setBedNumber(
                clean(admission.getBedNumber())
        );

        admission.setReason(
                admission.getReason().trim()
        );

        admission.setDiagnosis(
                clean(admission.getDiagnosis())
        );

        admission.setNotes(
                clean(admission.getNotes())
        );

        admission.setStatus(
                AdmissionStatus.ADMITTED
        );
        admission.setTenant(getCurrentTenant());

        if (admission.getAdmissionDate() == null) {

            admission.setAdmissionDate(
                    LocalDateTime.now()
            );
        }

        if (
                admission.getExpectedDischargeDate() != null &&
                admission.getExpectedDischargeDate()
                        .isBefore(
                                admission.getAdmissionDate()
                        )
        ) {

            throw new IllegalArgumentException(
                    "Expected discharge date cannot be before admission date."
            );
        }

        admission.setCreatedAt(
                LocalDateTime.now()
        );

        admission.setUpdatedAt(null);

        return admissionRepository.save(
                admission
        );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public Admission updateAdmission(
            String id,
            Admission updated
    ) {

        if (isBlank(id)) {

            throw new IllegalArgumentException(
                    "Admission ID is required."
            );
        }

        validateAdmission(updated);

        Admission existing =
                admissionRepository.findByIdAndTenant_Id(
                        id.trim(), getCurrentTenantId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Admission record not found."
                        )
                );

        /*
         * Completed/cancelled admissions should not be
         * casually modified.
         */
        if (
                existing.getStatus() ==
                        AdmissionStatus.DISCHARGED
        ) {

            throw new IllegalStateException(
                    "A discharged admission cannot be edited."
            );
        }

        if (
                existing.getStatus() ==
                        AdmissionStatus.CANCELLED
        ) {

            throw new IllegalStateException(
                    "A cancelled admission cannot be edited."
            );
        }

        /*
         * If ward or bed changed, verify the new bed.
         */
        boolean wardChanged =
                existing.getWard() !=
                        updated.getWard();

        boolean bedChanged =
                !safeEquals(
                        existing.getBedNumber(),
                        updated.getBedNumber()
                );

        if (
                (wardChanged || bedChanged) &&
                !isBlank(updated.getBedNumber())
        ) {

            ensureBedAvailable(
                    updated.getWard(),
                    updated.getBedNumber().trim(),
                    existing.getId()
            );
        }

        existing.setPatientId(
                updated.getPatientId().trim()
        );

        existing.setPatientName(
                updated.getPatientName().trim()
        );

        existing.setPatientNumber(
                clean(updated.getPatientNumber())
        );

        existing.setDoctorId(
                clean(updated.getDoctorId())
        );

        existing.setDoctorName(
                clean(updated.getDoctorName())
        );

        existing.setDepartmentId(
                clean(updated.getDepartmentId())
        );

        existing.setDepartmentName(
                clean(updated.getDepartmentName())
        );

        existing.setWard(
                updated.getWard()
        );

        existing.setBedNumber(
                clean(updated.getBedNumber())
        );

        existing.setAdmissionType(
                updated.getAdmissionType()
        );

        existing.setAdmissionDate(
                updated.getAdmissionDate()
        );

        existing.setExpectedDischargeDate(
                updated.getExpectedDischargeDate()
        );

        existing.setReason(
                updated.getReason().trim()
        );

        existing.setDiagnosis(
                clean(updated.getDiagnosis())
        );

        existing.setNotes(
                clean(updated.getNotes())
        );

        /*
         * Status is intentionally NOT taken from the edit
         * request. Status changes have dedicated methods.
         */
        if (
                existing.getExpectedDischargeDate() != null &&
                existing.getExpectedDischargeDate()
                        .isBefore(
                                existing.getAdmissionDate()
                        )
        ) {

            throw new IllegalArgumentException(
                    "Expected discharge date cannot be before admission date."
            );
        }

        existing.setUpdatedAt(
                LocalDateTime.now()
        );

        return admissionRepository.save(
                existing
        );
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @Override
    public Admission updateAdmissionStatus(
            String id,
            AdmissionStatus status
    ) {

        if (isBlank(id)) {

            throw new IllegalArgumentException(
                    "Admission ID is required."
            );
        }

        if (status == null) {

            throw new IllegalArgumentException(
                    "Admission status is required."
            );
        }

        Admission admission =
                admissionRepository.findByIdAndTenant_Id(
                        id.trim(), getCurrentTenantId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Admission record not found."
                        )
                );

        switch (status) {

            case ADMITTED:

                if (
                        admission.getStatus() ==
                                AdmissionStatus.DISCHARGED ||
                        admission.getStatus() ==
                                AdmissionStatus.CANCELLED
                ) {

                    throw new IllegalStateException(
                            "A discharged or cancelled admission cannot be re-admitted."
                    );
                }

                admission.setStatus(
                        AdmissionStatus.ADMITTED
                );

                admission.setDischargeDate(
                        null
                );

                break;

            case DISCHARGED:

                return dischargeAdmission(
                        id
                );

            case TRANSFERRED:

                if (
                        admission.getStatus() !=
                                AdmissionStatus.ADMITTED
                ) {

                    throw new IllegalStateException(
                            "Only an active admission can be transferred."
                    );
                }

                admission.setStatus(
                        AdmissionStatus.TRANSFERRED
                );

                break;

            case CANCELLED:

                if (
                        admission.getStatus() ==
                                AdmissionStatus.DISCHARGED
                ) {

                    throw new IllegalStateException(
                            "A discharged admission cannot be cancelled."
                    );
                }

                admission.setStatus(
                        AdmissionStatus.CANCELLED
                );

                break;
        }

        admission.setUpdatedAt(
                LocalDateTime.now()
        );

        return admissionRepository.save(
                admission
        );
    }

    // =========================================================
    // DISCHARGE
    // =========================================================

    @Override
    public Admission dischargeAdmission(
            String id
    ) {

        Admission admission =
                admissionRepository.findByIdAndTenant_Id(
                        id, getCurrentTenantId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Admission record not found."
                        )
                );

        if (
                admission.getStatus() !=
                        AdmissionStatus.ADMITTED
        ) {

            throw new IllegalStateException(
                    "Only an active admission can be discharged."
            );
        }

        admission.setStatus(
                AdmissionStatus.DISCHARGED
        );

        admission.setDischargeDate(
                LocalDateTime.now()
        );

        admission.setUpdatedAt(
                LocalDateTime.now()
        );

        return admissionRepository.save(
                admission
        );
    }

    // =========================================================
    // TRANSFER
    // =========================================================

    @Override
    public Admission transferAdmission(
            String id,
            WardType newWard,
            String newBedNumber
    ) {

        if (newWard == null) {

            throw new IllegalArgumentException(
                    "New ward is required."
            );
        }

        Admission admission =
                admissionRepository.findByIdAndTenant_Id(
                        id, getCurrentTenantId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Admission record not found."
                        )
                );

        if (
                admission.getStatus() !=
                        AdmissionStatus.ADMITTED
        ) {

            throw new IllegalStateException(
                    "Only an active admission can be transferred."
            );
        }

        if (!isBlank(newBedNumber)) {

            ensureBedAvailable(
                    newWard,
                    newBedNumber.trim(),
                    admission.getId()
            );
        }

        admission.setWard(
                newWard
        );

        admission.setBedNumber(
                clean(newBedNumber)
        );

        admission.setStatus(
                AdmissionStatus.TRANSFERRED
        );

        admission.setUpdatedAt(
                LocalDateTime.now()
        );

        return admissionRepository.save(
                admission
        );
    }

    // =========================================================
    // CANCEL
    // =========================================================

    @Override
    public Admission cancelAdmission(
            String id
    ) {

        Admission admission =
                admissionRepository.findByIdAndTenant_Id(
                        id, getCurrentTenantId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Admission record not found."
                        )
                );

        if (
                admission.getStatus() ==
                        AdmissionStatus.DISCHARGED
        ) {

            throw new IllegalStateException(
                    "A discharged admission cannot be cancelled."
            );
        }

        admission.setStatus(
                AdmissionStatus.CANCELLED
        );

        admission.setUpdatedAt(
                LocalDateTime.now()
        );

        return admissionRepository.save(
                admission
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deleteAdmission(
            String id
    ) {

        Admission admission =
                admissionRepository.findByIdAndTenant_Id(
                        id, getCurrentTenantId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Admission record not found."
                        )
                );

        if (
                admission.getStatus() ==
                        AdmissionStatus.ADMITTED
        ) {

            throw new IllegalStateException(
                    "An active admission cannot be deleted. Discharge or cancel it first."
            );
        }

        admissionRepository.delete(
                admission
        );
    }

    // =========================================================
    // COUNT
    // =========================================================

    @Override
    public long countAdmissions() {

        return admissionRepository.countByTenant_Id(getCurrentTenantId());
    }

    @Override
    public long countActiveAdmissions() {

        return admissionRepository.countByTenant_IdAndStatus(
                getCurrentTenantId(), AdmissionStatus.ADMITTED
        );
    }

    @Override
    public long countDischargedAdmissions() {

        return admissionRepository.countByTenant_IdAndStatus(
                getCurrentTenantId(), AdmissionStatus.DISCHARGED
        );
    }

    @Override
    public long countTransferredAdmissions() {

        return admissionRepository.countByTenant_IdAndStatus(
                getCurrentTenantId(), AdmissionStatus.TRANSFERRED
        );
    }

    @Override
    public long countCancelledAdmissions() {

        return admissionRepository.countByTenant_IdAndStatus(
                getCurrentTenantId(), AdmissionStatus.CANCELLED
        );
    }

    // =========================================================
    // BED AVAILABILITY
    // =========================================================

    private void ensureBedAvailable(
            WardType ward,
            String bedNumber
    ) {

        ensureBedAvailable(
                ward,
                bedNumber,
                null
        );
    }

    private void ensureBedAvailable(
            WardType ward,
            String bedNumber,
            String currentAdmissionId
    ) {

        if (
                ward == null ||
                isBlank(bedNumber)
        ) {
            return;
        }

        Optional<Admission> occupied =
                admissionRepository
                        .findFirstByTenant_IdAndWardAndBedNumberAndStatus(
                                getCurrentTenantId(),
                                ward,
                                bedNumber,
                                AdmissionStatus.ADMITTED
                        );

        if (occupied.isEmpty()) {
            return;
        }

        if (
                currentAdmissionId != null &&
                occupied.get()
                        .getId()
                        .equals(currentAdmissionId)
        ) {
            return;
        }

        throw new IllegalStateException(
                "Bed "
                        + bedNumber
                        + " in "
                        + ward
                        + " is already occupied."
        );
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateAdmission(
            Admission admission
    ) {

        if (admission == null) {

            throw new IllegalArgumentException(
                    "Admission data is required."
            );
        }

        if (
                isBlank(
                        admission.getPatientId()
                )
        ) {

            throw new IllegalArgumentException(
                    "Patient ID is required."
            );
        }

        if (
                isBlank(
                        admission.getPatientName()
                )
        ) {

            throw new IllegalArgumentException(
                    "Patient name is required."
            );
        }

        if (
                admission.getWard() == null
        ) {

            throw new IllegalArgumentException(
                    "Ward is required."
            );
        }

        if (
                admission.getAdmissionType() == null
        ) {

            throw new IllegalArgumentException(
                    "Admission type is required."
            );
        }

        if (
                admission.getAdmissionDate() == null
        ) {

            throw new IllegalArgumentException(
                    "Admission date is required."
            );
        }

        if (
                isBlank(
                        admission.getReason()
                )
        ) {

            throw new IllegalArgumentException(
                    "Reason for admission is required."
            );
        }
    }

    // =========================================================
    // GENERATE ID
    // =========================================================

    private String generateAdmissionId() {

        return "ADM-"
                + LocalDateTime.now()
                .toString()
                .replace("-", "")
                .replace(":", "")
                .replace(".", "")
                .substring(0, 14)
                + "-"
                + UUID.randomUUID()
                .toString()
                .substring(0, 4)
                .toUpperCase();
    }

    // =========================================================
    // CLEAN STRING
    // =========================================================

    private String clean(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String cleaned =
                value.trim();

        return cleaned.isEmpty()
                ? null
                : cleaned;
    }

    // =========================================================
    // BLANK CHECK
    // =========================================================

    private boolean isBlank(
            String value
    ) {

        return value == null ||
                value.trim().isEmpty();
    }

    // =========================================================
    // SAFE EQUALS
    // =========================================================

    private boolean safeEquals(
            String first,
            String second
    ) {

        if (first == null && second == null) {
            return true;
        }

        if (first == null || second == null) {
            return false;
        }

        return first.trim()
                .equals(second.trim());
    }
    private Long getCurrentTenantId() {
        return TenantContext.requireTenantId();
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findById(getCurrentTenantId())
                .orElseThrow(() -> new IllegalStateException(
                        "Current tenant was not found: " + getCurrentTenantId()));
    }

}