
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import {
  PharmacyPrescription
} from '../../../shared/models/pharmacy.model';

import {
  PharmacyService
} from '../../../core/services/pharmacy.service';

import {
  InventoryService
} from '../../../core/services/inventory.service';

import {
  InventoryItem
} from '../../../shared/models/inventory.model';


@Component({
  selector:
    'app-pharmacy-dashboard',

  standalone:
    true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './pharmacy-dashboard.html',

  styleUrl:
    './pharmacy-dashboard.css'
})
export class PharmacyDashboard
  implements OnInit {


  // =====================================================
  // PRESCRIPTIONS
  // =====================================================

  prescriptions:
    PharmacyPrescription[] = [];


  // =====================================================
  // MEDICINE COUNTS
  // =====================================================

  totalMedicines =
    0;

  lowStockMedicines =
    0;

  expiredMedicines =
    0;

  outOfStockMedicines =
    0;


  // =====================================================
  // PRESCRIPTION COUNTS
  // =====================================================

  waitingCount =
    0;

  preparingCount =
    0;

  awaitingPaymentCount =
    0;

  readyForPickupCount =
    0;

  dispensedCount =
    0;


  // =====================================================
  // LOADING
  // =====================================================

  isLoading =
    true;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage =
    '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly pharmacyService:
      PharmacyService,

    private readonly inventoryService:
      InventoryService,

    private readonly router:
      Router,

    private readonly cdr:
      ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadDashboard();

  }


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================
  //
  // IMPORTANT:
  //
  // Do NOT call:
  //
  // pharmacyService.getMedicines()
  //
  // here because that reads the pharmacy cache
  // synchronously.
  //
  // Instead, load inventory and prescriptions directly
  // and render once both are available.
  //
  // =====================================================

  loadDashboard(): void {

    this.isLoading =
      true;

    this.errorMessage =
      '';


    forkJoin({

      prescriptions:
        this.pharmacyService
          .getPrescriptions(),

      inventory:
        this.inventoryService
          .getItems()

    })
    .subscribe({

      next:
        (
          result
        ) => {

          // =============================================
          // PRESCRIPTIONS
          // =============================================

          this.prescriptions =
            Array.isArray(
              result.prescriptions
            )
              ? [
                  ...result.prescriptions
                ]
              : [];


          this.calculatePrescriptionCounts();


          // =============================================
          // INVENTORY
          // =============================================

          const inventory =
            Array.isArray(
              result.inventory
            )
              ? result.inventory
              : [];


          const medicines =
            inventory.filter(
              (
                item:
                  InventoryItem
              ) =>
                item.category ===
                'Medicine'
            );


          this.calculateMedicineCounts(
            medicines
          );


          // =============================================
          // COMPLETE RENDER
          // =============================================

          this.isLoading =
            false;


          this.cdr.detectChanges();

        },


      error:
        (
          error:
            unknown
        ) => {

          console.error(
            'Failed to load pharmacy dashboard:',
            error
          );


          this.prescriptions =
            [];


          this.resetPrescriptionCounts();

          this.resetMedicineCounts();


          this.errorMessage =
            'Unable to load pharmacy dashboard data. Please try again.';


          this.isLoading =
            false;


          this.cdr.detectChanges();

        }

    });

  }


  // =====================================================
  // CALCULATE PRESCRIPTION COUNTS
  // =====================================================

  private calculatePrescriptionCounts():
    void {

    this.waitingCount =
      this.prescriptions.filter(
        (
          prescription:
            PharmacyPrescription
        ) =>
          prescription.status ===
          'Waiting'
      ).length;


    this.preparingCount =
      this.prescriptions.filter(
        (
          prescription:
            PharmacyPrescription
        ) =>
          prescription.status ===
          'Preparing'
      ).length;


    this.awaitingPaymentCount =
      this.prescriptions.filter(
        (
          prescription:
            PharmacyPrescription
        ) =>
          prescription.status ===
          'Awaiting Payment'
      ).length;


    this.readyForPickupCount =
      this.prescriptions.filter(
        (
          prescription:
            PharmacyPrescription
        ) =>
          prescription.status ===
          'Ready for Pickup'
      ).length;


    this.dispensedCount =
      this.prescriptions.filter(
        (
          prescription:
            PharmacyPrescription
        ) =>
          prescription.status ===
          'Dispensed'
      ).length;

  }


  // =====================================================
  // RESET PRESCRIPTION COUNTS
  // =====================================================

  private resetPrescriptionCounts():
    void {

    this.waitingCount =
      0;

    this.preparingCount =
      0;

    this.awaitingPaymentCount =
      0;

    this.readyForPickupCount =
      0;

    this.dispensedCount =
      0;

  }


  // =====================================================
  // CALCULATE MEDICINE COUNTS
  // =====================================================

  private calculateMedicineCounts(
    medicines:
      InventoryItem[]
  ):
    void {

    this.totalMedicines =
      medicines.length;


    this.lowStockMedicines =
      medicines.filter(
        (
          medicine:
            InventoryItem
        ) =>
          this.getMedicineStatus(
            medicine
          ) ===
          'Low Stock'
      ).length;


    this.expiredMedicines =
      medicines.filter(
        (
          medicine:
            InventoryItem
        ) =>
          this.getMedicineStatus(
            medicine
          ) ===
          'Expired'
      ).length;


    this.outOfStockMedicines =
      medicines.filter(
        (
          medicine:
            InventoryItem
        ) =>
          this.getMedicineStatus(
            medicine
          ) ===
          'Out of Stock'
      ).length;

  }


  // =====================================================
  // RESET MEDICINE COUNTS
  // =====================================================

  private resetMedicineCounts():
    void {

    this.totalMedicines =
      0;

    this.lowStockMedicines =
      0;

    this.expiredMedicines =
      0;

    this.outOfStockMedicines =
      0;

  }


  // =====================================================
  // MEDICINE STATUS
  // =====================================================

  private getMedicineStatus(
    medicine:
      InventoryItem
  ):
    'Available' |
    'Low Stock' |
    'Out of Stock' |
    'Expired' {

    // ---------------------------------------------------
    // EXPIRY
    // ---------------------------------------------------

    if (
      medicine.expiryDate
    ) {

      const expiry =
        new Date(
          medicine.expiryDate
        );

      const today =
        new Date();


      expiry.setHours(
        0,
        0,
        0,
        0
      );


      today.setHours(
        0,
        0,
        0,
        0
      );


      if (
        expiry <
        today
      ) {

        return 'Expired';

      }

    }


    // ---------------------------------------------------
    // STOCK
    // ---------------------------------------------------

    const quantity =
      Number(
        medicine.quantity || 0
      );


    const minimumStock =
      Number(
        medicine.minimumStock || 0
      );


    if (
      quantity <=
      0
    ) {

      return 'Out of Stock';

    }


    if (
      quantity <=
      minimumStock
    ) {

      return 'Low Stock';

    }


    return 'Available';

  }


  // =====================================================
  // RECENT PRESCRIPTIONS
  // =====================================================

  get recentPrescriptions():
    PharmacyPrescription[] {

    return [
      ...this.prescriptions
    ]
      .sort(
        (
          first:
            PharmacyPrescription,

          second:
            PharmacyPrescription
        ) => {

          const firstTime =
            new Date(
              first.prescriptionDate
            ).getTime();


          const secondTime =
            new Date(
              second.prescriptionDate
            ).getTime();


          return (
            secondTime -
            firstTime
          );

        }
      )
      .slice(
        0,
        5
      );

  }


  // =====================================================
  // OPEN QUEUE
  // =====================================================

  openQueue(): void {

    this.router.navigate([
      '/pharmacy/queue'
    ]);

  }


  // =====================================================
  // OPEN PRESCRIPTION
  // =====================================================

  openPrescription(
    prescription:
      PharmacyPrescription
  ): void {

    if (
      prescription.id ===
        undefined ||
      prescription.id ===
        null
    ) {

      return;

    }


    this.router.navigate([
      '/pharmacy/prescriptions',
      prescription.id
    ]);

  }


  // =====================================================
  // OPEN STOCK
  // =====================================================

  openStock(): void {

    this.router.navigate([
      '/pharmacy/stock'
    ]);

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status:
      string
  ):
    string {

    switch (
      status
    ) {

      case 'Waiting':
        return 'status-waiting';

      case 'Preparing':
        return 'status-preparing';

      case 'Awaiting Payment':
        return 'status-payment';

      case 'Paid':
        return 'status-paid';

      case 'Ready for Pickup':
        return 'status-ready';

      case 'Dispensed':
        return 'status-dispensed';

      case 'Cancelled':
        return 'status-cancelled';

      default:
        return '';

    }

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date:
      string
  ):
    string {

    if (
      !date
    ) {

      return '—';

    }


    const parsedDate =
      new Date(
        date
      );


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—';

    }


    return parsedDate.toLocaleDateString(
      'en-GB',
      {
        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric'
      }
    );

  }

}

