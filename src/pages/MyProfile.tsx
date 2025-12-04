import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { employeeAPI } from '@/lib/api';
import { 
  User, Mail, Phone, Calendar, MapPin, Building, 
  Briefcase, CreditCard, Banknote, FileText, Edit 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const MyProfile = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await employeeAPI.getMyProfile();
      setProfile(response.employee);
      updateUser(response.employee);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'hr': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            View and manage your personal information
          </p>
        </div>
        <Button asChild>
          <a href="/edit-profile">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </a>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>Full Name</span>
                    </div>
                    <p className="text-lg font-medium">
                      {profile.firstName} {profile.lastName}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Date of Birth</span>
                    </div>
                    <p className="text-lg font-medium">
                      {formatDate(profile.date_of_birth)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="text-lg font-medium">{profile.company_email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-4 w-4" />
                      <span>Contact Number</span>
                    </div>
                    <p className="text-lg font-medium">
                      {profile.contact_number || 'Not specified'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>Gender</span>
                    </div>
                    <p className="text-lg font-medium">
                      {profile.gender || 'Not specified'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>Personal Email</span>
                    </div>
                    <p className="text-lg font-medium">
                      {profile.personal_email || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>Address</span>
                  </div>
                  <p className="text-lg font-medium">
                    {profile.address || 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank & Financial Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CreditCard className="h-4 w-4" />
                    <span>Account Number</span>
                  </div>
                  <p className="text-lg font-medium">
                    {profile.account_number || 'Not specified'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Banknote className="h-4 w-4" />
                    <span>IFSC Code</span>
                  </div>
                  <p className="text-lg font-medium">
                    {profile.ifsc_code || 'Not specified'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span>PAN Number</span>
                  </div>
                  <p className="text-lg font-medium">
                    {profile.pan_number || 'Not specified'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span>UAN Number</span>
                  </div>
                  <p className="text-lg font-medium">
                    {profile.uan_number || 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-gray-500 mb-2">{profile.designation}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getRoleColor(profile.role)}>
                    {profile.role}
                  </Badge>
                  <Badge variant="outline">{profile.department}</Badge>
                </div>

                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Employee ID</span>
                    <span className="font-medium">{profile.employeeId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <Badge variant={
                      profile.status === 'active' ? 'default' : 'secondary'
                    }>
                      {profile.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Joined</span>
                    <span className="font-medium">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Leaves</span>
                    <span className="font-medium">{profile.totalLeaves || 0}</span>
                  </div>
                  <Progress 
                    value={(profile.leavesRemaining || 0) / (profile.totalLeaves || 1) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Remaining</div>
                    <div className="text-2xl font-bold text-green-600">
                      {profile.leavesRemaining || 0}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Used</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {profile.leavesUsed || 0}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Casual Leaves</span>
                    <span className="font-medium">
                      {profile.casualLeavesUsed || 0}/{profile.casualLeavesTotal || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sick Leaves</span>
                    <span className="font-medium">
                      {profile.sickLeavesUsed || 0}/{profile.sickLeavesTotal || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Salary</span>
                  <span className="font-medium">
                    ₹{(profile.baseSalary || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PF Applicable</span>
                  <Badge variant={profile.pfApplicable ? 'default' : 'secondary'}>
                    {profile.pfApplicable ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {profile.pfApplicable && (
                  <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    PF will be deducted as per company policy (12% of basic, max ₹3600/month)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;