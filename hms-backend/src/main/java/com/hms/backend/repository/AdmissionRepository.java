package com.hms.backend.repository;

import com.hms.backend.entity.Admission;
import com.hms.backend.entity.Admission.AdmissionStatus;
import com.hms.backend.entity.Admission.WardType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, String> {

    List<Admission> findAllByTenant_IdOrderByAdmissionDateDesc(Long tenantId);

    Optional<Admission> findByIdAndTenant_Id(String id, Long tenantId);

    List<Admission> findByTenant_IdAndPatientIdOrderByAdmissionDateDesc(Long tenantId, String patientId);

    List<Admission> findByTenant_IdAndStatusOrderByAdmissionDateDesc(Long tenantId, AdmissionStatus status);

    Optional<Admission> findFirstByTenant_IdAndPatientIdAndStatusOrderByAdmissionDateDesc(
            Long tenantId, String patientId, AdmissionStatus status);

    List<Admission> findByTenant_IdAndDoctorIdOrderByAdmissionDateDesc(Long tenantId, String doctorId);

    List<Admission> findByTenant_IdAndDepartmentIdOrderByAdmissionDateDesc(Long tenantId, String departmentId);

    List<Admission> findByTenant_IdAndWardAndStatusOrderByAdmissionDateDesc(
            Long tenantId, WardType ward, AdmissionStatus status);

    Optional<Admission> findFirstByTenant_IdAndWardAndBedNumberAndStatus(
            Long tenantId, WardType ward, String bedNumber, AdmissionStatus status);

    boolean existsByTenant_IdAndPatientIdAndStatus(Long tenantId, String patientId, AdmissionStatus status);

    long countByTenant_Id(Long tenantId);
    long countByTenant_IdAndStatus(Long tenantId, AdmissionStatus status);
}