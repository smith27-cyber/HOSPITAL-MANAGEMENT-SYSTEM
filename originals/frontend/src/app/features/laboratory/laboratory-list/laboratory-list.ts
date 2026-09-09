import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  LaboratoryTest,
  LaboratoryCategory
} from '../../../shared/models/laboratory.model';

import {
  LaboratoryService
} from '../../../core/services/laboratory.service';


@Component({
  selector: 'app-laboratory-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './laboratory-list.html',

  styleUrl: './laboratory-list.css'
})
export class LaboratoryList implements OnInit {


  // =====================================================
  // TESTS
  // =====================================================

  tests: LaboratoryTest[] = [];

  filteredTests: LaboratoryTest[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // FILTER
  // =====================================================

  selectedCategory:
    LaboratoryCategory | 'All' = 'All';


  // =====================================================
  // STATISTICS
  // =====================================================

  totalTests = 0;

  totalCategories = 0;


  // =====================================================
  // CATEGORIES
  // =====================================================

  categories: LaboratoryCategory[] = [

    'Hematology',

    'Biochemistry',

    'Microbiology',

    'Parasitology',

    'Serology',

    'Urinalysis',

    'Immunology',

    'Pathology',

    'Other'

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private laboratoryService: LaboratoryService,
    private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadTests();

  }


  // =====================================================
  // LOAD TESTS
  // =====================================================

  loadTests(): void {

    this.laboratoryService
      .getTests()
      .subscribe({

        next: (
          tests: LaboratoryTest[]
        ) => {

          this.tests = tests;

          this.updateStatistics();

          this.applyFilters();

        },

        error: (
          error
        ) => {

          console.error(
            'Failed to load laboratory tests:',
            error
          );

          this.tests = [];

          this.updateStatistics();

          this.applyFilters();

        }

      });

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalTests =
      this.tests.length;


    const categorySet =
      new Set(
        this.tests.map(
          test =>
            test.category
        )
      );


    this.totalCategories =
      categorySet.size;

  }


  // =====================================================
  // FILTER TESTS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredTests =
      this.tests.filter(
        test => {

          // ---------------------------------------------
          // SEARCH
          // ---------------------------------------------

          const matchesSearch =
            !search ||

            test.testName
              .toLowerCase()
              .includes(search) ||

            test.category
              .toLowerCase()
              .includes(search) ||

            test.sampleType
              .toLowerCase()
              .includes(search) ||

            (test.description ?? '')
              .toLowerCase()
              .includes(search);


          // ---------------------------------------------
          // CATEGORY
          // ---------------------------------------------

          const matchesCategory =
            this.selectedCategory === 'All' ||

            test.category ===
              this.selectedCategory;


          return (
            matchesSearch &&
            matchesCategory
          );

        }
      );

  }


  // =====================================================
  // REGISTER TEST
  // =====================================================

  registerTest(): void {

    this.router.navigate([
      '/laboratory/register'
    ]);

  }


  // =====================================================
  // EDIT TEST
  // =====================================================

  editTest(
    test: LaboratoryTest
  ): void {

    this.router.navigate([
      '/laboratory',
      test.id,
      'edit'
    ]);

  }


  // =====================================================
  // VIEW TEST
  // =====================================================

  viewTest(
    test: LaboratoryTest
  ): void {

    this.router.navigate([
      '/laboratory',
      test.id
    ]);

  }


  // =====================================================
  // DELETE TEST
  // =====================================================

  deleteTest(
    test: LaboratoryTest
  ): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete ${test.testName}?`
      );


    if (!confirmed) {

      return;

    }


    this.laboratoryService
      .deleteTest(test.id)
      .subscribe({

        next: () => {

          alert(
            'Laboratory test deleted successfully.'
          );

          this.loadTests();

        },

        error: (
          error
        ) => {

          console.error(
            'Failed to delete laboratory test:',
            error
          );

          alert(
            'Unable to delete laboratory test.'
          );

        }

      });

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedCategory = 'All';

    this.applyFilters();

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
    ).format(amount);

  }

}