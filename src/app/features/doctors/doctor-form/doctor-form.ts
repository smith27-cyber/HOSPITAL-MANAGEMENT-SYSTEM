import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../shared/models/doctor.model';

import { DepartmentService } from '../../../core/services/department.service';
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
  // EDIT MODE
  // =====================================================

  isEditMode = false;

  doctorId: string | null = null;


  // =====================================================
  // DEPARTMENTS
  // =====================================================

  departments: Department[] = [];


  // =====================================================
  // SPECIALIZATIONS
  // =====================================================

  specializations: string[] = [

    'General Practitioner',

    'Cardiologist',

    'Dentist',

    'Pediatrician',

    'Orthopedic Surgeon',

    'Surgeon',

    'Dermatologist',

    'Radiologist',

    'Laboratory Specialist',

    'Psychiatrist',

    'Neurologist',

    'Ophthalmologist',

    'ENT Specialist',

    'Gynecologist',

    'Obstetrician',

    'Urologist',

    'Anesthesiologist',

    'Pathologist',

    'Oncologist',

    'Physiotherapist',

    'Emergency Medicine Specialist'

  ];


  // =====================================================
  // DOCTOR
  // =====================================================

  doctor: Doctor = {

    id: '',

    firstName: '',

    lastName: '',

    gender: '',

    dateOfBirth: '',

    phone: '',

    email: '',

    nationalId: '',

    specialization: '',

    department: '',

    licenseNumber: '',

    consultationFee: 0,

    status: 'Active',

    createdAt: new Date().toISOString()

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private doctorService: DoctorService,

    private departmentService: DepartmentService,

    private router: Router,

    private route: ActivatedRoute

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    // -----------------------------------------------------
    // LOAD ACTIVE DEPARTMENTS
    // -----------------------------------------------------

    this.loadDepartments();


    // -----------------------------------------------------
    // GET DOCTOR ID
    // -----------------------------------------------------

    this.doctorId =
      this.route.snapshot.paramMap.get('id');


    // -----------------------------------------------------
    // NEW DOCTOR
    // -----------------------------------------------------

    if (!this.doctorId) {

      return;

    }


    // -----------------------------------------------------
    // EDIT DOCTOR
    // -----------------------------------------------------

    this.isEditMode = true;


    const existingDoctor =
      this.doctorService.getDoctorById(
        this.doctorId
      );


    if (!existingDoctor) {

      alert(
        'Doctor could not be found.'
      );


      this.router.navigate([
        '/doctors'
      ]);


      return;

    }


    // -----------------------------------------------------
    // LOAD DOCTOR
    // -----------------------------------------------------

    this.doctor = {

      ...existingDoctor

    };

  }


  // =====================================================
  // LOAD DEPARTMENTS
  // =====================================================

  loadDepartments(): void {

    this.departments =
      this.departmentService
        .getDepartments()
        .filter(
          department =>
            department.status === 'Active'
        );

  }


  // =====================================================
  // SAVE DOCTOR
  // =====================================================

  saveDoctor(): void {

    // -----------------------------------------------------
    // CLEAN INPUT
    // -----------------------------------------------------

    const firstName =
      this.doctor.firstName
        .trim();


    const lastName =
      this.doctor.lastName
        .trim();


    const phone =
      this.doctor.phone
        .trim();


    const email =
      this.doctor.email
        .trim();


    const nationalId =
      this.doctor.nationalId
        ?.trim() || '';


    const specialization =
      this.doctor.specialization
        .trim();


    const department =
      this.doctor.department
        .trim();


    const licenseNumber =
      this.doctor.licenseNumber
        .trim();


    const consultationFee =
      Number(
        this.doctor.consultationFee
      ) || 0;


    // =====================================================
    // REQUIRED FIELD VALIDATION
    // =====================================================

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


    // =====================================================
    // VALIDATE DEPARTMENT
    // =====================================================

    const selectedDepartment =
      this.departments.find(
        item =>
          item.name === department
      );


    if (!selectedDepartment) {

      alert(
        'Please select a valid active department.'
      );

      return;

    }


    // =====================================================
    // CHECK DUPLICATE LICENSE NUMBER
    // =====================================================

    const doctors =
      this.doctorService.getDoctors();


    const duplicateLicense =
      doctors.find(
        doctor =>

          doctor.licenseNumber
            .trim()
            .toLowerCase() ===
          licenseNumber.toLowerCase()

          &&

          doctor.id !==
          this.doctorId
      );


    if (duplicateLicense) {

      alert(
        `License number "${licenseNumber}" is already registered.`
      );

      return;

    }


    // =====================================================
    // CHECK DUPLICATE EMAIL
    // =====================================================

    const duplicateEmail =
      doctors.find(
        doctor =>

          doctor.email
            .trim()
            .toLowerCase() ===
          email.toLowerCase()

          &&

          doctor.id !==
          this.doctorId
      );


    if (duplicateEmail) {

      alert(
        `Email "${email}" is already registered to another doctor.`
      );

      return;

    }


    // =====================================================
    // EDIT DOCTOR
    // =====================================================

    if (
      this.isEditMode &&
      this.doctorId
    ) {

      const existingDoctor =
        this.doctorService.getDoctorById(
          this.doctorId
        );


      if (!existingDoctor) {

        alert(
          'Doctor could not be found.'
        );


        this.router.navigate([
          '/doctors'
        ]);


        return;

      }


      const updatedDoctor: Doctor = {

        id:
          existingDoctor.id,

        firstName,

        lastName,

        gender:
          this.doctor.gender,

        dateOfBirth:
          this.doctor.dateOfBirth,

        phone,

        email,

        nationalId,

        specialization,

        department,

        licenseNumber,

        consultationFee,

        status:
          this.doctor.status,

        createdAt:
          existingDoctor.createdAt

      };


      this.doctorService.updateDoctor(
        updatedDoctor
      );


      alert(
        'Doctor updated successfully.'
      );


      this.router.navigate([
        '/doctors',
        this.doctorId
      ]);


      return;

    }


    // =====================================================
    // REGISTER NEW DOCTOR
    // =====================================================

    const newDoctor =
      this.doctorService.addDoctor({

        firstName,

        lastName,

        gender:
          this.doctor.gender,

        dateOfBirth:
          this.doctor.dateOfBirth,

        phone,

        email,

        nationalId,

        specialization,

        department,

        licenseNumber,

        consultationFee

      });


    // =====================================================
    // SUCCESS
    // =====================================================

    alert(
      `Dr. ${newDoctor.firstName} ${newDoctor.lastName} registered successfully.`
    );


    // =====================================================
    // RETURN TO DOCTOR LIST
    // =====================================================

    this.router.navigate([
      '/doctors'
    ]);

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
