import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PlatformSidebar } from '../platform-sidebar/platform-sidebar';
import { PlatformHeader } from '../platform-header/platform-header';

@Component({
  selector: 'app-platform-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    PlatformSidebar,
    PlatformHeader
  ],
  templateUrl: './platform-layout.html',
  styleUrl: './platform-layout.css'
})
export class PlatformLayout {

  sidebarOpen = false;
  sidebarCollapsed = false;

  toggleSidebar(): void {
    if (window.innerWidth <= 700) {
      this.sidebarOpen = !this.sidebarOpen;
      return;
    }

    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}