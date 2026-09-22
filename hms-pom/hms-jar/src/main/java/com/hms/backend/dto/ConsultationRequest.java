
package com.hms.backend.dto;



public class ConsultationRequest {

    // =====================================================
    // RELATED RECORDS
    // =====================================================

    private String patientId;

    private String doctorId;

    private String appointmentId;


    // =====================================================
    // DATE & TIME
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
    // CONSTRUCTOR
    // =====================================================

    public ConsultationRequest() {
    }


    // =====================================================
    // PATIENT ID
    // =====================================================

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }


    // =====================================================
    // DOCTOR ID
    // =====================================================

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }


    // =====================================================
    // APPOINTMENT ID
    // =====================================================

    public String getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }


    // =====================================================
    // CONSULTATION DATE
    // =====================================================

    public String getConsultationDate() {
        return consultationDate;
    }

    public void setConsultationDate(String consultationDate) {
        this.consultationDate = consultationDate;
    }


    // =====================================================
    // CONSULTATION TIME
    // =====================================================

    public String getConsultationTime() {
        return consultationTime;
    }

    public void setConsultationTime(String consultationTime) {
        this.consultationTime = consultationTime;
    }


    // =====================================================
    // CHIEF COMPLAINT
    // =====================================================

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }


    // =====================================================
    // SYMPTOMS
    // =====================================================

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }


    // =====================================================
    // DIAGNOSIS
    // =====================================================

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }


    // =====================================================
    // CLINICAL NOTES
    // =====================================================

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }


    // =====================================================
    // TREATMENT PLAN
    // =====================================================

    public String getTreatmentPlan() {
        return treatmentPlan;
    }

    public void setTreatmentPlan(String treatmentPlan) {
        this.treatmentPlan = treatmentPlan;
    }


    // =====================================================
    // FOLLOW-UP DATE
    // =====================================================

    public String getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(String followUpDate) {
        this.followUpDate = followUpDate;
    }
    
// =====================================================
// PATIENT NAME
// =====================================================

private String patientName;


public String getPatientName() {
    return patientName;
}


public void setPatientName(
        String patientName
) {
    this.patientName = patientName;
}


}

