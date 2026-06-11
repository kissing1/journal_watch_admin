import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private raw = JSON.parse(localStorage.getItem('user') ?? '{}');
  userName = (`${this.raw?.firstName ?? ''} ${this.raw?.lastName ?? ''}`).trim() || (this.raw?.username ?? 'Admin');

  currentDate = signal(new Date().toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }));

  stats = [
    { label: 'วารสารทั้งหมด',    value: '—', icon: '📚', color: 'navy' },
    { label: 'ค้นหาวันนี้',       value: '—', icon: '🔍', color: 'gold' },
    { label: 'วารสารต้องห้าม',    value: '—', icon: '🚫', color: 'red'  },
    { label: 'รายการที่รอตรวจ',  value: '—', icon: '⏳', color: 'gray' },
  ];

  ngOnInit() {}
}
