import { useState, useEffect } from 'react';
import { leaveAPI } from '@/lib/api';
import { Calendar, User, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaveRequest {
  requestId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  yearMonth: string;
  days: number;
  leaveType: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
}

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('');

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredRequests(leaveRequests);
    } else {
      setFilteredRequests(leaveRequests.filter(req => req.status === activeTab));
    }
  }, [leaveRequests, activeTab]);

  const loadLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const response = await leaveAPI.getLeaveRequests();
      setLeaveRequests(response.requests || []);
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest) return;

    try {
      await leaveAPI.processLeaveRequest(
        selectedRequest.requestId,
        actionType,
        comments
      );
      
      await loadLeaveRequests();
      setIsDialogOpen(false);
      setSelectedRequest(null);
      setComments('');
    } catch (error) {
      console.error('Error processing leave request:', error);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
        <p className="text-gray-600 mt-1">
          Manage employee leave applications ({filteredRequests.length} {activeTab} requests)
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">No leave requests</h3>
                  <p className="text-gray-500 mt-1">
                    {activeTab === 'pending' 
                      ? 'No pending leave requests to review'
                      : 'No leave requests in this category'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.requestId}
                      className="p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            <Badge variant="outline" className={getLeaveTypeColor(request.leaveType)}>
                              {request.leaveType}
                            </Badge>
                            <Badge variant="outline">
                              {request.days} day{request.days > 1 ? 's' : ''}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{request.employeeName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600">{request.department}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">•</span>
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{request.yearMonth}</span>
                            </div>
                          </div>

                          {request.reason && (
                            <p className="text-gray-700 mb-3">
                              {request.reason}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  Applied on {new Date(request.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {request.approvedAt && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>
                                    {request.status} on {new Date(request.approvedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => {
                                setSelectedRequest(request);
                                setActionType('approve');
                                setIsDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedRequest(request);
                                setActionType('reject');
                                setIsDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>

                      {request.comments && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium text-gray-700">Comments:</div>
                          <p className="text-sm text-gray-600 mt-1">{request.comments}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? `Approve leave request for ${selectedRequest?.employeeName}?`
                : `Reject leave request for ${selectedRequest?.employeeName}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Request Details:</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Employee:</span>
                  <span className="font-medium">{selectedRequest?.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Leave Type:</span>
                  <span className="font-medium">{selectedRequest?.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">{selectedRequest?.days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Period:</span>
                  <span className="font-medium">{selectedRequest?.yearMonth}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comments (Optional)</label>
              <Textarea
                placeholder="Add comments for the employee..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'} Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveRequests;