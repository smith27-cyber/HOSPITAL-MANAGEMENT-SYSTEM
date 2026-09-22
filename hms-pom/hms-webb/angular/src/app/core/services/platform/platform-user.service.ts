import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlatformUser {
  id: number;
  username: string;
  fullName: string;

  // Legacy single role
  role: string;

  // RBAC roles
  roles: string[];

  enabled: boolean;
  createdAt: string;

  tenantId: number | null;
  tenantCode: string;
  tenantName: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformUserService {

  private readonly apiUrl =
    'http://localhost:8081/api/platform/users';

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Get every user across all tenants.
   */
  getAllUsers(): Observable<PlatformUser[]> {
    return this.http.get<PlatformUser[]>(
      this.apiUrl
    );
  }

  /**
   * Get one platform user.
   */
  getUserById(
    id: number
  ): Observable<PlatformUser> {

    return this.http.get<PlatformUser>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Enable or disable a user.
   */
  updateUserStatus(
    id: number,
    enabled: boolean
  ): Observable<PlatformUser> {

    const params = new HttpParams()
      .set('enabled', enabled);

    return this.http.patch<PlatformUser>(
      `${this.apiUrl}/${id}/status`,
      null,
      { params }
    );
  }

  /**
   * Delete a platform user.
   */
  deleteUser(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}