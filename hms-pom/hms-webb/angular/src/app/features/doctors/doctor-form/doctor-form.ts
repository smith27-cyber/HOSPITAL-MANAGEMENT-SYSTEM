// =====================================================
// DOCTOR FORM COMPONENT
// File:
// src/app/features/doctors/doctor-form/doctor-form.ts
// =====================================================

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';

import { Doctor } from '../../../shared/models/doctor.model';
import { Department } from '../../../shared/models/department.model';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './doctor-form.html',
  styleUrl: './doctor-form.css'
})
export class DoctorForm implements OnInit {

  // =====================================================
  // PROPERTIES
  // =====================================================

  doctor: Partial<Doctor> = {};

  departments: Department[] = [];


  // =====================================================
  // SPECIALIZATIONS
  // =====================================================

  specializations: string[] = [

    'General Physician',
    'General Practitioner',
    'Cardiologist',
    'Dermatologist',
    'Endocrinologist',
    'Gastroenterologist',
    'Neurologist',
    'Obstetrician & Gynecologist',
    'Oncologist',
    'Ophthalmologist',
    'Orthopedic Surgeon',
    'Pediatrician',
    'Psychiatrist',
    'Radiologist',
    'Surgeon',
    'Urologist',
    'Dentist',
    'ENT Specialist',
    'Anesthesiologist',
    'Other'

  ];


  // =====================================================
  // EDIT MODE
  // =====================================================

  isEditMode = false;

  doctorId: string | null = null;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private doctorService: DoctorService,

    private departmentService: DepartmentService,

    private route: ActivatedRoute,

    private router: Router, 
     private cdr: ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    // ---------------------------------------------------
    // LOAD DEPARTMENTS
    // ---------------------------------------------------

    this.loadDepartments();


    // ---------------------------------------------------
    // GET DOCTOR ID
    // ---------------------------------------------------

    this.doctorId =
      this.route.snapshot.paramMap.get('id');


    // ---------------------------------------------------
    // EDIT MODE
    // ---------------------------------------------------

    if (this.doctorId) {

      this.isEditMode = true;

      this.loadDoctorForEdit();

    }

  }


  // =====================================================
  // LOAD DOCTOR FOR EDIT
  // =====================================================

  loadDoctorForEdit(): void {

    if (!this.doctorId) {
      return;
    }


    this.doctorService

      .getDoctorById(this.doctorId)

      .pipe(first())

      .subscribe({

        next: (existingDoctor: Doctor) => {

          console.log(
            'Doctor loaded for editing:',
            existingDoctor
          );


          this.doctor = {
            ...existingDoctor
          };

        },


        error: (err: unknown) => {

          console.error(
            'Failed to load doctor:',
            err
          );


          alert(
            'Doctor profile could not be loaded.'
          );


          this.router.navigate([
            '/doctors'
          ]);

        }

      });

  }


  // =====================================================
  // LOAD DEPARTMENTS
  // =====================================================
