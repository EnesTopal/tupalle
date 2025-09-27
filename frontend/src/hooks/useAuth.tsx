import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';

interface AuthContextType {
  user: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message: string }>;
  selectUsername: (username: string) => Promise<{ success: boolean; message: string }>;
  googleAuth: (code?: string, idToken?: string) => Promise<{ success: boolean; message: string }>;
  checkAuthStatus: () => Promise<void>;
  changeUsername: (username: string) => Promise<{ success: boolean; message: string }>;
  deleteAccount: () => Promise<{ success: boolean; message: string }>;
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

  const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Attempting login for user:', usernameOrEmail);
      const response = await authApi.login({ usernameOrEmail, password });
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
        errorMessage = error.response.data.message || 'Invalid username/email or password. Please check your credentials.';
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

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Attempting registration for user:', username);
      const response = await authApi.register({ username, email, password });
      if (response.success) {
        setUser(response.username);
        return { success: true, message: response.message || 'Registration successful' };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else if (error.response?.status === 409) {
        errorMessage = error.response.data.message || 'Username or email already exists. Please choose different credentials.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid registration data. Please check your username, email and password.';
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

  const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.verifyEmail({ token });
      return { success: response.success, message: response.message };
    } catch (error: any) {
      console.error('Email verification failed:', error);
      return { success: false, message: error.response?.data?.message || 'Email verification failed' };
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.forgotPassword({ email });
      return { success: response.success, message: response.message };
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to send reset email' };
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.resetPassword({ token, newPassword });
      return { success: response.success, message: response.message };
    } catch (error: any) {
      console.error('Password reset failed:', error);
      return { success: false, message: error.response?.data?.message || 'Password reset failed' };
    }
  };

  const resendVerification = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.resendVerification(email);
      return { success: response.success, message: response.message };
    } catch (error: any) {
      console.error('Resend verification failed:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to resend verification email' };
    }
  };

  const selectUsername = async (username: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.selectUsername({ username });
      if (response.success) {
        setUser(response.username);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      console.error('Username selection failed:', error);
      return { success: false, message: error.response?.data?.message || 'Username selection failed' };
    }
  };

  const googleAuth = async (code?: string, idToken?: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Attempting Google authentication');
      const response = await authApi.googleCallback({ code, idToken });
      if (response.success) {
        setUser(response.username);
        return { success: true, message: 'Google authentication successful' };
      }
      return { success: false, message: response.message || 'Google authentication failed' };
    } catch (error: any) {
      let errorMessage = 'Google authentication failed';
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else if (error.response?.status === 401) {
        errorMessage = error.response.data.message || 'Google authentication failed. Please try again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid Google authentication data.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = 'Something went wrong with Google authentication. Please try again.';
      }
      
      console.error('Google authentication failed:', errorMessage, error);
      return { success: false, message: errorMessage };
    }
  };

  const changeUsername = async (username: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Attempting username change to:', username);
      const response = await authApi.changeUsername({ username });
      if (response.success) {
        setUser(response.username);
        return { success: true, message: 'Username changed successfully' };
      }
      return { success: false, message: response.message || 'Username change failed' };
    } catch (error: any) {
      let errorMessage = 'Username change failed';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid username or username already exists.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = 'Something went wrong. Please try again.';
      }
      
      console.error('Username change failed:', errorMessage, error);
      return { success: false, message: errorMessage };
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Attempting account deletion');
      const response = await authApi.deleteAccount();
      if (response.success) {
        setUser(null);
        return { success: true, message: 'Account deleted successfully' };
      }
      return { success: false, message: response.message || 'Account deletion failed' };
    } catch (error: any) {
      let errorMessage = 'Account deletion failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = 'Something went wrong. Please try again.';
      }
      
      console.error('Account deletion failed:', errorMessage, error);
      return { success: false, message: errorMessage };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
    selectUsername,
    googleAuth,
    checkAuthStatus,
    changeUsername,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

