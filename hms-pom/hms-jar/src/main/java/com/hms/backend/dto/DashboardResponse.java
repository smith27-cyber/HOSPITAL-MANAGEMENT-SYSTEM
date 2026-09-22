package com.hms.backend.dto;

import com.hms.backend.entity.Appointment;

import java.util.List;

/**
 * =====================================================
 * DASHBOARD RESPONSE DTO
 * File:
 * src/main/java/com/hms/backend/dto/DashboardResponse.java
 * =====================================================
 *
 * Professional HMS Dashboard response.
 */
public class DashboardResponse {

    // =====================================================
    // CORE STATISTICS
    // =====================================================

    private long totalPatients;

    private long activeDoctors;

    private long totalDepartments;

    private long totalAppointments;


    // =====================================================
    // TODAY'S STATISTICS
    // =====================================================

    private long todaysAppointments;

    private long todaysConsultations;


    // =====================================================
    // PENDING WORK
    // =====================================================

    private long pendingLaboratoryRequests;

    private long pendingPharmacyPrescriptions;


    // =====================================================
    // INVENTORY ALERTS
    // =====================================================

    private long lowStockItems;

    private long expiringItems;


    // =====================================================
    // APPOINTMENT STATUS
    // =====================================================

    private long scheduledAppointments;

    private long completedAppointments;

    private long cancelledAppointments;


    // =====================================================
    // CONSULTATION STATUS
    // =====================================================

    private long openConsultations;

    private long completedConsultations;

    private long cancelledConsultations;


    // =====================================================
    // LABORATORY STATUS
    // =====================================================

    private long pendingLaboratory;

    private long completedLaboratory;

    private long cancelledLaboratory;


    // =====================================================
    // PHARMACY STATUS
    // =====================================================

    private long waitingPrescriptions;

    private long preparedPrescriptions;

    private long dispensedPrescriptions;


    // =====================================================
    // TODAY'S APPOINTMENTS
    // =====================================================

    private List<Appointment> todayAppointments;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public DashboardResponse() {
    }


    public DashboardResponse(
            long totalPatients,
            long activeDoctors,
            long totalDepartments,
            long totalAppointments,
            long todaysAppointments,
            long todaysConsultations,
            long pendingLaboratoryRequests,
            long pendingPharmacyPrescriptions,
            long lowStockItems,
            long expiringItems,
            long scheduledAppointments,
            long completedAppointments,
            long cancelledAppointments,
            long openConsultations,
            long completedConsultations,
            long cancelledConsultations,
            long pendingLaboratory,
            long completedLaboratory,
            long cancelledLaboratory,
            long waitingPrescriptions,
            long preparedPrescriptions,
            long dispensedPrescriptions,
            List<Appointment> todayAppointments
    ) {

        this.totalPatients = totalPatients;
        this.activeDoctors = activeDoctors;
        this.totalDepartments = totalDepartments;
        this.totalAppointments = totalAppointments;

        this.todaysAppointments = todaysAppointments;
        this.todaysConsultations = todaysConsultations;

        this.pendingLaboratoryRequests =
                pendingLaboratoryRequests;

        this.pendingPharmacyPrescriptions =
                pendingPharmacyPrescriptions;

        this.lowStockItems = lowStockItems;
        this.expiringItems = expiringItems;

        this.scheduledAppointments =
                scheduledAppointments;

        this.completedAppointments =
                completedAppointments;

        this.cancelledAppointments =
                cancelledAppointments;

        this.openConsultations =
                openConsultations;

        this.completedConsultations =
                completedConsultations;

        this.cancelledConsultations =
                cancelledConsultations;

        this.pendingLaboratory =
                pendingLaboratory;

        this.completedLaboratory =
                completedLaboratory;

        this.cancelledLaboratory =
                cancelledLaboratory;

        this.waitingPrescriptions =
                waitingPrescriptions;

        this.preparedPrescriptions =
                preparedPrescriptions;

        this.dispensedPrescriptions =
                dispensedPrescriptions;

        this.todayAppointments =
                todayAppointments;
    }


    // =====================================================
    // GETTERS
    // =====================================================

    public long getTotalPatients() {
        return totalPatients;
    }

