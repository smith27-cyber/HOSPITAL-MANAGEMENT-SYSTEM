
package com.hms.backend.service;

import com.hms.backend.entity.PharmacyPrescription;

import java.util.List;

public interface PharmacyPrescriptionService {

    // =====================================================
    // GET ALL
    // =====================================================

    List<PharmacyPrescription> getAllPrescriptions();


    // =====================================================
    // GET BY ID
    // =====================================================

    PharmacyPrescription getPrescriptionById(
        Long id
    );


    // =====================================================
    // GET BY PATIENT
    // =====================================================

    List<PharmacyPrescription> getPrescriptionsByPatient(
        String patientId
    );


    // =====================================================
    // GET BY CONSULTATION
    // =====================================================

    List<PharmacyPrescription> getPrescriptionsByConsultation(
        String consultationId
    );


    // =====================================================
    // GET BY STATUS
    // =====================================================

    List<PharmacyPrescription> getPrescriptionsByStatus(
        String status
    );


    // =====================================================
    // CREATE
    // =====================================================

    PharmacyPrescription createPrescription(
        PharmacyPrescription prescription
    );


    // =====================================================
    // START PREPARING
    // =====================================================

    PharmacyPrescription startPreparing(
        Long id
    );


    // =====================================================
    // SEND TO BILLING
    // =====================================================

    PharmacyPrescription sendToBilling(
        Long id
    );


    // =====================================================
    // CHECK PAYMENT
    // =====================================================

    PharmacyPrescription checkPayment(
        Long id
    );


    // =====================================================
    // DISPENSE
    // =====================================================

    PharmacyPrescription dispense(
        Long id,
        String dispensedBy
    );


    // =====================================================
    // CANCEL
    // =====================================================

    PharmacyPrescription cancelPrescription(
        Long id
    );


    // =====================================================
    // DELETE
    // =====================================================

    void deletePrescription(
        Long id
    );
}

