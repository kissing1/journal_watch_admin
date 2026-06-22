import { Injectable } from '@angular/core';

interface StoredUser {
  userId?:    number;
  username?:  string;
  role?:      string;
  firstName?: string;
  lastName?:  string;
  msuMail?:   string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  get token(): string {
    return localStorage.getItem('auth_token') ?? '';
  }

  get user(): StoredUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try { return JSON.parse(raw) as StoredUser; }
    catch { return null; }
  }
}