    public long getActiveDoctors() {
        return activeDoctors;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public long getTodaysAppointments() {
        return todaysAppointments;
    }

    public long getTodaysConsultations() {
        return todaysConsultations;
    }

    public long getPendingLaboratoryRequests() {
        return pendingLaboratoryRequests;
    }

    public long getPendingPharmacyPrescriptions() {
        return pendingPharmacyPrescriptions;
    }

    public long getLowStockItems() {
        return lowStockItems;
    }

    public long getExpiringItems() {
        return expiringItems;
    }

    public long getScheduledAppointments() {
        return scheduledAppointments;
    }

    public long getCompletedAppointments() {
        return completedAppointments;
    }

    public long getCancelledAppointments() {
        return cancelledAppointments;
    }

    public long getOpenConsultations() {
        return openConsultations;
    }

    public long getCompletedConsultations() {
        return completedConsultations;
    }

    public long getCancelledConsultations() {
        return cancelledConsultations;
    }

    public long getPendingLaboratory() {
        return pendingLaboratory;
    }

    public long getCompletedLaboratory() {
        return completedLaboratory;
    }

    public long getCancelledLaboratory() {
        return cancelledLaboratory;
    }

    public long getWaitingPrescriptions() {
        return waitingPrescriptions;
    }

    public long getPreparedPrescriptions() {
        return preparedPrescriptions;
    }

    public long getDispensedPrescriptions() {
        return dispensedPrescriptions;
    }

    public List<Appointment> getTodayAppointments() {
        return todayAppointments;
    }


    // =====================================================
    // SETTERS
    // =====================================================

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public void setActiveDoctors(long activeDoctors) {
        this.activeDoctors = activeDoctors;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public void setTodaysAppointments(long todaysAppointments) {
        this.todaysAppointments = todaysAppointments;
    }

    public void setTodaysConsultations(long todaysConsultations) {
        this.todaysConsultations = todaysConsultations;
    }

    public void setPendingLaboratoryRequests(
            long pendingLaboratoryRequests
    ) {
        this.pendingLaboratoryRequests =
                pendingLaboratoryRequests;
    }

    public void setPendingPharmacyPrescriptions(
            long pendingPharmacyPrescriptions
    ) {
        this.pendingPharmacyPrescriptions =
                pendingPharmacyPrescriptions;
    }

    public void setLowStockItems(long lowStockItems) {
        this.lowStockItems = lowStockItems;
    }

    public void setExpiringItems(long expiringItems) {
        this.expiringItems = expiringItems;
    }

    public void setScheduledAppointments(
            long scheduledAppointments
    ) {
        this.scheduledAppointments =
                scheduledAppointments;
    }

    public void setCompletedAppointments(
            long completedAppointments
    ) {
        this.completedAppointments =
                completedAppointments;
    }

    public void setCancelledAppointments(
            long cancelledAppointments
    ) {
        this.cancelledAppointments =
                cancelledAppointments;
    }

    public void setOpenConsultations(
            long openConsultations
    ) {
        this.openConsultations =
                openConsultations;
    }

    public void setCompletedConsultations(
            long completedConsultations
    ) {
        this.completedConsultations =
                completedConsultations;
    }

    public void setCancelledConsultations(
            long cancelledConsultations
    ) {
        this.cancelledConsultations =
                cancelledConsultations;
    }

    public void setPendingLaboratory(
            long pendingLaboratory
    ) {
        this.pendingLaboratory =
                pendingLaboratory;
    }

    public void setCompletedLaboratory(
            long completedLaboratory
    ) {
        this.completedLaboratory =
                completedLaboratory;
    }

    public void setCancelledLaboratory(
            long cancelledLaboratory
    ) {
        this.cancelledLaboratory =
                cancelledLaboratory;
    }

    public void setWaitingPrescriptions(
            long waitingPrescriptions
    ) {
        this.waitingPrescriptions =
                waitingPrescriptions;
    }

    public void setPreparedPrescriptions(
            long preparedPrescriptions
    ) {
        this.preparedPrescriptions =
                preparedPrescriptions;
    }

    public void setDispensedPrescriptions(
            long dispensedPrescriptions
    ) {
        this.dispensedPrescriptions =
                dispensedPrescriptions;
    }

    public void setTodayAppointments(
            List<Appointment> todayAppointments
    ) {
        this.todayAppointments =
                todayAppointments;
    }
}