// src/components/salary/SalarySlipGenerator.tsx
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  Printer,
} from "lucide-react";
import {
  generateSalarySlip,
  getSalarySlip,
  fetchEmployees,
} from "@/api/salary";
import { useAuth } from "@/contexts/AuthContext";
import { generateSalaryPDF } from "@/utils/pdf";

interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  company_email: string;
  department: string;
  designation: string;
  baseSalary: number;
  pfApplicable: boolean | string;
  pfStartDate?: string;
  joiningDate?: string;
}

const SalarySlipGenerator: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [yearMonth, setYearMonth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [salarySlip, setSalarySlip] = useState<any>(null);
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const { user } = useAuth();

  // State for messages
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7);

  const isAdmin = user?.role === "admin" || user?.role === "hr";

  useEffect(() => {
    // Load employees only if admin/hr
    if (isAdmin) {
      loadEmployees();
    } else {
      // For employees, auto-select their own ID
      setSelectedEmployee(user?.employeeId || "");
    }

    // Set default to current month
    setYearMonth(currentMonth);
  }, [user, isAdmin, currentMonth]);

  async function loadEmployees() {
    if (!isAdmin) return;

    try {
      const data = await fetchEmployees();
      setEmployees(
        data.filter((emp: { baseSalary: number }) => emp.baseSalary > 0)
      );
    } catch (error) {
      setMessage({ text: "Failed to load employees", type: "error" });
      setTimeout(() => setMessage(null), 5000);
    }
  }

  async function checkExistingSlip() {
    if (!selectedEmployee || !yearMonth) {
      setMessage({ text: "Please select employee and month", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await getSalarySlip(selectedEmployee, yearMonth);
      setSalarySlip(response.slip);
      setMessage({ text: "✓ Existing salary slip found", type: "success" });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        setSalarySlip(null);
        setMessage({
          text: "No existing slip found. Generate a new one.",
          type: "info",
        });
      } else {
        setMessage({
          text: error.message || "Failed to check for existing slip",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateSlip() {
    if (!selectedEmployee || !yearMonth) {
      setMessage({ text: "Please select employee and month", type: "error" });
      return;
    }

    setGenerating(true);
    try {
      const response = await generateSalarySlip({
        employeeId: selectedEmployee,
        yearMonth,
        forceRegenerate,
      });

      setSalarySlip(response.slip);
      setMessage({
        text: response.message,
        type: "success",
      });
    } catch (error: any) {
      setMessage({
        text: error.message || "Failed to generate salary slip",
        type: "error",
      });
    } finally {
      setGenerating(false);
    }
  }

  function handleDownloadPDF() {
    if (!salarySlip) {
      setMessage({ text: "No salary slip to download", type: "error" });
      return;
    }

    try {
      generateSalaryPDF(salarySlip);
      setMessage({
        text: "Opening PDF for download/print...",
        type: "info",
      });
    } catch (error: any) {
      setMessage({
        text: "Failed to generate PDF: " + error.message,
        type: "error",
      });
    }
  }

  const selectedEmp =
    employees.find((emp) => emp.employeeId === selectedEmployee) ||
    (isAdmin
      ? null
      : {
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          employeeId: user?.employeeId || "",
          department: user?.department || "",
          designation: user?.designation || "",
          baseSalary: user?.baseSalary || 0,
          pfApplicable: user?.pfApplicable || false,
          joiningDate: user?.joiningDate || "",
        });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Salary Slip Generator
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Generate salary slips for employees"
              : "Generate your salary slip"}
          </p>
        </div>
        <Badge variant={isAdmin ? "default" : "secondary"}>
          {isAdmin ? "Admin/HR View" : "Employee View"}
        </Badge>
      </div>

      {/* Message Display */}
      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className={
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : message.type === "error"
              ? ""
              : "border-blue-200 bg-blue-50 text-blue-800"
          }
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : message.type === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
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

      {/* Info Alert for Employees */}
      {!isAdmin && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Employee Access</AlertTitle>
          <AlertDescription>
            You can only generate your own salary slips. The system
            automatically uses your employee ID.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Generate Salary Slip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label htmlFor="employee">Employee {isAdmin ? "*" : ""}</Label>
              {isAdmin ? (
                <Select
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                  disabled={loading || generating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.employeeId} value={emp.employeeId}>
                        <div className="flex flex-col">
                          <span>
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {emp.employeeId} • {emp.department} • ₹
                            {emp.baseSalary?.toLocaleString()}/month
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 border rounded-md bg-gray-50">
                  <div className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user?.employeeId} • {user?.department} •{" "}
                    {user?.designation}
                  </div>
                </div>
              )}

              {selectedEmp && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <span>PF Status:</span>
                    <Badge variant="outline" className="ml-2">
                      {selectedEmp.pfApplicable === true
                        ? "Applicable"
                        : selectedEmp.pfApplicable === "pending"
                        ? "Pending"
                        : "Not Applicable"}
                    </Badge>
                  </div>
                  <div>
                    Base Salary: ₹{selectedEmp.baseSalary?.toLocaleString()}
                    /month
                  </div>
                  {selectedEmp.joiningDate && (
                    <div>
                      Joining Date:{" "}
                      {new Date(selectedEmp.joiningDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Month Selection */}
            <div className="space-y-2">
              <Label htmlFor="month">Month *</Label>
              <Input
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                max={currentMonth}
                disabled={loading || generating}
              />
              <p className="text-xs text-muted-foreground">
                Select past or current month
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button
                  onClick={checkExistingSlip}
                  variant="outline"
                  disabled={
                    loading || generating || !selectedEmployee || !yearMonth
                  }
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Check Existing
                </Button>
                <Button
                  onClick={handleGenerateSlip}
                  disabled={
                    generating || loading || !selectedEmployee || !yearMonth
                  }
                  className="flex-1"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Generate {isAdmin ? "Slip" : "My Slip"}
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="forceRegenerate"
                  checked={forceRegenerate}
                  onChange={(e) => setForceRegenerate(e.target.checked)}
                  className="h-4 w-4"
                  disabled={generating}
                />
                <Label htmlFor="forceRegenerate" className="text-sm">
                  Force regenerate (recalculate)
                </Label>
              </div>
            </div>
          </div>

          {/* Salary Slip Display */}
          {salarySlip && (
            <Card className="border-primary">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Salary Slip - {salarySlip.monthName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Generated on:{" "}
                      {new Date(salarySlip.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setForceRegenerate(true);
                        handleGenerateSlip();
                      }}
                      disabled={generating}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDownloadPDF}
                      disabled={generating}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Salary Slip Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Employee Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Employee Information
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">
                          {salarySlip.employeeName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Employee ID:
                        </span>
                        <span className="font-medium">
                          {salarySlip.employeeId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Department:
                        </span>
                        <span>{salarySlip.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Designation:
                        </span>
                        <span>{salarySlip.designation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span>
                          {salarySlip.companyName || "JHEX Consulting LLP"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Salary Summary */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Salary Summary</h3>
                    // In SalarySlipGenerator.tsx, update the salary summary
                    section: // Replace the existing salary summary display with
                    this:
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Base Salary:</span>
                        <span>₹{salarySlip.baseSalary?.toLocaleString()}</span>
                      </div>

                      {/* Deductions Section */}
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-destructive">
                          <span>Provident Fund (PF):</span>
                          <span>
                            - ₹{salarySlip.pfAmount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-destructive">
                          <span>Professional Tax (PT):</span>
                          <span>
                            - ₹{salarySlip.professionalTax?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-destructive font-medium">
                          <span>Total Deductions:</span>
                          <span>
                            - ₹
                            {(
                              salarySlip.pfAmount + salarySlip.professionalTax
                            )?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Net Pay (after deductions) */}
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">
                          Net Pay (after deductions):
                        </span>
                        <span className="font-medium">
                          ₹
                          {(
                            salarySlip.baseSalary -
                            salarySlip.pfAmount -
                            salarySlip.professionalTax
                          )?.toLocaleString()}
                        </span>
                      </div>

                      {/* Bonus if any */}
                      {salarySlip.bonus > 0 && (
                        <div className="flex justify-between">
                          <span>Performance Bonus:</span>
                          <span className="text-green-600 font-medium">
                            + ₹{salarySlip.bonus?.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Final Net Salary */}
                      <div className="flex justify-between border-t pt-3 mt-2">
                        <span className="font-semibold text-lg">
                          Final Net Salary:
                        </span>
                        <span className="font-bold text-green-600 text-lg">
                          ₹{salarySlip.netSalary?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Earnings */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm text-green-600">
                        Earnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Basic (50%)</span>
                          <span>₹{salarySlip.basic?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>House Rent Allowance (HRA)</span>
                          <span>₹{salarySlip.hra?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fuel Allowance</span>
                          <span>
                            ₹{salarySlip.fuelAllowance?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">Total Earnings</span>
                          <span className="font-medium">
                            ₹{salarySlip.grossSalary?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deductions */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm text-destructive">
                        Deductions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="space-y-3">
                        {salarySlip.pfAmount > 0 && (
                          <div className="flex justify-between">
                            <span>Provident Fund (PF)</span>
                            <span>
                              ₹{salarySlip.pfAmount?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Professional Tax (PT)</span>
                          <span>
                            ₹{salarySlip.professionalTax?.toLocaleString()}
                          </span>
                        </div>
                        {salarySlip.absentDeduction > 0 && (
                          <div className="flex justify-between">
                            <span>Absent Deduction</span>
                            <span className="text-destructive">
                              ₹{salarySlip.absentDeduction?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">Total Deductions</span>
                          <span className="font-medium text-destructive">
                            ₹
                            {(
                              (salarySlip.pfAmount || 0) +
                              (salarySlip.professionalTax || 0) +
                              (salarySlip.absentDeduction || 0)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance & Leave Info */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">
                      Attendance & Leave Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {salarySlip.daysPresent || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Days Present
                        </div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {salarySlip.lopDays || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          LOP Days
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {salarySlip.paidLeaveUsed || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Paid Leaves Used
                        </div>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">
                          {salarySlip.leavesRemaining || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Leaves Remaining
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>
                        Note: Salary calculation based on{" "}
                        {salarySlip.daysInMonth || 30} days in month.
                      </p>
                      {salarySlip.calculationNotes && (
                        <p className="mt-2 italic">
                          {salarySlip.calculationNotes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* PDF Preview Info */}
                <Alert className="mt-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Click "Download PDF" to get a professionally formatted
                    salary slip that you can print or save. The PDF will include
                    all details with proper formatting and number-to-words
                    conversion.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* No Data State */}
          {!salarySlip && selectedEmployee && (
            <Alert>
              <AlertDescription>
                No salary slip found for{" "}
                {isAdmin
                  ? `${selectedEmp?.firstName} ${selectedEmp?.lastName}`
                  : "you"}{" "}
                for {yearMonth}. Click "Generate {isAdmin ? "Slip" : "My Slip"}"
                to create one.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalarySlipGenerator;
