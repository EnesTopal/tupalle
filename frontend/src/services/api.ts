import axios from 'axios';
import { 
  Share, 
  CreateShareRequest, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse 
} from '../types';

// Re-export types for convenience
export type { Share, AuthResponse, ApiResponse, CreateShareRequest, LoginRequest, RegisterRequest };

const API_BASE_URL = 'http://localhost:8080';

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
};

// Share endpoints
export const shareApi = {
  getShares: (page = 0, size = 20, sort = 'recent'): Promise<ApiResponse<Share>> =>
    api.get(`/shares?page=${page}&size=${size}&sort=${sort}`).then(res => res.data),
  
  getShare: (id: string): Promise<Share> =>
    api.get(`/shares/${id}`).then(res => res.data),
  
  createShare: (data: CreateShareRequest): Promise<Share> =>
    api.post('/shares', data).then(res => res.data),
  
  likeShare: (id: string): Promise<void> =>
    api.post(`/shares/${id}/like`).then(res => res.data),
  
  unlikeShare: (id: string): Promise<void> =>
    api.delete(`/shares/${id}/like`).then(res => res.data),
  
  searchShares: (query: string, page = 0, size = 20): Promise<ApiResponse<Share>> =>
    api.get(`/shares/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`).then(res => res.data),
};

// User endpoints
export const userApi = {
  getMyShares: (page = 0, size = 20): Promise<ApiResponse<Share>> =>
    api.get(`/users/me/shares?page=${page}&size=${size}`).then(res => res.data),
  
  getUserShares: (username: string, page = 0, size = 20): Promise<ApiResponse<Share>> =>
    api.get(`/users/${username}/shares?page=${page}&size=${size}`).then(res => res.data),
};

export default api;

