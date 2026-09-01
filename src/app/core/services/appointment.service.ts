import { Injectable } from '@angular/core';

import {
  Appointment,
  AppointmentStatus
} from '../../shared/models/appointment.model';


@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly storageKey =
    'hms_appointments';

  private appointments: Appointment[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    this.loadAppointments();

  }


  // =====================================================
  // GET ALL APPOINTMENTS
  // =====================================================

  getAppointments(): Appointment[] {

    return this.appointments.map(
      appointment => ({
        ...appointment
      })
    );

  }


  // =====================================================
  // GET APPOINTMENT BY ID
  // =====================================================

  getAppointmentById(
    id: string
  ): Appointment | undefined {

    return this.appointments.find(
      appointment =>
        appointment.id === id
    );

  }


  // =====================================================
  // ADD APPOINTMENT
  // =====================================================

  addAppointment(
    appointment: Appointment
  ): void {

    this.appointments.push({
      ...appointment
    });

    this.saveAppointments();

  }


  // =====================================================
  // UPDATE APPOINTMENT
  // =====================================================

  updateAppointment(
    updatedAppointment: Appointment
  ): boolean {

    const index =
      this.appointments.findIndex(
        appointment =>
          appointment.id ===
          updatedAppointment.id
      );

    if (index === -1) {

      return false;

    }


    this.appointments[index] = {
      ...updatedAppointment
    };


    this.saveAppointments();

    return true;

  }


  // =====================================================
  // CONFIRM APPOINTMENT
  // =====================================================

  confirmAppointment(
    id: string
  ): boolean {

    return this.changeStatus(
      id,
      'Scheduled',
      'Confirmed'
    );

  }


  // =====================================================
  // CHECK IN APPOINTMENT
  // =====================================================

  checkInAppointment(
    id: string
  ): boolean {

    return this.changeStatus(
      id,
      'Confirmed',
      'Checked-In'
    );

  }


  // =====================================================
  // START CONSULTATION
  // =====================================================

  startConsultation(
    id: string
  ): boolean {

    return this.changeStatus(
      id,
      'Checked-In',
      'In Consultation'
    );

  }


  // =====================================================
  // COMPLETE APPOINTMENT
  // =====================================================

  completeAppointment(
    id: string
  ): boolean {

    return this.changeStatus(
      id,
      'In Consultation',
      'Completed'
    );

  }


  // =====================================================
  // MARK NO SHOW
  // =====================================================

  markNoShow(
    id: string
  ): boolean {

    const appointment =
      this.getAppointmentById(id);

    if (!appointment) {

      return false;

    }


    if (
      appointment.status !== 'Scheduled' &&
      appointment.status !== 'Confirmed'
    ) {

      return false;

    }


    appointment.status =
      'No Show';


    this.saveAppointments();

    return true;

  }


  // =====================================================
  // CANCEL APPOINTMENT
  // =====================================================

  cancelAppointment(
    id: string
  ): boolean {

    const appointment =
      this.getAppointmentById(id);

    if (!appointment) {

      return false;

    }


    if (
      appointment.status === 'Cancelled' ||
      appointment.status === 'Completed'
    ) {

      return false;

    }


    appointment.status =
      'Cancelled';


    this.saveAppointments();

    return true;

  }


  // =====================================================
  // GENERIC STATUS UPDATE
  // =====================================================

  updateStatus(
    id: string,
    status: AppointmentStatus
  ): boolean {

    const appointment =
      this.getAppointmentById(id);

    if (!appointment) {

      return false;

    }


    appointment.status =
      status;


    this.saveAppointments();

    return true;

  }


  // =====================================================
  // INTERNAL STATUS CHANGE
  // =====================================================

  private changeStatus(
    id: string,
    currentStatus: AppointmentStatus,
    newStatus: AppointmentStatus
  ): boolean {

    const appointment =
      this.getAppointmentById(id);

    if (!appointment) {

      return false;

    }


    if (
      appointment.status !==
      currentStatus
    ) {

      return false;

    }


    appointment.status =
      newStatus;


    this.saveAppointments();

    return true;

  }


  // =====================================================
  // SAVE CONSULTATION
  // =====================================================

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


    if (
      appointment.status !==
      'In Consultation'
    ) {

      return false;

    }


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


    appointment.status =
      'Completed';


    this.saveAppointments();

    return true;

  }


  // =====================================================
  // DELETE APPOINTMENT
  // =====================================================

  deleteAppointment(
    id: string
  ): boolean {

    const originalLength =
      this.appointments.length;


    this.appointments =
      this.appointments.filter(
        appointment =>
          appointment.id !== id
      );


    if (
      this.appointments.length ===
      originalLength
    ) {

      return false;

    }


    this.saveAppointments();

    return true;

  }


  // =====================================================
  // CLEAR APPOINTMENTS
  // =====================================================

  clearAppointments(): void {

    this.appointments = [];

    this.saveAppointments();

  }


  // =====================================================
  // LOAD APPOINTMENTS
  // =====================================================

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

      const parsed =
        JSON.parse(stored);


      if (
        Array.isArray(parsed)
      ) {

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


  // =====================================================
  // SAVE APPOINTMENTS
  // =====================================================

  private saveAppointments(): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(
        this.appointments
      )
    );

  }

}
