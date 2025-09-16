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
  title: string;
  description: string;
  imageUrls: string[];
  codeSnippets: CodeSnippet[];
  likeCount: number;
  isLiked: boolean;
}

export interface CreateShareRequest {
  title: string;
  description: string;
  imageUrls: string[];
  codeSnippets: CodeSnippet[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
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

