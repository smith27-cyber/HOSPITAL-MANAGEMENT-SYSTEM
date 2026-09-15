import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-platform-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './platform-sidebar.html',
  styleUrl: './platform-sidebar.css'
})
export class PlatformSidebar {

  @Input() collapsed = false;
  @Input() mobileOpen = false;

  @Output() closeSidebar =
    new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  close(): void {
    this.closeSidebar.emit();
  }

  logout(): void {
    this.authService.logout();

    this.router.navigate(
      ['/login'],
      {
        replaceUrl: true
      }
    );
  }
}