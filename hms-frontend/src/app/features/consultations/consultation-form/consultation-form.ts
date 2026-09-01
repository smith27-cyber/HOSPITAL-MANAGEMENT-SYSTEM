
import {
  ChangeDetectorRef,
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
  of,
  switchMap
} from 'rxjs';

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
  Consultation,
  ConsultationStatus
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

import {
  PharmacyPrescription,
  PharmacyPrescriptionItem
} from '../../../shared/models/pharmacy.model';

import {
  LaboratoryTest,
  LaboratoryRequest
} from '../../../shared/models/laboratory.model';


// =====================================================
// COMPONENT
// =====================================================

@Component({
  selector: 'app-consultation-form',

  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl:
    './consultation-form.html',

  styleUrl:
    './consultation-form.css'
})
export class ConsultationForm
  implements OnInit {


  // =====================================================
  // MODE
  // =====================================================

  isEditMode =
    false;

  consultationId:
    string | null =
      null;

  appointmentId:
    string | null =
      null;


  // =====================================================
  // DATA
  // =====================================================

  patients:
    Patient[] =
      [];

  doctors:
    Doctor[] =
      [];

  medicines:
    Medicine[] =
      [];

  laboratoryTests:
    LaboratoryTest[] =
      [];

  appointment?:
    Appointment;


  // =====================================================
  // SELECTED OBJECTS
  // =====================================================

  selectedPatient?:
    Patient;

  selectedDoctor?:
    Doctor;


  // =====================================================
  // LOADING
  // =====================================================

  isLoading =
    false;

  isSaving =
    false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage =
    '';


  // =====================================================
  // CONSULTATION FEE
  // =====================================================

  consultationFee =
    0;


  // =====================================================
  // PRESCRIPTION
  // =====================================================

  prescribedMedicines:
    PharmacyPrescriptionItem[] =
      [];

  selectedMedicineId =
    '';

  medicineQuantity =
    1;

  medicineDosage =
    '';

  medicineFrequency =
    '';

  medicineDuration =
    '';

  medicineInstructions =
    '';

  pharmacyNotes =
    '';


  // =====================================================
  // LABORATORY
  // =====================================================

  laboratoryRequests:
    LaboratoryRequest[] =
      [];

  selectedLaboratoryTestId =
    '';

  laboratoryNotes =
    '';


  // =====================================================
  // CONSULTATION MODEL
  // =====================================================

  consultation: {

    patientId:
      string;

    doctorId:
      string;

    appointmentId:
      string;

    consultationDate:
      string;

    consultationTime:
      string;

    chiefComplaint:
      string;

    symptoms:
      string;

    diagnosis:
      string;

    clinicalNotes:
      string;

    treatmentPlan:
      string;

    followUpDate:
      string;

    status:
      ConsultationStatus;

    hasLaboratoryRequests:
      boolean;

    hasLaboratoryResults:
      boolean;

    laboratoryResultsReviewed:
      boolean;

    hasPrescription:
      boolean;

    hasBilling:
      boolean;

  } = {

    patientId:
      '',

    doctorId:
      '',

    appointmentId:
      '',

    consultationDate:
      '',

    consultationTime:
      '',

    chiefComplaint:
      '',

    symptoms:
      '',

    diagnosis:
      '',

    clinicalNotes:
      '',

    treatmentPlan:
      '',

    followUpDate:
      '',

    status:
      'Open',

    hasLaboratoryRequests:
      false,

    hasLaboratoryResults:
      false,

    laboratoryResultsReviewed:
      false,

    hasPrescription:
      false,

    hasBilling:
      false

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private readonly router:
      Router,

    private readonly route:
      ActivatedRoute,

    private readonly consultationService:
      ConsultationService,

    private readonly patientService:
      PatientService,

    private readonly doctorService:
      DoctorService,

    private readonly appointmentService:
      AppointmentService,

    private readonly pharmacyService:
      PharmacyService,

    private readonly laboratoryService:
      LaboratoryService,

    private readonly cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.isLoading =
      true;

    this.setDefaultDateTime();

    this.loadConsultationFee();


    const appointmentId =
      this.route.snapshot
        .queryParamMap
        .get(
          'appointmentId'
        );


    const consultationId =
      this.route.snapshot
        .paramMap
        .get(
          'id'
        );


    // ===================================================
    // OPEN FROM APPOINTMENT
    // ===================================================

    if (
      appointmentId
    ) {

      this.appointmentId =
        appointmentId;

      this.loadRegistrationData(
        appointmentId
      );

      return;
    }


    // ===================================================
    // EDIT EXISTING
    // ===================================================

    if (
      consultationId
    ) {

      this.isEditMode =
        true;

      this.consultationId =
        consultationId;

      this.loadEditData(
        consultationId
      );

      return;
    }


    // ===================================================
    // NEW CONSULTATION
    // ===================================================

    this.loadNewConsultationData();

  }


  // =====================================================
  // LOAD REGISTRATION DATA
  // =====================================================

  private loadRegistrationData(
    appointmentId:
      string
  ): void {

    this.isLoading =
      true;

    this.errorMessage =
      '';


    forkJoin({

      appointment:
        this.appointmentService
          .getAppointmentById(
            appointmentId
          ),

      patients:
        this.patientService
          .getPatients(),

      doctors:
        this.doctorService
          .getDoctors(),

      laboratoryTests:
        this.laboratoryService
          .getTests()

    })
    .subscribe({

      next:
        (
          data
        ) => {

          const appointment =
            data.appointment;


          if (
            !appointment
          ) {

            this.finishLoading();

            alert(
              'Appointment not found.'
            );

            this.router.navigate([
              '/appointments'
            ]);

            return;
          }


          if (
            appointment.status !==
            'In Consultation'
          ) {

            this.finishLoading();

            alert(
              'This appointment is not currently in consultation.'
            );

            this.router.navigate([
              '/appointments',
              appointment.id
            ]);

            return;
          }


          this.patients =
            Array.isArray(
              data.patients
            )
              ? [
                  ...data.patients
                ]
              : [];


          this.doctors =
            Array.isArray(
              data.doctors
            )
              ? data.doctors.filter(
                  (
                    doctor:
                      Doctor
                  ) =>
                    doctor.status ===
                    'Active'
                )
              : [];


          this.laboratoryTests =
            Array.isArray(
              data.laboratoryTests
            )
              ? [
                  ...data.laboratoryTests
                ]
              : [];


          this.loadMedicines();


          this.appointment =
            appointment;

          this.appointmentId =
            appointment.id;


          this.consultation = {

            patientId:
              appointment.patientId,

            doctorId:
              appointment.doctorId,

            appointmentId:
              appointment.id,

            consultationDate:
              appointment.appointmentDate ||
              this.consultation
                .consultationDate,

            consultationTime:
              appointment.appointmentTime ||
              this.consultation
                .consultationTime,

            chiefComplaint:
              appointment.reason ||
              '',

            symptoms:
              '',

            diagnosis:
              appointment.diagnosis ||
              '',

            clinicalNotes:
              appointment.consultationNotes ||
              '',

            treatmentPlan:
              appointment.treatmentPlan ||
              '',

            followUpDate:
              '',

            status:
              'Open',

            hasLaboratoryRequests:
              false,

            hasLaboratoryResults:
              false,

            laboratoryResultsReviewed:
              false,

            hasPrescription:
              false,

            hasBilling:
              false

          };


          this.syncSelectedPatient();

          this.syncSelectedDoctor();

          this.finishLoading();

        },


      error:
        (
          error:
            unknown
        ) => {

          console.error(
            'Failed to load registration data:',
            error
          );


          this.patients =
            [];

          this.doctors =
            [];

          this.medicines =
            [];

          this.laboratoryTests =
            [];


          this.errorMessage =
            'Unable to load appointment information.';

          this.finishLoading();


          alert(
            'Unable to load appointment information.'
          );


          this.router.navigate([
            '/appointments'
          ]);

        }

    });

  }


  // =====================================================
  // LOAD EDIT DATA
  // =====================================================

  private loadEditData(
    consultationId:
      string
  ): void {

    this.isLoading =
      true;

    this.errorMessage =
      '';


    forkJoin({

      consultation:
        this.consultationService
          .getConsultationById(
            consultationId
          ),

      patients:
        this.patientService
          .getPatients(),

      doctors:
        this.doctorService
          .getDoctors(),

      laboratoryTests:
        this.laboratoryService
          .getTests()

    })
    .subscribe({

      next:
        (
          data
        ) => {

          const existing =
            data.consultation;


          if (
            !existing
          ) {

            this.finishLoading();

            alert(
              'Consultation not found.'
            );

            this.router.navigate([
              '/consultations'
            ]);

            return;
          }


          this.patients =
            Array.isArray(
              data.patients
            )
              ? [
                  ...data.patients
                ]
              : [];


          this.doctors =
            Array.isArray(
              data.doctors
            )
              ? data.doctors.filter(
                  (
                    doctor:
                      Doctor
                  ) =>
                    doctor.status ===
                      'Active' ||
                    doctor.id ===
                      existing.doctorId
                )
              : [];


          this.laboratoryTests =
            Array.isArray(
              data.laboratoryTests
            )
              ? [
                  ...data.laboratoryTests
                ]
              : [];


          this.loadMedicines();


          this.consultation = {

            patientId:
              existing.patientId,

            doctorId:
              existing.doctorId,

            appointmentId:
              existing.appointmentId ||
              '',

            consultationDate:
              existing.consultationDate,

            consultationTime:
              existing.consultationTime,

            chiefComplaint:
              existing.chiefComplaint ||
              '',

            symptoms:
              existing.symptoms ||
              '',

            diagnosis:
              existing.diagnosis ||
              '',

            clinicalNotes:
              existing.clinicalNotes ||
              '',

            treatmentPlan:
              existing.treatmentPlan ||
              '',

            followUpDate:
              existing.followUpDate ||
              '',

            status:
              existing.status,

            hasLaboratoryRequests:
              existing.hasLaboratoryRequests ??
              false,

            hasLaboratoryResults:
              existing.hasLaboratoryResults ??
              false,

            laboratoryResultsReviewed:
              existing.laboratoryResultsReviewed ??
              false,

            hasPrescription:
              existing.hasPrescription ??
              false,

            hasBilling:
              existing.hasBilling ??
              false

          };


          this.appointmentId =
            existing.appointmentId ||
            null;


          this.syncSelectedPatient();

          this.syncSelectedDoctor();


          // =================================================
          // RELATED DATA
          // =================================================

          const appointmentRequest$ =
            this.appointmentId

              ? this.appointmentService
                  .getAppointmentById(
                    this.appointmentId
                  )

              : of(undefined);


          const prescriptionRequest$ =
            this.loadPrescriptionObservable(
              consultationId
            );


          const laboratoryRequest$ =
            this.laboratoryService
              .getRequestsByConsultation(
                consultationId
              );


          forkJoin({

            appointment:
              appointmentRequest$,

            prescription:
              prescriptionRequest$,

            laboratoryRequests:
              laboratoryRequest$

          })
          .subscribe({

            next:
              (
                relatedData
              ) => {

                this.appointment =
                  relatedData.appointment;


                const prescription =
                  relatedData.prescription;


                this.prescribedMedicines =
                  prescription
                    ? [
                        ...prescription.items
                      ]
                    : [];


                this.pharmacyNotes =
                  prescription?.notes ||
                  '';


                this.consultation
                  .hasPrescription =
                  !!prescription ||
                  this.prescribedMedicines.length >
                    0;


                this.laboratoryRequests =
                  Array.isArray(
                    relatedData
                      .laboratoryRequests
                  )
                    ? [
                        ...relatedData
                          .laboratoryRequests
                      ]
                    : [];


                this.consultation
                  .hasLaboratoryRequests =
                  this.laboratoryRequests.length >
                    0 ||
                  this.consultation
                    .hasLaboratoryRequests;


                // -----------------------------------------
                // SYNCHRONIZE ACTUAL LAB RESULTS
                // -----------------------------------------

                if (
                  this.laboratoryRequests.length >
                  0
                ) {

                  this.consultation
                    .hasLaboratoryResults =
                    this.laboratoryRequests.every(
                      (
                        request:
                          LaboratoryRequest
                      ) =>
                        request.status ===
                          'Completed' &&
                        !!request.result
                    );

                }


                this.finishLoading();

              },


            error:
              (
                error:
                  unknown
              ) => {

                console.error(
                  'Failed to load related consultation data:',
                  error
                );


                this.errorMessage =
                  'Consultation loaded, but some related information could not be loaded.';


                this.finishLoading();

              }

          });

        },


      error:
        (
          error:
            unknown
        ) => {

          console.error(
            'Failed to load consultation edit data:',
            error
          );


          this.errorMessage =
            'Unable to load consultation.';


          this.finishLoading();


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
  // LOAD PRESCRIPTION OBSERVABLE
  // =====================================================

  private loadPrescriptionObservable(
    consultationId:
      string
  ):
    Observable<
      PharmacyPrescription | undefined
    > {

    return new Observable(
      subscriber => {

        this.pharmacyService
          .getPrescriptions()
          .subscribe({

            next:
              (
                prescriptions:
                  PharmacyPrescription[]
              ) => {

                const prescription =
                  prescriptions.find(
                    (
                      item:
                        PharmacyPrescription
                    ) =>
                      String(
                        item.consultationId
                      ) ===
                      String(
                        consultationId
                      )
                  );


                subscriber.next(
                  prescription
                );

                subscriber.complete();

              },

            error:
              (
                error:
                  unknown
              ) => {

                subscriber.error(
                  error
                );

              }

          });

      }
    );

  }


  // =====================================================
  // LOAD NEW CONSULTATION DATA
  // =====================================================

  private loadNewConsultationData(): void {

    this.isLoading =
      true;


    forkJoin({

      patients:
        this.patientService
          .getPatients(),

      doctors:
        this.doctorService
          .getDoctors(),

      laboratoryTests:
        this.laboratoryService
          .getTests()

    })
    .subscribe({

      next:
        (
          data
        ) => {

          this.patients =
            Array.isArray(
              data.patients
            )
              ? [
                  ...data.patients
                ]
              : [];


          this.doctors =
            Array.isArray(
              data.doctors
            )
              ? data.doctors.filter(
                  (
                    doctor:
                      Doctor
                  ) =>
                    doctor.status ===
                    'Active'
                )
              : [];


          this.laboratoryTests =
            Array.isArray(
              data.laboratoryTests
            )
              ? [
                  ...data.laboratoryTests
                ]
              : [];


          this.loadMedicines();

          this.syncSelectedPatient();

          this.syncSelectedDoctor();


          this.consultation.status =
            'Open';


          this.finishLoading();

        },


      error:
        (
          error:
            unknown
        ) => {

          console.error(
            'Failed to load new consultation data:',
            error
          );


          this.errorMessage =
            'Unable to load consultation data.';


          this.finishLoading();


          alert(
            'Unable to load consultation data.'
          );

        }

    });

  }


  // =====================================================
  // FINISH LOADING
  // =====================================================

  private finishLoading(): void {

    this.isLoading =
      false;

    this.cdr.detectChanges();

  }


  // =====================================================
  // CONSULTATION FEE
  // =====================================================

  private loadConsultationFee(): void {

    this.consultationFee =
      this.consultationService
        .getConsultationFee();

  }


  // =====================================================
  // LOAD MEDICINES
  // =====================================================

  private loadMedicines(): void {

    this.medicines =
      this.pharmacyService
        .getAvailableMedicines();

    this.cdr.detectChanges();

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
      now
        .toTimeString()
        .slice(
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
        (
          patient:
            Patient
        ) =>
          String(patient.id) ===
          String(patientId)
      );

  }


  // =====================================================
  // SYNC PATIENT
  // =====================================================

  private syncSelectedPatient(): void {

    this.selectedPatient =
      undefined;


    if (
      !this.consultation.patientId ||
      this.patients.length ===
        0
    ) {

      return;
    }


    this.selectedPatient =
      this.patients.find(
        (
          patient:
            Patient
        ) =>
          String(patient.id) ===
          String(
            this.consultation.patientId
          )
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
        (
          doctor:
            Doctor
        ) =>
          String(doctor.id) ===
          String(doctorId)
      );

  }


  // =====================================================
  // SYNC DOCTOR
  // =====================================================

  private syncSelectedDoctor(): void {

    this.selectedDoctor =
      undefined;


    if (
      !this.consultation.doctorId ||
      this.doctors.length ===
        0
    ) {

      return;
    }


    this.selectedDoctor =
      this.doctors.find(
        (
          doctor:
            Doctor
        ) =>
          String(doctor.id) ===
          String(
            this.consultation.doctorId
          )
      );

  }


  // =====================================================
  // SELECTED MEDICINE
  // =====================================================

  getSelectedMedicine():
    Medicine | undefined {

    if (
      !this.selectedMedicineId
    ) {

      return undefined;
    }


    return this.medicines.find(
      (
        medicine:
          Medicine
      ) =>
        String(medicine.id) ===
        String(
          this.selectedMedicineId
        )
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
      this.medicineQuantity <=
        0
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


    const alreadyAdded =
      this.prescribedMedicines.some(
        (
          item:
            PharmacyPrescriptionItem
        ) =>
          String(item.medicineId) ===
          String(medicine.id)
      );


    if (alreadyAdded) {

      alert(
        'This medicine has already been added to the prescription.'
      );

      return;
    }


    const item:
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
        this.medicineDosage
          .trim() ||
        undefined,

      frequency:
        this.medicineFrequency
          .trim() ||
        undefined,

      duration:
        this.medicineDuration
          .trim() ||
        undefined,

      instructions:
        this.medicineInstructions
          .trim() ||
        undefined

    };


    this.prescribedMedicines =
      [
        ...this.prescribedMedicines,
        item
      ];


    this.consultation
      .hasPrescription =
      true;


    this.resetMedicineForm();


    this.cdr.detectChanges();

  }


  // =====================================================
  // REMOVE MEDICINE
  // =====================================================

  removeMedicine(
    medicineId:
      string
  ): void {

    this.prescribedMedicines =
      this.prescribedMedicines.filter(
        (
          medicine:
            PharmacyPrescriptionItem
        ) =>
          String(
            medicine.medicineId
          ) !==
          String(
            medicineId
          )
      );


    this.consultation
      .hasPrescription =
      this.prescribedMedicines.length >
        0;


    this.cdr.detectChanges();

  }


  // =====================================================
  // RESET MEDICINE FORM
  // =====================================================

  private resetMedicineForm(): void {

    this.selectedMedicineId =
      '';

    this.medicineQuantity =
      1;

    this.medicineDosage =
      '';

    this.medicineFrequency =
      '';

    this.medicineDuration =
      '';

    this.medicineInstructions =
      '';

  }


  // =====================================================
  // MEDICINE UNIT
  // =====================================================

  private getMedicineUnit(
    medicine:
      Medicine
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
        total:
          number,

        medicine:
          PharmacyPrescriptionItem
      ) =>
        total +
        Number(
          medicine.totalPrice ||
          0
        ),

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
      (
        test:
          LaboratoryTest
      ) =>
        String(test.id) ===
        String(
          this.selectedLaboratoryTestId
        )
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
        (
          request:
            LaboratoryRequest
        ) =>
          String(request.testId) ===
          String(test.id)
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
        this.laboratoryNotes
          .trim() ||
        undefined,

      price:
        Number(
          test.price ||
          0
        ),

      requestedAt:
        new Date().toISOString()

    };


    this.laboratoryRequests =
      [
        ...this.laboratoryRequests,
        request
      ];


    this.selectedLaboratoryTestId =
      '';

    this.laboratoryNotes =
      '';


    this.consultation
      .hasLaboratoryRequests =
      true;


    this.cdr.detectChanges();

  }


  // =====================================================
  // REMOVE LABORATORY TEST
  // =====================================================

  removeLaboratoryTest(
    requestId:
      string |
      number |
      undefined
  ): void {

    if (
      requestId ===
      undefined
    ) {

      return;
    }


    if (
      typeof requestId ===
      'number'
    ) {

      alert(
        'Existing laboratory requests cannot be removed from this form. Manage them from the Laboratory module.'
      );

      return;
    }


    this.laboratoryRequests =
      this.laboratoryRequests.filter(
        (
          request:
            LaboratoryRequest
        ) =>
          request.id !==
          requestId
      );


    this.consultation
      .hasLaboratoryRequests =
      this.laboratoryRequests.length >
        0;


    this.cdr.detectChanges();

  }


  // =====================================================
  // LABORATORY TOTAL
  // =====================================================

  get laboratoryTotal():
    number {

    return this.laboratoryRequests.reduce(
      (
        total:
          number,

        request:
          LaboratoryRequest
      ) =>
        total +
        Number(
          request.price ||
          0
        ),

      0
    );

  }


  // =====================================================
  // TEMPORARY LAB ID
  // =====================================================

  private generateLaboratoryRequestId():
    string {

    const year =
      new Date()
        .getFullYear();


    return (
      `LAB-${year}-${Date.now()}-` +
      `${Math.floor(
        1000 +
        Math.random() *
        9000
      )}`
    );

  }


  // =====================================================
  // SAVE CONSULTATION
  // =====================================================
  //
  // IMPORTANT:
  //
  // SAVE PROGRESS NEVER COMPLETES THE CONSULTATION.
  //
  // It may save:
  // - consultation data
  // - new laboratory requests
  // - prescription
  //
  // Completion is always a separate action.
  //
  // =====================================================

  saveConsultation(): void {

    if (
      this.isSaving
    ) {

      return;
    }


    // ===================================================
    // VALIDATION
    // ===================================================

    if (
      !this.consultation.patientId
    ) {

      alert(
        'Please select a patient.'
      );

      return;
    }


    if (
      !this.consultation.doctorId
    ) {

      alert(
        'Please select a doctor.'
      );

      return;
    }


    if (
      !this.consultation.consultationDate
    ) {

      alert(
        'Please select the consultation date.'
      );

      return;
    }


    if (
      !this.consultation.consultationTime
    ) {

      alert(
        'Please select the consultation time.'
      );

      return;
    }


    if (
      !this.consultation
        .chiefComplaint
        .trim()
    ) {

      alert(
        'Please enter the chief complaint.'
      );

      return;
    }


    // ===================================================
    // PROTECT FINAL STATES
    // ===================================================

    if (
      this.consultation.status ===
      'Completed'
    ) {

      alert(
        'Completed consultations cannot be modified.'
      );

      return;
    }


    if (
      this.consultation.status ===
      'Cancelled'
    ) {

      alert(
        'Cancelled consultations cannot be modified. Reopen the consultation first.'
      );

      return;
    }


    this.syncSelectedPatient();


    if (
      !this.selectedPatient
    ) {

      alert(
        'The selected patient could not be found.'
      );

      return;
    }


    this.isSaving =
      true;


    // ===================================================
    // UPDATE EXISTING
    // ===================================================

    if (
      this.isEditMode &&
      this.consultationId
    ) {

      this.updateExistingConsultation();

      return;
    }


    // ===================================================
    // CREATE NEW
    // ===================================================

    const createRequest = {

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
        this.consultation
          .followUpDate ||
        undefined,

      hasLaboratoryRequests:
        this.laboratoryRequests.length >
        0,

      hasLaboratoryResults:
        false,

      laboratoryResultsReviewed:
        false,

      hasPrescription:
        this.prescribedMedicines.length >
        0,

      hasBilling:
        this.consultation.hasBilling

    };


    this.consultationService
      .addConsultation(
        createRequest
      )
      .subscribe({

        next:
          (
            newConsultation:
              Consultation
          ) => {

            this.consultationId =
              newConsultation.id;


            this.copyBackendWorkflowState(
              newConsultation
            );


            // =============================================
            // ATTACH CONSULTATION ID TO TEMPORARY LABS
            // =============================================

            this.laboratoryRequests =
              this.laboratoryRequests.map(
                (
                  request:
                    LaboratoryRequest
                ) => ({

                  ...request,

                  consultationId:
                    newConsultation.id

                })
              );


            // =============================================
            // SAVE LABORATORY + PHARMACY
            // =============================================

            const laboratorySave$ =
              this.createLaboratoryRequests(
                newConsultation
              );


            const pharmacySave$ =
              this.savePharmacyPrescription(
                newConsultation
              );


            forkJoin({

              laboratoryRequests:
                laboratorySave$,

              prescription:
                pharmacySave$

            })
            .subscribe({

              next:
                (
                  result
                ) => {

                  console.log(
                    'Consultation workflow saved:',
                    result
                  );


                  this.refreshLocalWorkflowFlags();


                  this.isSaving =
                    false;

                  this.cdr.detectChanges();


                  alert(
                    `Consultation ${newConsultation.id} saved successfully.`
                  );


                  this.router.navigate([
                    '/consultations',
                    newConsultation.id
                  ]);

                },


              error:
                (
                  error:
                    unknown
                ) => {

                  console.error(
                    'Failed to save consultation workflow data:',
                    error
                  );


                  this.isSaving =
                    false;

                  this.cdr.detectChanges();


                  alert(
                    'The consultation was saved, but some laboratory or pharmacy information could not be saved.'
                  );


                  this.router.navigate([
                    '/consultations',
                    newConsultation.id
                  ]);

                }

            });

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to create consultation:',
              error
            );


            this.isSaving =
              false;

            this.cdr.detectChanges();


            alert(
              this.extractErrorMessage(
                error,
                'Unable to create consultation.'
              )
            );

          }

      });

  }


  // =====================================================
  // CREATE LABORATORY REQUESTS
  // =====================================================

  private createLaboratoryRequests(
    consultation:
      Consultation
  ):
    Observable<LaboratoryRequest[]> {

    if (
      this.laboratoryRequests.length ===
      0
    ) {

      return of([]);

    }


    const newRequests =
      this.laboratoryRequests.filter(
        (
          request:
            LaboratoryRequest
        ) =>
          typeof request.id !==
          'number'
      );


    if (
      newRequests.length ===
      0
    ) {

      return of([]);

    }


    const requests =
      newRequests.map(
        (
          request:
            LaboratoryRequest
        ) => {

          const {
            id,
            ...requestWithoutId
          } =
            request;


          return {

            ...requestWithoutId,

            consultationId:
              consultation.id

          };

        }
      );


    return forkJoin(

      requests.map(
        (
          request
        ) =>
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

    if (
      !this.consultationId
    ) {

      this.isSaving =
        false;

      return;
    }


    this.consultationService
      .getConsultationById(
        this.consultationId
      )
      .subscribe({

        next:
          (
            existing:
              Consultation
          ) => {

            if (!existing) {

              this.isSaving =
                false;

              alert(
                'Consultation could not be found.'
              );

              return;
            }


            // =============================================
            // PROTECT FINAL RECORDS
            // =============================================

            if (
              existing.status ===
              'Completed'
            ) {

              this.isSaving =
                false;

              alert(
                'Completed consultations cannot be modified.'
              );

              return;
            }


            if (
              existing.status ===
              'Cancelled'
            ) {

              this.isSaving =
                false;

              alert(
                'Cancelled consultations cannot be modified. Reopen the consultation first.'
              );

              return;
            }


            const appointmentId =
              this.consultation
                .appointmentId ||
              undefined;


            // =============================================
            // IMPORTANT:
            //
            // Preserve backend workflow state.
            // =============================================

            const updateRequest:
              Consultation = {

              id:
                existing.id,

              patientId:
                this.consultation
                  .patientId,

              doctorId:
                this.consultation
                  .doctorId,

              appointmentId:
                appointmentId,

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
                existing.status,

              createdAt:
                existing.createdAt,

              updatedAt:
                existing.updatedAt,

              completedAt:
                existing.completedAt,

              hasLaboratoryRequests:
                existing.hasLaboratoryRequests ??
                this.laboratoryRequests.length >
                  0,

              hasLaboratoryResults:
                existing.hasLaboratoryResults ??
                false,

              laboratoryResultsReviewed:
                existing
                  .laboratoryResultsReviewed ??
                false,

              hasPrescription:
                existing.hasPrescription ??
                this.prescribedMedicines.length >
                  0,

              hasBilling:
                existing.hasBilling ??
                false

            };


            this.consultationService
              .updateConsultation(
                updateRequest
              )
              .subscribe({

                next:
                  (
                    savedConsultation:
                      Consultation
                  ) => {

                    this.consultationId =
                      savedConsultation.id;


                    this.copyBackendWorkflowState(
                      savedConsultation
                    );


                    // ===================================
                    // ATTACH REAL CONSULTATION ID
                    // ===================================

                    this.laboratoryRequests =
                      this.laboratoryRequests.map(
                        (
                          request:
                            LaboratoryRequest
                        ) => {

                          if (
                            typeof request.id ===
                            'number'
                          ) {

                            return request;
                          }


                          return {

                            ...request,

                            consultationId:
                              savedConsultation.id

                          };

                        }
                      );


                    // ===================================
                    // SAVE NEW LAB REQUESTS
                    // ===================================

                    const laboratorySave$ =
                      this.createLaboratoryRequests(
                        savedConsultation
                      );


                    // ===================================
                    // SAVE PRESCRIPTION
                    // ===================================

                    const pharmacySave$ =
                      this.savePharmacyPrescription(
                        savedConsultation
                      );


                    forkJoin({

                      laboratoryRequests:
                        laboratorySave$,

                      prescription:
                        pharmacySave$

                    })
                    .subscribe({

                      next:
                        (
                          result
                        ) => {

                          console.log(
                            'Updated consultation workflow saved:',
                            result
                          );


                          this.refreshLocalWorkflowFlags();


                          this.isSaving =
                            false;

                          this.cdr.detectChanges();


                          alert(
                            `Consultation ${savedConsultation.id} saved successfully.`
                          );


                          this.router.navigate([
                            '/consultations',
                            savedConsultation.id
                          ]);

                        },


                      error:
                        (
                          error:
                            unknown
                        ) => {

                          console.error(
                            'Failed to save updated workflow data:',
                            error
                          );


                          this.isSaving =
                            false;

                          this.cdr.detectChanges();


                          alert(
                            'The consultation was updated, but some laboratory or pharmacy information could not be saved.'
                          );


                          this.router.navigate([
                            '/consultations',
                            savedConsultation.id
                          ]);

                        }

                    });

                  },


                error:
                  (
                    error:
                      unknown
                  ) => {

                    console.error(
                      'Failed to update consultation:',
                      error
                    );


                    this.isSaving =
                      false;

                    this.cdr.detectChanges();


                    alert(
                      this.extractErrorMessage(
                        error,
                        'Unable to update consultation.'
                      )
                    );

                  }

              });

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to load existing consultation:',
              error
            );


            this.isSaving =
              false;

            this.cdr.detectChanges();


            alert(
              'Unable to load consultation.'
            );

          }

      });

  }



// =====================================================
// SAVE OR UPDATE PHARMACY PRESCRIPTION
// =====================================================


private savePharmacyPrescription(
  consultation:
    Consultation
):
  Observable<
    PharmacyPrescription | null
  > {

  if (
    !consultation ||
    !consultation.id ||
    this.prescribedMedicines.length === 0
  ) {

    return of(null);

  }


  const prescriptionData = {

    patientId:
      consultation.patientId,

    patientName:
      this.getPatientName(
        consultation.patientId
      ),

    patientNumber:
      consultation.patientId,

    consultationId:
      consultation.id,

    doctorId:
      consultation.doctorId,

    doctorName:
      this.getDoctorName(
        consultation.doctorId
      ),

    items:
      [
        ...this.prescribedMedicines
      ],

    notes:
      this.pharmacyNotes.trim() ||
      undefined

  };


  // ===================================================
  // FIND CURRENT PRESCRIPTION
  // ===================================================

  return this.pharmacyService
    .getCurrentPrescriptionByConsultation(
      consultation.id
    )
    .pipe(

      switchMap(
        (
          existingPrescription:
            PharmacyPrescription | null
        ) => {

          // =========================================
          // NO PRESCRIPTION
          // =========================================

          if (
            !existingPrescription
          ) {

            return this.pharmacyService
              .createPrescription(
                prescriptionData
              );

          }


          // =========================================
          // CANCELLED PRESCRIPTION
          // =========================================

          if (
            existingPrescription.status ===
            'Cancelled'
          ) {

            return this.pharmacyService
              .createPrescription(
                prescriptionData
              );

          }


          // =========================================
          // WAITING PRESCRIPTION
          //
          // Doctor can still modify it.
          // =========================================

          if (
            existingPrescription.status ===
            'Waiting'
          ) {

            const updatedPrescription:
              PharmacyPrescription = {

              ...existingPrescription,

              patientId:
                prescriptionData.patientId,

              patientName:
                prescriptionData.patientName,

              patientNumber:
                prescriptionData.patientNumber,

              consultationId:
                prescriptionData.consultationId,

              doctorId:
                prescriptionData.doctorId,

              doctorName:
                prescriptionData.doctorName,

              items:
                prescriptionData.items,

              notes:
                prescriptionData.notes

            };


            return this.pharmacyService
              .updatePrescription(
                updatedPrescription
              );

          }


          // =========================================
          // ALREADY IN PHARMACY WORKFLOW
          //
          // Do NOT update.
          // Do NOT create another prescription.
          // =========================================

          console.warn(
            'Prescription is already being processed by pharmacy:',
            {
              prescriptionId:
                existingPrescription.id,

              prescriptionNumber:
                existingPrescription.prescriptionNumber,

              status:
                existingPrescription.status,

              consultationId:
                consultation.id
            }
          );


          return of(
            existingPrescription
          );

        }

      )

    );

}


  // =====================================================
  // COPY BACKEND WORKFLOW STATE
  // =====================================================

  private copyBackendWorkflowState(
    consultation:
      Consultation
  ): void {

    this.consultation.status =
      consultation.status;


    this.consultation
      .hasLaboratoryRequests =
      consultation
        .hasLaboratoryRequests ??
      false;


    this.consultation
      .hasLaboratoryResults =
      consultation
        .hasLaboratoryResults ??
      false;


    this.consultation
      .laboratoryResultsReviewed =
      consultation
        .laboratoryResultsReviewed ??
      false;


    this.consultation
      .hasPrescription =
      consultation
        .hasPrescription ??
      false;


    this.consultation
      .hasBilling =
      consultation
        .hasBilling ??
      false;

  }


  // =====================================================
  // REFRESH LOCAL WORKFLOW FLAGS
  // =====================================================

  private refreshLocalWorkflowFlags(): void {

    this.consultation
      .hasLaboratoryRequests =
      this.laboratoryRequests.length >
      0 ||
      this.consultation
        .hasLaboratoryRequests;


    this.consultation
      .hasPrescription =
      this.prescribedMedicines.length >
      0 ||
      this.consultation
        .hasPrescription;

  }


  // =====================================================
  // REVIEW LABORATORY RESULTS
  // =====================================================

  reviewLaboratoryResults(): void {

    if (
      this.isSaving
    ) {

      return;
    }


    if (
      !this.consultationId
    ) {

      alert(
        'Consultation ID is missing.'
      );

      return;
    }


    if (
      this.consultation.status !==
      'Ready For Review'
    ) {

      alert(
        'Laboratory results are not currently ready for review.'
      );

      return;
    }


    if (
      !this.consultation
        .hasLaboratoryResults
    ) {

      alert(
        'Laboratory results are not available yet.'
      );

      return;
    }


    if (
      this.consultation
        .laboratoryResultsReviewed
    ) {

      alert(
        'Laboratory results have already been reviewed.'
      );

      return;
    }


    const confirmed =
      window.confirm(
        'Review the laboratory results and continue the consultation?'
      );


    if (
      !confirmed
    ) {

      return;
    }


    this.isSaving =
      true;


    this.consultationService
      .reviewLaboratoryResults(
        this.consultationId
      )
      .subscribe({

        next:
          (
            updatedConsultation:
              Consultation
          ) => {

            this.copyBackendWorkflowState(
              updatedConsultation
            );


            this.consultationId =
              updatedConsultation.id;


            this.isSaving =
              false;


            this.cdr.detectChanges();


            alert(
              'Laboratory results reviewed successfully. The consultation is now open for final diagnosis, treatment and prescription.'
            );

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to review laboratory results:',
              error
            );


            this.isSaving =
              false;

            this.cdr.detectChanges();


            alert(
              this.extractErrorMessage(
                error,
                'Unable to review laboratory results.'
              )
            );

          }

      });

  }


  // =====================================================
  // COMPLETE CONSULTATION
  // =====================================================

  completeConsultation(): void {

    if (
      this.isSaving
    ) {

      return;
    }


    if (
      !this.consultationId
    ) {

      alert(
        'Please save the consultation before completing it.'
      );

      return;
    }


    // ===================================================
    // ONLY OPEN
    // ===================================================

    if (
      this.consultation.status !==
      'Open'
    ) {

      alert(
        'Only Open consultations can be completed.'
      );

      return;
    }


    // ===================================================
    // FINAL DIAGNOSIS
    // ===================================================

    if (
      !this.consultation
        .diagnosis
        .trim()
    ) {

      alert(
        'Final diagnosis is required before completing the consultation.'
      );

      return;
    }


    // ===================================================
    // FINAL TREATMENT PLAN
    // ===================================================

    if (
      !this.consultation
        .treatmentPlan
        .trim()
    ) {

      alert(
        'Final treatment plan is required before completing the consultation.'
      );

      return;
    }


    // ===================================================
    // UNSAVED LABORATORY REQUESTS
    // ===================================================

    const hasUnsavedLabRequests =
      this.laboratoryRequests.some(
        (
          request:
            LaboratoryRequest
        ) =>
          typeof request.id !==
          'number'
      );


    if (
      hasUnsavedLabRequests
    ) {

      alert(
        'There are unsaved laboratory requests. Save Progress first.'
      );

      return;
    }


    // ===================================================
    // LABORATORY REQUIREMENTS
    // ===================================================

    if (
      this.consultation
        .hasLaboratoryRequests
    ) {

      if (
        !this.consultation
          .hasLaboratoryResults
      ) {

        alert(
          'Laboratory results must be available before completing the consultation.'
        );

        return;
      }


      if (
        !this.consultation
          .laboratoryResultsReviewed
      ) {

        alert(
          'Laboratory results must be reviewed by the doctor before completing the consultation.'
        );

        return;
      }

    }


    // ===================================================
    // CONFIRM
    // ===================================================

    const confirmed =
      window.confirm(
        'Complete this consultation? This will finalize the clinical record.'
      );


    if (
      !confirmed
    ) {

      return;
    }


    this.isSaving =
      true;


    // ===================================================
    // COMPLETE THROUGH BACKEND
    // ===================================================

    this.consultationService
      .completeConsultation(
        this.consultationId
      )
      .subscribe({

        next:
          (
            updatedConsultation:
              Consultation
          ) => {

            this.copyBackendWorkflowState(
              updatedConsultation
            );


            this.consultationId =
              updatedConsultation.id;


            const appointmentId =
              updatedConsultation
                .appointmentId ||
              this.appointmentId;


            // =============================================
            // UPDATE APPOINTMENT
            // =============================================

            if (
              appointmentId
            ) {

              this.appointmentService
                .updateStatus(
                  appointmentId,
                  'Completed'
                )
                .subscribe({

                  next:
                    () => {

                      this.appointmentId =
                        appointmentId;

                      this.isSaving =
                        false;

                      this.cdr.detectChanges();


                      alert(
                        `Consultation ${updatedConsultation.id} completed successfully.`
                      );


                      this.router.navigate([
                        '/consultations',
                        updatedConsultation.id
                      ]);

                    },


                  error:
                    (
                      error:
                        unknown
                    ) => {

                      console.error(
                        'Consultation completed but appointment status could not be updated:',
                        error
                      );


                      this.isSaving =
                        false;

                      this.cdr.detectChanges();


                      alert(
                        `Consultation ${updatedConsultation.id} was completed successfully, but the appointment status could not be updated.`
                      );


                      this.router.navigate([
                        '/consultations',
                        updatedConsultation.id
                      ]);

                    }

                });


              return;
            }


            // =============================================
            // NO APPOINTMENT
            // =============================================

            this.isSaving =
              false;

            this.cdr.detectChanges();


            alert(
              `Consultation ${updatedConsultation.id} completed successfully.`
            );


            this.router.navigate([
              '/consultations',
              updatedConsultation.id
            ]);

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to complete consultation:',
              error
            );


            this.isSaving =
              false;

            this.cdr.detectChanges();


            alert(
              this.extractErrorMessage(
                error,
                'Unable to complete consultation.'
              )
            );

          }

      });

  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private extractErrorMessage(
    error:
      unknown,

    fallback:
      string
  ): string {

    if (
      typeof error !==
      'object' ||
      error ===
      null
    ) {

      return fallback;
    }


    const response =
      error as {

        error?:
          unknown;

        message?:
          string;

      };


    // DIRECT MESSAGE
    if (
      typeof response.message ===
        'string' &&
      response.message.trim()
    ) {

      return response.message.trim();

    }


    // STRING ERROR
    if (
      typeof response.error ===
        'string' &&
      response.error.trim()
    ) {

      return response.error.trim();

    }


    // OBJECT ERROR
    if (
      typeof response.error ===
        'object' &&
      response.error !== null
    ) {

      const body =
        response.error as {

          message?:
            string;

          error?:
            string;

        };


      if (
        typeof body.message ===
          'string' &&
        body.message.trim()
      ) {

        return body.message.trim();

      }


      if (
        typeof body.error ===
          'string' &&
        body.error.trim()
      ) {

        return body.error.trim();

      }

    }


    return fallback;

  }


  // =====================================================
  // STATUS HELPERS
  // =====================================================

  get isOpen():
    boolean {

    return (
      this.consultation.status ===
      'Open'
    );

  }


  get isPendingResults():
    boolean {

    return (
      this.consultation.status ===
      'Pending Results'
    );

  }


  get isReadyForReview():
    boolean {

    return (
      this.consultation.status ===
      'Ready For Review'
    );

  }


  get isCompleted():
    boolean {

    return (
      this.consultation.status ===
      'Completed'
    );

  }


  get isCancelled():
    boolean {

    return (
      this.consultation.status ===
      'Cancelled'
    );

  }


  // =====================================================
  // CAN COMPLETE
  // =====================================================

  get canCompleteConsultation():
    boolean {

    if (
      this.isSaving ||
      !this.consultationId
    ) {

      return false;
    }


    if (
      this.consultation.status !==
      'Open'
    ) {

      return false;
    }


    if (
      !this.consultation
        .diagnosis
        .trim()
    ) {

      return false;
    }


    if (
      !this.consultation
        .treatmentPlan
        .trim()
    ) {

      return false;
    }


    // =============================================
    // LABORATORY
    // =============================================

    if (
      this.consultation
        .hasLaboratoryRequests
    ) {

      if (
        !this.consultation
          .hasLaboratoryResults
      ) {

        return false;
      }


      if (
        !this.consultation
          .laboratoryResultsReviewed
      ) {

        return false;
      }

    }


    // =============================================
    // UNSAVED LAB REQUESTS
    // =============================================

    const hasUnsavedLabRequests =
      this.laboratoryRequests.some(
        (
          request:
            LaboratoryRequest
        ) =>
          typeof request.id !==
          'number'
      );


    if (
      hasUnsavedLabRequests
    ) {

      return false;
    }


    return true;

  }


  // =====================================================
  // CANCEL FORM
  // =====================================================

  cancel(): void {

    if (
      this.isSaving
    ) {

      return;
    }


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


  // =====================================================
  // PATIENT NAME
  // =====================================================

  getPatientName(
    patientId:
      string
  ): string {

    const patient =
      this.patients.find(
        (
          item:
            Patient
        ) =>
          String(item.id) ===
          String(patientId)
      );


    if (
      !patient
    ) {

      return (
        patientId ||
        'Unknown Patient'
      );

    }


    return (
      `${patient.firstName} ` +
      `${patient.lastName}`
    );

  }


  // =====================================================
  // PATIENT NUMBER
  // =====================================================

  getPatientNumber(
    patientId:
      string
  ): string {

    const patient =
      this.patients.find(
        (
          item:
            Patient
        ) =>
          String(item.id) ===
          String(patientId)
      );


    if (
      !patient
    ) {

      return (
        patientId ||
        '—'
      );

    }


    return patient.id;

  }


  // =====================================================
  // DOCTOR NAME
  // =====================================================

  getDoctorName(
    doctorId:
      string
  ): string {

    const doctor =
      this.doctors.find(
        (
          item:
            Doctor
        ) =>
          String(item.id) ===
          String(doctorId)
      );


    if (
      !doctor
    ) {

      return (
        doctorId ||
        'Unknown Doctor'
      );

    }


    return (
      `Dr. ${doctor.firstName} ` +
      `${doctor.lastName}`
    );

  }


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    amount:
      number
  ): string {

    return new Intl.NumberFormat(
      'en-UG',
      {
        style:
          'currency',

        currency:
          'UGX',

        maximumFractionDigits:
          0

      }
    ).format(
      Number(
        amount ||
        0
      )
    );

  }

}

