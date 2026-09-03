
// =====================================================
// AUTHENTICATION SERVICE
// File:
// src/app/core/services/auth.service.ts
// =====================================================

import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';


// =====================================================
// LOGIN REQUEST
// =====================================================

export interface LoginRequest {
  username: string;
  password: string;
}


// =====================================================
// LOGIN RESPONSE
// =====================================================

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
}


// =====================================================
// AUTH SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ===================================================
  // API
  // ===================================================

  private readonly API_URL =
    'http://localhost:8081/api/auth';


  // ===================================================
  // STORAGE KEYS
  // ===================================================

  private readonly TOKEN_KEY =
    'hms_token';

  private readonly USER_KEY =
    'hms_user';


  // ===================================================
  // DEPENDENCIES
  // ===================================================

  private readonly http =
    inject(HttpClient);


  // ===================================================
  // LOGIN
  // ===================================================

  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.API_URL}/login`,
        request
      )
      .pipe(

        tap((response: LoginResponse) => {

          // ===========================================
          // SAVE JWT TOKEN FOR THIS BROWSER SESSION
          // ===========================================

          sessionStorage.setItem(
            this.TOKEN_KEY,
            response.token
          );


          // ===========================================
          // SAVE USER INFORMATION FOR THIS SESSION
          // ===========================================

          sessionStorage.setItem(
            this.USER_KEY,
            JSON.stringify({
              username: response.username,
              fullName: response.fullName,
              role: response.role
            })
          );

        })

      );
  }


  // ===================================================
  // GET TOKEN
  // ===================================================

  getToken(): string | null {

    return sessionStorage.getItem(
      this.TOKEN_KEY
    );
  }


  // ===================================================
  // GET USER
  // ===================================================

  getUser(): LoginResponse | null {

    const user =
      sessionStorage.getItem(
        this.USER_KEY
      );

    if (!user) {
      return null;
    }

    try {

      const parsedUser =
        JSON.parse(user);

      return {
        token: this.getToken() ?? '',
        username: parsedUser.username,
        fullName: parsedUser.fullName,
        role: parsedUser.role
      };

    } catch {

      return null;

    }
  }


  // ===================================================
  // GET USERNAME
  // ===================================================

  getUsername(): string | null {

    return this.getUser()?.username ?? null;
  }


  // ===================================================
  // GET FULL NAME
  // ===================================================

  getFullName(): string | null {

    return this.getUser()?.fullName ?? null;
  }


  // ===================================================
  // GET ROLE
  // ===================================================

  getRole(): string | null {

    return this.getUser()?.role ?? null;
  }


  // ===================================================
  // AUTHENTICATION CHECK
  // ===================================================

  isAuthenticated(): boolean {

    const token =
      this.getToken();

    const user =
      this.getUser();

    return !!token && !!user;

  }


  // ===================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    sessionStorage.removeItem(
      this.TOKEN_KEY
    );

    sessionStorage.removeItem(
      this.USER_KEY
    );

  }

}

