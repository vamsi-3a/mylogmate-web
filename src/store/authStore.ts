import { create } from 'zustand';
import { authApi } from '@/api/auth';
import { configureApiClient } from '@/api/client';
import type { User, LoginPayload, SignupPayload, GoogleAuthPayload } from '@/types/auth';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setAccessToken: (token: string) => void;
  login: (payload: LoginPayload) => Promise<boolean>;
  signup: (payload: SignupPayload) => Promise<boolean>;
  googleAuth: (payload: GoogleAuthPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutLocal: () => void;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  // Wire up the API client interceptors once the store is created
  configureApiClient({
    getAccessToken: () => get().accessToken,
    setAccessToken: (token: string) => set({ accessToken: token }),
    logout: () => {
      set({ user: null, accessToken: null });
    },
  });

  return {
    user: null,
    accessToken: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    setAccessToken: (token) => set({ accessToken: token }),

    login: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const result = await authApi.login(payload);
        set({ user: result.user, accessToken: result.access_token, isLoading: false });
        return true;
      } catch (err) {
        const message = extractErrorMessage(err, 'Invalid username or password');
        set({ error: message, isLoading: false });
        return false;
      }
    },

    signup: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const result = await authApi.signup(payload);
        set({ user: result.user, accessToken: result.access_token, isLoading: false });
        return true;
      } catch (err) {
        const message = extractErrorMessage(err, 'Failed to create account');
        set({ error: message, isLoading: false });
        return false;
      }
    },

    googleAuth: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const result = await authApi.googleAuth(payload);
        set({ user: result.user, accessToken: result.access_token, isLoading: false });
        return true;
      } catch (err) {
        const message = extractErrorMessage(err, 'Google authentication failed');
        set({ error: message, isLoading: false });
        return false;
      }
    },

    logout: async () => {
      try {
        await authApi.logout();
      } catch {
        // Best-effort logout — clear local state regardless
      } finally {
        set({ user: null, accessToken: null, error: null });
      }
    },

    logoutLocal: () => {
      set({ user: null, accessToken: null, error: null });
    },

    initialize: async () => {
      // Attempt to restore session via refresh-token cookie
      set({ isLoading: true });
      try {
        const result = await authApi.refresh();
        set({
          user: result.user,
          accessToken: result.access_token,
          isLoading: false,
          isInitialized: true,
        });
      } catch {
        // No valid session — that's fine
        set({ user: null, accessToken: null, isLoading: false, isInitialized: true });
      }
    },

    clearError: () => set({ error: null }),
  };
});

// ── Helpers ───────────────────────────────────────────────────────────────

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}
