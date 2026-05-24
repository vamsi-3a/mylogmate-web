import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type {
  TokenResponse,
  SignupPayload,
  LoginPayload,
  GoogleAuthPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  UpdatePasswordPayload,
  User,
} from '@/types/auth';

export const authApi = {
  signup: async (payload: SignupPayload): Promise<TokenResponse> => {
    const { data } = await apiClient.post<ApiResponse<TokenResponse>>(
      '/api/v1/auth/signup',
      payload,
    );
    return data.data;
  },

  login: async (payload: LoginPayload): Promise<TokenResponse> => {
    const { data } = await apiClient.post<ApiResponse<TokenResponse>>(
      '/api/v1/auth/login',
      payload,
    );
    return data.data;
  },

  googleAuth: async (payload: GoogleAuthPayload): Promise<TokenResponse> => {
    const { data } = await apiClient.post<ApiResponse<TokenResponse>>(
      '/api/v1/auth/google',
      payload,
    );
    return data.data;
  },

  refresh: async (): Promise<TokenResponse> => {
    const { data } = await apiClient.post<ApiResponse<TokenResponse>>('/api/v1/auth/refresh');
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>('/api/v1/auth/me');
    return data.data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    await apiClient.post('/api/v1/auth/forgot-password', payload);
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    await apiClient.post('/api/v1/auth/reset-password', payload);
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await apiClient.patch<ApiResponse<User>>('/api/v1/auth/me', payload);
    return data.data;
  },

  updatePassword: async (payload: UpdatePasswordPayload): Promise<void> => {
    await apiClient.post('/api/v1/auth/me/password', payload);
  },
};
