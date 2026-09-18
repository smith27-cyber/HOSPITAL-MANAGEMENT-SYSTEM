// =====================================================
// HMS HEADER
// File:
// src/app/layout/header/header.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  output
} from '@angular/core';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';

import {
  HospitalSettings
} from '../../shared/models/settings.model';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {

  // =====================================================
  // EVENTS
  // =====================================================

  menuToggle = output<void>();


  // =====================================================
  // USER INFORMATION
  // =====================================================

  fullName = 'User';

  username = '';

  role = '';

  avatarInitials = 'U';


  // =====================================================
  // TENANT INFORMATION
  // =====================================================

  hospitalName =
    'Hospital Management System';

  hospitalCity = '';

  hospitalLogo = '';


  // =====================================================
  // SUBSCRIPTIONS
  // =====================================================

  private hospitalSettingsSubscription?:
    Subscription;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.loadUser();

    this.loadHospitalIdentity();

  }


  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  private loadUser(): void {

    const user =
      this.authService.getUser();

    if (!user) {
      return;
    }

    // ---------------------------------------------------
    // Full name
    // ---------------------------------------------------

    this.fullName =
      user.fullName?.trim()
      || user.username?.trim()
      || 'User';


    // ---------------------------------------------------
    // Username
    // ---------------------------------------------------

    this.username =
      user.username?.trim()
      || '';


    // ---------------------------------------------------
    // Role
    // ---------------------------------------------------

    this.role =
      this.formatRole(
        user.role
        || user.roles?.[0]
        || ''
      );


    // ---------------------------------------------------
    // Avatar initials
    // ---------------------------------------------------

    this.avatarInitials =
      this.createInitials(
        this.fullName
      );

  }


  // =====================================================
  // LOAD CURRENT TENANT IDENTITY
  // =====================================================

  private loadHospitalIdentity(): void {

    this.hospitalSettingsSubscription =
      this.settingsService
        .hospitalSettings$
        .subscribe({

          next: (
            settings: HospitalSettings
          ) => {

            this.hospitalName =
              settings.hospitalName?.trim()
              || 'Hospital Management System';


            this.hospitalCity =
              settings.city?.trim()
              || '';


            this.hospitalLogo =
              settings.logoUrl?.trim()
              || '';


            this.cdr.detectChanges();

          }

        });

  }


  // =====================================================
  // FORMAT ROLE
  // =====================================================

  private formatRole(
    role: string
  ): string {

    if (!role) {
      return '';
    }

    return role
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(
        /\b\w/g,
        letter => letter.toUpperCase()
      );

  }


  // =====================================================
  // CREATE AVATAR INITIALS
  // =====================================================

  private createInitials(
    name: string
  ): string {

    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (parts.length === 0) {
      return 'U';
    }


    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();

    }


    return (
      parts[0][0]
      + parts[parts.length - 1][0]
    ).toUpperCase();

  }


  // =====================================================
  // OPEN PROFILE SETTINGS
  // =====================================================

  openProfileSettings(): void {

    this.router.navigate([
      '/settings/profile'
    ]);

  }


  // =====================================================
  // TOGGLE MENU
  // =====================================================

  toggleMenu(): void {

    this.menuToggle.emit();

  }


  // =====================================================
  // CLEANUP
  // =====================================================

  ngOnDestroy(): void {

    this.hospitalSettingsSubscription
      ?.unsubscribe();

  }

}