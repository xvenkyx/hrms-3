import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  FileText, 
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  User
} from 'lucide-react';
import { attendanceAPI, leaveAPI, employeeAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayAttendance: { checkedIn: 0, checkedOut: 0, notCheckedIn: 0 },
    pendingLeaves: 0,
    myAttendance: { present: 0, absent: 0 },
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      if (user?.role === 'admin' || user?.role === 'hr') {
        const [employeesRes, attendanceRes, leavesRes] = await Promise.all([
          employeeAPI.getEmployees(),
          attendanceAPI.getAttendanceDashboard(),
          leaveAPI.getLeaveRequests({ status: 'pending' })
        ]);
        
        setStats({
          totalEmployees: employeesRes.count || 0,
          todayAttendance: attendanceRes.summary || { checkedIn: 0, checkedOut: 0, notCheckedIn: 0 },
          pendingLeaves: leavesRes.count || 0,
          myAttendance: { present: 0, absent: 0 },
        });
      } else {
        const [attendanceRes, leavesRes] = await Promise.all([
          attendanceAPI.getMyAttendance({ limit: 30 }),
          leaveAPI.getMyLeaveRequests()
        ]);
        
        const presentDays = attendanceRes.attendance?.filter((a: any) => a.checkinTime).length || 0;
        const totalDays = attendanceRes.attendance?.length || 30;
        
        setStats({
          totalEmployees: 0,
          todayAttendance: { checkedIn: 0, checkedOut: 0, notCheckedIn: 0 },
          pendingLeaves: leavesRes.requests?.filter((r: any) => r.status === 'pending').length || 0,
          myAttendance: { 
            present: presentDays, 
            absent: totalDays - presentDays 
          },
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn();
      alert('Checked in successfully!');
      loadDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      alert('Checked out successfully!');
      loadDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to check out');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName}! Here's what's happening today.
          </p>
        </div>
        
        {(user?.role === 'employee') && (
          <div className="flex gap-2">
            <Button onClick={handleCheckIn}>
              <Clock className="h-4 w-4 mr-2" />
              Check In
            </Button>
            <Button variant="outline" onClick={handleCheckOut}>
              <Clock className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {(user?.role === 'admin' || user?.role === 'hr') ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Employees</CardTitle>
                <CardDescription className="text-2xl font-bold">{stats.totalEmployees}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Active
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Today's Attendance</CardTitle>
                <CardDescription className="text-2xl font-bold">
                  {stats.todayAttendance.checkedIn + stats.todayAttendance.checkedOut}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Checked In</span>
                    <Badge variant="outline">{stats.todayAttendance.checkedIn}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Checked Out</span>
                    <Badge variant="outline">{stats.todayAttendance.checkedOut}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pending Leaves</CardTitle>
                <CardDescription className="text-2xl font-bold">{stats.pendingLeaves}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Needs attention
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Absent Today</CardTitle>
                <CardDescription className="text-2xl font-bold">{stats.todayAttendance.notCheckedIn}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-red-600 text-sm">
                  <UserX className="h-4 w-4 mr-1" />
                  Not checked in
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">My Attendance</CardTitle>
                <CardDescription className="text-2xl font-bold">{stats.myAttendance.present} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  Present this month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Leaves Remaining</CardTitle>
                <CardDescription className="text-2xl font-bold">{user?.leavesRemaining || 0}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  Out of {user?.totalLeaves || 0} total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pending Leaves</CardTitle>
                <CardDescription className="text-2xl font-bold">{stats.pendingLeaves}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Waiting for approval
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Department</CardTitle>
                <CardDescription className="text-2xl font-bold">{user?.department}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  {user?.designation}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {user?.role === 'employee' ? (
                <>
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/my-leave-requests">
                      <FileText className="h-4 w-4 mr-2" />
                      Apply for Leave
                    </a>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/my-profile">
                      <User className="h-4 w-4 mr-2" />
                      Update Profile
                    </a>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/leave-requests">
                      <FileText className="h-4 w-4 mr-2" />
                      Review Leave Requests
                    </a>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/employees">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Employees
                    </a>
                  </Button>
                </>
              )}
              <Button variant="outline" className="justify-start" asChild>
                <a href="/attendance">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Attendance
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-3"></div>
                <div className="text-sm">
                  <p className="font-medium">System Updated</p>
                  <p className="text-gray-500 text-xs">HRMS v3 launched successfully</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-3"></div>
                <div className="text-sm">
                  <p className="font-medium">New Feature</p>
                  <p className="text-gray-500 text-xs">Real-time attendance tracking added</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;