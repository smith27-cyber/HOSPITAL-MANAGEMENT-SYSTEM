

import { Appointment } from './appointment.model';


// =====================================================
// DASHBOARD RESPONSE
// =====================================================

export interface DashboardResponse {

  // ===================================================
  // STATISTICS
  // ===================================================

  totalPatients: number;

  activeDoctors: number;

  totalDepartments: number;

  totalAppointments: number;

  todaysAppointments: number;


  // ===================================================
  // TODAY'S APPOINTMENTS
  // ===================================================

  todayAppointments: Appointment[];

}

