import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpClient,
  HttpBackend,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { Constants } from './comfig/constants';

interface RefreshRes {
  success: boolean;
  data: { accessToken: string };
}

// refresh เฉพาะช่วง 2 นาทีสุดท้ายก่อนหมด (ไม่ใช่ตลอดช่วง TTL)
const REFRESH_BEFORE_MS = 2 * 60 * 1000;

let isRefreshing    = false;
let lastRefreshedAt = 0;
let queue$          = new BehaviorSubject<string | null>(null);

function getExpMs(token: string): number {
  try {
    const p = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return typeof p.exp === 'number' ? p.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

function fmtMs(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 0)  return `หมดแล้ว ${Math.abs(s)} วิ`;
  if (s < 60) return `${s} วิ`;
  return `${Math.floor(s / 60)} นาที ${s % 60} วิ`;
}

function clearSession(router: Router): void {
  console.warn('[Auth] 🔴 clearSession → redirect /login');
  isRefreshing = false;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  router.navigate(['/login']);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router    = inject(Router);
  const backend   = inject(HttpBackend);
  const constants = inject(Constants);

  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.warn('[Auth] 🔴 ไม่มี token → redirect /login');
    clearSession(router);
    return throwError(() => new Error('no_token'));
  }

  const exp       = getExpMs(token);
  const now       = Date.now();
  const remaining = exp - now;

  console.groupCollapsed(`[Auth] 📡 ${req.method} ${req.url.replace(constants.API_ENDPOINT, '')}`);
  console.log('token exp :', exp > 0 ? new Date(exp).toLocaleTimeString('th-TH') : 'parse ไม่ได้');
  console.log('คงเหลือ   :', exp > 0 ? fmtMs(remaining) : '—');
  console.groupEnd();

  // Token หมดอายุแล้ว
  if (exp > 0 && remaining < 0) {
    console.warn(`[Auth] 🔴 Token หมดแล้ว (${fmtMs(remaining)}) → redirect /login`);
    clearSession(router);
    return throwError(() => new Error('token_expired'));
  }

  // Token จะหมดใน 2 นาที + cooldown 60 วิ
  const shouldRefresh =
    exp > 0 &&
    remaining < REFRESH_BEFORE_MS &&
    now - lastRefreshedAt > 60_000;

  if (shouldRefresh) {
    console.info(`[Auth] 🟡 Token เหลือ ${fmtMs(remaining)} → ต้อง refresh`);

    if (isRefreshing) {
      console.info('[Auth] ⏳ Refresh กำลังทำอยู่ → queue request นี้ไว้ก่อน');
      return queue$.pipe(
        filter(t => t !== null),
        take(1),
        switchMap(t =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }))
        ),
      );
    }

    isRefreshing = true;
    queue$       = new BehaviorSubject<string | null>(null);

    const refreshClient = new HttpClient(backend);
    console.info('[Auth] 🔄 เรียก /auth/refresh ...');

    return refreshClient
      .post<RefreshRes>(
        `${constants.API_ENDPOINT}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .pipe(
        switchMap(res => {
          isRefreshing    = false;
          lastRefreshedAt = Date.now();
          const fresh     = res.data.accessToken;
          const newExp    = getExpMs(fresh);
          localStorage.setItem('auth_token', fresh);
          queue$.next(fresh);
          console.info(`[Auth] ✅ Refresh สำเร็จ — token ใหม่หมด ${new Date(newExp).toLocaleTimeString('th-TH')}`);
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${fresh}` } }));
        }),
        catchError(err => {
          console.warn('[Auth] 🔴 Refresh ล้มเหลว →', err?.status ?? err?.message);
          queue$.error(err);
          queue$ = new BehaviorSubject<string | null>(null);
          clearSession(router);
          return throwError(() => err);
        }),
      );
  }

  // Token ปกติ
  return next(req).pipe(
    catchError(err => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        console.warn('[Auth] 🔴 API ตอบ 401 → redirect /login');
        clearSession(router);
      }
      return throwError(() => err);
    }),
  );
};
