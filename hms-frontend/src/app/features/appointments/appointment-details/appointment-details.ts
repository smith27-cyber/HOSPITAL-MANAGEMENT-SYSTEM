import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AppointmentService
} from '../../../core/services/appointment.service';

import {
  ConsultationService
} from '../../../core/services/consultation.service';

import {
  Appointment,
  AppointmentStatus
} from '../../../shared/models/appointment.model';

import {
  Consultation
} from '../../../shared/models/consultation.model';


@Component({
  selector: 'app-appointment-details',

  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl: './appointment-details.html',

  styleUrl: './appointment-details.css'
})
export class AppointmentDetails implements OnInit {

  // =====================================================
  // APPOINTMENT
  // =====================================================

  appointment?: Appointment;


  // =====================================================
  // CONSULTATION
  // =====================================================

  consultation?: Consultation;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly route: ActivatedRoute,

    private readonly router: Router,

    private readonly appointmentService:
      AppointmentService,

    private readonly consultationService:
      ConsultationService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {

      console.error(
        'Appointment ID was not provided in the route.'
      );

      return;

    }


    this.loadAppointment(id);

  }


  // =====================================================
  // LOAD APPOINTMENT
  // =====================================================

  private loadAppointment(
    id: string
  ): void {

    this.appointmentService
      .getAppointmentById(id)
      .subscribe({

        next: (
          appointment: Appointment
        ) => {

          this.appointment = {
            ...appointment
          };


          console.log(
            'Appointment loaded:',
            this.appointment
          );


          this.loadConsultation();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load appointment:',
            error
          );


          this.appointment =
            undefined;

          this.consultation =
            undefined;


          alert(
            'Appointment could not be loaded.'
          );

        }

      });

  }


  // =====================================================
  // LOAD CONSULTATION BY APPOINTMENT ID
  // =====================================================

  private loadConsultation(): void {

    if (!this.appointment) {

      this.consultation =
        undefined;

      return;

    }


    const appointmentId =
      this.appointment.id;


    console.log(
      'Loading consultation for appointment:',
      appointmentId
    );


    /*
     * IMPORTANT
     *
     * appointmentId is NOT a consultation ID.
     *
     * Therefore we MUST use:
     *
     * GET /api/consultations/appointment/{appointmentId}
     *
     * and NOT:
     *
     * GET /api/consultations/{appointmentId}
     */

    this.consultationService
      .getConsultationByAppointment(
        appointmentId
      )
      .subscribe({

        next: (
          consultation: Consultation
        ) => {

          if (!consultation) {

            this.consultation =
              undefined;

            console.log(
              'No consultation found for appointment:',
              appointmentId
            );

            return;

          }


          this.consultation = {
            ...consultation
          };


          console.log(
            'Consultation loaded for appointment:',
            this.consultation
          );

        },

        error: (
          error: unknown
        ) => {

          /*
           * A consultation may legitimately not exist yet.
           *
           * For example:
           *
           * Scheduled
           * Confirmed
           * Checked-In
           *
           * may all exist before a consultation record
           * has been created.
           */

          console.log(
            'No consultation currently linked to appointment:',
            appointmentId
          );


          console.log(
            'Consultation lookup response:',
            error
          );


          this.consultation =
            undefined;

        }

      });

  }


  // =====================================================
  // CONFIRM APPOINTMENT
  // =====================================================

  confirmAppointment(): void {

    if (!this.appointment) {

      return;

    }


    if (
      this.appointment.status !==
      'Scheduled'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Confirm appointment ${this.appointment.id} for ${this.appointment.patientName}?`
      );


    if (!confirmed) {

      return;

    }


    this.appointmentService
      .confirmAppointment(
        this.appointment.id
      )
      .subscribe({

        next: (
          updatedAppointment: Appointment
        ) => {

          this.appointment = {
            ...updatedAppointment
          };


          this.loadConsultation();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to confirm appointment:',
            error
          );


          alert(
            'Unable to confirm this appointment.'
          );

        }

      });

  }


  // =====================================================
  // CHECK IN APPOINTMENT
  // =====================================================

  checkInAppointment(): void {

    if (!this.appointment) {

      return;

    }


    if (
      this.appointment.status !==
      'Confirmed'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Check in ${this.appointment.patientName} for appointment ${this.appointment.id}?`
      );


    if (!confirmed) {

      return;

    }


    this.appointmentService
      .checkInAppointment(
        this.appointment.id
      )
      .subscribe({

        next: (
          updatedAppointment: Appointment
        ) => {

          this.appointment = {
            ...updatedAppointment
          };


          this.loadConsultation();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to check in appointment:',
            error
          );


          alert(
            'Unable to check in this patient.'
          );

        }

      });

  }


  // =====================================================
  // START CONSULTATION
  // =====================================================

  startConsultation(): void {

    if (!this.appointment) {

      return;

    }


    if (
      this.appointment.status !==
      'Checked-In'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Start consultation for ${this.appointment.patientName}?`
      );


    if (!confirmed) {

      return;

    }


    this.appointmentService
      .startConsultation(
        this.appointment.id
      )
      .subscribe({

        next: (
          updatedAppointment: Appointment
        ) => {

          this.appointment = {
            ...updatedAppointment
          };


          /*
           * IMPORTANT:
           *
           * The correct consultation registration route
           * is:
           *
           * /consultations/register
           *
           * NOT:
           *
           * /consultations/new
           */

          this.router.navigate(
            [
              '/consultations',
              'register'
            ],
            {
              queryParams: {
                appointmentId:
                  updatedAppointment.id
              }
            }
          );

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to start consultation:',
            error
          );


          alert(
            'Unable to start the consultation.'
          );

        }

      });

  }


  // =====================================================
  // OPEN CONSULTATION
  // =====================================================

  openConsultation(): void {

    if (!this.appointment) {

      return;

    }


    /*
     * EXISTING CONSULTATION
     *
     * Open the actual consultation profile
     * using the consultation ID.
     */

    if (this.consultation) {

      console.log(
        'Opening consultation:',
        this.consultation.id
      );


      this.router.navigate([
        '/consultations',
        this.consultation.id
      ]);


      return;

    }


    /*
     * NO CONSULTATION YET
     *
     * Open the registration form using
     * the appointment ID.
     */

    console.log(
      'Opening consultation registration for appointment:',
      this.appointment.id
    );


    this.router.navigate(
      [
        '/consultations',
        'register'
      ],
      {
        queryParams: {
          appointmentId:
            this.appointment.id
        }
      }
    );

  }


  // =====================================================
  // COMPLETE APPOINTMENT
  // =====================================================

  completeAppointment(): void {

    if (!this.appointment) {

      return;

    }


    if (
      this.appointment.status !==
      'In Consultation'
    ) {

      return;

    }


    /*
     * The appointment cannot be completed
     * until a consultation exists.
     */

    if (!this.consultation) {

      alert(
        'This appointment cannot be completed yet. Please create the consultation first.'
      );

      return;

    }


    /*
     * The consultation itself must be completed.
     */

    if (
      this.consultation.status !==
      'Completed'
    ) {

      alert(
        'Please complete the consultation before completing the appointment.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Mark appointment ${this.appointment.id} for ${this.appointment.patientName} as completed?`
      );


    if (!confirmed) {

      return;

    }


    this.appointmentService
      .completeAppointment(
        this.appointment.id
      )
      .subscribe({

        next: (
          updatedAppointment: Appointment
        ) => {

          this.appointment = {
            ...updatedAppointment
          };


          this.loadConsultation();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to complete appointment:',
            error
          );


          alert(
            'Unable to complete this appointment.'
          );

        }

      });

  }


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  updateStatus(
    status: AppointmentStatus
  ): void {

    if (!this.appointment) {

      return;

    }


    this.appointmentService
      .updateStatus(
        this.appointment.id,
        status
      )
      .subscribe({

        next: (
          updatedAppointment: Appointment
        ) => {

          this.appointment = {
            ...updatedAppointment
          };


          this.loadConsultation();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to update appointment status:',
            error
          );


          alert(
            'Unable to update appointment status.'
          );

        }

      });

  }


  // =====================================================
  // CANCEL APPOINTMENT
  // =====================================================

  cancelAppointment(): void {

    if (!this.appointment) {

      return;

    }


    if (
      this.appointment.status ===
      'Cancelled'
    ) {

      return;

    }


    if (
      this.appointment.status ===
      'Completed'
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to cancel appointment ${this.appointment.id}?`
      );


    if (!confirmed) {

      return;

    }


    this.appointmentService
      .cancelAppointment(
        this.appointment.id
      )
      .subscribe({

        next: (
          updatedAppointment: Appointment
        ) => {

          this.appointment = {
            ...updatedAppointment
          };


          this.consultation =
            undefined;

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to cancel appointment:',
            error
          );


          alert(
            'Unable to cancel this appointment.'
          );

        }

      });

  }


  // =====================================================
  // REFRESH APPOINTMENT
  // =====================================================

  private refreshAppointment(): void {

    if (!this.appointment) {

      return;

    }


    this.appointmentService
      .getAppointmentById(
        this.appointment.id
      )
      .subscribe({

        next: (
          updatedAppointment: Appointment
        ) => {

          this.appointment = {
            ...updatedAppointment
          };


          this.loadConsultation();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to refresh appointment:',
            error
          );

        }

      });

  }


  // =====================================================
  // PRINT
  // =====================================================

  print(): void {

    window.print();

  }

}