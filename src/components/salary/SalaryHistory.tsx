import { generateSalaryPDF } from '@/utils/pdf';
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Filter, Download, Eye, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { getSalaryHistory, getMySalaryHistory } from "@/api/salary";
import { fetchEmployees } from "@/api/salary";
import { useAuth } from "@/contexts/AuthContext";

const SalaryHistory: React.FC = () => {
  const [salarySlips, setSalarySlips] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // State for messages
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Filters
  const [employeeId, setEmployeeId] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [limit] = useState<number>(20);
  const [page, setPage] = useState<number>(1);

  const isAdmin = user?.role === "admin" || user?.role === "hr";

  useEffect(() => {
    if (isAdmin) {
      loadEmployees();
    }
    loadSalaryHistory();
  }, [user]);

  useEffect(() => {
    loadSalaryHistory();
  }, [page]);

  async function loadEmployees() {
    if (!isAdmin) return;
    
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (error) {
      setMessage({ text: 'Failed to load employees', type: 'error' });
      setTimeout(() => setMessage(null), 5000);
    }
  }

  async function loadSalaryHistory() {
    setLoading(true);
    try {
      let response;

      if (isAdmin) {
        // Admin/HR can view all with filters
        response = await getSalaryHistory({
          employeeId: employeeId || undefined,
          department: department || undefined,
          year: year || undefined,
          month: month || undefined,
          limit,
          page,
        });
      } else {
        // Employee can only view their own
        response = await getMySalaryHistory({
          year: year || undefined,
          month: month || undefined,
          limit,
        });
      }

      setSalarySlips(response.slips || []);
      setSummary(response.summary || {});
    } catch (error: any) {
      setMessage({ text: error.message || "Failed to load salary history", type: "error" });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setEmployeeId("");
    setDepartment("");
    setYear("");
    setMonth("");
    setPage(1);
  }

  const departments = Array.from(
    new Set(employees.map((emp) => emp.department).filter(Boolean))
  ).sort();

  const handleViewSlip = (slip: any) => {
    // Navigate to slip details or open modal
    setMessage({ 
      text: `Viewing slip for ${slip.employeeName} - ${slip.monthName}`, 
      type: 'info' 
    });
  };

  // In SalaryHistory.tsx, update the handleDownloadSlip function:

const handleDownloadSlip = (slip: any) => {
  try {
    generateSalaryPDF(slip);
    setMessage({ 
      text: `Downloading slip for ${slip.employeeName}`, 
      type: 'success' 
    });
  } catch (error: any) {
    setMessage({ 
      text: `Failed to download slip: ${error.message}`, 
      type: 'error' 
    });
  }
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary History</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "View and manage all salary records"
              : "View your salary history"}
          </p>
        </div>
        <Badge variant={isAdmin ? "default" : "secondary"}>
          {isAdmin ? "HR/Admin View" : "Employee View"}
        </Badge>
      </div>

      {/* Message Display */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={
          message.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' :
          message.type === 'error' ? '' :
          'border-blue-200 bg-blue-50 text-blue-800'
        }>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-sm opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Salary Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters - Only show for Admin/HR */}
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 border rounded-lg">
              {/* Employee Filter */}
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select value={employeeId} onValueChange={setEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Employees</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.employeeId} value={emp.employeeId}>
                        {emp.employeeId} - {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  type="number"
                  placeholder="e.g., 2025"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="2000"
                  max="2030"
                />
              </div>

              {/* Month Filter */}
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Months</SelectItem>
                    <SelectItem value="01">January</SelectItem>
                    <SelectItem value="02">February</SelectItem>
                    <SelectItem value="03">March</SelectItem>
                    <SelectItem value="04">April</SelectItem>
                    <SelectItem value="05">May</SelectItem>
                    <SelectItem value="06">June</SelectItem>
                    <SelectItem value="07">July</SelectItem>
                    <SelectItem value="08">August</SelectItem>
                    <SelectItem value="09">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
                <Button onClick={loadSalaryHistory} className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {summary.totalSlips > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {summary.totalSlips}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Slips
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{(summary.averageNetSalary || 0)?.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg. Net Salary
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      ₹{(summary.totalPF || 0)?.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total PF
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      ₹{(summary.totalBonus || 0)?.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Bonus
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Count */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {salarySlips.length} salary record
              {salarySlips.length !== 1 ? "s" : ""} found
            </p>
            <div className="flex items-center gap-2">
              {loading && (
                <div className="flex items-center text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={loadSalaryHistory}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Salary Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>Employee</TableHead>}
                  <TableHead>Month</TableHead>
                  <TableHead>Basic</TableHead>
                  <TableHead>HRA</TableHead>
                  <TableHead>Fuel</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salarySlips.map((slip) => (
                  <TableRow key={slip.slipId}>
                    {isAdmin && (
                      <TableCell>
                        <div>
                          <div className="font-medium">{slip.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {slip.employeeId}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div>{slip.monthName}</div>
                      <div className="text-sm text-muted-foreground">
                        {slip.yearMonth}
                      </div>
                    </TableCell>
                    <TableCell>₹{(slip.basic || 0)?.toLocaleString()}</TableCell>
                    <TableCell>₹{(slip.hra || 0)?.toLocaleString()}</TableCell>
                    <TableCell>
                      ₹{(slip.fuelAllowance || 0)?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-destructive">
                      ₹
                      {(
                        (slip.pfAmount || 0) +
                        (slip.professionalTax || 0) +
                        (slip.absentDeduction || 0)
                      )?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {(slip.bonus || 0) > 0
                        ? `₹${(slip.bonus || 0)?.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{(slip.netSalary || 0)?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewSlip(slip)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadSlip(slip)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {salarySlips.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 9 : 8}
                      className="text-center py-8"
                    >
                      <Alert>
                        <AlertDescription>
                          No salary records found.{" "}
                          {isAdmin
                            ? "Generate salary slips first."
                            : "No salary history available."}
                        </AlertDescription>
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination - Only for Admin */}
          {isAdmin && salarySlips.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {salarySlips.length} records
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={salarySlips.length < limit || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryHistory;