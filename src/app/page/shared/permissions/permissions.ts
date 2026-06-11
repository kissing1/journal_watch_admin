import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PermRow { group: string; label: string; admin: boolean; superAdmin: boolean; }

@Component({
  selector: 'app-permissions',
  imports: [CommonModule],
  templateUrl: './permissions.html',
  styleUrl: './permissions.scss',
})
export class Permissions {
  permRows: PermRow[] = [
    { group: 'วารสาร',     label: 'ค้นหาวารสาร',             admin: true,  superAdmin: true  },
    { group: 'วารสาร',     label: 'ดูวารสารต้องห้าม',         admin: true,  superAdmin: true  },
    { group: 'วารสาร',     label: 'เพิ่ม/แก้ไขวารสารต้องห้าม', admin: false, superAdmin: true  },
    { group: 'ผู้ใช้',     label: 'ดูรายชื่อผู้ใช้',           admin: false, superAdmin: true  },
    { group: 'ผู้ใช้',     label: 'เพิ่ม/แก้ไขผู้ใช้',         admin: false, superAdmin: true  },
    { group: 'ผู้ใช้',     label: 'ลบผู้ใช้',                  admin: false, superAdmin: true  },
    { group: 'ระบบ',       label: 'ตั้งค่าระบบ',               admin: false, superAdmin: true  },
    { group: 'ระบบ',       label: 'ดูบันทึกระบบ',              admin: false, superAdmin: true  },
    { group: 'ระบบ',       label: 'สำรอง/กู้คืนข้อมูล',        admin: false, superAdmin: true  },
    { group: 'รายงาน',     label: 'ดูรายงาน',                  admin: false, superAdmin: true  },
  ];

  get groups(): string[] {
    return [...new Set(this.permRows.map(r => r.group))];
  }

  rowsByGroup(group: string): PermRow[] {
    return this.permRows.filter(r => r.group === group);
  }
}
