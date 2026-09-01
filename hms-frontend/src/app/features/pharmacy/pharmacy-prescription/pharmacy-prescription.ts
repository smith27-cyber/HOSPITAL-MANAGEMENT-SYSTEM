
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  PharmacyPrescription as PharmacyPrescriptionModel,
  PharmacyPrescriptionStatus
} from '../../../shared/models/pharmacy.model';

import {
  PharmacyService
} from '../../../core/services/pharmacy.service';


@Component({
  selector: 'app-pharmacy-prescription',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './pharmacy-prescription.html',

  styleUrl:
    './pharmacy-prescription.css'
})
export class PharmacyPrescription
  implements OnInit {


  // =====================================================
  // PRESCRIPTION
  // =====================================================

  prescription:
    PharmacyPrescriptionModel |
    null =
      null;


  // =====================================================
  // PRESCRIPTION ID
  // =====================================================

  prescriptionId:
    string |
    null =
      null;


  // =====================================================
  // LOADING
  // =====================================================

  isLoading =
    true;


  // =====================================================
  // PROCESSING
  // =====================================================

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
    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly pharmacyService:
      PharmacyService,

    private readonly cdr:
      ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.prescriptionId =
      this.route.snapshot.paramMap.get(
        'id'
      );


    if (
      !this.prescriptionId
    ) {

      this.isLoading =
        false;

      this.errorMessage =
        'Prescription ID is missing.';

      this.cdr.detectChanges();

      return;
    }


    this.loadPrescription(
      this.prescriptionId
    );

  }


  // =====================================================
  // LOAD PRESCRIPTION
  // =====================================================

  private loadPrescription(
    id:
      string
  ): void {

    const numericId =
      Number(id);


    if (
      Number.isNaN(numericId) ||
      numericId <= 0
    ) {

      this.isLoading =
        false;

      this.errorMessage =
        'Invalid prescription ID.';

      this.cdr.detectChanges();

      return;
    }


    this.isLoading =
      true;

    this.errorMessage =
      '';

    this.prescription =
      null;

    this.cdr.detectChanges();


    this.pharmacyService
      .getPrescriptionById(
        numericId
      )
      .subscribe({

        next:
          (
            prescription:
              PharmacyPrescriptionModel
          ) => {

            console.log(
              'Prescription loaded:',
              prescription
            );


            this.prescription =
              prescription;

            this.isLoading =
              false;

            this.errorMessage =
              '';

            this.cdr.detectChanges();

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to load prescription:',
              error
            );


            this.prescription =
              null;

            this.isLoading =
              false;

            this.errorMessage =
              this.extractErrorMessage(
                error,
                'Unable to load prescription.'
              );

            this.cdr.detectChanges();

          }

      });

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshPrescription(): void {

    if (
      !this.prescriptionId
    ) {

      return;
    }


    this.loadPrescription(
      this.prescriptionId
    );

  }


  // =====================================================
  // GO BACK
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/pharmacy/queue'
    ]);

  }


  // =====================================================
  // GET STATUS CLASS
  // =====================================================

  getStatusClass(
    status:
      PharmacyPrescriptionStatus
  ): string {

    switch (status) {

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
  // START PREPARING
  // =====================================================

  startPreparing(): void {

    if (
      !this.prescription ||
      this.isProcessing
    ) {

      return;
    }


    if (
      this.prescription.status !==
      'Waiting'
    ) {

      return;
    }


    this.isProcessing =
      true;

    this.cdr.detectChanges();


    this.pharmacyService
      .startPreparing(
        this.prescription.id
      )
      .subscribe({

        next:
          (
            updated:
              PharmacyPrescriptionModel
          ) => {

            console.log(
              'Prescription preparing:',
              updated
            );


            this.prescription =
              updated;

            this.isProcessing =
              false;

            this.cdr.detectChanges();

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
              this.extractErrorMessage(
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

  sendToBilling(): void {

    if (
      !this.prescription ||
      this.isProcessing
    ) {

      return;
    }


    if (
      this.prescription.status !==
      'Preparing'
    ) {

      return;
    }


    const confirmed =
      window.confirm(
        'Send this prescription to Billing for payment?'
      );


    if (
      !confirmed
    ) {

      return;
    }


    this.isProcessing =
      true;

    this.cdr.detectChanges();


    this.pharmacyService
      .sendToBilling(
        this.prescription.id
      )
      .subscribe({

        next:
          (
            updated:
              PharmacyPrescriptionModel
          ) => {

            console.log(
              'Prescription sent to billing:',
              updated
            );


            this.prescription =
              updated;

            this.isProcessing =
              false;

            this.cdr.detectChanges();


            alert(
              'Prescription sent to Billing successfully.'
            );

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to send prescription to Billing:',
              error
            );


            this.isProcessing =
              false;

            this.cdr.detectChanges();


            alert(
              this.extractErrorMessage(
                error,
                'Unable to send this prescription to Billing.'
              )
            );

          }

      });

  }


  // =====================================================
  // CHECK PAYMENT
  // =====================================================

  checkPayment(): void {

    if (
      !this.prescription ||
      this.isProcessing
    ) {

      return;
    }


    if (
      this.prescription.status !==
      'Awaiting Payment'
    ) {

      return;
    }


    this.isProcessing =
      true;

    this.cdr.detectChanges();


    this.pharmacyService
      .checkPayment(
        this.prescription.id
      )
      .subscribe({

        next:
          (
            updated:
              PharmacyPrescriptionModel
          ) => {

            console.log(
              'Payment status checked:',
              updated
            );


            this.prescription =
              updated;

            this.isProcessing =
              false;

            this.cdr.detectChanges();


            if (
              updated.status ===
              'Ready for Pickup'
            ) {

              alert(
                'Payment confirmed. Prescription is ready for pickup.'
              );

            } else {

              alert(
                'Payment has not yet been completed.'
              );

            }

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to check payment:',
              error
            );


            this.isProcessing =
              false;

            this.cdr.detectChanges();


            alert(
              this.extractErrorMessage(
                error,
                'Unable to check payment.'
              )
            );

          }

      });

  }


  // =====================================================
  // DISPENSE
  // =====================================================

  dispense(): void {

    if (
      !this.prescription ||
      this.isProcessing
    ) {

      return;
    }


    if (
      this.prescription.status !==
      'Ready for Pickup'
    ) {

      return;
    }


    if (
      Number(
        this.prescription.balance || 0
      ) > 0
    ) {

      alert(
        'This prescription still has an outstanding balance.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        'Confirm that the patient has collected the prescribed medicines?'
      );


    if (
      !confirmed
    ) {

      return;
    }


    this.isProcessing =
      true;

    this.cdr.detectChanges();


    this.pharmacyService
      .dispense(
        this.prescription.id,
        'Pharmacist'
      )
      .subscribe({

        next:
          (
            updated:
              PharmacyPrescriptionModel
          ) => {

            console.log(
              'Prescription dispensed:',
              updated
            );


            this.prescription =
              updated;

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
              this.extractErrorMessage(
                error,
                'Unable to dispense the prescription. Please verify payment and medicine stock.'
              )
            );

          }

      });

  }


  // =====================================================
  // CANCEL PRESCRIPTION
  // =====================================================

  cancelPrescription(): void {

    if (
      !this.prescription ||
      this.isProcessing
    ) {

      return;
    }


    if (
      this.prescription.status ===
      'Dispensed'
    ) {

      alert(
        'A dispensed prescription cannot be cancelled.'
      );

      return;
    }


    if (
      this.prescription.status ===
      'Cancelled'
    ) {

      return;
    }


    const confirmed =
      window.confirm(
        `Cancel prescription ${this.prescription.prescriptionNumber}?`
      );


    if (
      !confirmed
    ) {

      return;
    }


    this.isProcessing =
      true;

    this.cdr.detectChanges();


    this.pharmacyService
      .cancelPrescription(
        this.prescription.id
      )
      .subscribe({

        next:
          (
            updated:
              PharmacyPrescriptionModel
          ) => {

            this.prescription =
              updated;

            this.isProcessing =
              false;

            this.cdr.detectChanges();


            alert(
              'Prescription cancelled successfully.'
            );

          },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to cancel prescription:',
              error
            );


            this.isProcessing =
              false;

            this.cdr.detectChanges();


            alert(
              this.extractErrorMessage(
                error,
                'Unable to cancel prescription.'
              )
            );

          }

      });

  }


  // =====================================================
  // DELETE PRESCRIPTION
  // =====================================================

  deletePrescription(): void {

    if (
      !this.prescription ||
      this.isProcessing
    ) {

      return;
    }


    if (
      this.prescription.status ===
      'Dispensed'
    ) {

      alert(
        'Dispensed prescriptions cannot be deleted.'
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Delete prescription ${this.prescription.prescriptionNumber}? This action cannot be undone.`
      );


    if (
      !confirmed
    ) {

      return;
    }


    this.isProcessing =
      true;

    this.cdr.detectChanges();


    this.pharmacyService
      .deletePrescription(
        this.prescription.id
      )
      .subscribe({

        next: () => {

          this.isProcessing =
            false;

          this.cdr.detectChanges();


          alert(
            'Prescription deleted successfully.'
          );


          this.router.navigate([
            '/pharmacy/queue'
          ]);

        },


        error:
          (
            error:
              unknown
          ) => {

            console.error(
              'Failed to delete prescription:',
              error
            );


            this.isProcessing =
              false;

            this.cdr.detectChanges();


            alert(
              this.extractErrorMessage(
                error,
                'Unable to delete prescription.'
              )
            );

          }

      });

  }


  // =====================================================
  // PAYMENT PERCENTAGE
  // =====================================================

  getPaymentPercentage():
    number {

    if (
      !this.prescription
    ) {

      return 0;

    }


    const subtotal =
      Number(
        this.prescription.subtotal || 0
      );


    const amountPaid =
      Number(
        this.prescription.amountPaid || 0
      );


    if (
      subtotal <= 0
    ) {

      return 0;

    }


    const percentage =
      (
        amountPaid /
        subtotal
      ) * 100;


    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          percentage
        )
      )
    );

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?:
      string
  ): string {

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
  // FORMAT DATE TIME
  // =====================================================

  formatDateTime(
    date?:
      string
  ): string {

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


    return parsedDate.toLocaleString(
      'en-GB',
      {
        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit'
      }
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
        amount || 0
      )
    );

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
      typeof error !== 'object' ||
      error === null
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


    // -------------------------------------------------
    // DIRECT MESSAGE
    // -------------------------------------------------

    if (
      typeof response.message ===
        'string' &&
      response.message.trim()
    ) {

      return response.message.trim();

    }


    // -------------------------------------------------
    // STRING ERROR
    // -------------------------------------------------

    if (
      typeof response.error ===
        'string' &&
      response.error.trim()
    ) {

      return response.error.trim();

    }


    // -------------------------------------------------
    // OBJECT ERROR
    // -------------------------------------------------

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

}

