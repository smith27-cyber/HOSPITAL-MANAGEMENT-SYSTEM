// =====================================================
// CONSULTATION FORM COMPONENT
// File:
// src/app/features/consultations/consultation-form/consultation-form.ts
// =====================================================

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  forkJoin,
  Observable,
  of
} from 'rxjs';

import {
  catchError
} from 'rxjs/operators';


import {
  ConsultationService
} from '../../../core/services/consultation.service';

import {
  PatientService
} from '../../../core/services/patient.service';

import {
  DoctorService
} from '../../../core/services/doctor.service';

import {
  AppointmentService
} from '../../../core/services/appointment.service';

import {
  PharmacyService
} from '../../../core/services/pharmacy.service';

import {
  LaboratoryService
} from '../../../core/services/laboratory.service';


import {
  Consultation
} from '../../../shared/models/consultation.model';

import {
  Patient
} from '../../../shared/models/patient.model';

import {
  Doctor
} from '../../../shared/models/doctor.model';

import {
  Appointment
} from '../../../shared/models/appointment.model';

import {
  Medicine
} from '../../../shared/models/medicine.model';

import {PharmacyPrescription,
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
  // SELECTED PATIENT
  // =====================================================

  selectedPatient?: Patient;


  // =====================================================
  // SELECTED DOCTOR
  // =====================================================

  selectedDoctor?: Doctor;


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = false;

  isSaving = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


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
        'Open' |
        'Completed' |
        'Cancelled'

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
// =====================================================
// INITIALIZE
// =====================================================

ngOnInit(): void {

  this.isLoading = true;

  this.setDefaultDateTime();

  this.loadConsultationFee();

  const appointmentId =
    this.route.snapshot
      .queryParamMap
      .get('appointmentId');

  const consultationId =
    this.route.snapshot
      .paramMap
      .get('id');


  // ===================================================
  // REGISTER FROM APPOINTMENT
  // ===================================================

  if (appointmentId) {

    this.appointmentId =
      appointmentId;

    this.loadRegistrationData(
      appointmentId
    );

    return;
  }


  // ===================================================
  // EDIT EXISTING CONSULTATION
  // ===================================================

  if (consultationId) {

    this.isEditMode = true;

    this.consultationId =
      consultationId;

    this.loadEditData(
      consultationId
    );

    return;
  }


  // ===================================================
  // NEW CONSULTATION WITHOUT APPOINTMENT
  // ===================================================

  this.loadNewConsultationData();

}
  loadRegistrationData(appointmentId: string) {
    throw new Error('Method not implemented.');
  }
  loadEditData(consultationId: string) {
    throw new Error('Method not implemented.');
  }
  loadNewConsultationData() {
    throw new Error('Method not implemented.');
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

    this.isLoading = true;

    this.patientService
      .getPatients()
      .subscribe({

        next:
          (patients: Patient[]) => {

            this.patients =
              Array.isArray(patients)
                ? [...patients]
                : [];

            this.syncSelectedPatient();

            this.isLoading = false;

          },

        error:
          (error: unknown) => {

            console.error(
              'Failed to load patients:',
              error
            );

            this.patients = [];

            this.selectedPatient =
              undefined;

            this.isLoading = false;

          }

      });

  }


  // =====================================================
  // LOAD DOCTORS
  // =====================================================

  private loadDoctors(): void {

    this.doctorService
      .getDoctors()
      .subscribe({

        next:
          (allDoctors: Doctor[]) => {

            this.doctors =
              Array.isArray(allDoctors)
                ? allDoctors.filter(
                    (doctor: Doctor) =>
                      doctor.status === 'Active'
                  )
                : [];

            this.syncSelectedDoctor();

          },

        error:
          (error: unknown) => {

            console.error(
              'Failed to load doctors:',
              error
            );

            this.doctors = [];

            this.selectedDoctor =
              undefined;

          }

      });

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

    this.laboratoryService
      .getTests()
      .subscribe({

        next:
          (tests: LaboratoryTest[]) => {

            this.laboratoryTests =
              Array.isArray(tests)
                ? [...tests]
                : [];

          },

        error:
          (error: unknown) => {

            console.error(
              'Failed to load laboratory tests:',
              error
            );

            this.laboratoryTests = [];

          }

      });

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
      now.toTimeString().slice(
        0,
        5
      );

  }


  // =====================================================
  // PATIENT CHANGE
  // =====================================================

  onPatientChange(): void {

    const patientId =
      this.consultation.patientId;


    if (!patientId) {

      this.selectedPatient =
        undefined;

      return;

    }


    this.selectedPatient =
      this.patients.find(
        patient =>
          patient.id === patientId
      );


    if (!this.selectedPatient) {

      console.warn(
        'Selected patient could not be found:',
        patientId
      );

      return;

    }


    this.consultation.patientId =
      this.selectedPatient.id;

  }


  // =====================================================
  // SYNC SELECTED PATIENT
  // =====================================================

  private syncSelectedPatient(): void {

    if (!this.consultation.patientId) {

      this.selectedPatient =
        undefined;

      return;

    }


    this.selectedPatient =
      this.patients.find(
        patient =>
          patient.id ===
          this.consultation.patientId
      );

  }


  // =====================================================
  // DOCTOR CHANGE
  // =====================================================

  onDoctorChange(): void {

    const doctorId =
      this.consultation.doctorId;


    if (!doctorId) {

      this.selectedDoctor =
        undefined;

      return;

    }


    this.selectedDoctor =
      this.doctors.find(
        doctor =>
          doctor.id === doctorId
      );

  }


  // =====================================================
  // SYNC SELECTED DOCTOR
  // =====================================================

  private syncSelectedDoctor(): void {

    if (!this.consultation.doctorId) {

      this.selectedDoctor =
        undefined;

      return;

    }


    this.selectedDoctor =
      this.doctors.find(
        doctor =>
          doctor.id ===
          this.consultation.doctorId
      );

  }


  // =====================================================
  // LOAD APPOINTMENT
  // =====================================================

  private loadAppointment(
    id: string
  ): void {

    this.appointmentService
      .getAppointmentById(id)
      .subscribe({

        next:
          (appointment: Appointment) => {

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


            // -------------------------------------------
            // APPOINTMENT STATUS
            // -------------------------------------------

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


            // -------------------------------------------
            // PATIENT
            // -------------------------------------------

            this.consultation.patientId =
              appointment.patientId;


            // -------------------------------------------
            // DOCTOR
            // -------------------------------------------

            this.consultation.doctorId =
              appointment.doctorId;


            // -------------------------------------------
            // APPOINTMENT
            // -------------------------------------------

            this.consultation.appointmentId =
              appointment.id;

            this.appointmentId =
              appointment.id;


            // -------------------------------------------
            // DATE / TIME
            // -------------------------------------------

            this.consultation.consultationDate =
              appointment.appointmentDate;

            this.consultation.consultationTime =
              appointment.appointmentTime;


            // -------------------------------------------
            // CLINICAL INFORMATION
            // -------------------------------------------

            this.consultation.chiefComplaint =
              appointment.reason || '';

            this.consultation.diagnosis =
              appointment.diagnosis || '';

            this.consultation.clinicalNotes =
              appointment.consultationNotes || '';

            this.consultation.treatmentPlan =
              appointment.treatmentPlan || '';


            this.consultation.status =
              'Open';


            // -------------------------------------------
            // SYNC
            // -------------------------------------------

            this.syncSelectedPatient();

            this.syncSelectedDoctor();

          },

        error:
          (error: unknown) => {

            console.error(
              'Failed to load appointment:',
              error
            );

            alert(
              'Unable to load appointment.'
            );

            this.router.navigate([
              '/appointments'
            ]);

          }

      });

  }


  // =====================================================
  // LOAD EXISTING CONSULTATION
  // =====================================================

  private loadConsultation(
    id: string
  ): void {

    this.consultationService
      .getConsultationById(id)
      .subscribe({

        next:
          (existingConsultation:
            Consultation) => {

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
                existingConsultation
                  .appointmentId || '',

              consultationDate:
                existingConsultation
                  .consultationDate,

              consultationTime:
                existingConsultation
                  .consultationTime,

              chiefComplaint:
                existingConsultation
                  .chiefComplaint,

              symptoms:
                existingConsultation
                  .symptoms || '',

              diagnosis:
                existingConsultation
                  .diagnosis || '',

              clinicalNotes:
                existingConsultation
                  .clinicalNotes || '',

              treatmentPlan:
                existingConsultation
                  .treatmentPlan || '',

              followUpDate:
                existingConsultation
                  .followUpDate || '',

              status:
                existingConsultation.status

            };


            this.appointmentId =
              existingConsultation
                .appointmentId ||
              null;


            this.syncSelectedPatient();

            this.syncSelectedDoctor();


            this.loadExistingAppointment();

            this.loadExistingPrescription(
              id
            );

            this.loadExistingLaboratoryRequests(
              id
            );

          },

        error:
          (error: unknown) => {

            console.error(
              'Failed to load consultation:',
              error
            );

            alert(
              'Unable to load consultation.'
            );

            this.router.navigate([
              '/consultations'
            ]);

          }

      });

  }


  // =====================================================
  // LOAD EXISTING APPOINTMENT
  // =====================================================

  private loadExistingAppointment(): void {

    if (!this.appointmentId) {

      return;

    }


    this.appointmentService
      .getAppointmentById(
        this.appointmentId
      )
      .subscribe({

        next:
          (appointment: Appointment) => {

            this.appointment =
              appointment;

          },

        error:
          (error: unknown) => {

            console.error(
              'Failed to load existing appointment:',
              error
            );

          }

      });

  }


