import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  PlatformUser,
  PlatformUserService
} from '../../core/services/platform/platform-user.service';

@Component({
  selector: 'app-platform-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  users: PlatformUser[] = [];

  filteredUsers: PlatformUser[] = [];

  loading = false;

  errorMessage = '';

  searchTerm = '';

  selectedTenant = '';

  selectedRole = '';

  selectedStatus = '';

  deletingUserId: number | null = null;

  updatingUserId: number | null = null;

  constructor(
    private platformUserService: PlatformUserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load all platform users.
   */
  loadUsers(): void {

    this.loading = true;
    this.errorMessage = '';

    this.platformUserService
      .getAllUsers()
      .subscribe({

        next: (users) => {

          this.users = users;

          this.applyFilters();

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to load platform users:',
            error
          );

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to load users. Please try again.';

          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Search/filter users.
   */
  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    this.filteredUsers =
      this.users.filter(user => {

        const matchesSearch =
          !search ||
          user.username
            ?.toLowerCase()
            .includes(search) ||
          user.fullName
            ?.toLowerCase()
            .includes(search) ||
          user.tenantName
            ?.toLowerCase()
            .includes(search) ||
          user.tenantCode
            ?.toLowerCase()
            .includes(search);

        const matchesTenant =
          !this.selectedTenant ||
          user.tenantCode === this.selectedTenant;

        const matchesRole =
          !this.selectedRole ||
          user.role === this.selectedRole;

        const matchesStatus =
          !this.selectedStatus ||
          (
            this.selectedStatus === 'enabled'
              ? user.enabled
              : !user.enabled
          );

        return (
          matchesSearch &&
          matchesTenant &&
          matchesRole &&
          matchesStatus
        );
      });
  }

  /**
   * Get unique tenant codes.
   */
  get tenants(): string[] {

    return [
      ...new Set(
        this.users
          .map(user => user.tenantCode)
          .filter(Boolean)
      )
    ];
  }

  /**
   * Get unique roles.
   */
  get roles(): string[] {

    return [
      ...new Set(
        this.users
          .map(user => user.role)
          .filter(Boolean)
      )
    ];
  }

  /**
   * Clear all filters.
   */
  clearFilters(): void {

    this.searchTerm = '';

    this.selectedTenant = '';

    this.selectedRole = '';

    this.selectedStatus = '';

    this.applyFilters();
  }

  /**
   * Determine whether this is the protected
   * SUPER_ADMIN account.
   */
  isSuperAdmin(user: PlatformUser): boolean {

    if (
      user.role?.toUpperCase() ===
      'SUPER_ADMIN'
    ) {
      return true;
    }

    return user.roles?.some(
      role =>
        role?.toUpperCase() ===
        'SUPER_ADMIN'
    ) ?? false;
  }

  /**
   * Enable/disable a user.
   */
  toggleUserStatus(
    user: PlatformUser
  ): void {

    if (this.isSuperAdmin(user)) {
      return;
    }

    const newStatus =
      !user.enabled;

    this.updatingUserId =
      user.id;

    this.platformUserService
      .updateUserStatus(
        user.id,
        newStatus
      )
      .subscribe({

        next: (updatedUser) => {

          const index =
            this.users.findIndex(
              item =>
                item.id ===
                updatedUser.id
            );

          if (index !== -1) {
            this.users[index] =
              updatedUser;
          }

          this.applyFilters();

          this.updatingUserId = null;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to update user status:',
            error
          );

          alert(
            error?.error?.message ||
            'Failed to update user status.'
          );

          this.updatingUserId = null;

          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Delete a user.
   */
  deleteUser(
    user: PlatformUser
  ): void {

    if (this.isSuperAdmin(user)) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete user "${user.username}"?\n\n` +
        `This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    this.deletingUserId =
      user.id;

    this.platformUserService
      .deleteUser(user.id)
      .subscribe({

        next: () => {

          this.users =
            this.users.filter(
              item =>
                item.id !== user.id
            );

          this.applyFilters();

          this.deletingUserId = null;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to delete user:',
            error
          );

          alert(
            error?.error?.message ||
            'Failed to delete user.'
          );

          this.deletingUserId = null;

          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Format the creation date.
   */
  formatDate(
    date: string
  ): string {

    if (!date) {
      return '—';
    }

    return new Date(date)
      .toLocaleDateString(
        'en-UG',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }
      );
  }

  /**
   * Refresh the users list.
   */
  refresh(): void {
    this.loadUsers();
  }
}