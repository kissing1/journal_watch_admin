import { Component, signal, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from './Components/header/header';
import { Footer } from './Components/footer/footer';
import { Sidebar } from './Components/sidebar/sidebar';
import { AuthService } from './auth.service';

const SIDEBAR_ROUTES = ['/admin', '/super-admin', '/profile', '/search', '/msu-unwanted',
  '/manage-users', '/permissions', '/reports', '/settings', '/backup-restore', '/system-log',
  '/bug-reports', '/admin/profile', '/super-admin/profile', '/about', '/manual'];

// หน้าที่ไม่ต้อง login — ไม่ redirect ไป /login แม้ไม่มี token
const AUTH_ROUTES = ['/login', '/req-otp', '/about', '/manual'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly auth   = inject(AuthService);
  private tokenCheckTimer?: ReturnType<typeof setInterval>;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  protected readonly showSidebar = computed(() => {
    const url = this.currentUrl(); // อ่านก่อนเสมอเพื่อ register signal dependency
    return this.auth.isLoggedIn && SIDEBAR_ROUTES.some(r => url.startsWith(r));
  });

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
    if (AUTH_ROUTES.some(r => url.startsWith(r))) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.auth.logout();
      return;
    }

    try {
      const p   = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const exp = typeof p.exp === 'number' ? p.exp * 1000 : 0;
      if (exp > 0 && exp - Date.now() < 0) {
        this.auth.logout();
      }
    } catch {
      this.auth.logout();
    }
  }
}
