import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://h56yfvr9pl.execute-api.us-east-1.amazonaws.com/v3';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Try multiple token storage keys
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
      console.warn('401 Unauthorized - Clearing auth data');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth', { email, password });
    return response.data;
  },

  changePassword: async (email: string, session: string, newPassword: string) => {
    const response = await api.post('/change-password', {
      email,
      session,
      newPassword
    });
    return response.data;
  },
};

export const employeeAPI = {
  getEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  getEmployee: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data: any) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  updateEmployee: async (id: string, data: any) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/my-profile');
    return response.data;
  },
};

export const leaveAPI = {
  getLeaveRequests: async (params?: any) => {
    const response = await api.get('/leave-requests', { params });
    return response.data;
  },

  getMyLeaveRequests: async () => {
    const response = await api.get('/my-leave-requests');
    return response.data;
  },

  createLeaveRequest: async (data: any) => {
    const response = await api.post('/leave-requests', data);
    return response.data;
  },

  processLeaveRequest: async (id: string, action: 'approve' | 'reject', comments?: string) => {
    const response = await api.put(`/leave-requests/${id}`, {
      action,
      comments
    });
    return response.data;
  },
};

export const attendanceAPI = {
  checkIn: async () => {
    const response = await api.post('/attendance/checkin');
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/attendance/checkout');
    return response.data;
  },

  getMyAttendance: async (params?: any) => {
    const response = await api.get('/my-attendance', { params });
    return response.data;
  },

  getAttendanceDashboard: async (params?: any) => {
    const response = await api.get('/attendance/dashboard', { params });
    return response.data;
  },

  getEmployeeAttendance: async (employeeId: string, params?: any) => {
    const response = await api.get(`/attendance/${employeeId}`, { params });
    return response.data;
  },
};

export default api;