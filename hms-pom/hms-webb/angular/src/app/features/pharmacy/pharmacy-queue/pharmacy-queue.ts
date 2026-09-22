
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  PharmacyPrescription,
  PharmacyPrescriptionStatus
} from '../../../shared/models/pharmacy.model';

import {
  PharmacyService
} from '../../../core/services/pharmacy.service';


@Component({
  selector:
    'app-pharmacy-queue',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl:
    './pharmacy-queue.html',

  styleUrl:
    './pharmacy-queue.css'
})
export class PharmacyQueue
  implements OnInit {


  // =====================================================
  // PRESCRIPTIONS
  // =====================================================

  prescriptions:
    PharmacyPrescription[] = [];

  filteredPrescriptions:
    PharmacyPrescription[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm =
    '';


  // =====================================================
  // STATUS FILTER
  // =====================================================

  selectedStatus:
    PharmacyPrescriptionStatus |
    'All' =
    'All';


  // =====================================================
  // STATISTICS
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

  totalCount =
    0;


  // =====================================================
  // LOADING
  // =====================================================

  isLoading =
    true;

  isProcessing =
    false;


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

    private readonly router:
      Router,

    private readonly cdr:
      ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadQueue();

  }


  // =====================================================
  // LOAD QUEUE
  // =====================================================

  loadQueue(): void {

    this.isLoading =
      true;

    this.errorMessage =
      '';


    this.pharmacyService
      .getPrescriptions()
      .subscribe({

        next:
          (
            prescriptions:
              PharmacyPrescription[]
          ) => {

            this.prescriptions =
              Array.isArray(
                prescriptions
              )
                ? [
                    ...prescriptions
                  ]
                : [];


            this.updateStatistics();

            this.applyFilters();


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
              'Failed to load pharmacy prescription queue:',
              error
            );


            this.prescriptions =
              [];

            this.filteredPrescriptions =
              [];

            this.updateStatistics();

            this.errorMessage =
              'Unable to load the pharmacy queue. Please try again.';


            this.isLoading =
              false;


            this.cdr.detectChanges();

          }

      });

  }


  // =====================================================
  // UPDATE STATISTICS
  // =====================================================

  private updateStatistics(): void {

    this.totalCount =
      this.prescriptions.length;


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
  // FILTER QUEUE
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredPrescriptions =
      this.prescriptions.filter(
        (
          prescription:
            PharmacyPrescription
        ) => {

          const patientName =
            (
              prescription.patientName ||
              ''
            )
              .toLowerCase();


          const prescriptionNumber =
            (
              prescription.prescriptionNumber ||
              ''
            )
              .toLowerCase();


          const patientNumber =
            (
              prescription.patientNumber ||
              ''
            )
              .toLowerCase();


          const doctorName =
            (
              prescription.doctorName ||
              ''
            )
              .toLowerCase();


          const matchesSearch =
            !search ||

            patientName.includes(
              search
            ) ||

            prescriptionNumber.includes(
              search
            ) ||

            patientNumber.includes(
              search
            ) ||

            doctorName.includes(
              search
            );


          const matchesStatus =
            this.selectedStatus ===
              'All' ||

            prescription.status ===
              this.selectedStatus;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

  }


  // =====================================================
  // SEARCH CHANGE
  // =====================================================

  onSearchChange(): void {

    this.applyFilters();

  }


  // =====================================================
  // FILTER BY STATUS
  // =====================================================

  filterByStatus(
    status:
      PharmacyPrescriptionStatus |
      'All'
  ): void {

    this.selectedStatus =
      status;

    this.applyFilters();

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm =
      '';

    this.selectedStatus =
      'All';

    this.applyFilters();

  }


  // =====================================================
  // VIEW PRESCRIPTION
  // =====================================================

  viewPrescription(
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
  // START PREPARING
  // =====================================================
  //
  // IMPORTANT:
  //
  // PharmacyService.startPreparing()
  // returns Observable<PharmacyPrescription>
  //
  // Therefore it MUST be subscribed to.
  //
  // =====================================================

  startPreparing(
    prescription:
      PharmacyPrescription
  ): void {

    if (
      this.isProcessing ||
      prescription.status !==
      'Waiting'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Start preparing prescription ${prescription.prescriptionNumber}?`
      );


    if (!confirmed) {

      return;

    }


    this.isProcessing =
      true;


    this.pharmacyService
      .startPreparing(
        prescription.id
      )
      .subscribe({

        next:
          (
            updatedPrescription:
              PharmacyPrescription
          ) => {

            this.replacePrescription(
              updatedPrescription
            );


            this.isProcessing =
              false;


            this.cdr.detectChanges();


            alert(
              'Prescription preparation started.'
            );

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to start preparing prescription:',
              error
            );


            this.isProcessing =
              false;


            this.cdr.detectChanges();


            alert(
              this.getErrorMessage(
                error,
                'Unable to start preparing this prescription.'
              )
            );

          }

      });

  }


  // =====================================================
  // SEND TO BILLING
  // =====================================================

  sendToBilling(
    prescription:
      PharmacyPrescription
  ): void {

    if (
      this.isProcessing ||
      prescription.status !==
      'Preparing'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        'Send this prescription to Billing for payment?'
      );


    if (!confirmed) {

      return;

    }


    this.isProcessing =
      true;


    this.pharmacyService
      .sendToBilling(
        prescription.id
      )
      .subscribe({

        next:
          (
            updatedPrescription:
              PharmacyPrescription
          ) => {

            this.replacePrescription(
              updatedPrescription
            );


            this.isProcessing =
              false;


            this.cdr.detectChanges();


            alert(
              'Prescription sent to Billing.'
            );

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to send prescription to billing:',
              error
            );


            this.isProcessing =
              false;


            this.cdr.detectChanges();


            alert(
              this.getErrorMessage(
                error,
                'Unable to send prescription to Billing.'
              )
            );

          }

      });

  }


  // =====================================================
  // CHECK PAYMENT
  // =====================================================

  checkPayment(
    prescription:
      PharmacyPrescription
  ): void {

    if (
      this.isProcessing ||
      prescription.status !==
      'Awaiting Payment'
    ) {

      return;

    }


    this.isProcessing =
      true;


    this.pharmacyService
      .checkPayment(
        prescription.id
      )
      .subscribe({

        next:
          (
            updatedPrescription:
              PharmacyPrescription
          ) => {

            this.replacePrescription(
              updatedPrescription
            );


            this.isProcessing =
              false;


            this.cdr.detectChanges();


            if (
              updatedPrescription.status ===
              'Ready for Pickup'
            ) {

              alert(
                'Payment confirmed. Prescription is ready for pickup.'
              );

            } else {

              alert(
                'Payment is still pending.'
              );

            }

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to check prescription payment:',
              error
            );


            this.isProcessing =
              false;


            this.cdr.detectChanges();


            alert(
              this.getErrorMessage(
                error,
                'Unable to check payment status.'
              )
            );

          }

      });

  }


  // =====================================================
  // DISPENSE
  // =====================================================

  dispense(
    prescription:
      PharmacyPrescription
  ): void {

    if (
      this.isProcessing ||
      prescription.status !==
      'Ready for Pickup'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        'Confirm that the patient has collected the medicine?'
      );


    if (!confirmed) {

      return;

    }


    this.isProcessing =
      true;


    this.pharmacyService
      .dispense(
        prescription.id,
        'Pharmacist'
      )
      .subscribe({

        next:
          (
            updatedPrescription:
              PharmacyPrescription
          ) => {

            this.replacePrescription(
              updatedPrescription
            );


            this.isProcessing =
              false;


            this.cdr.detectChanges();


            alert(
              'Prescription dispensed successfully.'
            );

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to dispense prescription:',
              error
            );


            this.isProcessing =
              false;


            this.cdr.detectChanges();


            alert(
              this.getErrorMessage(
                error,
                'Unable to dispense this prescription. Check payment and stock.'
              )
            );

          }

      });

  }


  // =====================================================
  // REPLACE PRESCRIPTION IN LOCAL STATE
  // =====================================================

  private replacePrescription(
    updatedPrescription:
      PharmacyPrescription
  ): void {

    const index =
      this.prescriptions.findIndex(
        (
          prescription:
            PharmacyPrescription
        ) =>
          prescription.id ===
          updatedPrescription.id
      );


    if (
      index ===
      -1
    ) {

      this.prescriptions =
        [
          updatedPrescription,
          ...this.prescriptions
        ];

    } else {

      this.prescriptions =
        [
          ...this.prescriptions
        ];


      this.prescriptions[index] =
        updatedPrescription;

    }


    this.updateStatistics();

    this.applyFilters();

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status:
      PharmacyPrescriptionStatus
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


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    amount:
      number
  ):
    string {

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
        amount || 0
      )
    );

  }


  // =====================================================
  // TRACK BY PRESCRIPTION
  // =====================================================

  trackPrescription(
    index:
      number,

    prescription:
      PharmacyPrescription
  ):
    number {

    return prescription.id;

  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error:
      unknown,

    fallback:
      string
  ):
    string {

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


    // ---------------------------------------------------
    // DIRECT MESSAGE
    // ---------------------------------------------------

    if (
      typeof response.message ===
        'string' &&
      response.message.trim()
    ) {

      return response.message.trim();

    }


    // ---------------------------------------------------
    // STRING ERROR BODY
    // ---------------------------------------------------

    if (
      typeof response.error ===
        'string' &&
      response.error.trim()
    ) {

      return response.error.trim();

    }


    // ---------------------------------------------------
    // OBJECT ERROR BODY
    // ---------------------------------------------------

    if (
      typeof response.error ===
        'object' &&
      response.error !==
        null
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

}

