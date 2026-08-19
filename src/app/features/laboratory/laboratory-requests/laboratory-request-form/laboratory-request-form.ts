import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LaboratoryRequest,
  LaboratoryStatus,
  LaboratoryTest
} from '../../../../shared/models/laboratory.model';

import {
  LaboratoryService
} from '../../../../core/services/laboratory.service';


@Component({
  selector: 'app-laboratory-request-form',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './laboratory-request-form.html',

  styleUrl: './laboratory-request-form.css'
})
export class LaboratoryRequestForm implements OnInit {


  // =====================================================
  // EDIT MODE
  // =====================================================

  isEditMode = false;

  editingId = '';


  // =====================================================
  // TESTS
  // =====================================================

  tests: LaboratoryTest[] = [];


  // =====================================================
  // REQUEST
  // =====================================================

  request: LaboratoryRequest = {

    id: '',

    patientId: '',

    patientName: '',

    doctorId: '',

    doctorName: '',

    testId: '',

    testName: '',

    category: 'Hematology',

    sampleType: 'Blood',

    status: 'Pending',

    result: '',

    notes: '',

    price: 0,

    requestedAt: ''

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private laboratoryService: LaboratoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.tests =
      this.laboratoryService.getTests();


    const id =
      this.route.snapshot.paramMap.get('id');


    if (id) {

      this.isEditMode = true;

      this.editingId = id;

      this.loadRequest(id);

    }

  }


  // =====================================================
  // LOAD REQUEST
  // =====================================================

  private loadRequest(id: string): void {

    const existing =
      this.laboratoryService.getRequestById(id);


    if (!existing) {

      alert(
        'Laboratory request could not be found.'
      );

      this.router.navigate([
        '/laboratory/requests'
      ]);

      return;

    }


    this.request = {
      ...existing
    };

  }


  // =====================================================
  // TEST SELECTED
  // =====================================================

  testSelected(): void {

    const selected =
      this.tests.find(
        test =>
          test.id === this.request.testId
      );


    if (!selected) {
      return;
    }


    this.request.testName =
      selected.testName;

    this.request.category =
      selected.category;

    this.request.sampleType =
      selected.sampleType;

    this.request.price =
      selected.price;

  }


  // =====================================================
  // SAVE REQUEST
  // =====================================================

  saveRequest(): void {

    this.request.patientId =
      this.request.patientId.trim();

    this.request.patientName =
      this.request.patientName.trim();

    this.request.doctorId =
      this.request.doctorId?.trim();

    this.request.doctorName =
      this.request.doctorName?.trim();

    this.request.result =
      this.request.result?.trim();

    this.request.notes =
      this.request.notes?.trim();


    // ===================================================
    // VALIDATION
    // ===================================================

    const missingFields: string[] = [];


    if (!this.request.patientId) {

      missingFields.push(
        'Patient ID'
      );

    }


    if (!this.request.patientName) {

      missingFields.push(
        'Patient Name'
      );

    }


    if (!this.request.testId) {

      missingFields.push(
        'Laboratory Test'
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
    // EDIT
    // ===================================================

    if (this.isEditMode) {

      const updated: LaboratoryRequest = {

        ...this.request,

        id: this.editingId

      };


      const success =
        this.laboratoryService.updateRequest(
          updated
        );


      if (!success) {

        alert(
          'Unable to update laboratory request.'
        );

        return;

      }


      alert(
        'Laboratory request updated successfully.'
      );


      this.router.navigate([
        '/laboratory/requests'
      ]);

      return;

    }


    // ===================================================
    // NEW REQUEST
    // ===================================================

    this.request.id =
      this.generateRequestId();


    this.request.requestedAt =
      new Date().toISOString();


    this.request.status =
      'Pending';


    this.laboratoryService.addRequest({

      ...this.request

    });


    alert(
      'Laboratory request created successfully.'
    );


    this.router.navigate([
      '/laboratory/requests'
    ]);

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/laboratory/requests'
    ]);

  }


  // =====================================================
  // GENERATE ID
  // =====================================================

  private generateRequestId(): string {

    return `REQ-${Date.now()
      .toString()
      .slice(-7)}`;

  }

}
