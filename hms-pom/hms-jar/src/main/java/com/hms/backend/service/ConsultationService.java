package com.hms.backend.service;

import com.hms.backend.dto.ConsultationRequest;
import com.hms.backend.dto.ConsultationResponse;

import java.util.List;

public interface ConsultationService {

    // =====================================================
    // GET ALL
    // =====================================================

    List<ConsultationResponse> getAllConsultations();


    // =====================================================
    // GET BY ID
    // =====================================================

    ConsultationResponse getConsultationById(
            String id
    );


    // =====================================================
    // GET BY PATIENT
    // =====================================================

    List<ConsultationResponse> getConsultationsByPatient(
            String patientId
    );


    // =====================================================
    // GET BY DOCTOR
    // =====================================================

    List<ConsultationResponse> getConsultationsByDoctor(
            String doctorId
    );


    // =====================================================
    // GET BY APPOINTMENT
    // =====================================================

    ConsultationResponse getConsultationByAppointment(
            String appointmentId
    );


    // =====================================================
    // GET BY APPOINTMENT OR NULL
    // =====================================================

    ConsultationResponse getConsultationByAppointmentOrNull(
            String appointmentId
    );


    // =====================================================
    // CREATE
    // =====================================================

    ConsultationResponse createConsultation(
            ConsultationRequest request
    );


    // =====================================================
    // UPDATE
    // =====================================================

    ConsultationResponse updateConsultation(
            String id,
            ConsultationRequest request
    );


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    ConsultationResponse updateStatus(
            String id,
            String status
    );


    // =====================================================
    // REVIEW LABORATORY RESULTS
    // =====================================================

    ConsultationResponse reviewLaboratoryResults(
            String id
    );


    // =====================================================
    // COMPLETE
    // =====================================================

    ConsultationResponse completeConsultation(
            String id
    );


    // =====================================================
    // CANCEL
    // =====================================================

    ConsultationResponse cancelConsultation(
            String id
    );


    // =====================================================
    // DELETE
    // =====================================================

    void deleteConsultation(
            String id
    );
}