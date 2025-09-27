export interface User {
  username: string;
  enabled: boolean;
}

export interface CodeSnippet {
  language: string;
  filename?: string;
  content: string;
}

export interface Share {
  id: string;
  ownerUsername: string;
  ownerTitle: string;
  title: string;
  description: string;
  imageUrls: string[];
  codeSnippets: CodeSnippet[];
  likeCount: number;
  isLiked: boolean;
}

export interface UserProfile {
  username: string;
  title: string;
  totalLikes: number;
  enabled: boolean;
}

export interface CreateShareRequest {
  title: string;
  description: string;
  imageUrls: string[];
  codeSnippets: CodeSnippet[];
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UsernameSelectionRequest {
  username: string;
}

export interface GoogleCallbackRequest {
  code?: string;
  idToken?: string;
}

export interface AuthResponse {
  username: string | null;
  message: string;
  success: boolean;
}

export interface ApiResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

