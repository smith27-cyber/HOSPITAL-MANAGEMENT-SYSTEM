
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './settings.html',

  styleUrl: './settings.css'
})
export class Settings {

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private router: Router
  ) {}


  // =====================================================
  // NAVIGATION
  // =====================================================

  openHospitalSettings(): void {

    this.router.navigate([
      '/settings/hospital'
    ]);

  }


  openProfileSettings(): void {

    this.router.navigate([
      '/settings/profile'
    ]);

  }


  openSystemSettings(): void {

    this.router.navigate([
      '/settings/system'
    ]);

  }


  openNotifications(): void {

    this.router.navigate([
      '/settings/notifications'
    ]);

  }


  openSecurity(): void {

    this.router.navigate([
      '/settings/security'
    ]);

  }


  openDataManagement(): void {

    this.router.navigate([
      '/settings/data'
    ]);

  }

}

