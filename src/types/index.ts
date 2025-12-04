export interface User {
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'hr' | 'employee';
  department: string;
  designation: string;
  contact_number?: string;
  personal_email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  account_number?: string;
  ifsc_code?: string;
  pan_number?: string;
  uan_number?: string;
  baseSalary?: number;
  pfApplicable?: boolean;
  totalLeaves?: number;
  leavesRemaining?: number;
  casualLeavesUsed?: number;
  casualLeavesTotal?: number;
  sickLeavesUsed?: number;
  sickLeavesTotal?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee extends User {
  // Same as User for now
}

export interface LeaveRequest {
  requestId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  yearMonth: string;
  days: number;
  leaveType: 'casual' | 'sick' | 'earned';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
}

export interface AttendanceRecord {
  checkinId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkinTime: string;
  checkoutTime: string | null;
  totalHours: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  todayAttendance: {
    checkedIn: number;
    checkedOut: number;
    notCheckedIn: number;
  };
  pendingLeaves: number;
  myAttendance: {
    present: number;
    absent: number;
  };
}