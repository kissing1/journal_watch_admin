import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number; firstName: string; lastName: string;
  username: string; role: 'Admin' | 'SuperAdmin'; active: boolean; createdAt: string;
}

@Component({
  selector: 'app-manage-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.scss',
})
export class ManageUsers {
  searchText = signal('');

  users: User[] = [
    { id: 1, firstName: 'สมชาย',  lastName: 'ใจดี',    username: 'somchai.j',  role: 'SuperAdmin', active: true,  createdAt: '2024-01-15' },
    { id: 2, firstName: 'สมหญิง', lastName: 'รักเรียน', username: 'somying.r', role: 'Admin',      active: true,  createdAt: '2024-02-20' },
    { id: 3, firstName: 'วิชัย',  lastName: 'มั่นคง',   username: 'wichai.m',  role: 'Admin',      active: true,  createdAt: '2024-03-10' },
    { id: 4, firstName: 'นภา',    lastName: 'สว่างใจ',  username: 'napa.s',    role: 'Admin',      active: false, createdAt: '2024-04-05' },
    { id: 5, firstName: 'ธนา',    lastName: 'เจริญรัตน์', username: 'thana.c', role: 'Admin',      active: true,  createdAt: '2024-05-18' },
  ];

  get filtered(): User[] {
    const q = this.searchText().toLowerCase();
    if (!q) return this.users;
    return this.users.filter(u =>
      u.firstName.includes(q) || u.lastName.includes(q) || u.username.includes(q)
    );
  }

  initials(u: User) { return (u.firstName.charAt(0) + u.lastName.charAt(0)).toUpperCase(); }
}
