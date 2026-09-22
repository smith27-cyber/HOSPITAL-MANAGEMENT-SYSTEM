

import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  DashboardResponse
} from '../../shared/models/dashboard.model';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {


  // =====================================================
  // API URL
  // =====================================================

  private readonly API_URL =
    '/api/dashboard';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET DASHBOARD DATA
  // =====================================================

  getDashboard():
    Observable<DashboardResponse> {

    return this.http.get<DashboardResponse>(
      this.API_URL
    );

  }

}

