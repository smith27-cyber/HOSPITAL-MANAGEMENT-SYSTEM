import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-platform-header',
  standalone: true,
  templateUrl: './platform-header.html',
  styleUrl: './platform-header.css'
})
export class PlatformHeader {

  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    public authService: AuthService
  ) {}

  toggle(): void {
    this.toggleSidebar.emit();
  }
}