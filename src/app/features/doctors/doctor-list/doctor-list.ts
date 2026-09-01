
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../shared/models/doctor.model';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './doctor-list.html',
  styleUrl: './doctor-list.css'
})
export class DoctorList implements OnInit {

  // =========================
  // DOCTORS
  // =========================

  doctors: Doctor[] = [];


  // =========================
  // SEARCH
  // =========================

  searchTerm = '';


  // =========================
  // FILTERS
  // =========================

  selectedDepartment = '';

  selectedStatus: Doctor['status'] | '' = '';


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private doctorService: DoctorService
  ) {}


  // =========================
  // INITIALIZE
  // =========================

  ngOnInit(): void {

    this.loadDoctors();

  }


  // =========================
  // LOAD DOCTORS
  // =========================

  loadDoctors(): void {

    this.doctors =
      this.doctorService.getDoctors();

  }


  // =========================
  // FILTERED DOCTORS
  // =========================

  get filteredDoctors(): Doctor[] {

    const term =
      this.searchTerm
        .toLowerCase()
        .trim();


    return this.doctors.filter(
      doctor => {

        const fullName =
          `${doctor.firstName} ${doctor.lastName}`
            .toLowerCase();


        const phone =
          doctor.phone?.toLowerCase() || '';


        const doctorId =
          doctor.id?.toLowerCase() || '';


        const matchesSearch =
          !term ||
          fullName.includes(term) ||
          doctorId.includes(term) ||
          phone.includes(term);


        const matchesDepartment =
          !this.selectedDepartment ||
          doctor.department ===
            this.selectedDepartment;


        const matchesStatus =
          !this.selectedStatus ||
          doctor.status ===
            this.selectedStatus;


        return (
          matchesSearch &&
          matchesDepartment &&
          matchesStatus
        );

      }
    );

  }


  // =========================
  // STATISTICS
  // =========================

  get totalDoctors(): number {

    return this.doctors.length;

  }


  get activeDoctors(): number {

    return this.doctors.filter(
      doctor =>
        doctor.status === 'Active'
    ).length;

  }


  get inactiveDoctors(): number {

    return this.doctors.filter(
      doctor =>
        doctor.status === 'Inactive'
    ).length;

  }


  // =========================
  // CLEAR FILTERS
  // =========================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedDepartment = '';

    this.selectedStatus = '';

  }


  // =========================
  // DEACTIVATE DOCTOR
  // =========================

  deactivateDoctor(id: string): void {

    const doctor =
      this.doctors.find(
        doctor =>
          doctor.id === id
      );


    if (!doctor) {
      return;
    }


    if (doctor.status === 'Inactive') {
      return;
    }


    const confirmed =
      window.confirm(
        `Deactivate Dr. ${doctor.firstName} ${doctor.lastName}?`
      );


    if (!confirmed) {
      return;
    }


    this.doctorService
      .deactivateDoctor(id);


    this.loadDoctors();

  }


  // =========================
  // DELETE DOCTOR
  // =========================

  deleteDoctor(id: string): void {

    const doctor =
      this.doctors.find(
        doctor =>
          doctor.id === id
      );


    if (!doctor) {
      return;
    }


    const confirmed =
      window.confirm(
        `Delete Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.id})? This action cannot be undone.`
      );


    if (!confirmed) {
      return;
    }


    this.doctorService
      .deleteDoctor(id);


    this.loadDoctors();

  }


  // =========================
  // REFRESH
  // =========================

  refreshDoctors(): void {

    this.loadDoctors();

  }

}

