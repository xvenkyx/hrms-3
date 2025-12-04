import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI, employeeAPI } from '@/lib/api';

export interface User {
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'hr' | 'employee';
  department: string;
  designation: string;
  contact_number?: string;
  personal_email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  account_number?: string;
  ifsc_code?: string;
  pan_number?: string;
  uan_number?: string;
  baseSalary?: number;
  pfApplicable?: boolean;
  totalLeaves?: number;
  leavesRemaining?: number;
  casualLeavesUsed?: number;
  casualLeavesTotal?: number;
  sickLeavesUsed?: number;
  sickLeavesTotal?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('accessToken');
        
        if (savedUser && savedToken) {
          try {
            const profile = await employeeAPI.getMyProfile();
            if (profile?.employee) {
              setUser(profile.employee);
            } else {
              // Only clear if we get a 401 (handled by interceptor)
              console.warn('Profile fetch returned no employee data');
            }
          } catch (profileError: any) {
            // Don't clear tokens on network errors, only on 401
            if (profileError.response?.status === 401) {
              console.warn('Token expired or invalid, clearing auth data');
              localStorage.removeItem('user');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password);
      
      console.log('Login response:', response); // Debug log
      
      if (response.token || response.accessToken) {
        // Store the token (use token if exists, otherwise accessToken)
        const token = response.token || response.accessToken;
        localStorage.setItem('accessToken', token);
        
        // Store refresh token if provided
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        // Fetch user profile
        const profile = await employeeAPI.getMyProfile();
        if (profile?.employee) {
          setUser(profile.employee);
          localStorage.setItem('user', JSON.stringify(profile.employee));
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } else {
        throw new Error('Login failed: No token received in response');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Clear any partial data on login failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};