// =====================================================
// LOAD EXISTING PRESCRIPTION
// =====================================================

private loadExistingPrescription(
  consultationId: string
): void {

  this.pharmacyService
    .getPrescriptions()
    .subscribe({

      next:
        (prescriptions: PharmacyPrescription[]) => {

          const prescription =
            prescriptions.find(
              (item: PharmacyPrescription) =>
                item.consultationId ===
                consultationId
            );


          if (!prescription) {

            this.prescribedMedicines = [];

            this.pharmacyNotes = '';

            return;

          }


          this.prescribedMedicines = [
            ...prescription.items
          ];


          this.pharmacyNotes =
            prescription.notes || '';

        },

      error:
        (error: unknown) => {

          console.error(
            'Failed to load existing prescription:',
            error
          );

          this.prescribedMedicines = [];

          this.pharmacyNotes = '';

        }

    });

}


  // =====================================================
  // LOAD EXISTING LAB REQUESTS
  // =====================================================

  private loadExistingLaboratoryRequests(
    consultationId: string
  ): void {

    this.laboratoryService
      .getRequestsByConsultation(
        consultationId
      )
      .subscribe({

        next:
          (requests: LaboratoryRequest[]) => {

            this.laboratoryRequests =
              Array.isArray(requests)
                ? [...requests]
                : [];

          },

        error:
          (error: unknown) => {

            console.error(
              'Failed to load laboratory requests:',
              error
            );

            this.laboratoryRequests = [];

          }

      });

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
          item.id === patientId
      );


    if (!patient) {

      return patientId;

    }


    return `${patient.firstName} ${patient.lastName}`;

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
          item.id === patientId
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
          item.id === doctorId
      );


    if (!doctor) {

      return doctorId;

    }


    return `Dr. ${doctor.firstName} ${doctor.lastName}`;

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


    if (
      this.medicineQuantity >
      medicine.quantity
    ) {

      alert(
        `Only ${medicine.quantity} units of ${medicine.name} are currently available.`
      );

      return;

    }


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


    this.prescribedMedicines = [
      ...this.prescribedMedicines,
      prescriptionItem
    ];


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

    switch (medicine.form) {

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

  get prescriptionTotal(): number {

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

    if (!this.selectedLaboratoryTestId) {

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


    if (!this.consultation.patientId) {

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
        Number(
          test.price || 0
        ),

      requestedAt:
        new Date().toISOString()

    };


    this.laboratoryRequests = [

      ...this.laboratoryRequests,

      request

    ];


    this.selectedLaboratoryTestId = '';

    this.laboratoryNotes = '';

  }


  // =====================================================
  // REMOVE LABORATORY TEST
  // =====================================================

  removeLaboratoryTest(
    requestId: string | number
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

  get laboratoryTotal(): number {

    return this.laboratoryRequests.reduce(
      (
        total,
        request
      ) =>
        total +
        Number(
          request.price || 0
        ),
      0
    );

  }


  // =====================================================
  // GENERATE TEMPORARY LAB REQUEST ID
  // =====================================================

  private generateLaboratoryRequestId(): string {

    const year =
      new Date().getFullYear();


    return `LAB-${year}-${Date.now()}-${Math.floor(
      1000 +
      Math.random() * 9000
    )}`;

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

    // ---------------------------------------------------
    // PREVENT DOUBLE SAVE
    // ---------------------------------------------------

    if (this.isSaving) {

      return;

    }


    // ---------------------------------------------------
    // VALIDATE PATIENT
    // ---------------------------------------------------

    if (!this.consultation.patientId) {

      alert(
        'Please select a patient.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE DOCTOR
    // ---------------------------------------------------

    if (!this.consultation.doctorId) {

      alert(
        'Please select a doctor.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE DATE
    // ---------------------------------------------------

    if (!this.consultation.consultationDate) {

      alert(
        'Please select the consultation date.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE TIME
    // ---------------------------------------------------

    if (!this.consultation.consultationTime) {

      alert(
        'Please select the consultation time.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE CHIEF COMPLAINT
    // ---------------------------------------------------

    if (
      !this.consultation.chiefComplaint.trim()
    ) {

      alert(
        'Please enter the chief complaint.'
      );

      return;

    }


    // ---------------------------------------------------
    // VALIDATE PATIENT
    // ---------------------------------------------------

    this.syncSelectedPatient();


    if (!this.selectedPatient) {

      alert(
        'The selected patient could not be found. Please select the patient again.'
      );

      return;

    }


    this.isSaving = true;


    // ---------------------------------------------------
    // EDIT
    // ---------------------------------------------------

    if (
      this.isEditMode &&
      this.consultationId
    ) {

      this.updateExistingConsultation();

      return;

    }


    // ---------------------------------------------------
    // CREATE CONSULTATION
    // ---------------------------------------------------

    this.consultationService
      .addConsultation({

        patientId:
          this.selectedPatient.id,

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
          this.consultation
            .chiefComplaint
            .trim(),

        symptoms:
          this.consultation
            .symptoms
            .trim() ||
          undefined,

        diagnosis:
          this.consultation
            .diagnosis
            .trim() ||
          undefined,

        clinicalNotes:
          this.consultation
            .clinicalNotes
            .trim() ||
          undefined,

        treatmentPlan:
          this.consultation
            .treatmentPlan
            .trim() ||
          undefined,

        followUpDate:
          this.consultation.followUpDate ||
          undefined

      })
      .subscribe({

        next:
          (newConsultation:
            Consultation) => {

            this.consultationId =
              newConsultation.id;


            // -------------------------------------------
            // ADD CONSULTATION ID TO LAB REQUESTS
            // -------------------------------------------

            this.laboratoryRequests =
              this.laboratoryRequests.map(
                request => ({

                  ...request,

                  consultationId:
                    newConsultation.id

                })
              );


            // -------------------------------------------
            // CREATE LAB REQUESTS
            // -------------------------------------------

            this.createLaboratoryRequests(
              newConsultation
            )
            .subscribe({

              next:
                () => {

                  this.completeConsultationWithPharmacy(
                    newConsultation
                  );

                },

              error:
                (error: unknown) => {

                  console.error(
                    'Failed to create laboratory requests:',
                    error
                  );

                  this.isSaving = false;

                  alert(
                    'Consultation was created, but one or more laboratory requests could not be saved.'
                  );

                }

            });

          },

        error:
          (error: unknown) => {

            console.error(
              'Failed to create consultation:',
              error
            );

            this.isSaving = false;

            alert(
              'Unable to create consultation.'
            );

          }

      });

  }


  // =====================================================
  // CREATE LABORATORY REQUESTS
  // =====================================================

  private createLaboratoryRequests(
    consultation: Consultation
  ): Observable<LaboratoryRequest[]> {

    if (
      this.laboratoryRequests.length === 0
    ) {

      return of([]);

    }


    const requests =
      this.laboratoryRequests.map(
        request => ({

          ...request,

          consultationId:
            consultation.id

        })
      );


    return forkJoin(

      requests.map(
        request =>
          this.laboratoryService
            .addRequest(
              request
            )
      )

    );

  }


  // =====================================================
  // UPDATE EXISTING CONSULTATION
  // =====================================================

  private updateExistingConsultation(): void {

    if (!this.consultationId) {

      this.isSaving = false;

      return;

    }


    this.consultationService
      .getConsultationById(
        this.consultationId
      )
      .subscribe({

        next:
          (existing: Consultation) => {

            if (!existing) {

              this.isSaving = false;

              alert(
                'Consultation could not be found.'
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
                this.consultation
                  .consultationDate,

              consultationTime:
                this.consultation
                  .consultationTime,

              chiefComplaint:
                this.consultation
                  .chiefComplaint
                  .trim(),

              symptoms:
                this.consultation
                  .symptoms
                  .trim() ||
                undefined,

              diagnosis:
                this.consultation
                  .diagnosis
                  .trim() ||
                undefined,

              clinicalNotes:
                this.consultation
                  .clinicalNotes
                  .trim() ||
                undefined,

              treatmentPlan:
                this.consultation
                  .treatmentPlan
                  .trim() ||
                undefined,

              followUpDate:
                this.consultation
                  .followUpDate ||
                undefined,

              status:
                this.consultation.status,

              createdAt:
                existing.createdAt

            };


            this.consultationService
              .updateConsultation(
                updatedConsultation
              )
              .subscribe({

                next:
                  (
                    savedConsultation:
                      Consultation
                  ) => {

                    this.consultationId =
                      savedConsultation.id;


                    // ---------------------------------
                    // CREATE NEW LAB REQUESTS
                    // ---------------------------------

                    this.laboratoryRequests =
                      this.laboratoryRequests.map(
                        request => ({

                          ...request,

                          consultationId:
                            savedConsultation.id

                        })
                      );


                    this.createLaboratoryRequests(
                      savedConsultation
                    )
                    .subscribe({

                      next:
                        () => {

                          if (
                            savedConsultation.status ===
                            'Open'
                          ) {

                            this.completeConsultationWithPharmacy(
                              savedConsultation
                            );

                            return;

                          }


                          this.finishUpdate(
                            savedConsultation
                          );

                        },

                      error:
                        (error: unknown) => {

                          console.error(
                            'Failed to create laboratory requests:',
                            error
                          );

                          this.isSaving = false;

                          alert(
                            'Consultation was updated, but the laboratory requests could not be saved.'
                          );

                        }

                    });

                  },

                error:
                  (error: unknown) => {

                    console.error(
                      'Failed to update consultation:',
                      error
                    );

                    this.isSaving = false;

                    alert(
                      'Unable to update consultation.'
                    );

                  }

              });

          },

        error:
          (error: unknown) => {

            console.error(
              'Failed to load consultation:',
              error
            );

            this.isSaving = false;

            alert(
              'Unable to load consultation.'
            );

          }

      });

  }


  // =====================================================
  // COMPLETE CONSULTATION + PHARMACY
  // =====================================================

  private completeConsultationWithPharmacy(
    consultation: Consultation
  ): void {

    this.consultationService
      .completeConsultation(
        consultation.id,
        this.buildPharmacyData()
      )
      .subscribe({

        next:
          (success: boolean) => {

            if (!success) {

              this.isSaving = false;

              alert(
                'Consultation was saved, but completion or the Pharmacy prescription could not be processed.'
              );

              return;

            }


            // -------------------------------------------
            // UPDATE APPOINTMENT
            // -------------------------------------------

            if (this.appointmentId) {

              this.appointmentService
                .updateStatus(
                  this.appointmentId,
                  'Completed'
                )
                .subscribe({

                  next:
                    () => {

                      this.isSaving = false;

                      this.finishUpdate(
                        consultation
                      );

                    },

                  error:
                    (error: unknown) => {

                      console.error(
                        'Failed to update appointment status:',
                        error
                      );

                      this.isSaving = false;

                      this.finishUpdate(
                        consultation
                      );

                    }

                });

            } else {

              this.isSaving = false;

              this.finishUpdate(
                consultation
              );

            }

          },

        error:
          (error: unknown) => {

            console.error(
              'Failed to complete consultation:',
              error
            );

            this.isSaving = false;

            alert(
              'Consultation was created, but it could not be completed successfully.'
            );

          }

      });

  }


  // =====================================================
  // FINISH
  // =====================================================

  private finishUpdate(
    consultation: Consultation
  ): void {

    const messages: string[] = [

      `Consultation ${consultation.id} completed successfully.`

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


    this.router.navigate([
      '/consultations',
      consultation.id
    ]);

  }


  // =====================================================
  // BUILD PHARMACY DATA
  // =====================================================

  private buildPharmacyData(): {

    patientName: string;

    patientNumber?: string;

    doctorName?: string;

    items: PharmacyPrescriptionItem[];

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

      items: [
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

    if (this.appointmentId) {

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