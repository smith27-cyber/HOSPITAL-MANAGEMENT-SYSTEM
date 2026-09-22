// =====================================================
// USER MANAGEMENT COMPONENT
// File:
// src/app/features/settings/user-management/user-management.ts
// =====================================================

import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  UserService
} from '../../../core/services/user.service';

import {
  User,
  UserCreateRequest,
  UserUpdateRequest
} from '../../../shared/models/user.model';


@Component({
  selector: 'app-user-management',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './user-management.html',

  styleUrl: './user-management.css'
})
export class UserManagementComponent
  implements OnInit {


  // ===================================================
  // SERVICES
  // ===================================================

  private readonly authService =
    inject(AuthService);

  private readonly userService =
    inject(UserService);

  private readonly router =
    inject(Router);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);


  // ===================================================
  // USERS
  // ===================================================

  users: User[] = [];


  // ===================================================
  // ROLES
  // ===================================================

  readonly roles: string[] = [

    'SUPER_ADMIN',

    'ADMIN',

    'DOCTOR',

    'NURSE',

    'RECEPTIONIST',

    'PHARMACIST',

    'LABORATORY_TECHNICIAN',

    'ACCOUNTANT',

    'RECORDS_OFFICER',

    'HOSPITAL_MANAGER'

  ];


  // ===================================================
  // SEARCH
  // ===================================================

  searchTerm = '';


  // ===================================================
  // LOADING
  // ===================================================

  loading = true;


  // ===================================================
  // SAVING
  // ===================================================

  saving = false;


  // ===================================================
  // SHOW FORM
  // ===================================================

  showForm = false;


  // ===================================================
  // EDIT MODE
  // ===================================================

  editing = false;


  // ===================================================
  // SELECTED USER
  // ===================================================

  selectedUser: User | null = null;


  // ===================================================
  // FORM
  // ===================================================

  form: UserCreateRequest = {

    username: '',

    password: '',

    fullName: '',

    role: 'RECEPTIONIST',

    enabled: true

  };


  // ===================================================
  // UPDATE FORM
  // ===================================================

  updateForm: UserUpdateRequest = {

    fullName: '',

    role: 'RECEPTIONIST',

    enabled: true

  };


  // ===================================================
  // INITIALIZE
  // ===================================================

  ngOnInit(): void {

    /*
     * Start loading immediately.
     *
     * This prevents the page from briefly displaying
     * the empty-state message before the HTTP request
     * has completed.
     */

    this.loading = true;

    this.loadUsers();

  }


  // ===================================================
  // PERMISSION CHECK
  // ===================================================

  canManageUsers(): boolean {

    return this.authService.hasPermission(
      'SETTINGS_USER_MANAGE'
    );

  }


  // ===================================================
  // LOAD USERS
  // ===================================================

  loadUsers(): void {

    // -----------------------------------------------
    // SECURITY CHECK
    // -----------------------------------------------

    if (!this.canManageUsers()) {

      this.loading = false;

      this.changeDetectorRef.markForCheck();

      return;

    }


    // -----------------------------------------------
    // START LOADING
    // -----------------------------------------------

    this.loading = true;


    // -----------------------------------------------
    // REQUEST USERS
    // -----------------------------------------------

    this.userService
      .getUsers()
      .subscribe({

        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        next: (
          users: User[]
        ) => {

          this.users = Array.isArray(users)
            ? users
            : [];

          this.loading = false;

          /*
           * Explicitly notify Angular that the view
           * should be refreshed after the asynchronous
           * HTTP response.
           */

          this.changeDetectorRef.markForCheck();

        },


        // ---------------------------------------------
        // ERROR
        // ---------------------------------------------

        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to load users:',
            error
          );

          this.users = [];

          this.loading = false;

          this.changeDetectorRef.markForCheck();

          window.alert(
            'Unable to load users. Please try again.'
          );

        }

      });

  }


  // ===================================================
  // FILTER USERS
  // ===================================================

  get filteredUsers(): User[] {

    const term =
      this.searchTerm
        .trim()
        .toLowerCase();


    if (!term) {

      return this.users;

    }


    return this.users.filter(
      user => {

        const username =
          user.username ?? '';

        const fullName =
          user.fullName ?? '';

        const role =
          user.role ?? '';


        return (

          username
            .toLowerCase()
            .includes(term)

          ||

          fullName
            .toLowerCase()
            .includes(term)

          ||

          role
            .toLowerCase()
            .includes(term)

        );

      }

    );

  }


  // ===================================================
  // OPEN CREATE FORM
  // ===================================================

  openCreateForm(): void {

    this.editing = false;

    this.selectedUser = null;

    this.form = {

      username: '',

      password: '',

      fullName: '',

      role: 'RECEPTIONIST',

      enabled: true

    };

    this.showForm = true;

    this.changeDetectorRef.markForCheck();

  }


  // ===================================================
  // OPEN EDIT FORM
  // ===================================================

  openEditForm(
    user: User
  ): void {

    this.editing = true;

    this.selectedUser = user;

    this.updateForm = {

      fullName:
        user.fullName ?? '',

      role:
        user.role ?? 'RECEPTIONIST',

      enabled:
        user.enabled

    };

    this.showForm = true;

    this.changeDetectorRef.markForCheck();

  }


  // ===================================================
  // CLOSE FORM
  // ===================================================

  closeForm(): void {

    if (this.saving) {

      return;

    }


    this.showForm = false;

    this.editing = false;

    this.selectedUser = null;

    this.changeDetectorRef.markForCheck();

  }


  // ===================================================
  // CREATE USER
  // ===================================================

  createUser(): void {

    if (this.saving) {

      return;

    }


    const username =
      this.form.username
        .trim()
        .toLowerCase();


    const fullName =
      this.form.fullName
        .trim();


    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!username) {

      window.alert(
        'Please enter a username.'
      );

      return;

    }


    if (!fullName) {

      window.alert(
        'Please enter the full name.'
      );

      return;

    }


    if (!this.form.password) {

      window.alert(
        'Please enter a password.'
      );

      return;

    }


    if (this.form.password.length < 6) {

      window.alert(
        'Password must contain at least 6 characters.'
      );

      return;

    }


    if (!this.form.role) {

      window.alert(
        'Please select a role.'
      );

      return;

    }


    // -----------------------------------------------
    // REQUEST
    // -----------------------------------------------

    const request: UserCreateRequest = {

      username,

      password:
        this.form.password,

      fullName,

      role:
        this.form.role,

      enabled:
        this.form.enabled

    };


    this.saving = true;

    this.changeDetectorRef.markForCheck();


    // -----------------------------------------------
    // CREATE
    // -----------------------------------------------

    this.userService
      .createUser(request)
      .subscribe({

        next: (
          user: User
        ) => {

          this.users = [
            ...this.users,
            user
          ];

          this.saving = false;

          this.closeForm();

          this.changeDetectorRef.markForCheck();

          window.alert(
            `User "${user.username}" was created successfully.`
          );

        },


        error: (
          error: any
        ) => {

          console.error(
            'Failed to create user:',
            error
          );

          this.saving = false;

          this.changeDetectorRef.markForCheck();


          if (error?.status === 400) {

            window.alert(
              error?.error?.message ||
              'The user information is invalid.'
            );

          }

          else if (error?.status === 403) {

            window.alert(
              'You do not have permission to create users.'
            );

          }

          else if (error?.status === 409) {

            window.alert(
              'That username is already in use.'
            );

          }

          else {

            window.alert(
              'Failed to create user. Please try again.'
            );

          }

        }

      });

  }


  // ===================================================
  // UPDATE USER
  // ===================================================

  updateUser(): void {

    if (
      this.saving ||
      !this.selectedUser
    ) {

      return;

    }


    const fullName =
      this.updateForm.fullName
        .trim();


    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!fullName) {

      window.alert(
        'Please enter the full name.'
      );

      return;

    }


    if (!this.updateForm.role) {

      window.alert(
        'Please select a role.'
      );

      return;

    }


    // -----------------------------------------------
    // REQUEST
    // -----------------------------------------------

    const request: UserUpdateRequest = {

      fullName,

      role:
        this.updateForm.role,

      enabled:
        this.updateForm.enabled

    };


    this.saving = true;

    this.changeDetectorRef.markForCheck();


    // -----------------------------------------------
    // UPDATE
    // -----------------------------------------------

    this.userService
      .updateUser(
        this.selectedUser.id,
        request
      )
      .subscribe({

        next: (
          updatedUser: User
        ) => {

          this.users =
            this.users.map(
              user =>
                user.id === updatedUser.id
                  ? updatedUser
                  : user
            );


          this.saving = false;

          this.closeForm();

          this.changeDetectorRef.markForCheck();

          window.alert(
            'User updated successfully.'
          );

        },


        error: (
          error: any
        ) => {

          console.error(
            'Failed to update user:',
            error
          );

          this.saving = false;

          this.changeDetectorRef.markForCheck();


          if (error?.status === 403) {

            window.alert(
              'You do not have permission to update users.'
            );

          }

          else {

            window.alert(
              'Failed to update user. Please try again.'
            );

          }

        }

      });

  }


  // ===================================================
  // TOGGLE USER STATUS
  // ===================================================

  toggleUserStatus(
    user: User
  ): void {

    const action =
      user.enabled
        ? 'disable'
        : 'enable';


    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} "${user.username}"?`
      );


    if (!confirmed) {

      return;

    }


    this.userService
      .updateUserStatus(
        user.id,
        !user.enabled
      )
      .subscribe({

        next: (
          updatedUser: User
        ) => {

          this.users =
            this.users.map(
              currentUser =>
                currentUser.id === updatedUser.id
                  ? updatedUser
                  : currentUser
            );

          this.changeDetectorRef.markForCheck();


          window.alert(
            `User "${updatedUser.username}" is now ${
              updatedUser.enabled
                ? 'enabled'
                : 'disabled'
            }.`
          );

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to update user status:',
            error
          );

          this.changeDetectorRef.markForCheck();


          window.alert(
            'Failed to update user status.'
          );

        }

      });

  }


  // ===================================================
  // DELETE USER
  // ===================================================

  deleteUser(
    user: User
  ): void {

    const confirmed =
      window.confirm(
        `Delete user "${user.username}" permanently?`
      );


    if (!confirmed) {

      return;

    }


    this.userService
      .deleteUser(user.id)
      .subscribe({

        next: () => {

          this.users =
            this.users.filter(
              currentUser =>
                currentUser.id !== user.id
            );

          this.changeDetectorRef.markForCheck();


          window.alert(
            'User deleted successfully.'
          );

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Failed to delete user:',
            error
          );


          window.alert(
            'User could not be deleted. The account may be referenced by other records.'
          );

        }

      });

  }


  // ===================================================
  // BACK TO SETTINGS
  // ===================================================

  goBack(): void {

    this.router.navigate([
      '/settings'
    ]);

  }

}