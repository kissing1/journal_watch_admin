import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

interface NavChild {
  label: string;
  route: string;
}

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  roles?: string[];           // ถ้าไม่ระบุ = แสดงทุก role
  children?: NavChild[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  @Input() isOpen = true;

  private user = JSON.parse(localStorage.getItem('user') ?? '{}');

  userRole     = this.user?.role     ?? '';
  userName     = (`${this.user?.firstName ?? ''} ${this.user?.lastName ?? ''}`).trim() || (this.user?.username ?? '');
  userEmail    = this.user?.username ?? '';
  userInitials = this.userName.charAt(0).toUpperCase() || 'A';
  userPicture  = '';

  private expandedItems = signal<Set<string>>(new Set());

  readonly allNavGroups: NavGroup[] = [
    {
      group: 'หลัก',
      items: [
        { label: 'แดชบอร์ด',      icon: '📊', route: this.getDashboardRoute() },
        { label: 'ค้นหาวารสาร',   icon: '🔍', route: '/search' },
        { label: 'วารสารต้องห้าม', icon: '🚫', route: '/msu-unwanted' },
      ],
    },
    {
      group: 'จัดการ',
      items: [
        { label: 'จัดการผู้ใช้',   icon: '👥', route: '/manage-users' },
        { label: 'สิทธิ์การเข้าถึง', icon: '🔐', route: '/permissions' },
        { label: 'รายงาน',          icon: '📈', route: '/reports', roles: ['SuperAdmin'] },
      ],
    },
    {
      group: 'ระบบ',
      items: [
        { label: 'ตั้งค่าระบบ',    icon: '⚙️', route: '/settings' },
        { label: 'Backup & Restore', icon: '💾', route: '/backup-restore' },
        { label: 'บันทึกระบบ',     icon: '📋', route: '/system-log',   roles: ['SuperAdmin'] },
      ],
    },
  ];

  get navGroups(): NavGroup[] {
    return this.allNavGroups
      .map(g => ({
        ...g,
        items: g.items.filter(item =>
          !item.roles || item.roles.includes(this.userRole)
        ),
      }))
      .filter(g => g.items.length > 0);
  }

  constructor(private router: Router) {}

  ngOnInit() {}

  private getDashboardRoute(): string {
    return this.userRole === 'SuperAdmin'
      ? '/super-admin/dashboard'
      : '/admin/dashboard';
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  hasActiveChild(item: NavItem): boolean {
    return item.children?.some(c => this.isActive(c.route)) ?? false;
  }

  toggleExpand(label: string) {
    this.expandedItems.update(set => {
      const next = new Set(set);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  isExpanded(label: string): boolean {
    return this.expandedItems().has(label);
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
