
package com.hms.backend.service;

import com.hms.backend.entity.LaboratoryRequest;

import java.util.List;
import java.util.Optional;

public interface LaboratoryRequestService {

    // =====================================================
    // GET ALL
    // =====================================================

    List<LaboratoryRequest> getAllRequests();


    // =====================================================
    // GET BY ID
    // =====================================================

    Optional<LaboratoryRequest> getRequestById(
            Long id
    );


    // =====================================================
    // CREATE REQUEST
    // =====================================================

    LaboratoryRequest createRequest(
            LaboratoryRequest request
    );


    // =====================================================
    // UPDATE REQUEST
    // =====================================================

    LaboratoryRequest updateRequest(
            Long id,
            LaboratoryRequest request
    );


    // =====================================================
    // UPDATE REQUEST STATUS
    // =====================================================
    //
    // Returns the updated laboratory request.
    //
    // Frontend workflow:
    //
    // Pending
    //      ↓
    // In Progress
    //      ↓
    // Completed
    //
    // =====================================================

    LaboratoryRequest updateRequestStatus(
            Long id,
            String status
    );


    // =====================================================
    // COMPLETE REQUEST
    // =====================================================
    //
    // Explicit laboratory completion operation.
    //
    // Result must exist before completion.
    //
    // =====================================================

    LaboratoryRequest completeRequest(
            Long id
    );


    // =====================================================
    // DELETE REQUEST
    // =====================================================

    void deleteRequest(
            Long id
    );


    // =====================================================
    // GET BY PATIENT
    // =====================================================

    List<LaboratoryRequest> getRequestsByPatient(
            String patientId
    );


    // =====================================================
    // GET BY CONSULTATION
    // =====================================================

    List<LaboratoryRequest> getRequestsByConsultation(
            String consultationId
    );


    // =====================================================
    // GET BY STATUS
    // =====================================================

    List<LaboratoryRequest> getRequestsByStatus(
            String status
    );


    // =====================================================
    // COMPLETED REQUESTS BY PATIENT
    // =====================================================

    List<LaboratoryRequest> getCompletedRequestsByPatient(
            String patientId
    );


    // =====================================================
    // COMPLETED REQUESTS BY CONSULTATION
    // =====================================================

    List<LaboratoryRequest> getCompletedRequestsByConsultation(
            String consultationId
    );
}

