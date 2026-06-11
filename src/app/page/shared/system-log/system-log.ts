import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LogEntry {
  time: string; user: string; action: string;
  ip: string; type: 'login' | 'data' | 'system' | 'error';
}

@Component({
  selector: 'app-system-log',
  imports: [CommonModule],
  templateUrl: './system-log.html',
  styleUrl: './system-log.scss',
})
export class SystemLog {
  activeFilter = signal<string>('all');

  logs: LogEntry[] = [
    { time: '10 มิ.ย. 09:48', user: 'somchai.j',  action: 'เข้าสู่ระบบสำเร็จ',              ip: '192.168.1.10', type: 'login'  },
    { time: '10 มิ.ย. 09:50', user: 'somchai.j',  action: 'เพิ่มผู้ใช้ wichai.m',           ip: '192.168.1.10', type: 'data'   },
    { time: '10 มิ.ย. 10:05', user: 'somying.r',  action: 'เข้าสู่ระบบสำเร็จ',              ip: '10.0.0.25',    type: 'login'  },
    { time: '10 มิ.ย. 10:12', user: 'somying.r',  action: 'แก้ไขวารสารต้องห้าม ID #42',     ip: '10.0.0.25',    type: 'data'   },
    { time: '10 มิ.ย. 10:30', user: 'system',     action: 'Backup อัตโนมัติสำเร็จ',          ip: 'localhost',    type: 'system' },
    { time: '10 มิ.ย. 11:00', user: 'napa.s',     action: 'เข้าสู่ระบบล้มเหลว (OTP หมดอายุ)', ip: '172.16.0.8',  type: 'error'  },
    { time: '10 มิ.ย. 11:22', user: 'wichai.m',   action: 'เข้าสู่ระบบสำเร็จ',              ip: '192.168.2.4',  type: 'login'  },
    { time: '10 มิ.ย. 13:15', user: 'somchai.j',  action: 'เปลี่ยนการตั้งค่าระบบ',          ip: '192.168.1.10', type: 'system' },
  ];

  filters = [
    { key: 'all',    label: 'ทั้งหมด' },
    { key: 'login',  label: 'เข้าสู่ระบบ' },
    { key: 'data',   label: 'แก้ไขข้อมูล' },
    { key: 'system', label: 'ระบบ' },
    { key: 'error',  label: 'ข้อผิดพลาด' },
  ];

  get filtered(): LogEntry[] {
    const f = this.activeFilter();
    return f === 'all' ? this.logs : this.logs.filter(l => l.type === f);
  }

  get counts() {
    return {
      all:    this.logs.length,
      login:  this.logs.filter(l => l.type === 'login').length,
      data:   this.logs.filter(l => l.type === 'data').length,
      system: this.logs.filter(l => l.type === 'system').length,
      error:  this.logs.filter(l => l.type === 'error').length,
    };
  }
}
