// =====================================================
// USER MODEL
// File:
// src/app/shared/models/user.model.ts
// =====================================================

export interface User {

  id: number;

  username: string;

  fullName: string;

  role: string;

  roles: string[];

  enabled: boolean;

  createdAt: string;

}


// =====================================================
// CREATE USER REQUEST
// =====================================================

export interface UserCreateRequest {

  username: string;

  password: string;

  fullName: string;

  role: string;

  enabled: boolean;

}


// =====================================================
// UPDATE USER REQUEST
// =====================================================

export interface UserUpdateRequest {

  fullName: string;

  role: string;

  enabled: boolean;

}


// =====================================================
// CHANGE PASSWORD REQUEST
// =====================================================

export interface ChangePasswordRequest {

  newPassword: string;

}