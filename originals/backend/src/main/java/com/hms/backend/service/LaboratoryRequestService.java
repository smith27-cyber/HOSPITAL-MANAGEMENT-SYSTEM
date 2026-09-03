package com.hms.backend.service;

import com.hms.backend.entity.LaboratoryRequest;

import java.util.List;
import java.util.Optional;

public interface LaboratoryRequestService {

    List<LaboratoryRequest> getAllRequests();

    Optional<LaboratoryRequest> getRequestById(Long id);

    LaboratoryRequest createRequest(LaboratoryRequest request);

    LaboratoryRequest updateRequest(Long id, LaboratoryRequest request);

    boolean updateRequestStatus(Long id, String status);

    void deleteRequest(Long id);

    List<LaboratoryRequest> getRequestsByPatient(Long patientId);

    List<LaboratoryRequest> getRequestsByConsultation(Long consultationId);

    List<LaboratoryRequest> getRequestsByStatus(String status);

    List<LaboratoryRequest> getCompletedRequestsByPatient(Long patientId);

    List<LaboratoryRequest> getCompletedRequestsByConsultation(
            Long consultationId
    );
}