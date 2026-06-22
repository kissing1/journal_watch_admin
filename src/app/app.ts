import { Component, signal, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from './Components/header/header';
import { Footer } from './Components/footer/footer';
import { Sidebar } from './Components/sidebar/sidebar';

const SIDEBAR_ROUTES = ['/admin', '/super-admin', '/profile', '/search', '/msu-unwanted',
  '/manage-users', '/permissions', '/reports', '/settings', '/backup-restore', '/system-log',
  '/bug-reports', '/admin/profile', '/super-admin/profile'];

const AUTH_ROUTES = ['/login', '/req-otp'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private tokenCheckTimer?: ReturnType<typeof setInterval>;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  protected readonly showSidebar = computed(() =>
    SIDEBAR_ROUTES.some(r => this.currentUrl().startsWith(r))
  );

  protected readonly showHeader = computed(() => true);

  protected readonly sidebarOpen = signal(true);

  protected toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  ngOnInit() {
    // ตรวจ token ทุก 30 วินาที — จับ idle user ที่ไม่ได้ยิง request
    this.tokenCheckTimer = setInterval(() => this.checkTokenIdle(), 30_000);
  }

  ngOnDestroy() {
    clearInterval(this.tokenCheckTimer);
  }

  private checkTokenIdle() {
    const url = this.router.url;
    if (AUTH_ROUTES.some(r => url.startsWith(r))) return; // อยู่หน้า login แล้ว ไม่ต้องตรวจ

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('[Auth-idle] 🔴 ไม่มี token → redirect /login');
      this.router.navigate(['/login']);
      return;
    }

    try {
      const p   = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const exp = typeof p.exp === 'number' ? p.exp * 1000 : 0;
      const rem = exp - Date.now();
      console.log(`[Auth-idle] ⏱ token คงเหลือ ${rem > 0 ? Math.round(rem / 1000) + ' วิ' : 'หมดแล้ว'}`);
      if (exp > 0 && rem < 0) {
        console.warn('[Auth-idle] 🔴 Token หมดอายุ (idle) → redirect /login');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }
    } catch {
      console.warn('[Auth-idle] 🔴 decode token ไม่ได้ → redirect /login');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }
}
