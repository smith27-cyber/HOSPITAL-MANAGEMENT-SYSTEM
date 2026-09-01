
package com.hms.backend.dto;

import com.hms.backend.entity.Consultation;

public class ConsultationResponse {

    // =====================================================
    // IDENTIFICATION
    // =====================================================

    private String id;


    // =====================================================
    // RELATED RECORDS
    // =====================================================

    private String patientId;

    private String doctorId;

    private String appointmentId;


    // =====================================================
    // CONSULTATION DATE & TIME
    // =====================================================

    private String consultationDate;

    private String consultationTime;


    // =====================================================
    // CLINICAL INFORMATION
    // =====================================================

    private String chiefComplaint;

    private String symptoms;

    private String diagnosis;

    private String clinicalNotes;

    private String treatmentPlan;


    // =====================================================
    // FOLLOW-UP
    // =====================================================

    private String followUpDate;


    // =====================================================
    // WORKFLOW STATUS
    // =====================================================

    private String status;


    // =====================================================
    // WORKFLOW FLAGS
    // =====================================================

    private boolean hasLaboratoryRequests;

    private boolean hasLaboratoryResults;

    private boolean laboratoryResultsReviewed;

    private boolean hasPrescription;

    private boolean hasBilling;


    // =====================================================
    // AUDIT
    // =====================================================

    private String createdAt;

    private String updatedAt;

    private String completedAt;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ConsultationResponse() {
    }


    // =====================================================
    // ENTITY → RESPONSE
    // =====================================================

    public ConsultationResponse(
            Consultation consultation) {

        // -------------------------------------------------
        // IDENTIFICATION
        // -------------------------------------------------

        this.id =
                consultation.getId();


        // -------------------------------------------------
        // RELATED RECORDS
        // -------------------------------------------------

        this.patientId =
                consultation.getPatientId();

        this.doctorId =
                consultation.getDoctorId();

        this.appointmentId =
                consultation.getAppointmentId();


        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        this.consultationDate =
                consultation.getConsultationDate() != null
                        ? consultation.getConsultationDate().toString()
                        : null;


        // -------------------------------------------------
        // TIME
        // -------------------------------------------------

        this.consultationTime =
                consultation.getConsultationTime() != null
                        ? consultation.getConsultationTime().toString()
                        : null;


        // -------------------------------------------------
        // CLINICAL INFORMATION
        // -------------------------------------------------

        this.chiefComplaint =
                consultation.getChiefComplaint();

        this.symptoms =
                consultation.getSymptoms();

        this.diagnosis =
                consultation.getDiagnosis();

        this.clinicalNotes =
                consultation.getClinicalNotes();

        this.treatmentPlan =
                consultation.getTreatmentPlan();


        // -------------------------------------------------
        // FOLLOW-UP
        // -------------------------------------------------

        this.followUpDate =
                consultation.getFollowUpDate() != null
                        ? consultation.getFollowUpDate().toString()
                        : null;


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        this.status =
                consultation.getStatus() != null
                        ? formatStatus(
                                consultation.getStatus()
                          )
                        : null;


        // -------------------------------------------------
        // WORKFLOW FLAGS
        // -------------------------------------------------

        this.hasLaboratoryRequests =
                consultation.isHasLaboratoryRequests();

        this.hasLaboratoryResults =
                consultation.isHasLaboratoryResults();

        this.laboratoryResultsReviewed =
                consultation.isLaboratoryResultsReviewed();

        this.hasPrescription =
                consultation.isHasPrescription();

        this.hasBilling =
                consultation.isHasBilling();


        // -------------------------------------------------
        // AUDIT
        // -------------------------------------------------

        this.createdAt =
                consultation.getCreatedAt() != null
                        ? consultation.getCreatedAt().toString()
                        : null;

        this.updatedAt =
                consultation.getUpdatedAt() != null
                        ? consultation.getUpdatedAt().toString()
                        : null;

        this.completedAt =
                consultation.getCompletedAt() != null
                        ? consultation.getCompletedAt().toString()
                        : null;
    }


    // =====================================================
    // FORMAT STATUS
    // =====================================================

    private String formatStatus(
            Consultation.ConsultationStatus status) {

        String value =
                status.name();

        return value.substring(0, 1)
                + value.substring(1)
                        .toLowerCase()
                        .replace("_", " ");
    }


    // =====================================================
    // GETTERS
    // =====================================================

    public String getId() {
        return id;
    }


    public String getPatientId() {
        return patientId;
    }


    public String getDoctorId() {
        return doctorId;
    }


    public String getAppointmentId() {
        return appointmentId;
    }


    public String getConsultationDate() {
        return consultationDate;
    }


    public String getConsultationTime() {
        return consultationTime;
    }


    public String getChiefComplaint() {
        return chiefComplaint;
    }


    public String getSymptoms() {
        return symptoms;
    }


    public String getDiagnosis() {
        return diagnosis;
    }


    public String getClinicalNotes() {
        return clinicalNotes;
    }


    public String getTreatmentPlan() {
        return treatmentPlan;
    }


    public String getFollowUpDate() {
        return followUpDate;
    }


    public String getStatus() {
        return status;
    }


    // =====================================================
    // WORKFLOW FLAG GETTERS
    // =====================================================

    public boolean isHasLaboratoryRequests() {
        return hasLaboratoryRequests;
    }


    public boolean isHasLaboratoryResults() {
        return hasLaboratoryResults;
    }


    public boolean isLaboratoryResultsReviewed() {
        return laboratoryResultsReviewed;
    }


    public boolean isHasPrescription() {
        return hasPrescription;
    }


    public boolean isHasBilling() {
        return hasBilling;
    }


    // =====================================================
    // AUDIT GETTERS
    // =====================================================

    public String getCreatedAt() {
        return createdAt;
    }


    public String getUpdatedAt() {
        return updatedAt;
    }


    public String getCompletedAt() {
        return completedAt;
    }
}

