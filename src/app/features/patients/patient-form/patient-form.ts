
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../shared/models/patient.model';


@Component({
  selector: 'app-patient-form',

  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl: './patient-form.html',

  styleUrl: './patient-form.css'
})
export class PatientForm implements OnInit {


  // =====================================================
  // EDIT MODE
  // =====================================================

  isEditMode = false;

  patientId: string | null = null;


  // =====================================================
  // FORM DATA
  // =====================================================

  patient = {

    firstName: '',

    lastName: '',

    dateOfBirth: '',

    gender: '',

    phone: '',

    email: '',

    address: '',

    nationalId: '',

    emergencyContactName: '',

    emergencyContactPhone: '',

    bloodGroup: '',

    department: ''

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private router: Router,

    private route: ActivatedRoute,

    private patientService: PatientService

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.patientId =
      this.route.snapshot.paramMap.get('id');


    /*
     * If an ID exists, this is
     * edit mode.
     */

    if (!this.patientId) {

      this.isEditMode = false;

      return;

    }


    this.isEditMode = true;


    const existingPatient =
      this.patientService.getPatientById(
        this.patientId
      );


    /*
     * Patient does not exist.
     */

    if (!existingPatient) {

      alert(
        'Patient record could not be found.'
      );

      this.router.navigate([
        '/patients'
      ]);

      return;

    }


    /*
     * Load existing patient
     * into the form.
     */

    this.patient = {

      firstName:
        existingPatient.firstName,

      lastName:
        existingPatient.lastName,

      dateOfBirth:
        existingPatient.dateOfBirth,

      gender:
        existingPatient.gender,

      phone:
        existingPatient.phone,

      email:
        existingPatient.email,

      address:
        existingPatient.address,

      nationalId:
        existingPatient.nationalId,

      emergencyContactName:
        existingPatient.emergencyContactName,

      emergencyContactPhone:
        existingPatient.emergencyContactPhone,

      bloodGroup:
        existingPatient.bloodGroup,

      department:
        existingPatient.department

    };

  }


  // =====================================================
  // SAVE PATIENT
  // =====================================================

  savePatient(): void {


    // ===================================================
    // VALIDATION
    // ===================================================

    const firstName =
      this.patient.firstName.trim();

    const lastName =
      this.patient.lastName.trim();

    const dateOfBirth =
      this.patient.dateOfBirth.trim();

    const gender =
      this.patient.gender.trim();

    const phone =
      this.patient.phone.trim();

    const email =
      this.patient.email.trim();

    const address =
      this.patient.address.trim();

    const nationalId =
      this.patient.nationalId.trim();

    const emergencyContactName =
      this.patient.emergencyContactName.trim();

    const emergencyContactPhone =
      this.patient.emergencyContactPhone.trim();

    const bloodGroup =
      this.patient.bloodGroup.trim();

    const department =
      this.patient.department.trim();


    /*
     * Required fields.
     */

    const missingFields: string[] = [];


    if (!firstName) {

      missingFields.push(
        'First Name'
      );

    }


    if (!lastName) {

      missingFields.push(
        'Last Name'
      );

    }


    if (!dateOfBirth) {

      missingFields.push(
        'Date of Birth'
      );

    }


    if (!gender) {

      missingFields.push(
        'Gender'
      );

    }


    if (!phone) {

      missingFields.push(
        'Phone'
      );

    }


    if (!address) {

      missingFields.push(
        'Address'
      );

    }


    if (!bloodGroup) {

      missingFields.push(
        'Blood Group'
      );

    }


    if (!department) {

      missingFields.push(
        'Department'
      );

    }


    if (missingFields.length > 0) {

      alert(
        'Please complete the following fields:\n\n' +
        missingFields.join('\n')
      );

      return;

    }


    // ===================================================
    // GENDER
    // ===================================================

    const patientGender =
      gender as
        | 'Male'
        | 'Female'
        | 'Other';


    // ===================================================
    // EDIT EXISTING PATIENT
    // ===================================================

    if (
      this.isEditMode &&
      this.patientId
    ) {

      const existingPatient =
        this.patientService.getPatientById(
          this.patientId
        );


      if (!existingPatient) {

        alert(
          'Patient record could not be found.'
        );

        this.router.navigate([
          '/patients'
        ]);

        return;

      }


      const updatedPatient: Patient = {

        id:
          existingPatient.id,

        firstName:
          firstName,

        lastName:
          lastName,

        dateOfBirth:
          dateOfBirth,

        gender:
          patientGender,

        phone:
          phone,

        email:
          email,

        address:
          address,

        nationalId:
          nationalId,

        emergencyContactName:
          emergencyContactName,

        emergencyContactPhone:
          emergencyContactPhone,

        bloodGroup:
          bloodGroup,

        department:
          department,

        status:
          existingPatient.status,

        createdAt:
          existingPatient.createdAt

      };


      this.patientService.updatePatient(
        updatedPatient
      );


      alert(
        'Patient updated successfully.'
      );


      this.router.navigate([
        '/patients',
        this.patientId
      ]);


      return;

    }


    // ===================================================
    // REGISTER NEW PATIENT
    // ===================================================

    const newPatient =
      this.patientService.addPatient({

        firstName:
          firstName,

        lastName:
          lastName,

        dateOfBirth:
          dateOfBirth,

        gender:
          patientGender,

        phone:
          phone,

        email:
          email,

        address:
          address,

        nationalId:
          nationalId,

        emergencyContactName:
          emergencyContactName,

        emergencyContactPhone:
          emergencyContactPhone,

        bloodGroup:
          bloodGroup,

        department:
          department

      });


    alert(
      `Patient ${newPatient.id} registered successfully.`
    );


    this.router.navigate([
      '/patients'
    ]);

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {


    if (
      this.isEditMode &&
      this.patientId
    ) {

      this.router.navigate([
        '/patients',
        this.patientId
      ]);

      return;

    }


    this.router.navigate([
      '/patients'
    ]);

  }

}
