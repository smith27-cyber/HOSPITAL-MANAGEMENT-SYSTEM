// =====================================================
// HMS MAIN LAYOUT
// File:
// src/app/layout/main-layout/main-layout.ts
// =====================================================

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Sidebar,
    Header
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {

  // Mobile sidebar state
  sidebarOpen = false;

  // Desktop sidebar state
  sidebarCollapsed = false;


  toggleSidebar(): void {

    // Mobile
    if (window.innerWidth <= 700) {

      this.sidebarOpen =
        !this.sidebarOpen;

      return;
    }

    // Desktop / tablet
    this.sidebarCollapsed =
      !this.sidebarCollapsed;
  }


  closeSidebar(): void {

    this.sidebarOpen = false;
  }
}