import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';

interface AuthContextType {
  user: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.username) {
        setUser(response.username);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Attempting login for user:', username);
      const response = await authApi.login({ username, password });
      if (response.success) {
        setUser(response.username);
        return { success: true, message: 'Login successful' };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error: any) {
      let errorMessage = 'Login failed';
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else if (error.response?.status === 401) {
        errorMessage = error.response.data.message || 'Invalid username or password. Please check your credentials.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please check your login credentials.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Server not found. Please check if the backend is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = 'Something went wrong. Please try again.';
      }
      
      console.error('Login failed:', errorMessage, error);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Attempting registration for user:', username);
      const response = await authApi.register({ username, password });
      if (response.success) {
        setUser(response.username);
        return { success: true, message: 'Registration successful' };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else if (error.response?.status === 409) {
        errorMessage = error.response.data.message || 'Username already exists. Please choose a different username.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid registration data. Please check your username and password.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Registration not allowed. Please contact support.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Server not found. Please check if the backend is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = 'Something went wrong. Please try again.';
      }
      
      console.error('Registration failed:', errorMessage, error);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

