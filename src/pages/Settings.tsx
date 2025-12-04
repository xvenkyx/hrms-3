import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Shield, UserCog, Globe, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Settings = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    leaveAlerts: true,
    attendanceReminders: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={() => handleNotificationChange('emailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Browser notifications for important updates
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.pushNotifications}
                  onCheckedChange={() => handleNotificationChange('pushNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="leave-alerts">Leave Request Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Notifications for leave approvals/rejections
                  </p>
                </div>
                <Switch
                  id="leave-alerts"
                  checked={notifications.leaveAlerts}
                  onCheckedChange={() => handleNotificationChange('leaveAlerts')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="attendance-reminders">Attendance Reminders</Label>
                  <p className="text-sm text-gray-500">
                    Daily reminders to check in/out
                  </p>
                </div>
                <Switch
                  id="attendance-reminders"
                  checked={notifications.attendanceReminders}
                  onCheckedChange={() => handleNotificationChange('attendanceReminders')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Two-Factor Authentication</Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                  <Badge variant="outline">Disabled</Badge>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Last changed 30 days ago
                  </p>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label>Sessions</Label>
                <p className="text-sm text-gray-500">
                  Manage your active sessions
                </p>
                <Button variant="outline" size="sm">
                  View Active Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-500">Role</Label>
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{user?.role}</span>
                  <Badge variant="outline">
                    {user?.role === 'admin' ? 'Full Access' : 
                     user?.role === 'hr' ? 'HR Access' : 'Limited Access'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-500">Department</Label>
                <p className="font-medium">{user?.department}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-500">Employee ID</Label>
                <p className="font-medium">{user?.employeeId}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-500">Email</Label>
                <p className="font-medium">{user?.email}</p>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Request Role Change
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Version</span>
                <span className="font-medium">HRMS v3.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium">December 2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">API Status</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Database</span>
                <span className="font-medium">DynamoDB</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                Export Data
              </Button>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;