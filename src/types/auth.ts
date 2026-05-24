export interface User {
  id: string;
  username: string;
  email: string | null;
  is_active: boolean;
  is_admin: boolean;
  auth_provider: 'local' | 'google';
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface GoogleAuthPayload {
  id_token: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
}
