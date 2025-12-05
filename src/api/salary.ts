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
  (response) => {
    // Handle CORS issues
    if (response.headers['access-control-allow-origin']) {
      return response;
    }
    return response;
  },
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

// Generate salary slip - ALLOW EMPLOYEES TO GENERATE THEIR OWN
export const generateSalarySlip = async (data: any) => {
  try {
    const response = await api.post('/salary/generate', data);
    return response.data;
  } catch (error: any) {
    // Handle specific error messages from backend
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

// Get specific salary slip
export const getSalarySlip = async (employeeId: string, yearMonth: string) => {
  try {
    const response = await api.get(`/salary/${employeeId}/${yearMonth}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Salary slip not found');
    }
    throw error;
  }
};

// Get salary history - For HR/Admin with filters
export const getSalaryHistory = async (filters?: any) => {
  try {
    const response = await api.get('/salary/history', { 
      params: filters,
      paramsSerializer: {
        indexes: null
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

// Get my salary history - For employees
export const getMySalaryHistory = async (filters?: any) => {
  try {
    const response = await api.get('/salary/my-history', { 
      params: filters,
      paramsSerializer: {
        indexes: null
      }
    });
    return response.data;
  } catch (error: any) {
    // Fallback to using history endpoint if my-history doesn't exist
    if (error.response?.status === 404) {
      // Get current user's employeeId from token or localStorage
      const token = localStorage.getItem('accessToken') || 
                    localStorage.getItem('token') ||
                    localStorage.getItem('idToken');
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const employeeId = payload['custom:employeeId'] || 
                           payload.employeeId || 
                           payload.sub;
          
          return getSalaryHistory({ employeeId, ...filters });
        } catch {
          throw new Error('Cannot determine employee ID');
        }
      }
    }
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

// Fetch employees - For HR/Admin only
export const fetchEmployees = async () => {
  try {
    const response = await api.get('/employees');
    return response.data;
  } catch (error: any) {
    // If no access to employees endpoint, return empty array
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.warn('No permission to fetch employees');
      return [];
    }
    throw error;
  }
};