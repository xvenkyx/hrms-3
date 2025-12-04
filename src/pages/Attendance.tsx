import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceAPI } from '@/lib/api';
import { Clock, Calendar, CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface AttendanceRecord {
  checkinId: string;
  date: string;
  checkinTime: string;
  checkoutTime: string | null;
  totalHours: number | null;
  status: string;
}

const Attendance = () => {
  const { user } = useAuth();
  const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      
      if (user?.role === 'employee') {
        const [attendanceRes] = await Promise.all([
          attendanceAPI.getMyAttendance(),
        ]);
        setMyAttendance(attendanceRes.attendance || []);
        
        // Find today's record
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = attendanceRes.attendance?.find(
          (record: AttendanceRecord) => record.date === today
        );
        setTodayRecord(todayRecord || null);
      } else {
        const [dashboardRes] = await Promise.all([
          attendanceAPI.getAttendanceDashboard(),
        ]);
        setDashboardData(dashboardRes);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);
      await attendanceAPI.checkIn();
      alert('Checked in successfully!');
      await loadAttendanceData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to check in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsCheckingOut(true);
      await attendanceAPI.checkOut();
      alert('Checked out successfully!');
      await loadAttendanceData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to check out');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'employee' 
              ? 'Track your daily attendance' 
              : 'Monitor team attendance and trends'
            }
          </p>
        </div>
        
        {user?.role === 'employee' && (
          <div className="flex gap-2">
            <Button 
              onClick={handleCheckIn} 
              disabled={isCheckingIn || (todayRecord && todayRecord.checkinTime)}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCheckingIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking In...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check In
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={handleCheckOut} 
              disabled={isCheckingOut || !todayRecord || todayRecord.checkoutTime}
            >
              {isCheckingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Checking Out...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Check Out
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {user?.role === 'employee' ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Today's Status</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayRecord ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Check In</div>
                      <div className="text-lg font-semibold">
                        {formatTime(todayRecord.checkinTime)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Check Out</div>
                      <div className="text-lg font-semibold">
                        {todayRecord.checkoutTime 
                          ? formatTime(todayRecord.checkoutTime)
                          : 'Not yet'
                        }
                      </div>
                    </div>
                  </div>
                  
                  {todayRecord.totalHours && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600">Total Hours</div>
                      <div className="text-xl font-bold text-blue-700">
                        {todayRecord.totalHours} hours
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No attendance today</h3>
                  <p className="text-gray-500 mt-1">Check in to start tracking your attendance</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {myAttendance.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No attendance records found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myAttendance.slice(0, 10).map((record) => (
                    <div
                      key={record.checkinId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.checkinTime && formatTime(record.checkinTime)}
                          {record.checkoutTime && ` → ${formatTime(record.checkoutTime)}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.totalHours && (
                          <Badge variant="outline">
                            {record.totalHours}h
                          </Badge>
                        )}
                        <Badge variant={
                          record.status === 'checked-out' ? 'default' : 'secondary'
                        }>
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {dashboardData && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Employees
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {dashboardData.totalEmployees}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-green-600 text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    Total workforce
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Checked In Today
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {dashboardData.summary?.checkedIn || 0}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-blue-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Currently working
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Not Checked In
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {dashboardData.summary?.notCheckedIn || 0}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-amber-600 text-sm">
                    <XCircle className="h-4 w-4 mr-1" />
                    Absent today
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Attendance Rate
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {dashboardData.summary?.attendanceRate || '0%'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-purple-600 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Today's rate
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
              <CardDescription>Employees who checked in today</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentCheckIns?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentCheckIns.map((checkin: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {checkin.employeeName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{checkin.employeeName}</div>
                          <div className="text-sm text-gray-500">{checkin.department}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium">
                            {new Date(checkin.checkinTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="text-sm text-gray-500">Check-in time</div>
                        </div>
                        {checkin.isLate && (
                          <Badge variant="destructive">Late</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No check-ins recorded yet today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Attendance;