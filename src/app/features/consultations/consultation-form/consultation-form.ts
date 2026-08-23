import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { ConsultationService } from '../../../core/services/consultation.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { LaboratoryService } from '../../../core/services/laboratory.service';

import { Consultation } from '../../../shared/models/consultation.model';
import { Patient } from '../../../shared/models/patient.model';
import { Doctor } from '../../../shared/models/doctor.model';
import { Appointment } from '../../../shared/models/appointment.model';
import { Medicine } from '../../../shared/models/medicine.model';

import {
  PharmacyPrescriptionItem
} from '../../../shared/models/pharmacy.model';

import {
  LaboratoryTest,
  LaboratoryRequest
} from '../../../shared/models/laboratory.model';


@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './consultation-form.html',
  styleUrl: './consultation-form.css'
})
export class ConsultationForm implements OnInit {

  // =====================================================
  // MODE
  // =====================================================

  isEditMode = false;

  consultationId: string | null = null;

  appointmentId: string | null = null;


  // =====================================================
  // DATA
  // =====================================================

  patients: Patient[] = [];

  doctors: Doctor[] = [];

  medicines: Medicine[] = [];

  laboratoryTests: LaboratoryTest[] = [];

  appointment?: Appointment;


  // =====================================================
  // CONSULTATION FEE
  // =====================================================

  consultationFee = 0;


  // =====================================================
  // PRESCRIPTION
  // =====================================================

  prescribedMedicines:
    PharmacyPrescriptionItem[] = [];

  selectedMedicineId = '';

  medicineQuantity = 1;

  medicineDosage = '';

  medicineFrequency = '';

  medicineDuration = '';

  medicineInstructions = '';

  pharmacyNotes = '';


  // =====================================================
  // LABORATORY REQUESTS
  // =====================================================

  laboratoryRequests:
    LaboratoryRequest[] = [];

  selectedLaboratoryTestId = '';

  laboratoryNotes = '';


  // =====================================================
  // CONSULTATION FORM
  // =====================================================

  consultation = {

    patientId: '',

    doctorId: '',

    appointmentId: '',

    consultationDate: '',

    consultationTime: '',

    chiefComplaint: '',

    symptoms: '',

    diagnosis: '',

    clinicalNotes: '',

    treatmentPlan: '',

    followUpDate: '',

    status:
      'Open' as
        | 'Open'
        | 'Completed'
        | 'Cancelled'

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private router: Router,

    private route: ActivatedRoute,

    private consultationService:
      ConsultationService,

    private patientService:
      PatientService,

    private doctorService:
      DoctorService,

    private appointmentService:
      AppointmentService,

    private pharmacyService:
      PharmacyService,

    private laboratoryService:
      LaboratoryService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadPatients();

    this.loadDoctors();

    this.loadMedicines();

    this.loadLaboratoryTests();

    this.loadConsultationFee();

    this.setDefaultDateTime();


    // ===================================================
    // APPOINTMENT QUERY PARAMETER
    // ===================================================

    const appointmentId =
      this.route.snapshot.queryParamMap.get(
        'appointmentId'
      );


    if (appointmentId) {

      this.appointmentId =
        appointmentId;

      this.loadAppointment(
        appointmentId
      );

      return;

    }


    // ===================================================
    // EDIT MODE
    // ===================================================

    const consultationId =
      this.route.snapshot.paramMap.get(
        'id'
      );


    if (!consultationId) {

      return;

    }


    this.isEditMode = true;

    this.consultationId =
      consultationId;

    this.loadConsultation(
      consultationId
    );

  }


  // =====================================================
  // LOAD CONSULTATION FEE
  // =====================================================

  private loadConsultationFee(): void {

    this.consultationFee =
      this.consultationService
        .getConsultationFee();

  }


  // =====================================================
  // LOAD PATIENTS
  // =====================================================

  private loadPatients(): void {

    this.patients =
      this.patientService.getPatients();

  }


  // =====================================================
  // LOAD DOCTORS
  // =====================================================

