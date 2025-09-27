import axios from 'axios';
import { 
  Share, 
  CreateShareRequest, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse,
  UserProfile,
  EmailVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UsernameSelectionRequest,
  GoogleCallbackRequest
} from '../types';

// Re-export types for convenience
export type { Share, AuthResponse, ApiResponse, CreateShareRequest, LoginRequest, RegisterRequest, UserProfile, EmailVerificationRequest, ForgotPasswordRequest, ResetPasswordRequest, UsernameSelectionRequest, GoogleCallbackRequest };

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:18089';
    }
    return 'https://vjxd31fv-18089.euw.devtunnels.ms';
  }

  return 'http://localhost:18089'; 
};

const API_BASE_URL = getApiBaseUrl();


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', data);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', data);
      console.log('Register response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  logout: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/logout');
      console.log('Logout response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Logout error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get('/auth/me');
      console.log('Get current user response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error.response?.data || error.message);
      throw error;
    }
  },

  verifyEmail: async (data: EmailVerificationRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/verify-email', data);
      console.log('Verify email response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Verify email error:', error.response?.data || error.message);
      throw error;
    }
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/forgot-password', data);
      console.log('Forgot password response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/reset-password', data);
      console.log('Reset password response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error.response?.data || error.message);
      throw error;
    }
  },

  resendVerification: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/resend-verification', null, {
        params: { email }
      });
      console.log('Resend verification response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Resend verification error:', error.response?.data || error.message);
      throw error;
    }
  },

  selectUsername: async (data: UsernameSelectionRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/select-username', data);
      console.log('Select username response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Select username error:', error.response?.data || error.message);
      throw error;
    }
  },

  googleCallback: async (data: GoogleCallbackRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/google/callback', data);
      console.log('Google callback response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Google callback error:', error.response?.data || error.message);
      throw error;
    }
  },

  changeUsername: async (data: UsernameSelectionRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/change-username', data);
      console.log('Change username response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Change username error:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteAccount: async (): Promise<AuthResponse> => {
    try {
      const response = await api.delete('/auth/delete-account');
      console.log('Delete account response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Delete account error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Share endpoints
export const shareApi = {
  getShares: (page = 0, size = 20, sort = 'recent'): Promise<ApiResponse<Share>> =>
    api.get(`/shares?page=${page}&size=${size}&sort=${sort}`).then(res => res.data),
  
  getShare: (id: string): Promise<Share> =>
    api.get(`/shares/${id}`).then(res => res.data),
  
  createShare: (data: CreateShareRequest): Promise<Share> =>
    api.post('/shares', data).then(res => res.data),
  
  createShareWithImages: (formData: FormData): Promise<Share> =>
    api.post('/shares/with-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data),
  
  uploadImage: (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/shares/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
  
  refreshImageUrl: (imageUrl: string): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('imageUrl', imageUrl);
    return api.post('/shares/refresh-image-url', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
  
  likeShare: (id: string): Promise<void> =>
    api.post(`/shares/${id}/like`).then(res => res.data),
  
  unlikeShare: (id: string): Promise<void> =>
    api.delete(`/shares/${id}/like`).then(res => res.data),
  
  searchShares: (query: string, page = 0, size = 20): Promise<ApiResponse<Share>> =>
    api.get(`/shares/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`).then(res => res.data),
  
  deleteShare: (id: string): Promise<void> =>
    api.delete(`/shares/${id}`).then(res => res.data),
  
  updateShare: (id: string, data: CreateShareRequest): Promise<Share> =>
    api.put(`/shares/${id}`, data).then(res => res.data),
};

// User endpoints
export const userApi = {
  getMyShares: (page = 0, size = 20): Promise<ApiResponse<Share>> =>
    api.get(`/users/me/shares?page=${page}&size=${size}`).then(res => res.data),
  
  getMyLikedShares: (page = 0, size = 20): Promise<ApiResponse<Share>> =>
    api.get(`/users/me/liked?page=${page}&size=${size}`).then(res => res.data),
  
  getUserShares: (username: string, page = 0, size = 20): Promise<ApiResponse<Share>> =>
    api.get(`/api/users/${username}/shares?page=${page}&size=${size}`).then(res => res.data),
  
  getUserProfile: (username: string): Promise<UserProfile> =>
    api.get(`/api/users/${username}/profile`).then(res => res.data),
};

export default api;

