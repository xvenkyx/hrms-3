import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Employees from '@/pages/Employees';
import Attendance from '@/pages/Attendance';
import LeaveRequests from '@/pages/LeaveRequests';
import MyLeaveRequests from '@/pages/MyLeaveRequests';
import MyProfile from '@/pages/MyProfile';
import EditProfile from '@/pages/EditProfile';
import Settings from '@/pages/Settings';

// Salary components
import SalarySlipGenerator from '@/components/salary/SalarySlipGenerator';
import SalaryHistory from '@/components/salary/SalaryHistory';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={
              <ProtectedRoute allowedRoles={['admin', 'hr']}>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave-requests" element={
              <ProtectedRoute allowedRoles={['admin', 'hr']}>
                <LeaveRequests />
              </ProtectedRoute>
            } />
            <Route path="my-leave-requests" element={<MyLeaveRequests />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="settings" element={<Settings />} />

            
            {/* Keep separate routes for specific features */}
            <Route path="salary/generate" element={
              <ProtectedRoute allowedRoles={['admin', 'hr']}>
                <SalarySlipGenerator />
              </ProtectedRoute>
            } />
            <Route path="salary/history" element={<SalaryHistory />} />
            <Route path="my-salary" element={<SalaryHistory />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);