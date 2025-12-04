// src/api/salary.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://h56yfvr9pl.execute-api.us-east-1.amazonaws.com/v3';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || 
                localStorage.getItem('token') ||
                localStorage.getItem('idToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const generateSalarySlip = async (data: any) => {
  const response = await api.post('/salary/generate', data);
  return response.data;
};

export const getSalarySlip = async (employeeId: string, yearMonth: string) => {
  const response = await api.get(`/salary/${employeeId}/${yearMonth}`);
  return response.data;
};

export const getSalaryHistory = async (filters?: any) => {
  const response = await api.get('/salary/history', { params: filters });
  return response.data;
};

export const getMySalaryHistory = async (filters?: any) => {
  const response = await api.get('/salary/my-history', { params: filters });
  return response.data;
};

// In src/api/salary.ts, update the fetchEmployees function:

// Add this import if not already there
import { employeeAPI } from '@/lib/api';

// Update fetchEmployees to handle employee role
export const fetchEmployees = async () => {
  try {
    // For employees, we can only fetch our own profile
    // For admin/hr, fetch all employees
    const token = localStorage.getItem('accessToken') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('idToken');
    
    if (!token) {
      console.warn('No token found');
      return [];
    }
    
    // Try to decode token to get user role
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload['custom:role'] || payload.role || 'employee';
      
      if (userRole === 'employee') {
        // Employee can only get their own profile
        const response = await fetch(`${API_BASE}/my-profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Return as array with single employee
          return [data.employee].filter(Boolean);
        }
        return [];
      } else {
        // Admin/HR can get all employees
        const response = await fetch(`${API_BASE}/employees`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : data.employees || [];
        }
        return [];
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};