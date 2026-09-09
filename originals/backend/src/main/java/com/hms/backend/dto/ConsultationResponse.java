package com.hms.backend.dto;

import com.hms.backend.entity.Consultation;

public class ConsultationResponse {

    private String id;

    private String patientId;

    private String doctorId;

    private String appointmentId;

    private String consultationDate;

    private String consultationTime;

    private String chiefComplaint;

    private String symptoms;

    private String diagnosis;

    private String clinicalNotes;

    private String treatmentPlan;

    private String followUpDate;

    private String status;

    private String createdAt;

    private String updatedAt;

    public ConsultationResponse() {
    }

    public ConsultationResponse(Consultation consultation) {

        this.id = consultation.getId();

        this.patientId = consultation.getPatientId();

        this.doctorId = consultation.getDoctorId();

        this.appointmentId =
            consultation.getAppointmentId();

        this.consultationDate =
            consultation.getConsultationDate() != null
                ? consultation.getConsultationDate().toString()
                : null;

        this.consultationTime =
            consultation.getConsultationTime() != null
                ? consultation.getConsultationTime().toString()
                : null;

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

        this.followUpDate =
            consultation.getFollowUpDate() != null
                ? consultation.getFollowUpDate().toString()
                : null;

        this.status =
            consultation.getStatus() != null
                ? consultation.getStatus().name().substring(0, 1)
                    + consultation.getStatus().name().substring(1).toLowerCase()
                : null;

        this.createdAt =
            consultation.getCreatedAt() != null
                ? consultation.getCreatedAt().toString()
                : null;

        this.updatedAt =
            consultation.getUpdatedAt() != null
                ? consultation.getUpdatedAt().toString()
                : null;
    }

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

    public String getCreatedAt() {
        return createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }
}