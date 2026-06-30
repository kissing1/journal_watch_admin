import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Constants } from './comfig/constants';

interface StoredUser {
  userId?:    number;
  username?:  string;
  role?:      string;
  firstName?: string;
  lastName?:  string;
  msuMail?:   string;
}

interface RefreshRes {
  success: boolean;
  data: { accessToken: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly backend   = inject(HttpBackend);
  private readonly constants = inject(Constants);
  private readonly router    = inject(Router);

  get token(): string {
    return localStorage.getItem('auth_token') ?? '';
  }

  get refreshToken(): string {
    return localStorage.getItem('auth_refresh_token') ?? '';
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get user(): StoredUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try { return JSON.parse(raw) as StoredUser; }
    catch { return null; }
  }

  refreshAccessToken(): Observable<RefreshRes> {
    const http = new HttpClient(this.backend);
    return http.post<RefreshRes>(
      `${this.constants.API_ENDPOINT}/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${this.refreshToken}` } },
    ).pipe(
      tap(res => localStorage.setItem('auth_token', res.data.accessToken)),
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
