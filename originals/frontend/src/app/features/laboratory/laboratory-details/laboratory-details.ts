
// =====================================================
// LABORATORY DETAILS COMPONENT
// File:
// src/app/features/laboratory/laboratory-details/laboratory-details.ts
// =====================================================

import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  LaboratoryTest
} from '../../../shared/models/laboratory.model';

import {
  LaboratoryService
} from '../../../core/services/laboratory.service';


@Component({
  selector: 'app-laboratory-details',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './laboratory-details.html',

  styleUrl: './laboratory-details.css'
})
export class LaboratoryDetails implements OnInit {


  // =====================================================
  // TEST
  // =====================================================

  test: LaboratoryTest | null = null;


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly laboratoryService: LaboratoryService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {

      alert(
        'Laboratory test ID was not provided.'
      );

      this.router.navigate([
        '/laboratory'
      ]);

      return;
    }


    this.loadTest(id);
  }


  // =====================================================
  // LOAD TEST
  // =====================================================

  private loadTest(
    id: string
  ): void {

    this.isLoading = true;

    this.test = null;


    this.laboratoryService
      .getTestById(id)
      .subscribe({

        next: (
          test: LaboratoryTest | undefined
        ) => {

          this.isLoading = false;


          if (!test) {

            alert(
              'Laboratory test could not be found.'
            );

            this.router.navigate([
              '/laboratory'
            ]);

            return;
          }


          this.test = test;
        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load laboratory test:',
            error
          );

          this.isLoading = false;

          this.test = null;

          alert(
            'Unable to load laboratory test.'
          );

          this.router.navigate([
            '/laboratory'
          ]);
        }

      });
  }


  // =====================================================
  // EDIT TEST
  // =====================================================

  editTest(): void {

    if (!this.test) {
      return;
    }


    this.router.navigate([
      '/laboratory',
      this.test.id,
      'edit'
    ]);
  }


  // =====================================================
  // DELETE TEST
  // =====================================================

  deleteTest(): void {

    if (!this.test) {
      return;
    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${this.test.testName}?`
      );


    if (!confirmed) {
      return;
    }


    const deleted =
      this.laboratoryService.deleteTest(
        this.test.id
      );


    if (!deleted) {

      alert(
        'Unable to delete laboratory test.'
      );

      return;
    }


    alert(
      'Laboratory test deleted successfully.'
    );


    this.router.navigate([
      '/laboratory'
    ]);
  }


  // =====================================================
  // BACK
  // =====================================================

  backToLaboratory(): void {

    this.router.navigate([
      '/laboratory'
    ]);
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

}
