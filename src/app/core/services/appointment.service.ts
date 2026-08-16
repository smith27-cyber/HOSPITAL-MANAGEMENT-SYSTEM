import { Injectable } from '@angular/core';
import { Appointment } from '../../shared/models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly storageKey = 'hms_appointments';

  private appointments: Appointment[] = [];

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
      appointment => appointment.id === id
    );

  }


  // =========================
  // Add Appointment
  // =========================

  addAppointment(
    appointment: Appointment
  ): void {

    this.appointments.push(
      appointment
    );

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

    this.appointments[index] =
      updatedAppointment;

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

    if (!stored) {

      this.appointments = [];

      return;

    }

    try {

      this.appointments =
        JSON.parse(stored);

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
