import { useState, useEffect } from 'react';
import { leaveAPI } from '@/lib/api';
import { Calendar, FileText, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaveRequest {
  requestId: string;
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

const MyLeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    yearMonth: '',
    days: 1,
    leaveType: 'casual' as 'casual' | 'sick' | 'earned',
    reason: '',
  });

  useEffect(() => {
    loadMyLeaveRequests();
  }, []);

  const loadMyLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const response = await leaveAPI.getMyLeaveRequests();
      setLeaveRequests(response.requests || []);
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitLeave = async () => {
    try {
      await leaveAPI.createLeaveRequest(newLeave);
      await loadMyLeaveRequests();
      setIsDialogOpen(false);
      setNewLeave({
        yearMonth: '',
        days: 1,
        leaveType: 'casual',
        reason: '',
      });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit leave request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'casual': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
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
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leave Requests</h1>
          <p className="text-gray-600 mt-1">
            View and manage your leave applications ({leaveRequests.length} total)
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No leave requests</h3>
              <p className="text-gray-500 mt-1">You haven't applied for any leaves yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div
                  key={request.requestId}
                  className="p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <Badge variant="outline" className={getLeaveTypeColor(request.leaveType)}>
                          {request.leaveType}
                        </Badge>
                        <Badge variant="outline">
                          {request.days} day{request.days > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{request.yearMonth}</span>
                        </div>
                      </div>

                      {request.reason && (
                        <p className="text-gray-700 mb-3">
                          {request.reason}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Applied on {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {request.approvedAt && (
                          <span>
                            {request.status} on {new Date(request.approvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {request.comments && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm font-medium text-gray-700">HR Comments:</div>
                      <p className="text-sm text-gray-600 mt-1">{request.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>
              Submit a new leave request for approval
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yearMonth">Month</Label>
              <Input
                id="yearMonth"
                type="month"
                value={newLeave.yearMonth}
                onChange={(e) => setNewLeave({...newLeave, yearMonth: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days">Number of Days</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  max="30"
                  value={newLeave.days}
                  onChange={(e) => setNewLeave({...newLeave, days: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select
                  value={newLeave.leaveType}
                  onValueChange={(value: 'casual' | 'sick' | 'earned') => 
                    setNewLeave({...newLeave, leaveType: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="earned">Earned Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Brief reason for leave..."
                value={newLeave.reason}
                onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitLeave}>
              Submit Leave Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyLeaveRequests;