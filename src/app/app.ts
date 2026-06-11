import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Header } from './Components/header/header';
import { Footer } from './Components/footer/footer';
import { Sidebar } from './Components/sidebar/sidebar';

const SIDEBAR_ROUTES = ['/admin', '/super-admin', '/profile', '/search', '/msu-unwanted',
  '/manage-users', '/permissions', '/reports', '/settings', '/backup-restore', '/system-log'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

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

  protected readonly showHeader = computed(() =>
    !this.currentUrl().startsWith('/login') && !this.currentUrl().startsWith('/req-otp')
  );

  protected readonly sidebarOpen = signal(true);

  protected toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
}
