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

  roles: string[];

  permissions: string[];

}


// =====================================================
// DEV LOGIN STATUS
// =====================================================

export interface DevLoginStatus {

  enabled: boolean;

  usernames: string[];

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
    '/api/auth';


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

        tap(
          (response: LoginResponse) =>
            this.persistSession(response)
        )

      );

  }


  // ===================================================
  // DEV LOGIN (local dev / testing only — no password)
  // ===================================================

  devLogin(
    username: string
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.API_URL}/dev-login`,
        { username }
      )
      .pipe(

        tap(
          (response: LoginResponse) =>
            this.persistSession(response)
        )

      );

  }


  // ===================================================
  // DEV LOGIN STATUS
  // ===================================================

  devLoginStatus(): Observable<DevLoginStatus> {

    return this.http
      .get<DevLoginStatus>(
        `${this.API_URL}/dev-login/status`
      );

  }


  // ===================================================
  // PERSIST SESSION (shared: login + devLogin)
  // ===================================================

  private persistSession(
    response: LoginResponse
  ): void {

    // =========================================
    // SAVE JWT TOKEN
    // =========================================

    sessionStorage.setItem(
      this.TOKEN_KEY,
      response.token
    );


    // =========================================
    // SAVE COMPLETE USER SESSION
    // =========================================

    sessionStorage.setItem(
      this.USER_KEY,
      JSON.stringify({

        username:
          response.username,

        fullName:
          response.fullName,

        role:
          response.role,

        roles:
          response.roles ?? [],

        permissions:
          response.permissions ?? []

      })
    );


    // =========================================
    // DEBUG
    // =========================================

    console.log(
      'HMS user authenticated:',
      {
        username:
          response.username,

        role:
          response.role,

        roles:
          response.roles,

        permissions:
          response.permissions
      }
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

        token:
          this.getToken() ?? '',

        username:
          parsedUser.username ?? '',

        fullName:
          parsedUser.fullName ?? '',

        role:
          parsedUser.role ?? '',

        roles:
          Array.isArray(
            parsedUser.roles
          )
            ? parsedUser.roles
            : [],

        permissions:
          Array.isArray(
            parsedUser.permissions
          )
            ? parsedUser.permissions
            : []

      };

    }

    catch {

      return null;

    }

  }


  // ===================================================
  // GET USERNAME
  // ===================================================

  getUsername(): string | null {

    return this
      .getUser()
      ?.username ?? null;

  }


  // ===================================================
  // GET FULL NAME
  // ===================================================

  getFullName(): string | null {

    return this
      .getUser()
      ?.fullName ?? null;

  }


  // ===================================================
  // GET PRIMARY ROLE
  // ===================================================

  getRole(): string | null {

    return this
      .getUser()
      ?.role ?? null;

  }


  // ===================================================
  // GET ALL ROLES
  // ===================================================

  getRoles(): string[] {

    return this
      .getUser()
      ?.roles ?? [];

  }


  // ===================================================
  // GET ALL PERMISSIONS
  // ===================================================

  getPermissions(): string[] {

    return this
      .getUser()
      ?.permissions ?? [];

  }


  // ===================================================
  // CHECK ROLE
  // ===================================================

  hasRole(
    role: string
  ): boolean {

    const normalizedRole =
      role
        .trim()
        .toUpperCase();


    return this
      .getRoles()
      .some(
        currentRole =>
          currentRole
            .trim()
            .toUpperCase() ===
          normalizedRole
      );

  }


  // ===================================================
  // CHECK PERMISSION
  // ===================================================

  hasPermission(
    permission: string
  ): boolean {

    const normalizedPermission =
      permission
        .trim()
        .toUpperCase();


    return this
      .getPermissions()
      .some(
        currentPermission =>
          currentPermission
            .trim()
            .toUpperCase() ===
          normalizedPermission
      );

  }


  // ===================================================
  // CHECK ANY PERMISSION
  // ===================================================

  hasAnyPermission(
    permissions: string[]
  ): boolean {

    return permissions.some(
      permission =>
        this.hasPermission(
          permission
        )
    );

  }


  // ===================================================
  // CHECK ALL PERMISSIONS
  // ===================================================

  hasAllPermissions(
    permissions: string[]
  ): boolean {

    return permissions.every(
      permission =>
        this.hasPermission(
          permission
        )
    );

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
  // ===================================================

  logout(): void {

    sessionStorage.removeItem(
      this.TOKEN_KEY
    );

    sessionStorage.removeItem(
      this.USER_KEY
    );

  }

}