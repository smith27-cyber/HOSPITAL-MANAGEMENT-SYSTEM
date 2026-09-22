// =====================================================
// USER SERVICE
// File:
// src/app/core/services/user.service.ts
// =====================================================

import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  ChangePasswordRequest
} from '../../shared/models/user.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {


  // ===================================================
  // API
  // ===================================================

  private readonly API_URL =
    '/api/users';


  // ===================================================
  // HTTP CLIENT
  // ===================================================

  private readonly http =
    inject(HttpClient);


  // ===================================================
  // GET ALL USERS
  // ===================================================

  getUsers(): Observable<User[]> {

    return this.http.get<User[]>(
      this.API_URL
    );

  }


  // ===================================================
  // GET USER BY ID
  // ===================================================

  getUser(
    id: number
  ): Observable<User> {

    return this.http.get<User>(
      `${this.API_URL}/${id}`
    );

  }


  // ===================================================
  // CREATE USER
  // ===================================================

  createUser(
    request: UserCreateRequest
  ): Observable<User> {

    return this.http.post<User>(
      this.API_URL,
      request
    );

  }


  // ===================================================
  // UPDATE USER
  // ===================================================

  updateUser(
    id: number,
    request: UserUpdateRequest
  ): Observable<User> {

    return this.http.put<User>(
      `${this.API_URL}/${id}`,
      request
    );

  }


  // ===================================================
  // ENABLE / DISABLE USER
  // ===================================================

  updateUserStatus(
    id: number,
    enabled: boolean
  ): Observable<User> {

    return this.http.patch<User>(
      `${this.API_URL}/${id}/status`,
      null,
      {
        params: {
          enabled: enabled.toString()
        }
      }
    );

  }


  // ===================================================
  // CHANGE PASSWORD
  // ===================================================

  changePassword(
    id: number,
    request: ChangePasswordRequest
  ): Observable<void> {

    return this.http.patch<void>(
      `${this.API_URL}/${id}/password`,
      request
    );

  }


  // ===================================================
  // DELETE USER
  // ===================================================

  deleteUser(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.API_URL}/${id}`
    );

  }

}