
// =====================================================
// LOGIN COMPONENT
// File:
// src/app/auth/login/login.ts
// =====================================================

import {
  ChangeDetectorRef,
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

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);


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
  // DEV LOGIN STATE
  // ===================================================
  //
  // Purely cosmetic — whether these render at all comes
  // from the backend's own /api/auth/dev-login/status.
  // The real gate (hms.dev-login.enabled + loopback-only
  // caller) is enforced server-side regardless of what
  // this component shows.
  // ===================================================

  devLoginEnabled = false;

  testUserOptions: string[] = [];

  selectedTestUser = '';

  devLoginLoading = false;


  // ===================================================
  // INITIALIZATION
  // ===================================================

  constructor() {

    // If the user is already authenticated,
    // don't show the login page again.

    if (
      this.authService.isAuthenticated()
    ) {

      this.router.navigate(
        ['/dashboard']
      );

    }


    // ================================================
    // CHECK DEV LOGIN AVAILABILITY
    // ================================================

    this.authService
      .devLoginStatus()
      .subscribe({

        next: status => {

          this.devLoginEnabled =
            status.enabled;

          this.testUserOptions =
            (status.usernames ?? [])
              .filter(
                username => username !== 'thor'
              );

          // HttpClient's fetch-based backend isn't reliably
          // zone-patched here, so the @if(devLoginEnabled)
          // block wouldn't otherwise re-render on its own.

          this.changeDetectorRef.detectChanges();

        },

        // Dev-login status itself is best-effort —
        // if it fails, just don't show the buttons.
        error: () => {

          this.devLoginEnabled = false;

          this.changeDetectorRef.detectChanges();

        }

      });

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

        next: () => {

          this.loading = false;

          this.router.navigate(
            ['/dashboard']
          );

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
  // TOGGLE PASSWORD VISIBILITY
  // ===================================================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }


  // ===================================================
  // DEV LOGIN — THOR
  // ===================================================

  loginAsThor(): void {

    this.runDevLogin('thor');

  }


  // ===================================================
  // DEV LOGIN — TEST USER DROPDOWN
  // ===================================================

  onTestUserSelected(): void {

    if (!this.selectedTestUser) {

      return;

    }

    this.runDevLogin(this.selectedTestUser);

  }


  // ===================================================
  // DEV LOGIN — SHARED
  // ===================================================

  private runDevLogin(username: string): void {

    this.errorMessage = '';

    this.devLoginLoading = true;

    this.authService
      .devLogin(username)
      .subscribe({

        next: () => {

          this.devLoginLoading = false;

          this.router.navigate(
            ['/dashboard']
          );

        },

        error: error => {

          this.devLoginLoading = false;

          this.selectedTestUser = '';

          console.error(
            'Dev login error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Dev login failed.';

        }

      });

  }

}

