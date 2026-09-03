
// =====================================================
// SIDEBAR COMPONENT
// File:
// src/app/layout/sidebar/sidebar.ts
// =====================================================

import {
  Component,
  EventEmitter,
  Output,
  inject
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  AuthService
} from '../../core/services/auth.service';


// =====================================================
// SIDEBAR
// =====================================================

@Component({
  selector: 'app-sidebar',

  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './sidebar.html',

  styleUrl: './sidebar.css'
})
export class Sidebar {

  // ===================================================
  // SIDEBAR EVENT
  // ===================================================

  @Output()
  closeSidebar =
    new EventEmitter<void>();


  // ===================================================
  // DEPENDENCIES
  // ===================================================

  private readonly router =
    inject(Router);

  private readonly authService =
    inject(AuthService);


  // ===================================================
  // NAVIGATION
  // ===================================================

  /**
   * Close the mobile sidebar after navigation.
   */
  navigate(): void {

    this.closeSidebar.emit();

  }


  // ===================================================
  // LOGOUT
  // ===================================================

  /**
   * Logs the user out of the HMS.
   *
   * Authentication data is removed from sessionStorage
   * and the user is redirected to the login page.
   */
  logout(): void {

    // ================================================
    // CLOSE SIDEBAR
    // ================================================

    this.closeSidebar.emit();


    // ================================================
    // CLEAR AUTHENTICATION
    // ================================================

    this.authService.logout();


    // ================================================
    // REDIRECT TO LOGIN
    // ================================================

    this.router.navigate(
      ['/login'],
      {
        replaceUrl: true
      }
    );

  }

}

