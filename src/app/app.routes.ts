import { Routes } from '@angular/router';
import { Login } from './Login/login/login';
import { ReqOTP } from './page/shared/req-otp/req-otp';
import { Dashboard as AdminDashboard } from './page/admin/dashboard/dashboard';
import { Dashboard as SuperAdminDashboard } from './page/super-admin/dashboard/dashboard';
import { Search } from './page/shared/search/search';
import { MsuUnwanted } from './page/shared/msu-unwanted/msu-unwanted';
import { ManageUsers } from './page/shared/manage-users/manage-users';
import { Reports } from './page/shared/reports/reports';
import { BackupRestore } from './page/shared/backup-restore/backup-restore';
import { SystemLog } from './page/shared/system-log/system-log';
import { BugReports } from './page/shared/bug-reports/bug-reports';
import { Profile as AdminProfile } from './page/admin/profile/profile';
import { Profile as SuperAdminProfile } from './page/super-admin/profile/profile';
import { AboutJournalWatch } from './page/shared/about-journal-watch/about-journal-watch';
import { Manual } from './page/shared/manual/manual';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth
  { path: 'login',   component: Login },
  { path: 'req-otp', component: ReqOTP },

  // เมนูหลัก (Admin + SuperAdmin)
  { path: 'admin/dashboard',       component: AdminDashboard },
  { path: 'super-admin/dashboard', component: SuperAdminDashboard },
  { path: 'search',                component: Search },
  { path: 'msu-unwanted',          component: MsuUnwanted },

  // เมนูจัดการ
  { path: 'manage-users',          component: ManageUsers },
  { path: 'reports',               component: Reports },

  // เมนูระบบ
  { path: 'backup-restore',        component: BackupRestore },
  { path: 'system-log',            component: SystemLog },
  { path: 'bug-reports',           component: BugReports },
  { path: 'admin/profile',       component: AdminProfile },
  { path: 'super-admin/profile', component: SuperAdminProfile },

  // Footer pages
  { path: 'about',  component: AboutJournalWatch },
  { path: 'manual', component: Manual },
];