loadDepartments(): void {

  this.departmentService
    .getActiveDepartments()
    .pipe(first())
    .subscribe({

      next: (departments: Department[]) => {

        console.log(
          'Active departments loaded:',
          departments
        );

        this.departments = [
          ...departments
        ];

        // Force the Department dropdown
        // to render immediately.
        this.cdr.detectChanges();

      },

      error: (error: unknown) => {

        console.error(
          'Failed to load departments:',
          error
        );

        this.departments = [];

        this.cdr.detectChanges();

        alert(
          'Unable to load departments. Please make sure the department API is running.'
        );

      }

    });

}

  // =====================================================
  // SAVE DOCTOR
  // =====================================================

  saveDoctor(): void {

    // ===================================================
    // CLEAN INPUT
    // ===================================================

    const firstName =
      this.doctor.firstName?.trim() || '';


    const lastName =
      this.doctor.lastName?.trim() || '';


    const phone =
      this.doctor.phone?.trim() || '';


    const email =
      this.doctor.email?.trim() || '';


    const nationalId =
      this.doctor.nationalId?.trim() || '';


    const specialization =
      this.doctor.specialization?.trim() || '';


    const department =
      this.doctor.department?.trim() || '';


    const licenseNumber =
      this.doctor.licenseNumber?.trim() || '';


    const consultationFee =
      Number(
        this.doctor.consultationFee
      ) || 0;


    // ===================================================
    // REQUIRED FIELD VALIDATION
    // ===================================================

    if (

      !firstName ||

      !lastName ||

      !this.doctor.dateOfBirth ||

      !this.doctor.gender ||

      !phone ||

      !email ||

      !specialization ||

      !department ||

      !licenseNumber

    ) {

      alert(
        'Please complete all required fields.'
      );

      return;

    }


    // ===================================================
    // VALIDATE DEPARTMENT
    // ===================================================

    const selectedDepartment =
      this.departments.find(

        (item: Department) =>

          item.name.trim().toLowerCase() ===
          department.trim().toLowerCase()

      );


    if (!selectedDepartment) {

      alert(
        'Please select a valid active department.'
      );

      return;

    }


    // ===================================================
    // VALIDATE EMAIL
    // ===================================================

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

      alert(
        'Please enter a valid email address.'
      );

      return;

    }


    // ===================================================
    // LOAD DOCTORS FOR DUPLICATE CHECK
    // =====================================================

    this.doctorService

      .getDoctors()

      .pipe(first())

      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (doctors: Doctor[]) => {

          console.log(
            'Doctors loaded for duplicate check:',
            doctors
          );


          // ===============================================
          // DUPLICATE LICENSE NUMBER
          // ===============================================

          const duplicateLicense =
            doctors.find(

              (doc: Doctor) => {

                const existingLicense =
                  doc.licenseNumber
                    ?.trim()
                    .toLowerCase() || '';


                return (

                  existingLicense ===
                    licenseNumber.toLowerCase() &&

                  doc.id !== this.doctorId

                );

              }

            );


          if (duplicateLicense) {

            alert(
              `License number "${licenseNumber}" is already registered.`
            );

            return;

          }


          // ===============================================
          // DUPLICATE EMAIL
          // ===============================================

          const duplicateEmail =
            doctors.find(

              (doc: Doctor) => {

                const existingEmail =
                  doc.email
                    ?.trim()
                    .toLowerCase() || '';


                return (

                  existingEmail ===
                    email.toLowerCase() &&

                  doc.id !== this.doctorId

                );

              }

            );


          if (duplicateEmail) {

            alert(
              `Email "${email}" is already registered to another doctor.`
            );

            return;

          }


          // =================================================
          // EDIT EXISTING DOCTOR
          // =================================================

          if (

            this.isEditMode &&

            this.doctorId

          ) {

            this.updateExistingDoctor(

              firstName,

              lastName,

              phone,

              email,

              nationalId,

              specialization,

              department,

              licenseNumber,

              consultationFee

            );

            return;

          }


          // =================================================
          // REGISTER NEW DOCTOR
          // =================================================

          this.registerNewDoctor(

            firstName,

            lastName,

            phone,

            email,

            nationalId,

            specialization,

            department,

            licenseNumber,

            consultationFee

          );

        },


        // =================================================
        // ERROR
        // =================================================

        error: (err: unknown) => {

          console.error(
            'Failed to load doctors for duplicate check:',
            err
          );


          alert(
            'Unable to verify doctor information. Please make sure the doctor API is running and try again.'
          );

        }

      });

  }


  // =====================================================
  // UPDATE EXISTING DOCTOR
  // =====================================================

  private updateExistingDoctor(

    firstName: string,

    lastName: string,

    phone: string,

    email: string,

    nationalId: string,

    specialization: string,

    department: string,

    licenseNumber: string,

    consultationFee: number

  ): void {

    // ---------------------------------------------------
    // MAKE SURE CURRENT DOCTOR EXISTS
    // ---------------------------------------------------

    if (!this.doctorId) {
      return;
    }


    // ---------------------------------------------------
    // CREATE UPDATED DOCTOR
    // ---------------------------------------------------

    const updatedDoctor: Doctor = {

      id:
        this.doctorId,


      firstName,

      lastName,


      gender:
        this.doctor.gender as Doctor['gender'],


      dateOfBirth:
        this.doctor.dateOfBirth!,


      phone,

      email,

      nationalId,

      specialization,

      department,

      licenseNumber,

      consultationFee,


      status:
        this.doctor.status || 'Active',


      createdAt:
        this.doctor.createdAt ||
        new Date().toISOString()

    };


    console.log(
      'Updating doctor:',
      updatedDoctor
    );


    // ---------------------------------------------------
    // UPDATE API
    // ---------------------------------------------------

    this.doctorService

      .updateDoctor(updatedDoctor)

      .pipe(first())

      .subscribe({

        next: (doctor: Doctor) => {

          console.log(
            'Doctor updated successfully:',
            doctor
          );


          alert(
            `Dr. ${doctor.firstName} ${doctor.lastName} updated successfully.`
          );


          this.router.navigate([

            '/doctors',

            doctor.id

          ]);

        },


        error: (err: unknown) => {

          console.error(
            'Failed to update doctor:',
            err
          );


          alert(
            'Failed to update doctor. Please try again.'
          );

        }

      });

  }


  // =====================================================
  // REGISTER NEW DOCTOR
  // =====================================================

  private registerNewDoctor(

    firstName: string,

    lastName: string,

    phone: string,

    email: string,

    nationalId: string,

    specialization: string,

    department: string,

    licenseNumber: string,

    consultationFee: number

  ): void {

    const newDoctorPayload:

      Omit<

        Doctor,

        'id' |

        'status' |

        'createdAt'

      > = {

        firstName,

        lastName,


        gender:
          this.doctor.gender as Doctor['gender'],


        dateOfBirth:
          this.doctor.dateOfBirth!,


        phone,

        email,

        nationalId,

        specialization,

        department,

        licenseNumber,

        consultationFee

      };


    console.log(
      'Registering new doctor:',
      newDoctorPayload
    );


    // ---------------------------------------------------
    // POST DOCTOR
    // ---------------------------------------------------

    this.doctorService

      .addDoctor(newDoctorPayload)

      .pipe(first())

      .subscribe({

        next: (newDoctor: Doctor) => {

          console.log(
            'Doctor registered successfully:',
            newDoctor
          );


          alert(
            `Dr. ${newDoctor.firstName} ${newDoctor.lastName} registered successfully.`
          );


          this.router.navigate([
            '/doctors'
          ]);

        },


        error: (err: unknown) => {

          console.error(
            'Failed to register doctor:',
            err
          );


          alert(
            'Failed to register doctor. Please check the server and try again.'
          );

        }

      });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    if (

      this.isEditMode &&

      this.doctorId

    ) {

      this.router.navigate([

        '/doctors',

        this.doctorId

      ]);

      return;

    }


    this.router.navigate([
      '/doctors'
    ]);

  }

}
