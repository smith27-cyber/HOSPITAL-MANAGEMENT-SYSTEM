// =====================================================
// LOGIN COMPONENT
// File:
// src/app/auth/login/login.ts
// =====================================================

import {
  Component,
  inject
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../core/services/auth.service';


// =====================================================
// LOGIN COMPONENT
// =====================================================

@Component({

  selector: 'app-login',

  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl: './login.html',

  styleUrl: './login.css'

})
export class Login {


  // ===================================================
  // DEPENDENCIES
  // ===================================================

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);


  // ===================================================
  // FORM VALUES
  // ===================================================

  username = '';

  password = '';


  // ===================================================
  // STATE
  // ===================================================

  loading = false;

  errorMessage = '';

  showPassword = false;


  // ===================================================
  // INITIALIZATION
  // ===================================================

  constructor() {

    // -------------------------------------------------
    // If the user is already authenticated,
    // send them to the correct application area.
    // -------------------------------------------------

    if (
      this.authService.isAuthenticated()
    ) {

      this.navigateAfterLogin();

    }

  }


  // ===================================================
  // LOGIN
  // ===================================================

  login(): void {

    // ================================================
    // CLEAR PREVIOUS ERROR
    // ================================================

    this.errorMessage = '';


    // ================================================
    // VALIDATE USERNAME
    // ================================================

    if (!this.username.trim()) {

      this.errorMessage =
        'Please enter your username.';

      return;

    }


    // ================================================
    // VALIDATE PASSWORD
    // ================================================

    if (!this.password) {

      this.errorMessage =
        'Please enter your password.';

      return;

    }


    // ================================================
    // START LOADING
    // ================================================

    this.loading = true;


    // ================================================
    // CALL BACKEND
    // ================================================

    this.authService
      .login({

        username:
          this.username.trim(),

        password:
          this.password

      })
      .subscribe({

        // ============================================
        // SUCCESS
        // ============================================

        next: response => {

          this.loading = false;

          console.log(
            'Login successful. Redirecting user:',
            {
              username: response.username,
              role: response.role,
              roles: response.roles,
              permissions: response.permissions
            }
          );

          this.navigateAfterLogin();

        },


        // ============================================
        // ERROR
        // ============================================

        error: error => {

          this.loading = false;

          console.error(
            'Login error:',
            error
          );


          // ==========================================
          // INVALID CREDENTIALS
          // ==========================================

          if (
            error.status === 401
          ) {

            this.errorMessage =
              'Invalid username or password.';

          }


          // ==========================================
          // FORBIDDEN
          // ==========================================

          else if (
            error.status === 403
          ) {

            this.errorMessage =
              'Access denied. Please contact the administrator.';

          }


          // ==========================================
          // BACKEND UNAVAILABLE
          // ==========================================

          else if (
            error.status === 0
          ) {

            this.errorMessage =
              'Unable to connect to the HMS server. Make sure the backend is running on port 8081.';

          }


          // ==========================================
          // OTHER SERVER ERROR
          // ==========================================

          else {

            this.errorMessage =
              error?.error?.message ||
              'Login failed. Please try again.';

          }

        }

      });

  }


  // ===================================================
  // NAVIGATION AFTER LOGIN
  // ===================================================

  private navigateAfterLogin(): void {

    // -------------------------------------------------
    // ONLY SUPER_ADMIN ENTERS THE PLATFORM PANEL
    // -------------------------------------------------
    //
    // IMPORTANT:
    //
    // ADMIN is a TENANT administrator.
    //
    // SUPER_ADMIN is the OLIVES TECH platform
    // administrator.
    //
    // Do not determine platform access using
    // individual platform permissions because a
    // tenant administrator may legitimately have
    // permissions such as TENANT_VIEW.
    //
    // -------------------------------------------------

    if (
      this.hasPlatformAccess()
    ) {

      console.log(
        'Platform administrator detected. Redirecting to /platform/dashboard'
      );

      this.router.navigate(
        ['/platform/dashboard']
      );

      return;

    }


    // -------------------------------------------------
    // NORMAL TENANT HMS USER
    // -------------------------------------------------

    console.log(
      'Tenant HMS user detected. Redirecting to /dashboard'
    );

    this.router.navigate(
      ['/dashboard']
    );

  }


  // ===================================================
  // PLATFORM ACCESS CHECK
  // ===================================================
  //
  // Only SUPER_ADMIN should enter the Olives Tech
  // Platform Panel.
  //
  // Tenant ADMIN users must remain inside their
  // tenant's HMS application.
  //
  // ===================================================

  private hasPlatformAccess(): boolean {

    return this.authService.hasRole(
      'SUPER_ADMIN'
    );

  }


  // ===================================================
  // TOGGLE PASSWORD VISIBILITY
  // ===================================================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }

}