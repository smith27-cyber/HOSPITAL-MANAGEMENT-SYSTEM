import { Injectable } from '@angular/core';
import { Appointment } from '../../shared/models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly storageKey = 'hms_appointments';

  private appointments: Appointment[] = [];


  // =========================
  // Constructor
  // =========================

  constructor() {

    this.loadAppointments();

  }


  // =========================
  // Get Appointments
  // =========================

  getAppointments(): Appointment[] {

    return [...this.appointments];

  }


  // =========================
  // Get Appointment By ID
  // =========================

  getAppointmentById(
    id: string
  ): Appointment | undefined {

    return this.appointments.find(
      appointment =>
        appointment.id === id
    );

  }


  // =========================
  // Add Appointment
  // =========================

  addAppointment(
    appointment: Appointment
  ): void {

    this.appointments.push({
      ...appointment
    });

    this.saveAppointments();

  }


  // =========================
  // Update Appointment
  // =========================

  updateAppointment(
    updatedAppointment: Appointment
  ): void {

    const index =
      this.appointments.findIndex(
        appointment =>
          appointment.id ===
          updatedAppointment.id
      );

    if (index === -1) {
      return;
    }

    this.appointments[index] = {
      ...updatedAppointment
    };

    this.saveAppointments();

  }


  // =========================
  // Confirm Appointment
  // =========================

  confirmAppointment(
    id: string
  ): void {

    const appointment =
      this.getAppointmentById(id);

    if (!appointment) {
      return;
    }

    /*
     * Only Scheduled appointments
     * can be confirmed.
     */

    if (
      appointment.status !==
      'Scheduled'
    ) {
      return;
    }

    appointment.status =
      'Confirmed';

    this.saveAppointments();

  }


  // =========================
  // Cancel Appointment
  // =========================

  cancelAppointment(
    id: string
  ): void {

    const appointment =
      this.getAppointmentById(id);

    if (!appointment) {
      return;
    }

    /*
     * Prevent cancelling an
     * already cancelled appointment.
     */

    if (
      appointment.status ===
      'Cancelled'
    ) {
      return;
    }

    appointment.status =
      'Cancelled';

    this.saveAppointments();

  }


  // =========================
  // Update Status
  // =========================

  updateStatus(
    id: string,
    status: Appointment['status']
  ): void {

    const appointment =
      this.getAppointmentById(id);

    if (!appointment) {
      return;
    }

    appointment.status =
      status;

    this.saveAppointments();

  }

  // =========================
// SAVE CONSULTATION
// =========================

saveConsultation(
  id: string,
  diagnosis: string,
  consultationNotes: string,
  treatmentPlan: string,
  prescription: string
): boolean {

  const appointment =
    this.getAppointmentById(id);

  if (!appointment) {
    return false;
  }


  // Only appointments currently
  // in consultation can be completed.

  if (
    appointment.status !==
    'In Consultation'
  ) {
    return false;
  }


  // Save consultation information

  appointment.diagnosis =
    diagnosis.trim();

  appointment.consultationNotes =
    consultationNotes.trim();

  appointment.treatmentPlan =
    treatmentPlan.trim();

  appointment.prescription =
    prescription.trim();

  appointment.consultationDate =
    new Date().toISOString();


  // Complete appointment

  appointment.status =
    'Completed';


  // IMPORTANT:
  // Persist changes to localStorage

  this.saveAppointments();


  return true;
}


  // =========================
  // Delete Appointment
  // =========================

  deleteAppointment(
    id: string
  ): void {

    this.appointments =
      this.appointments.filter(
        appointment =>
          appointment.id !== id
      );

    this.saveAppointments();

  }


  // =========================
  // Clear Appointments
  // =========================

  clearAppointments(): void {

    this.appointments = [];

    this.saveAppointments();

  }


  // =========================
  // Load Appointments
  // =========================

  private loadAppointments(): void {

    const stored =
      localStorage.getItem(
        this.storageKey
      );


    /*
     * No saved appointments.
     */

    if (!stored) {

      this.appointments = [];

      return;

    }


    try {

      const parsed =
        JSON.parse(stored);


      /*
       * Make sure the stored
       * value is actually an array.
       */

      if (Array.isArray(parsed)) {

        this.appointments =
          parsed;

      } else {

        this.appointments = [];

      }

    } catch (error) {

      console.error(
        'Failed to load appointments:',
        error
      );

      this.appointments = [];

    }

  }


  // =========================
  // Save Appointments
  // =========================

  private saveAppointments(): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(
        this.appointments
      )
    );

  }

}
