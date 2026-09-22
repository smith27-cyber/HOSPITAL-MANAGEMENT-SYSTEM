// =====================================================
// HEADER COMPONENT
// File:
// src/app/layout/header/header.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  AuthService
} from '../../core/services/auth.service';


// =====================================================
// HEADER
// =====================================================

@Component({
  selector: 'app-header',

  standalone: true,

  imports: [],

  templateUrl: './header.html',

  styleUrl: './header.css'
})
export class Header implements OnInit {


  // =====================================================
  // MENU
  // =====================================================

  @Output()
  menuToggle =
    new EventEmitter<void>();


  // =====================================================
  // LOGGED-IN USER
  // =====================================================

  fullName =
    'User';

  username =
    '';

  role =
    'User';

  avatarInitials =
    'U';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly authService:
      AuthService,

    private readonly router:
      Router,

    private readonly changeDetectorRef:
      ChangeDetectorRef
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadUser();

  }


  // =====================================================
  // LOAD LOGGED-IN USER
  // =====================================================

  private loadUser(): void {

    const user =
      this.authService.getUser();


    // ---------------------------------------------------
    // No authenticated user
    // ---------------------------------------------------

    if (!user) {

      return;

    }


    // ---------------------------------------------------
    // Full name
    // ---------------------------------------------------

    this.fullName =
      user.fullName?.trim() ||
      user.username?.trim() ||
      'User';


    // ---------------------------------------------------
    // Username
    // ---------------------------------------------------

    this.username =
      user.username?.trim() ||
      '';


    // ---------------------------------------------------
    // Role
    // ---------------------------------------------------

    this.role =
      this.formatRole(
        user.role
      );


    // ---------------------------------------------------
    // Avatar initials
    // ---------------------------------------------------

    this.avatarInitials =
      this.createInitials(
        this.fullName
      );


    // ---------------------------------------------------
    // Force immediate UI rendering
    // ---------------------------------------------------

    this.changeDetectorRef.detectChanges();

  }


  // =====================================================
  // PROFILE SETTINGS
  // =====================================================

  /**
   * Opens the currently authenticated user's
   * Profile Settings page.
   */
  openProfileSettings(): void {

    this.router.navigate([
      '/settings/profile'
    ]);

  }


  // =====================================================
  // CREATE INITIALS
  // =====================================================

  private createInitials(
    name: string
  ): string {

    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    // ---------------------------------------------------
    // Two or more names
    // ---------------------------------------------------

    if (parts.length >= 2) {

      return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
      ).toUpperCase();

    }


    // ---------------------------------------------------
    // Single name
    // ---------------------------------------------------

    return (
      name.charAt(0) ||
      'U'
    ).toUpperCase();

  }


  // =====================================================
  // FORMAT ROLE
  // =====================================================

  private formatRole(
    role: string
  ): string {

    if (!role) {

      return 'User';

    }


    return role
      .trim()
      .toLowerCase()
      .split('_')
      .map(word =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
      )
      .join(' ');

  }


  // =====================================================
  // MENU
  // =====================================================

  toggleMenu(): void {

    this.menuToggle.emit();

  }

}