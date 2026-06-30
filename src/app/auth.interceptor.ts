import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';

let isRefreshing = false;
let queue$       = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // ไม่แตะ request ของ /auth/ (login, verify-otp, refresh)
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // ไม่มี token เลย → logout ทันที
  const token = auth.token;
  if (!token) {
    auth.logout();
    return throwError(() => new Error('no_token'));
  }

  // แนบ access token แล้วส่ง request
  const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(authReq).pipe(
    catchError(err => {
      // ถ้าไม่ใช่ 401 → ส่ง error ต่อไปตามปกติ
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }

      // ── 401: refresh กำลังทำอยู่ → รอใน queue ──
      if (isRefreshing) {
        return queue$.pipe(
          filter(t => t !== null),
          take(1),
          switchMap(fresh =>
            next(req.clone({ setHeaders: { Authorization: `Bearer ${fresh}` } }))
          ),
        );
      }

      // ── 401: เริ่ม refresh ──
      isRefreshing = true;
      queue$       = new BehaviorSubject<string | null>(null);

      return auth.refreshAccessToken().pipe(
        switchMap(res => {
          isRefreshing = false;
          const fresh  = res.data.accessToken;
          queue$.next(fresh);
          // retry request เดิมด้วย token ใหม่
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${fresh}` } }));
        }),
        catchError(refreshErr => {
          isRefreshing = false;
          queue$.error(refreshErr);
          queue$ = new BehaviorSubject<string | null>(null);
          auth.logout();
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