  private loadDoctors(): void {

    this.doctors =
      this.doctorService
        .getDoctors()
        .filter(
          doctor =>
            doctor.status === 'Active'
        );

  }


  // =====================================================
  // LOAD MEDICINES
  // =====================================================

  private loadMedicines(): void {

    this.medicines =
      this.pharmacyService
        .getAvailableMedicines();

  }


  // =====================================================
  // LOAD LABORATORY TESTS
  // =====================================================

  private loadLaboratoryTests(): void {

    this.laboratoryTests =
      this.laboratoryService
        .getTests();

  }


  // =====================================================
  // DEFAULT DATE / TIME
  // =====================================================

  private setDefaultDateTime(): void {

    const now =
      new Date();


    const year =
      now.getFullYear();


    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        '0'
      );


    this.consultation.consultationDate =
      `${year}-${month}-${day}`;


    this.consultation.consultationTime =
      now.toTimeString()
        .slice(
          0,
          5
        );

  }


  // =====================================================
  // LOAD APPOINTMENT
  // =====================================================

  private loadAppointment(
    id: string
  ): void {

    const appointment =
      this.appointmentService
        .getAppointmentById(
          id
        );


    if (!appointment) {

      alert(
        'Appointment not found.'
      );


      this.router.navigate([
        '/appointments'
      ]);

      return;

    }


    this.appointment =
      appointment;


    // ===================================================
    // VERIFY STATUS
    // ===================================================

    if (
      appointment.status !==
      'In Consultation'
    ) {

      alert(
        'This appointment is not currently in consultation.'
      );


      this.router.navigate([
        '/appointments',
        appointment.id
      ]);

      return;

    }


    // ===================================================
    // PRE-FILL FORM
    // ===================================================

    this.consultation = {

      patientId:
        appointment.patientId,

      doctorId:
        appointment.doctorId,

      appointmentId:
        appointment.id,

      consultationDate:
        appointment.appointmentDate,

      consultationTime:
        appointment.appointmentTime,

      chiefComplaint:
        appointment.reason || '',

      symptoms: '',

      diagnosis:
        appointment.diagnosis || '',

      clinicalNotes:
        appointment.consultationNotes || '',

      treatmentPlan:
        appointment.treatmentPlan || '',

      followUpDate: '',

      status:
        'Open'

    };

  }


  // =====================================================
  // LOAD EXISTING CONSULTATION
  // =====================================================

  private loadConsultation(
    id: string
  ): void {

    const existingConsultation =
      this.consultationService
        .getConsultationById(
          id
        );


    if (!existingConsultation) {

      alert(
        'Consultation not found.'
      );


      this.router.navigate([
        '/consultations'
      ]);

      return;

    }


    this.consultation = {

      patientId:
        existingConsultation.patientId,

      doctorId:
        existingConsultation.doctorId,

      appointmentId:
        existingConsultation.appointmentId || '',

      consultationDate:
        existingConsultation.consultationDate,

      consultationTime:
        existingConsultation.consultationTime,

      chiefComplaint:
        existingConsultation.chiefComplaint,

      symptoms:
        existingConsultation.symptoms || '',

      diagnosis:
        existingConsultation.diagnosis || '',

      clinicalNotes:
        existingConsultation.clinicalNotes || '',

      treatmentPlan:
        existingConsultation.treatmentPlan || '',

      followUpDate:
        existingConsultation.followUpDate || '',

      status:
        existingConsultation.status

    };


    this.appointmentId =
      existingConsultation.appointmentId ||
      null;


    this.loadExistingAppointment();

    this.loadExistingPrescription(
      id
    );

    this.loadExistingLaboratoryRequests(
      id
    );

  }


  // =====================================================
  // LOAD EXISTING APPOINTMENT
  // =====================================================

  private loadExistingAppointment(): void {

    if (!this.appointmentId) {

      return;

    }


    const appointment =
      this.appointmentService
        .getAppointmentById(
          this.appointmentId
        );


    if (appointment) {

      this.appointment =
        appointment;

    }

  }


  // =====================================================
  // LOAD EXISTING PRESCRIPTION
  // =====================================================

  private loadExistingPrescription(
    consultationId: string
  ): void {

    const prescription =
      this.pharmacyService
        .getPrescriptions()
        .find(
          item =>
            item.consultationId ===
            consultationId
        );


    if (!prescription) {

      return;

    }


    this.prescribedMedicines = [
      ...prescription.items
    ];


    this.pharmacyNotes =
      prescription.notes || '';

  }


  // =====================================================
  // LOAD EXISTING LABORATORY REQUESTS
  // =====================================================

  private loadExistingLaboratoryRequests(
    consultationId: string
  ): void {

    this.laboratoryRequests =
      this.laboratoryService
        .getRequests()
        .filter(
          request =>
            request.consultationId ===
            consultationId
        );

  }


  // =====================================================
  // PATIENT NAME
  // =====================================================

  getPatientName(
    patientId: string
  ): string {

    const patient =
      this.patients.find(
        item =>
          item.id ===
          patientId
      );


    if (!patient) {

      return patientId;

    }


    return (
      `${patient.firstName} ${patient.lastName}`
    );

  }


  // =====================================================
  // PATIENT NUMBER
  // =====================================================

  getPatientNumber(
    patientId: string
  ): string {

    const patient =
      this.patients.find(
        item =>
          item.id ===
          patientId
      );


    if (!patient) {

      return patientId;

    }


    return patient.id;

  }


  // =====================================================
  // DOCTOR NAME
  // =====================================================

  getDoctorName(
    doctorId: string
  ): string {

    const doctor =
      this.doctors.find(
        item =>
          item.id ===
          doctorId
      );


    if (!doctor) {

      return doctorId;

    }


    return (
      `Dr. ${doctor.firstName} ${doctor.lastName}`
    );

  }


  // =====================================================
  // SELECTED MEDICINE
  // =====================================================

  getSelectedMedicine():
    Medicine | undefined {

    if (!this.selectedMedicineId) {

      return undefined;

    }


    return this.medicines.find(
      medicine =>
        medicine.id ===
        this.selectedMedicineId
    );

  }


  // =====================================================
  // ADD MEDICINE
  // =====================================================

  addMedicine(): void {

    const medicine =
      this.getSelectedMedicine();


    if (!medicine) {

      alert(
        'Please select a medicine.'
      );

      return;

    }


    // ===================================================
    // QUANTITY VALIDATION
    // ===================================================

    if (
      !Number.isInteger(
        this.medicineQuantity
      ) ||
      this.medicineQuantity <= 0
    ) {

      alert(
        'Please enter a valid medicine quantity.'
      );

      return;

    }


    // ===================================================
    // STOCK VALIDATION
    // ===================================================

    if (
      this.medicineQuantity >
      medicine.quantity
    ) {

      alert(
        `Only ${medicine.quantity} units of ${medicine.name} are currently available.`
      );

      return;

    }


    // ===================================================
    // DUPLICATE VALIDATION
    // ===================================================

    const existing =
      this.prescribedMedicines.find(
        item =>
          item.medicineId ===
          medicine.id
      );


    if (existing) {

      alert(
        'This medicine has already been added to the prescription.'
      );

      return;

    }


    // ===================================================
    // CREATE PRESCRIPTION ITEM
    // =====================================================

    const prescriptionItem:
      PharmacyPrescriptionItem = {

      medicineId:
        medicine.id,

      medicineName:
        medicine.name,

      itemCode:
        medicine.batchNumber,

      quantity:
        this.medicineQuantity,

      unit:
        this.getMedicineUnit(
          medicine
        ),

      unitPrice:
        medicine.unitPrice,

      totalPrice:
        medicine.unitPrice *
        this.medicineQuantity,

      dosage:
        this.medicineDosage.trim() ||
        undefined,

      frequency:
        this.medicineFrequency.trim() ||
        undefined,

      duration:
        this.medicineDuration.trim() ||
        undefined,

      instructions:
        this.medicineInstructions.trim() ||
        undefined

    };


    this.prescribedMedicines.push(
      prescriptionItem
    );


    this.resetMedicineForm();

  }


  // =====================================================
  // REMOVE MEDICINE
  // =====================================================

  removeMedicine(
    medicineId: string
  ): void {

    this.prescribedMedicines =
      this.prescribedMedicines.filter(
        medicine =>
          medicine.medicineId !==
          medicineId
      );

  }


  // =====================================================
  // RESET MEDICINE FORM
  // =====================================================

  private resetMedicineForm(): void {

    this.selectedMedicineId = '';

    this.medicineQuantity = 1;

    this.medicineDosage = '';

    this.medicineFrequency = '';

    this.medicineDuration = '';

    this.medicineInstructions = '';

  }


  // =====================================================
  // MEDICINE UNIT
  // =====================================================

  private getMedicineUnit(
    medicine: Medicine
  ): string {

    switch (
      medicine.form
    ) {

      case 'Tablet':
        return 'Tablet';

      case 'Capsule':
        return 'Capsule';

      case 'Syrup':
        return 'Bottle';

      case 'Injection':
        return 'Vial';

      case 'Cream':
      case 'Ointment':
      case 'Drops':
      case 'Inhaler':
      case 'Other':
      default:
        return 'Piece';

    }

  }


  // =====================================================
  // PRESCRIPTION TOTAL
  // =====================================================

  get prescriptionTotal():
    number {

    return this.prescribedMedicines.reduce(
      (
        total,
        medicine
      ) =>
        total +
        medicine.totalPrice,
      0
    );

  }


  // =====================================================
  // SELECTED LABORATORY TEST
  // =====================================================

  getSelectedLaboratoryTest():
    LaboratoryTest | undefined {

    if (
      !this.selectedLaboratoryTestId
    ) {

      return undefined;

    }


    return this.laboratoryTests.find(
      test =>
        test.id ===
        this.selectedLaboratoryTestId
    );

  }


  // =====================================================
  // ADD LABORATORY TEST
  // =====================================================

  addLaboratoryTest(): void {

    const test =
      this.getSelectedLaboratoryTest();


    if (!test) {

      alert(
        'Please select a laboratory test.'
      );

      return;

    }


    if (
      !this.consultation.patientId
    ) {

      alert(
        'Please select a patient before adding a laboratory test.'
      );

      return;

    }


    const alreadyAdded =
      this.laboratoryRequests.some(
        request =>
          request.testId ===
          test.id
      );


    if (alreadyAdded) {

      alert(
        'This laboratory test has already been added.'
      );

      return;

    }


    const request:
      LaboratoryRequest = {

      id:
        this.generateLaboratoryRequestId(),

      patientId:
        this.consultation.patientId,

      patientName:
        this.getPatientName(
          this.consultation.patientId
        ),

      consultationId:
        this.consultationId ||
        undefined,

      doctorId:
        this.consultation.doctorId,

      doctorName:
        this.getDoctorName(
          this.consultation.doctorId
        ),

      testId:
        test.id,

      testName:
        test.testName,

      category:
        test.category,

      sampleType:
        test.sampleType,

      status:
        'Pending',

      notes:
        this.laboratoryNotes.trim() ||
        undefined,

      price:
        test.price,

      requestedAt:
        new Date().toISOString()

    };


    this.laboratoryRequests.push(
      request
    );


    this.selectedLaboratoryTestId = '';

    this.laboratoryNotes = '';

  }


  // =====================================================
  // REMOVE LABORATORY TEST
  // =====================================================

  removeLaboratoryTest(
    requestId: string
  ): void {

    this.laboratoryRequests =
      this.laboratoryRequests.filter(
        request =>
          request.id !==
          requestId
      );

  }


  // =====================================================
  // LABORATORY TOTAL
  // =====================================================

  get laboratoryTotal():
    number {

    return this.laboratoryRequests.reduce(
      (
        total,
        request
      ) =>
        total +
        request.price,
      0
    );

  }


  // =====================================================
  // GENERATE LAB REQUEST ID
  // =====================================================

  private generateLaboratoryRequestId():
    string {

    const year =
      new Date().getFullYear();


    return (
      `LAB-${year}-${Date.now()}-${Math.floor(
        1000 +
        Math.random() * 9000
      )}`
    );

  }


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    amount: number
  ): string {

    return new Intl.NumberFormat(
      'en-UG',
      {
        style: 'currency',
        currency: 'UGX',
        maximumFractionDigits: 0
      }
    ).format(
      amount || 0
    );

  }


  // =====================================================
  // SAVE CONSULTATION
  // =====================================================

  saveConsultation(): void {

    // ===================================================
    // VALIDATION
    // ===================================================

    if (
      !this.consultation.patientId ||
      !this.consultation.doctorId ||
      !this.consultation.consultationDate ||
      !this.consultation.consultationTime ||
      !this.consultation.chiefComplaint.trim()
    ) {

      alert(
        'Please complete all required consultation fields.'
      );

      return;

    }


    // ===================================================
    // EDIT EXISTING CONSULTATION
    // ===================================================

    if (
      this.isEditMode &&
      this.consultationId
    ) {

      this.updateExistingConsultation();

      return;

    }


    // ===================================================
    // CREATE CONSULTATION
    // ===================================================

    const newConsultation =
      this.consultationService.addConsultation({

        patientId:
          this.consultation.patientId,

        doctorId:
          this.consultation.doctorId,

        appointmentId:
          this.consultation.appointmentId ||
          undefined,

        consultationDate:
          this.consultation.consultationDate,

        consultationTime:
          this.consultation.consultationTime,

        chiefComplaint:
          this.consultation.chiefComplaint.trim(),

        symptoms:
          this.consultation.symptoms.trim() ||
          undefined,

        diagnosis:
          this.consultation.diagnosis.trim() ||
          undefined,

        clinicalNotes:
          this.consultation.clinicalNotes.trim() ||
          undefined,

        treatmentPlan:
          this.consultation.treatmentPlan.trim() ||
          undefined,

        followUpDate:
          this.consultation.followUpDate ||
          undefined

      });


    // ===================================================
    // ASSIGN CONSULTATION ID TO LAB REQUESTS
    // ===================================================

    this.laboratoryRequests =
      this.laboratoryRequests.map(
        request => ({

          ...request,

          consultationId:
            newConsultation.id

        })
      );


    // ===================================================
    // SAVE LABORATORY REQUESTS
    // ===================================================

    const laboratorySuccess =
      this.createLaboratoryRequests();


    if (!laboratorySuccess) {

      alert(
        'Consultation was created, but the laboratory requests could not be created.'
      );

      return;

    }


    // ===================================================
    // COMPLETE CONSULTATION
    // ===================================================

    const completed =
      this.completeConsultationWithPharmacy(
        newConsultation
      );


    if (!completed) {

      alert(
        'Consultation was created, but it could not be completed successfully.'
      );

      return;

    }


    // ===================================================
    // UPDATE APPOINTMENT
    // ===================================================

    if (
      this.appointmentId
    ) {

      this.appointmentService.updateStatus(
        this.appointmentId,
        'Completed'
      );

    }


    // ===================================================
    // SUCCESS MESSAGE
    // ===================================================

    const messages: string[] = [

      `Consultation ${newConsultation.id} completed successfully.`

    ];


    if (
      this.prescribedMedicines.length > 0
    ) {

      messages.push(
        'Prescription sent to Pharmacy.'
      );

    }


    if (
      this.laboratoryRequests.length > 0
    ) {

      messages.push(
        `${this.laboratoryRequests.length} laboratory test(s) sent to Laboratory.`
      );

    }


    alert(
      messages.join('\n')
    );


    // ===================================================
    // REDIRECT
    // ===================================================

    this.router.navigate([
      '/consultations',
      newConsultation.id
    ]);

  }


  // =====================================================
  // CREATE LABORATORY REQUESTS
  // =====================================================

  private createLaboratoryRequests():
    boolean {

    if (
      this.laboratoryRequests.length ===
      0
    ) {

      return true;

    }


    try {

      for (
        const request of
        this.laboratoryRequests
      ) {

        const existing =
          this.laboratoryService
            .getRequestById(
              request.id
            );


        if (existing) {

          continue;

        }


        this.laboratoryService.addRequest(
          request
        );

      }


      return true;

    }

    catch (
      error
    ) {

      console.error(
        'Failed to create laboratory requests:',
        error
      );


      return false;

    }

  }


  // =====================================================
  // UPDATE EXISTING CONSULTATION
  // =====================================================

  private updateExistingConsultation(): void {

    if (!this.consultationId) {

      return;

    }


    const existing =
      this.consultationService
        .getConsultationById(
          this.consultationId
        );


    if (!existing) {

      alert(
        'Consultation record not found.'
      );

      return;

    }


    const updatedConsultation:
      Consultation = {

      id:
        existing.id,

      patientId:
        this.consultation.patientId,

      doctorId:
        this.consultation.doctorId,

      appointmentId:
        this.consultation.appointmentId ||
        undefined,

      consultationDate:
        this.consultation.consultationDate,

      consultationTime:
        this.consultation.consultationTime,

      chiefComplaint:
        this.consultation.chiefComplaint.trim(),

      symptoms:
        this.consultation.symptoms.trim() ||
        undefined,

      diagnosis:
        this.consultation.diagnosis.trim() ||
        undefined,

      clinicalNotes:
        this.consultation.clinicalNotes.trim() ||
        undefined,

      treatmentPlan:
        this.consultation.treatmentPlan.trim() ||
        undefined,

      followUpDate:
        this.consultation.followUpDate ||
        undefined,

      status:
        this.consultation.status,

      createdAt:
        existing.createdAt

    };


    this.consultationService
      .updateConsultation(
        updatedConsultation
      );


    // ===================================================
    // ENSURE LAB REQUESTS HAVE CONSULTATION ID
    // ===================================================

    this.laboratoryRequests =
      this.laboratoryRequests.map(
        request => ({

          ...request,

          consultationId:
            this.consultationId ||
            undefined

        })
      );


    // ===================================================
    // COMPLETED
    // ===================================================

    if (
      updatedConsultation.status ===
      'Completed'
    ) {

      const laboratorySuccess =
        this.createLaboratoryRequests();


      if (!laboratorySuccess) {

        alert(
          'Consultation was updated, but the laboratory requests could not be created.'
        );

        return;

      }


      const completed =
        this.consultationService
          .completeConsultation(
            updatedConsultation.id,
            this.buildPharmacyData()
          );


      if (!completed) {

        alert(
          'Consultation was updated, but the Pharmacy prescription could not be processed.'
        );

        return;

      }

    }


    alert(
      'Consultation updated successfully.'
    );


    this.router.navigate([
      '/consultations',
      updatedConsultation.id
    ]);

  }


  // =====================================================
  // COMPLETE + PHARMACY DATA
  // =====================================================

  private completeConsultationWithPharmacy(
    consultation:
      Consultation
  ): boolean {

    return this.consultationService
      .completeConsultation(
        consultation.id,
        this.buildPharmacyData()
      );

  }


  // =====================================================
  // BUILD PHARMACY DATA
  // =====================================================

  private buildPharmacyData(): {

    patientName: string;

    patientNumber?: string;

    doctorName?: string;

    items:
      PharmacyPrescriptionItem[];

    notes?: string;

  } {

    return {

      patientName:
        this.getPatientName(
          this.consultation.patientId
        ),

      patientNumber:
        this.getPatientNumber(
          this.consultation.patientId
        ),

      doctorName:
        this.getDoctorName(
          this.consultation.doctorId
        ),

      items:
        [
          ...this.prescribedMedicines
        ],

      notes:
        this.pharmacyNotes.trim() ||
        undefined

    };

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    if (
      this.appointmentId
    ) {

      this.router.navigate([
        '/appointments',
        this.appointmentId
      ]);

      return;

    }


    if (
      this.isEditMode &&
      this.consultationId
    ) {

      this.router.navigate([
        '/consultations',
        this.consultationId
      ]);

      return;

    }


    this.router.navigate([
      '/consultations'
    ]);

  }

}
