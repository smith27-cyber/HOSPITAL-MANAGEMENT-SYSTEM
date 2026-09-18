/**
 * =====================================================
 * SETTINGS COMPONENT
 * File:
 * src/app/features/settings/settings/settings.ts
 * =====================================================
 */

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';


@Component({
  selector: 'app-settings',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './settings.html',

  styleUrl:
    './settings.css'
})
export class Settings
  implements OnInit {


  // =====================================================
  // STATE
  // =====================================================

  isLoading =
    false;

  errorMessage =
    '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private readonly router:
      Router,

    private readonly authService:
      AuthService,

    private readonly changeDetectorRef:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.isLoading =
      false;

    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // PERMISSION CHECK
  // =====================================================

  canManageUsers():
    boolean {

    return this.authService.hasPermission(
      'SETTINGS_USER_MANAGE'
    );

  }


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


  openUserManagement(): void {

    if (
      !this.canManageUsers()
    ) {

      return;

    }


    this.router.navigate([
      '/settings/users'
    ]);

  }

}